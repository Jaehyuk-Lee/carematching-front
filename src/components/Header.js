import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../logo.svg';
import styles from './Header.module.css';

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <Link to="/" className={styles.logo}>
          <img src={logo} alt="케어매칭" />
        </Link>
        <nav className={styles.mainNav}>
          <ul>
            <li><Link to="/caregiver">요양사 찾기</Link></li>
            <li><Link to="/apply">수급자 찾기</Link></li>
            <li><Link to="/hospital">요양병원 찾기</Link></li>
            <li><Link to="/community">커뮤니티</Link></li>
            <li><Link to="/education">고객센터</Link></li>
          </ul>
        </nav>
        <div className={styles.authNav}>
          {user ? (
            <div className={styles.userMenu}>
              <span className={styles.username}>{user.username}</span>
              <Link to="/mypage">마이페이지</Link>
              <button onClick={handleLogout} className={styles.logoutButton}>로그아웃</button>
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
  );
}

export default Header;
