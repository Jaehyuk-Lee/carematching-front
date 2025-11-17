import { useSearchParams, Link } from "react-router-dom";
import styles from "./Success.module.css";
import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

function SuccessPage() {
  const [searchParams] = useSearchParams();
  // status: 'idle' | 'success' | 'pending' | 'error'
  const [verifyResult, setVerifyResult] = useState({ loading: true, status: 'idle', orderId: '', price: 0, message: '' });

  useEffect(() => {
    const paymentKey = searchParams.get("paymentKey");
    const orderId = searchParams.get("orderId");
    const amount = searchParams.get("amount");

    if (paymentKey && orderId && amount) {
      axiosInstance.post(`/transactions/verify/${paymentKey}`, {
        orderId,
        price: amount
      }).then((res) => {
        // 서버가 202로 응답하면 결제 승인 처리가 지연된 상태
        if (res.status === 202) {
          setVerifyResult({
            loading: false,
            status: 'pending',
            orderId: res.data.orderId || orderId || '',
            price: res.data.price ?? amount,
            message: res.data.message || '현재 결제 승인 처리가 지연되고 있습니다. 10분 내로 완료됩니다. 이 페이지를 떠나셔도 괜찮습니다.'
          });
        } else {
          setVerifyResult({
            loading: false,
            status: 'success',
            orderId: res.data.orderId,
            price: res.data.price,
            message: ''
          });
        }
      }).catch((err) => {
        setVerifyResult({
          loading: false,
          status: 'error',
          orderId: '',
          price: 0,
          message: err?.response?.data?.message || '결제 정보에 문제가 발생했습니다. 다시 시도해 주세요.'
        });
      });
    } else {
      setVerifyResult({
        loading: false,
        status: 'error',
        orderId: '',
        price: 0,
        message: '결제 정보가 올바르지 않습니다.'
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

  // pending 상태: 승인 대기(예: Toss Payments 지연 응답, HTTP 202)
  if (verifyResult.status === 'pending') {
    return (
      <div className={styles.successContainer}>
        <div className={styles.checkIcon} style={{ background: 'none', color: '#ff9800' }}>
          {/* 시계/대기 아이콘 */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
            <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2zm1 11h4v-2h-3V7h-2v6z" />
          </svg>
        </div>
        <h1 className={styles.successTitle} style={{ color: '#ff9800' }}>결제 승인 대기중입니다</h1>
        <div className={styles.infoSection}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>안내</span>
            <span className={styles.infoValue} style={{ color: '#ff9800' }}>{verifyResult.message}</span>
          </div>
          {verifyResult.orderId ? (
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>주문번호</span>
              <span className={styles.infoValue}>{verifyResult.orderId}</span>
            </div>
          ) : null}
          {verifyResult.price ? (
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>결제 금액</span>
              <span className={styles.infoValue}>{Number(verifyResult.price).toLocaleString()}원</span>
            </div>
          ) : null}
        </div>
        <Link to="/" className={styles.homeButton} style={{ marginTop: 18 }}>
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

  if (verifyResult.status === 'error') {
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
            <span className={styles.infoValue} style={{ color: '#f44336' }}>{verifyResult.message}</span>
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
