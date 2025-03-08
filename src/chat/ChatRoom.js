import React, { useEffect, useState, useCallback } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import Swal from 'sweetalert2';
import "./ChatRoom.css";

let stompClient = null;

const ChatRoom = ({ roomId, onBack, onClose, chatRooms }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [roomInfo, setRoomInfo] = useState(null);

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
    const socket = new SockJS("http://localhost:8080/wss");
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
  const fetchMessages = useCallback(async (roomId) => {
    try {
      const response = await axiosInstance.get(`/api/messages/${roomId}`);
      setMessages(response.data);
      console.log("✅ [INFO] 기존 메시지 불러오기:", response.data);
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
    if (stompClient && newMessage.trim() !== "") {
      const messageRequest = {
        roomId: Number.parseInt(roomId),
        username: user.username,
        message: newMessage,
      };
      console.log("📤 [SEND] 메시지 요청:", messageRequest);
      stompClient.send("/app/chat/send", {}, JSON.stringify(messageRequest));
      setNewMessage("");
    }
  }, [newMessage, roomId, user.username]);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      sendMessage();
    }
  };

  useEffect(() => {
    if (roomId) {
      fetchMessages(roomId);
      connectWebSocket();
    }
    return () => {
      disconnectWebSocket();
    };
  }, [roomId, fetchMessages, connectWebSocket, disconnectWebSocket]);

  // 메시지들을 createdDate(월/일) 기준으로 그룹화
  const groupedMessages = messages.reduce((groups, message) => {
    const date = message.createdDate;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  // 그룹화된 날짜들을 정렬 (필요에 따라 정렬 기준 조정 가능)
  const sortedDates = Object.keys(groupedMessages).sort();

  return (
    <div className="chat-room-container">
      <div className="chat-room-header">
        <button className="chat-back-button" onClick={onBack}>←</button>
        <h1 className="chat-room-title">{roomInfo?.name}</h1>
        <button className="chat-close-button" onClick={onClose}>×</button>
      </div>
      <button className="chat-action-button">이 케어코디님으로 결정하기</button>

      <div className="chat-messages">
        {sortedDates.map((date) => (
          <div key={date} className="chat-date-group">
            <div className="chat-date-header">{date}</div>
            {groupedMessages[date].map((msg, index) => (
              <div
                key={msg.createdAt + index}
                className={`chat-message ${msg.username === user.username ? "chat-message-mine" : "chat-message-other"}`}
              >
                <div className="chat-message-bubble">
                  <p className="chat-message-text">{msg.message}</p>
                  <span className="chat-message-time">{msg.createdTime}</span>
                </div>
              </div>
            ))}
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
