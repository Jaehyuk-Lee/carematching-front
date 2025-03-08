"use client"

import { useState, useEffect } from "react"
import axiosInstance from "../api/axiosInstance"
import { useAuth } from "../context/AuthContext"
import ChatRoom from "./ChatRoom"
import "./ChatSidebar.css"

const ChatSidebar = ({ isChatOpen, onClose }) => {
  const [activeChatId, setActiveChatId] = useState(null)
  const [chatRooms, setChatRooms] = useState([])
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchChatRooms(user.username)
    }
  }, [user])

  const fetchChatRooms = async (username) => {
    try {
      const response = await axiosInstance.get(`/api/rooms?username=${username}`)

      const enhancedRooms = response.data.map((room) => ({
        ...room,
        name: room.otherUsername, // 상대방 username
        lastMessage: room.lastMessage,
        lastMessageDate: room.lastMessageDate,
        unread: 0,
        avatar: "/placeholder.svg",
      }))

      setChatRooms(enhancedRooms)
      console.log("✅ [INFO] 채팅방 목록:", enhancedRooms)
    } catch (error) {
      console.error("❌ [ERROR] 채팅방 목록 불러오기 오류:", error)
    }
  }

  const handleChatRoomClick = (roomId) => {
    setActiveChatId(roomId)
  }

  const handleBackToList = () => {
    setActiveChatId(null)
  }

  // Handle clicks on the overlay to close the sidebar
  const handleOverlayClick = (e) => {
    // Prevent clicks inside the sidebar from closing it
    if (e.target.classList.contains("chat-overlay")) {
      onClose()
    }
  }

  return (
    <>
      {/* 채팅 사이드바 */}
      <div className={`chat-sidebar ${isChatOpen ? "open" : ""}`}>
        {!activeChatId ? (
          <div className="chat-sidebar-container">
            <div className="chat-sidebar-header">
              <h2 className="chat-sidebar-title">채팅</h2>
              <button className="chat-close-button" onClick={onClose}>
                ×
              </button>
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
                      <div className="chat-side-header">
                        <h3 className="chat-room-name">{room.name}</h3>
                        <span className="chat-room-time">{room.lastMessageDate || ""}</span>
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
          <ChatRoom roomId={activeChatId} onBack={handleBackToList} onClose={onClose} chatRooms={chatRooms} />
        )}
      </div>

      {/* 배경 오버레이 */}
      {isChatOpen && <div className="chat-overlay" onClick={handleOverlayClick} />}
    </>
  )
}

export default ChatSidebar

