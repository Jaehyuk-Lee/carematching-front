import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import styles from './Success.module.css'; // Re-use Success.module.css for consistency

function KakaoPaySuccess() {
  const [searchParams] = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState({
    status: 'pending', // 'pending', 'success', 'failed'
    orderId: searchParams.get('orderId'),
    error: null,
    price: 0,
  });

  useEffect(() => {
    const pgToken = searchParams.get('pg_token');
    const orderId = paymentStatus.orderId;

    if (!pgToken || !orderId) {
      setPaymentStatus(prev => ({ ...prev, status: 'failed', error: '잘못된 접근입니다. 필수 정보가 누락되었습니다.' }));
      return;
    }

    const approvePayment = async () => {
      try {
        const paymentKeyRes = await axiosInstance.get(`/transactions/kakao/getPaymentKey/${orderId}`);
        const paymentKey = paymentKeyRes.data;
        if (!paymentKey) {
          throw new Error('결제 키를 받아오지 못했습니다.');
        }

        const verifyRes = await axiosInstance.post(`/transactions/verify/${paymentKey}`, {
          pgToken,
          orderId,
        });

        setPaymentStatus(prev => ({
          ...prev,
          status: 'success',
          price: verifyRes.data.price,
        }));

      } catch (error) {
        console.error('KakaoPay Approval Error:', error);
        setPaymentStatus(prev => ({
          ...prev,
          status: 'failed',
          error: error?.response?.data?.message || '결제 승인 중 오류가 발생했습니다.',
        }));
      }
    };

    approvePayment();
  }, [paymentStatus.orderId, searchParams]);

  if (paymentStatus.status === 'pending') {
    return (
      <div className={styles.successContainer}>
        <div className={styles.checkIcon}>
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="20" stroke="#1976d2" strokeWidth="4" opacity="0.2" />
            <path d="M44 24c0-11.046-8.954-20-20-20" stroke="#1976d2" strokeWidth="4" strokeLinecap="round">
              <animateTransform attributeName="transform" type="rotate" from="0 24 24" to="360 24 24" dur="1s" repeatCount="indefinite" />
            </path>
          </svg>
        </div>
        <h1 className={styles.successTitle} style={{ color: '#1976d2' }}>카카오페이 결제 승인 중...</h1>
        <p>잠시만 기다려 주세요. 결제 정보를 확인하고 있습니다.</p>
      </div>
    );
  }

  if (paymentStatus.status === 'failed') {
    return (
      <div className={styles.successContainer}>
        <div className={styles.checkIcon} style={{ color: '#f44336', background: 'none' }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
            <circle cx="12" cy="12" r="10" fill="#f44336" />
            <path d="M8 8l8 8M16 8l-8 8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <h1 className={styles.successTitle} style={{ color: '#f44336' }}>결제에 실패하였습니다</h1>
        <div className={styles.infoSection}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>에러 메시지</span>
            <span className={styles.infoValue} style={{ color: '#f44336' }}>{paymentStatus.error}</span>
          </div>
        </div>
        <Link to="/" className={styles.homeButton}>
          <span className={styles.backIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
          </span>
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  // Success UI
  return (
    <div className={styles.successContainer}>
      <div className={styles.checkIcon}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9.55 18l-5.7-5.7 1.425-1.425L9.55 15.15l9.175-9.175L20.15 7.4z" />
        </svg>
      </div>
      <h1 className={styles.successTitle}>결제에 성공하였습니다</h1>
      <div className={styles.infoSection}>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>주문번호</span>
          <span className={styles.infoValue}>{paymentStatus.orderId}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>결제 금액</span>
          <span className={styles.infoValue}>{Number(paymentStatus.price).toLocaleString()}원</span>
        </div>
      </div>
      <Link to="/" className={styles.homeButton}>
        <span className={styles.backIcon}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
        </span>
        홈으로 돌아가기
      </Link>
    </div>
  );
}

export default KakaoPaySuccess;
