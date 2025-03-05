import { useSearchParams, Link } from "react-router-dom"
import styles from "./Fail.module.css"

function FailPage() {
  const [searchParams] = useSearchParams()

  // 실패 정보 파싱
  const errorMessage = searchParams.get("message") || "알 수 없는 오류가 발생했습니다"
  const errorCode = searchParams.get("code") || "ERROR"

  return (
    <div className={styles.failContainer}>
      {/* 에러 아이콘 */}
      <div className={styles.errorIcon}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </svg>
      </div>

      {/* 결제 실패 메시지 */}
      <h1 className={styles.failTitle}>결제에 실패하였습니다</h1>

      {/* 오류 정보 */}
      <div className={styles.infoSection}>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>오류 코드</span>
          <span className={styles.infoValue}>{errorCode}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>실패 사유</span>
          <span className={styles.infoValue}>{errorMessage}</span>
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

export default FailPage;
