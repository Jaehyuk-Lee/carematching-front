import { useSearchParams, Link } from "react-router-dom";
import styles from "./Success.module.css";
import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import Swal from "sweetalert2";

function SuccessPage() {
  const [searchParams] = useSearchParams();
  const [verifyResult, setVerifyResult] = useState({ loading: true, success: false, orderId: '', price: 0, error: '' });

  useEffect(() => {
    const paymentKey = searchParams.get("paymentKey");
    const orderId = searchParams.get("orderId");
    const amount = searchParams.get("amount");

    if (paymentKey && orderId && amount) {
      axiosInstance.post(`/transactions/verify/${paymentKey}`, {
        orderId,
        price: amount
      }).then((res) => {
        setVerifyResult({
          loading: false,
          success: true,
          orderId: res.data.orderId,
          price: res.data.price,
          error: ''
        });
      }).catch((err) => {
        setVerifyResult({
          loading: false,
          success: false,
          orderId: '',
          price: 0,
          error: err?.response?.data?.message || '결제 정보에 문제가 발생했습니다. 다시 시도해 주세요.'
        });
      });
    } else {
      setVerifyResult({
        loading: false,
        success: false,
        orderId: '',
        price: 0,
        error: '결제 정보가 올바르지 않습니다.'
      });
    }
  }, [searchParams]);

  if (verifyResult.loading) {
    return (
      <div className={styles.successContainer}>
        {/* 로딩 아이콘: 체크 아이콘 위치에 회전 애니메이션 */}
        <div className={styles.checkIcon}>
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="20" stroke="#1976d2" strokeWidth="4" opacity="0.2" />
            <path d="M44 24c0-11.046-8.954-20-20-20" stroke="#1976d2" strokeWidth="4" strokeLinecap="round">
              <animateTransform attributeName="transform" type="rotate" from="0 24 24" to="360 24 24" dur="1s" repeatCount="indefinite" />
            </path>
          </svg>
        </div>
        <h1 className={styles.successTitle} style={{ color: '#1976d2' }}>결제 검증 중입니다...</h1>
        <div className={styles.infoSection}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>잠시만 기다려 주세요</span>
            <span className={styles.infoValue} style={{ color: '#1976d2' }}>결제 정보를 확인하고 있습니다</span>
          </div>
        </div>
        <Link to="/" className={styles.homeButton}>
          <span className={styles.backIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
          </span>
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  if (!verifyResult.success) {
    return (
      <div className={styles.successContainer}>
        {/* 실패 아이콘 */}
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
            <span className={styles.infoValue} style={{ color: '#f44336' }}>{verifyResult.error}</span>
          </div>
        </div>
        <Link to="/" className={styles.homeButton}>
          {/* 화살표 아이콘 */}
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

  // 성공 UI
  return (
    <div className={styles.successContainer}>
      {/* 체크 아이콘 */}
      <div className={styles.checkIcon}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9.55 18l-5.7-5.7 1.425-1.425L9.55 15.15l9.175-9.175L20.15 7.4z" />
        </svg>
      </div>
      <h1 className={styles.successTitle}>결제에 성공하였습니다</h1>
      <div className={styles.infoSection}>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>주문번호</span>
          <span className={styles.infoValue}>{verifyResult.orderId}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>결제 금액</span>
          <span className={styles.infoValue}>{Number(verifyResult.price).toLocaleString()}원</span>
        </div>
      </div>
      <Link to="/" className={styles.homeButton}>
        <span className={styles.backIcon}>
          {/* 화살표 아이콘 */}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
        </span>
        홈으로 돌아가기
      </Link>
    </div>
  );
}

export default SuccessPage;
