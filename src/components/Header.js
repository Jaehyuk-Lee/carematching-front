"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Bell, MessageSquare } from "lucide-react"
import styles from "./Header.module.css"
import Swal from "sweetalert2"
import ChatSidebar from "../chat/ChatSidebar"
import axiosInstance from "../api/axiosInstance"

function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [unreadMessages, setUnreadMessages] = useState(0)

  useEffect(() => {
    if (user) {
      axiosInstance
        .get(`/api/chat/unread-count?userId=${user.id}`)
        .then((response) => setUnreadMessages(response.data.unreadCount))
        .catch((err) => console.error("채팅 알림 로드 오류:", err))
    }
  }, [user])

  const handleLogout = () => {
    Swal.fire({
      title: "로그아웃",
      text: "정말 로그아웃 하시겠습니까?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "네",
      cancelButtonText: "아니요",
    }).then((result) => {
      if (result.isConfirmed) {
        logout()
        navigate("/")
      }
    })
  }

  const handleChatClick = () => {
    setIsChatOpen((prev) => !prev)
    if (isChatOpen) setUnreadMessages(0)
  }

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          {/* 로고 */}
          <Link to="/" className={styles.logo}>
            <img src="/reallogo.png" alt="케어매칭" />
            케어매칭
          </Link>
          {/* 메인 네비게이션 */}
          <nav className={styles.mainNav}>
            <ul>
              <li>
                <Link to="/caregiver">요양사 찾기</Link>
              </li>
              <li>
                <Link to="/hospital">요양병원 찾기</Link>
              </li>
              <li>
                <Link to="/community">커뮤니티</Link>
              </li>
              <li>
                <a href="https://pf.kakao.com/_MGmGn/chat" target="_blank" rel="noopener noreferrer">
                  고객센터
                </a>
              </li>
            </ul>
          </nav>

          {/* 액션 버튼 (검색, 알림) */}
          <div className={styles.actionButtons}>
            <button className={styles.iconButton}>
              <Bell size={18} />
            </button>

            {/* 채팅 버튼 */}
            {user && (
              <div className={styles.chatContainer} onClick={handleChatClick}>
                <MessageSquare size={18} />
                {unreadMessages > 0 && <span className={styles.chatBadge}>{unreadMessages}</span>}
              </div>
            )}
          </div>

          {/* 로그인/회원가입 영역 */}
          <div className={styles.authNav}>
            {user ? (
              <div className={styles.userMenu}>
                <span className={styles.username}>{user.username}</span>
                <Link to="/myPage">마이페이지</Link>
                <button onClick={handleLogout} className={styles.logoutButton}>
                  로그아웃
                </button>
              </div>
            ) : (
              <div className={styles.guestMenu}>
                <Link to="/login">로그인</Link>
                <Link to="/signup">회원가입</Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 채팅 사이드바 */}
      <ChatSidebar isChatOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  )
}

export default Header

