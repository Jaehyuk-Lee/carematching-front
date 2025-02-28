import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAdminFeature = () => {
    navigate('/admin/cert');
  };

  return (
    <div>
      <h1>홈페이지</h1>
      {user ? (
        <div>
          <p>로그인된 사용자: {user.username}</p>
          <p>권한: {user.role}</p>
          {user.role === 'ROLE_ADMIN' && (
            <button className="btn" style={{ margin: '5px' }} onClick={handleAdminFeature}>자격증 관리 (관리자 전용)</button>
          )}
          <button className="btn-primary" style={{ margin: '5px' }} onClick={handleLogout}>로그아웃</button>
        </div>
      ) : (
        <p>로그인이 필요합니다.</p>
      )}
    </div>
  );
}

export default Home;
