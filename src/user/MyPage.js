import React from 'react';
import { useAuth } from '../context/AuthContext';
import defaultProfile from '../logo.svg'; // 임시 프로필 이미지
import styles from './MyPage.module.css';

function MyPage() {
  const { user } = useAuth();

  return (
    <div className={styles.mypageContainer}>
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
          <button className={`${styles.actionButton} ${styles.gray}`}>작성글</button>
          <button className={`${styles.actionButton} ${styles.gray}`}>댓글</button>
          <button className={`${styles.actionButton} ${styles.gray}`}>좋아요</button>
          <button className={`${styles.actionButton} ${styles.orange}`}>내 정보 수정</button>
        </div>
        <div className={styles.contentSection}>
          {/* 여기에 선택된 카테고리에 따른 컨텐츠가 표시됩니다 */}
        </div>
      </div>
    </div>
  );
}

export default MyPage;
