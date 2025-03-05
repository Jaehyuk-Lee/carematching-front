import React from 'react';
import { Link } from 'react-router-dom';
import styles from './NotFound.module.css';

function NotFound() {
  return (
    <div className={styles.notFoundContainer}>
      <h1 className={styles.title}>404</h1>
      <h2 className={styles.subtitle}>페이지를 찾을 수 없습니다</h2>
      <p className={styles.description}>
        요청하신 페이지가 존재하지 않거나, 이동되었거나, 접근할 수 없습니다.
      </p>
      <Link to="/" className={styles.homeButton}>
        홈으로 돌아가기
      </Link>
    </div>
  );
}

export default NotFound;
