import React, { useEffect, useState, useRef, useCallback } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import "./ChatRoom.css";

let stompClient = null;

const ChatRoom = ({ roomId, onBack, onClose, chatRooms }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const [roomInfo, setRoomInfo] = useState(null);

  useEffect(() => {
    const currentRoom = chatRooms.find((room) => room.roomId === roomId);
    setRoomInfo(currentRoom || { name: `채팅방 #${roomId}` });
  }, [roomId, chatRooms]);

  const connectWebSocket = useCallback(() => {
    const socket = new SockJS("http://localhost:8080/ws");
    stompClient = Stomp.over(socket);
    stompClient.connect({}, onConnected, onError);
  }, []);

  const onConnected = () => {
    console.log("✅ WebSocket 연결 성공");
    stompClient.subscribe(`/topic/chat/${roomId}`, onMessageReceived);
  };

  const onError = (err) => {
    console.error("❌ WebSocket 연결 실패:", err);
  };

  const disconnectWebSocket = () => {
    if (stompClient) {
      stompClient.disconnect(() => {
        console.log("🔌 WebSocket 연결 해제");
      });
    }
  };

  const onMessageReceived = (payload) => {
    const message = JSON.parse(payload.body);
    console.log("📨 [RECEIVED] 메시지:", message);
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  const fetchMessages = async (roomId) => {
    try {
      const response = await axiosInstance.get(`/api/messages/${roomId}`);
      setMessages(response.data);
      console.log("✅ [INFO] 기존 메시지 불러오기:", response.data);
    } catch (error) {
      console.error("❌ [ERROR] 메시지 불러오기 오류:", error);
    }
  };

  const sendMessage = () => {
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
  };

  useEffect(() => {
    if (roomId) {
      fetchMessages(roomId);
      connectWebSocket();
    }

    return () => {
      disconnectWebSocket();
    };
  }, [roomId, connectWebSocket]);

  return (
    <div className="chat-room-container">
      <div className="chat-room-header">
        <button className="chat-back-button" onClick={onBack}>←</button>
        <h2 className="chat-room-title">{roomInfo?.name}</h2>
        <button className="chat-close-button" onClick={onClose}>×</button>
      </div>

      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.username === user.username ? "chat-message-mine" : "chat-message-other"}`}>
            <div className="chat-message-bubble">
              <p className="chat-message-text">{msg.message}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="chat-input-container">
        <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="메시지를 입력하세요..." className="chat-input"/>
        <button onClick={sendMessage} disabled={!newMessage.trim()}className="chat-send-button">전송</button>
      </div>
    </div>
  );
};

export default ChatRoom;
