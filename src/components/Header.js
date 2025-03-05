import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../logo.svg';
import styles from './Header.module.css';
import Swal from 'sweetalert2';
import ChatSidebar from '../chat/ChatSidebar';

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleLogout = () => {
    Swal.fire({
      title: '로그아웃',
      text: "정말 로그아웃 하시겠습니까?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '네',
      cancelButtonText: '아니요'
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate('/');
      }
    });
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link to="/" className={styles.logo}>
            <img src={logo} alt="케어매칭" />
          </Link>
          <nav className={styles.mainNav}>
            <ul>
              <li><Link to="/caregiver">요양사 찾기</Link></li>
              <li><Link to="/hospital">요양병원 찾기</Link></li>
              <li><Link to="/community">커뮤니티</Link></li>
              <li><Link to="/education">고객센터</Link></li>
            </ul>
          </nav>
          <div className={styles.authNav}>
            {user ? (
              <div className={styles.userMenu}>
                <span className={styles.username}>{user.username}</span>
                <Link to="/myPage">마이페이지</Link>
                <button onClick={handleLogout} className={styles.logoutButton}>로그아웃</button>
              </div>
            ) : (
              <div className={styles.guestMenu}>
                <Link to="/login">로그인</Link>
                <Link to="/signup">회원가입</Link>
              </div>
            )}
          </div>

          {/* 🔹 채팅 아이콘 (💬) 클릭 시 ChatSidebar 열기 */}
          {user && (
            <span className={styles.chatIcon} onClick={() => setIsChatOpen(true)}>💬</span>
          )}
        </div>
      </header>

      {/* 🔹 채팅 사이드바 (💬 클릭 시 열림) */}
      {isChatOpen && <ChatSidebar onClose={() => setIsChatOpen(false)} />}
    </>
  );
}

export default Header;
