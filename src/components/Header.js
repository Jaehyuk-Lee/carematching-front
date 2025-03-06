import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Bell, MessageSquare, Menu, X, User, LogOut } from 'lucide-react';
import styles from "./Header.module.css";
import Swal from "sweetalert2";
import ChatSidebar from "../chat/ChatSidebar";
import axiosInstance from "../api/axiosInstance";

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      axiosInstance
        .get(`/api/chat/unread-count?userId=${user.id}`)
        .then((response) => setUnreadMessages(response.data.unreadCount))
        .catch((err) => console.error("채팅 알림 로드 오류:", err));
    }
  }, [user]);

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
        logout();
        navigate("/");
        setMobileMenuOpen(false);
      }
    });
  };

  const handleChatClick = () => {
    setIsChatOpen((prev) => !prev);
    if (isChatOpen) setUnreadMessages(0);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.logoContainer}>
            <Link to="/" className={styles.logo} onClick={closeMobileMenu}>
              케어매칭
            </Link>

            <button
              className={styles.mobileMenuButton}
              onClick={toggleMobileMenu}
              aria-label={mobileMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          <nav className={`${styles.nav} ${mobileMenuOpen ? styles.mobileMenuActive : ''}`}>
            <ul className={styles.navList}>
              <li className={styles.navItem}>
                <Link to="/caregiver" className={styles.navLink} onClick={closeMobileMenu}>
                  케어기버 찾기
                </Link>
              </li>
              <li className={styles.navItem}>
                <Link to="/community" className={styles.navLink} onClick={closeMobileMenu}>
                  커뮤니티
                </Link>
              </li>
              {user && user.role === 'ROLE_ADMIN' && (
                <li className={styles.navItem}>
                  <Link to="/admin/cert" className={styles.navLink} onClick={closeMobileMenu}>
                    관리자
                  </Link>
                </li>
              )}
            </ul>

            <div className={styles.authContainer}>
              {user ? (
                <>
                  <Link to="/mypage" className={styles.userButton} onClick={closeMobileMenu}>
                    <User size={20} />
                    <span className={styles.userName}>{user.username}</span>
                  </Link>
                  <button className={styles.logoutButton} onClick={handleLogout}>
                    <LogOut size={20} />
                    <span className={styles.logoutText}>로그아웃</span>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className={styles.authButton} onClick={closeMobileMenu}>
                    로그인
                  </Link>
                  <Link to="/signup" className={styles.authButton} onClick={closeMobileMenu}>
                    회원가입
                  </Link>
                </>
              )}
            </div>
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
        </div>
      </header>

      {/* 채팅 사이드바 */}
      <ChatSidebar isChatOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
}

export default Header;
