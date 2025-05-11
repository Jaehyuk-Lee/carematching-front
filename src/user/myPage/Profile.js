import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosInstance';
import styles from './Profile.module.css';

function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    nickname: "",
    phoneNumber: "",
    certno: "",
    createdAt: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axiosInstance.get('/user/info');
        setProfile(response.data);
      } catch (error) {
        console.error('프로필 정보 로딩 실패:', error);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileHeader}>
        <h2 className={styles.welcomeText}>
          <span className={styles.username}>{user.username}</span>님, 환영합니다!
        </h2>
      </div>

      <div className={styles.profileCard}>
        <div className={styles.infoSection}>
          <h3>기본 정보</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.label}>닉네임</span>
              <span className={styles.value}>{profile?.nickname || '-'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>전화번호</span>
              <span className={styles.value}>{profile?.phoneNumber || '-'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>가입일</span>
              <span className={styles.value}>
                {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '-'}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>회원 유형</span>
              <span className={styles.value}>
                {user.role === 'ROLE_USER_CAREGIVER' ? '요양보호사' :
                 user.role === 'ROLE_USER' ? '일반 회원' :
                 user.role === 'ROLE_ADMIN' ? '관리자' : '-'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
