import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import config from "../config/config";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import Swal from 'sweetalert2';
import "./ChatRoom.css";
import { useNavigate } from "react-router-dom";

let stompClient = null;

const ChatRoom = ({ roomId, onBack, onClose, chatRooms }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [roomInfo, setRoomInfo] = useState(null);

  // 메시지 목록을 렌더링하는 컨테이너 참조
  const chatMessagesRef = useRef(null);
  const navigate = useNavigate();

  // 특정 채팅방의 마지막 메시지 ID로 읽음 처리 호출
  const markAsReadRef = useRef(null);
  // track last epoch we sent to backend to avoid duplicate mark-as-read calls
  const lastSentReadEpochRef = useRef(null);
  // stable ref function to call backend without creating hook deps
  useEffect(() => {
    markAsReadRef.current = async (roomIdParam, userId, lastMessageId) => {
      if (!roomIdParam || !userId || !lastMessageId) return;
      try {
        await axiosInstance.post(`/messages/${roomIdParam}/${userId}/read`, lastMessageId, {
          headers: { 'Content-Type': 'text/plain' }
        });
        console.log(`✅ [INFO] 읽음 처리: room=${roomIdParam}, user=${userId}, last=${lastMessageId}`);
      } catch (err) {
        console.error("❌ [ERROR] 읽음 처리 실패:", err);
      }
    };
  }, []);

  const onMessageReceived = useCallback((payload) => {
    const message = JSON.parse(payload.body);
    console.log("📨 [RECEIVED] 메시지:", message);
    setMessages((prevMessages) => [...prevMessages, message]);
  }, []);

  useEffect(() => {
    const currentRoom = chatRooms.find((room) => room.roomId === roomId);
    setRoomInfo(currentRoom || { name: `채팅방 #${roomId}` });
  }, [roomId, chatRooms]);

  const onConnected = useCallback(() => {
    console.log("✅ WebSocket 연결 성공");
    stompClient.subscribe(`/topic/chat/${roomId}`, onMessageReceived);
  }, [roomId, onMessageReceived]);

  const onError = useCallback((err) => {
    console.error("❌ WebSocket 연결 실패:", err);
    Swal.fire({
      icon: 'error',
      title: '연결 실패',
      text: 'WebSocket 연결에 실패했습니다. 잠시 후 다시 시도해주세요.',
    });
  }, []);

  const connectWebSocket = useCallback(() => {
    const socket = new SockJS(config.apiUrl + "/ws");
    stompClient = Stomp.over(socket);
    stompClient.connect({}, onConnected, onError);
  }, [onConnected, onError]);

  const disconnectWebSocket = useCallback(() => {
    if (stompClient) {
      stompClient.disconnect(() => {
        console.log("🔌 WebSocket 연결 해제");
      });
    }
  }, []);

  // roomId와 userId를 받아 메시지를 가져오도록 변경
  const fetchMessages = useCallback(async (roomIdParam, userId) => {
    try {
      const uid = userId || '';
      const response = await axiosInstance.get(`/messages/${roomIdParam}`);
      setMessages(response.data);
      console.log("✅ [INFO] 기존 메시지 불러오기:", response.data);
  // 읽음 처리: 상대방의 마지막 메시지(내 메시지 제외)를 찾아 시간(createdAt 등)을 epoch(ms)로 변환해 전송
  // We notify backend which of the other user's messages we've read (so backend can update read status for them)
  const last = response.data && response.data.length ? response.data.slice().reverse().find(m => m?.username !== uid) : null;
      const candidate = last?.createdAt || last?.timestamp || (last?.createdDate && last?.createdTime ? `${last.createdDate} ${last.createdTime}` : null);
      let epoch = null;
      if (candidate) {
        const num = Number(candidate);
        if (!isNaN(num)) {
          epoch = num;
        } else {
          const parsed = Date.parse(candidate);
          if (!isNaN(parsed)) epoch = parsed;
        }
      }
        if (epoch && markAsReadRef.current) {
          markAsReadRef.current(roomIdParam, uid, String(epoch));
        }
    } catch (error) {
      console.error("❌ [ERROR] 메시지 불러오기 오류:", error);
      Swal.fire({
        icon: 'error',
        title: '메시지 불러오기 실패',
        text: '메시지를 불러오는 중 오류가 발생했습니다.',
      });
    }
  }, []);

  const sendMessage = useCallback(() => {
    if (stompClient && newMessage.trim() !== "" && user) {
      const messageRequest = {
        roomId,
        username: user.username,
        message: newMessage,
      };
      console.log("📤 [SEND] 메시지 요청:", messageRequest);
      stompClient.send("/app/chat/send", {}, JSON.stringify(messageRequest));
      setNewMessage("");
    }
  }, [newMessage, roomId, user]);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      sendMessage();
    }
  };

  // ➡ 메시지 변경될 때 자동 스크롤
  useEffect(() => {
    if (chatMessagesRef.current) {
      // scrollTop을 scrollHeight로 설정해서 맨 아래로 스크롤
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages, user?.username]);

  const handleDecide = async () => {
    const transactionId = await axiosInstance.post(`/transactions/add`, {
      receiverUsername: roomInfo.receiverUsername,
    });
    navigate(`/payment?id=${transactionId.data}`);
  };

  useEffect(() => {
    if (roomId) {
      fetchMessages(roomId, user?.username);
      connectWebSocket();
    }
    return () => {
      disconnectWebSocket();
    };
  }, [roomId, fetchMessages, connectWebSocket, disconnectWebSocket, user?.username]);

  // 새로운 메시지가 추가될 때(실시간 수신) 읽음 처리
  useEffect(() => {
    if (!messages || messages.length === 0) return;
  // 실시간 수신 시에도 내 메시지는 제외하고 상대방의 마지막 메시지에 대해서만 읽음 처리
  const last = messages && messages.length ? messages.slice().reverse().find(m => m?.username !== user?.username) : null;
  const candidate = last?.createdAt || last?.timestamp || (last?.createdDate && last?.createdTime ? `${last.createdDate} ${last.createdTime}` : null);
    let epoch = null;
    if (candidate) {
      const num = Number(candidate);
      if (!isNaN(num)) {
        epoch = num;
      } else {
        const parsed = Date.parse(candidate);
        if (!isNaN(parsed)) epoch = parsed;
      }
    }
    if (epoch && markAsReadRef.current) {
      // avoid sending same epoch repeatedly
      if (String(lastSentReadEpochRef.current) !== String(epoch)) {
        lastSentReadEpochRef.current = String(epoch);
        markAsReadRef.current(roomId, user?.username, String(epoch));
      }
    }
  }, [messages, roomId, user?.username]);

  // 메시지들을 createdDate(월/일) 기준으로 그룹화
  const groupedMessages = messages.reduce((groups, message) => {
    const date = message.createdDate;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  // read가 true인 메시지 중 가장 최신(createdAt 기준)인 메시지의 epoch(ms)
  const lastReadEpoch = useMemo(() => {
    // We want the latest epoch of *my* messages that the other user has read.
    const epochs = messages
      .filter((m) => m?.read && m?.username === user?.username)
      .map((m) => {
        const candidate = m?.createdAt || m?.timestamp || (m?.createdDate && m?.createdTime ? `${m.createdDate} ${m.createdTime}` : null);
        if (!candidate) return null;
        const num = Number(candidate);
        if (!isNaN(num)) return num;
        const parsed = Date.parse(candidate);
        return isNaN(parsed) ? null : parsed;
      })
      .filter(Boolean);
    return epochs.length ? Math.max(...epochs) : null;
  }, [messages, user?.username]);

  // 그룹화된 날짜들을 정렬
  const sortedDates = Object.keys(groupedMessages).sort();

  return (
    <div className="chat-room-container">
      <div className="chat-room-header">
        <button className="chat-back-button" onClick={onBack}>←</button>
          <h1 className="chat-room-title">{roomInfo?.name}</h1>
          <button className="chat-close-button" onClick={onClose}>×</button>
        </div>
        {user && user.role !== "ROLE_USER_CAREGIVER" && (
          <button className="chat-action-button" onClick={handleDecide}>이 케어코디님으로 결정하기</button>
        )}
      {/* 메시지 목록 컨테이너에 ref 추가 */}
      <div className="chat-messages" ref={chatMessagesRef}>
        {sortedDates.map((date) => (
          <div key={date} className="chat-date-group">
            <div className="chat-date-header">{date}</div>
            {groupedMessages[date].map((msg, index) => {
              const msgEpoch = (() => {
                const c = msg?.createdAt || msg?.timestamp || (msg?.createdDate && msg?.createdTime ? `${msg.createdDate} ${msg.createdTime}` : null);
                if (!c) return null;
                const n = Number(c);
                if (!isNaN(n)) return n;
                const p = Date.parse(c);
                return isNaN(p) ? null : p;
              })();
              const isLastRead = lastReadEpoch && msgEpoch && Number(lastReadEpoch) === Number(msgEpoch);
              return (
                <div
                  key={msg.createdAt + index}
                  className={`chat-message ${msg.username === user?.username ? "chat-message-mine" : "chat-message-other"}`}>
                  <div className="chat-message-bubble">
                    <p className="chat-message-text">{msg.message}</p>
                    <span className="chat-message-time">{msg.createdTime}</span>
                  </div>
                  {msg.username === user?.username && isLastRead && (
                    <div className="chat-message-read-right">읽음</div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="chat-input-container">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="메시지를 입력하세요..."
          className="chat-input"
          onKeyDown={handleKeyDown}
        />
        <button onClick={sendMessage} disabled={!newMessage.trim()} className="chat-send-button">
          전송
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;
