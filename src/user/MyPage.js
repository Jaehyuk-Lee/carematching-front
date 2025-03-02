import React from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import axiosInstance from "../api/axiosInstance";
import { useAuth } from '../context/AuthContext';
import defaultProfile from '../logo.svg'; // 임시 프로필 이미지
import styles from './MyPage.module.css';
import EditProfile from './myPage/EditProfile';
import MyPosts from './myPage/MyPosts';

function MyPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleDeleteUser() {
    if (window.confirm('정말로 탈퇴하시겠습니까?\n\n작성한 게시글과 댓글, 좋아요 등의 모든 데이터가 삭제됩니다.')) {
      try {
        const res = await axiosInstance.post(`/api/user/delete`);
        if (res.status !== 200) {
          throw new Error('회원 탈퇴 실패');
        }

        // 로그아웃 처리 및 로컬 스토리지 클리어
        logout();
        alert('회원 탈퇴가 완료되었습니다!');
        navigate('/');
      } catch (error) {
        console.error('회원 탈퇴 중 오류 발생:', error);
        alert(error.response.data || "회원 탈퇴 중 오류가 발생했습니다.");
      }
    }
  }

  return (
    <div className={styles.myPageContainer}>
      <div className={styles.profileSection}>
        <div className={styles.profileImageContainer}>
          <img src={defaultProfile} alt="프로필" className={styles.profileImage} />
        </div>
        <h2 className={styles.profileName}>{user?.username || '사용자'}</h2>
        <div className={styles.profileStats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>작성글</span>
            <span className={styles.statValue}>5</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>댓글</span>
            <span className={styles.statValue}>5</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>좋아요</span>
            <span className={styles.statValue}>5</span>
          </div>
        </div>
      </div>
      <div className={styles.contentWrapper}>
        <div className={styles.actionButtons}>
          <button
            className={`${styles.actionButton} ${styles.gray}`}
            onClick={() => navigate('/myPage/my-posts')}
          >
            작성글
          </button>
          <button className={`${styles.actionButton} ${styles.gray}`}>댓글</button>
          <button className={`${styles.actionButton} ${styles.gray}`}>좋아요</button>
          <button
            className={`${styles.actionButton} ${styles.orange}`}
            onClick={() => navigate('/myPage/edit-profile')}
          >
            내 정보 수정
          </button>
          <button
            className={`${styles.actionButton} ${styles.gray} ${styles.deleteUser}`}
            onClick={handleDeleteUser}
          >
            회원 탈퇴
          </button>
        </div>
        <div className={styles.contentSection}>
          <Routes>
            <Route path="edit-profile" element={<EditProfile />} />
            <Route path="my-posts" element={<MyPosts />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default MyPage;
