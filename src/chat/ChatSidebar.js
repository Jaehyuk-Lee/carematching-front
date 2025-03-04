import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import ChatRoom from "./ChatRoom";
import "./ChatSidebar.css";

const ChatSidebar = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState(null);
  const [chatRooms, setChatRooms] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchChatRooms(user.username);
    }
  }, [user]);

  const fetchChatRooms = async (username) => {
    try {
      const response = await axiosInstance.get(`/api/rooms?username=${username}`);

      const enhancedRooms = response.data.map((room) => ({
        ...room,
        name: room.otherUsername, // 상대방 username
        lastMessage: room.lastMessage, // 👈 마지막 메시지 추가
        lastMessageDate: room.lastMessageDate,
        unread: 0,
        avatar: "/placeholder.svg",
      }));

      setChatRooms(enhancedRooms);
      console.log("✅ [INFO] 채팅방 목록:", enhancedRooms);
    } catch (error) {
      console.error("❌ [ERROR] 채팅방 목록 불러오기 오류:", error);
    }
  };


  const handleChatButtonClick = () => {
    setIsChatOpen(true);
    setActiveChatId(null);
  };

  const handleCloseSidebar = () => {
    setIsChatOpen(false);
    setActiveChatId(null);
  };

  const handleChatRoomClick = (roomId) => {
    setActiveChatId(roomId);
    // ✅ 여기서 URL을 변경하지 않음 (navigate() 제거)
  };

  const handleBackToList = () => {
    setActiveChatId(null);
  };

  return (

    <>
      {/* 채팅 버튼 */}
      <div className="chat-button-container">
        <button onClick={handleChatButtonClick} className="chat-button">💬 채팅하기</button>
      </div>

      {/* 채팅 사이드바 */}
      <div className={`chat-sidebar ${isChatOpen ? "open" : ""}`}>
        {!activeChatId ? (
          <div className="chat-sidebar-container">
            <div className="chat-sidebar-header">
              <h2 className="chat-sidebar-title">채팅</h2>
              <button className="chat-close-button" onClick={handleCloseSidebar}>×</button>
            </div>
            <div className="chat-rooms-list">
              {chatRooms.length > 0 ? (
                chatRooms.map((room) => (
                  <div key={room.roomId} className="chat-room-item" onClick={() => handleChatRoomClick(room.roomId)}>
                    <div className="chat-room-avatar-container">
                      <img src={room.avatar || "/placeholder.svg"} alt={room.name} className="chat-room-avatar" />
                      {room.unread > 0 && <span className="chat-room-unread">{room.unread}</span>}
                    </div>
                    <div className="chat-room-info">
                      <div className="chat-room-header">
                        <h3 className="chat-room-name">{room.name}</h3>
                        <span className="chat-room-time">{room.lastMessageDate || ""}</span> {/* ✅ 오른쪽 정렬 */}
                      </div>
                      <p className="chat-room-last-message">{room.lastMessage}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="chat-no-rooms">참여 중인 채팅방이 없습니다.</p>
              )}
            </div>
          </div>
        ) : (
          <ChatRoom roomId={activeChatId} onBack={handleBackToList} onClose={handleCloseSidebar} chatRooms={chatRooms} />
        )}
      </div>

      {/* 배경 오버레이 */}
      {isChatOpen && <div className="chat-overlay" onClick={handleCloseSidebar} />}
    </>
  );
};

export default ChatSidebar;
