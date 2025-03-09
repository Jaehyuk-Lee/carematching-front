import { useSearchParams, Link } from "react-router-dom";
import styles from "./Success.module.css";
import { useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import Swal from "sweetalert2";

function SuccessPage() {
  const [searchParams] = useSearchParams();

  const wrongPayment = async (message) => {
    const result = await Swal.fire({
      icon: 'error',
      title: '결제 실패',
      text: message || '결제 정보에 문제가 발생했습니다. 다시 시도해 주세요.'
    });
    if (result.isConfirmed) {
      window.location.href = "/";
    }
  }
  useEffect(() => {
    const orderId = searchParams.get("orderId");
    const amount = searchParams.get("amount");

    if (orderId && amount) {
      try {
        axiosInstance.post('/api/transactions/success', {
          orderId,
          price: amount
        }).then((res) => {
          if (res.status !== 200) {
            wrongPayment();
          }
        }).catch((err) => {
          wrongPayment(err.response.data.message);
        });
      } catch (err) {
        console.log("err", err);
      }
    }
  }, [searchParams]);

  // 서버로 승인 요청
  // 실제 구현에서는 여기서 백엔드 API를 호출하여 결제 승인 처리를 완료해야 합니다.

  return (
    <div className={styles.successContainer}>
      {/* 체크 아이콘 */}
      <div className={styles.checkIcon}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9.55 18l-5.7-5.7 1.425-1.425L9.55 15.15l9.175-9.175L20.15 7.4z" />
        </svg>
      </div>

      {/* 결제 성공 메시지 */}
      <h1 className={styles.successTitle}>결제에 성공하였습니다</h1>

      {/* 주문 정보 */}
      <div className={styles.infoSection}>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>주문번호</span>
          <span className={styles.infoValue}>{searchParams.get("orderId")}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>결제 금액</span>
          <span className={styles.infoValue}>{Number(searchParams.get("amount") || 50000).toLocaleString()}원</span>
        </div>
      </div>

      {/* 돌아가기 버튼 */}
      <Link to="/" className={styles.homeButton}>
        <span className={styles.backIcon}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
        </span>
        홈으로 돌아가기
      </Link>
    </div>
  )
}

export default SuccessPage;
