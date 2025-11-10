import { useEffect, useState } from "react";
import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";
import styles from './Checkout.module.css';
import { useSearchParams } from 'react-router-dom';
import axiosInstance from "../api/axiosInstance";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

function Checkout() {
  const navigate = useNavigate();
  const [price, setPrice] = useState(0);
  const [selectedMethod, setSelectedMethod] = useState("CARD");
  const [payment, setPayment] = useState(null);
  const [pg, setPg] = useState('TOSS'); // PG사 선택

  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('id');
  const [paymentInfo, setPaymentInfo] = useState(null);

  const [customerEmail, setCustomerEmail] = useState("");

  const clientKey = process.env.REACT_APP_TOSS_CLIENT_KEY;
  const customerKey = paymentInfo?.userName || ANONYMOUS;

  useEffect(() => {
    async function fetchTossPayment() {
      if (pg !== 'TOSS' || !paymentInfo) return;
      try {
        const tossPayments = await loadTossPayments(clientKey);
        const paymentObj = tossPayments.payment({ customerKey });
        setPayment(paymentObj);
      } catch (error) {
        console.error("Error fetching Toss payment:", error);
      }
    }
    fetchTossPayment();
  }, [clientKey, customerKey, paymentInfo, pg]);

  useEffect(() => {
    if (orderId) {
      axiosInstance.get(`/transactions/${orderId}`)
        .then(response => {
          setPaymentInfo(response.data);
          setPrice(response.data.price);
        })
        .catch(async (error) => {
          console.error('결제 정보 조회 중 오류 발생:', error);
          const result = await Swal.fire({
            icon: 'error',
            title: '결제 정보 조회 중 오류 발생',
            text: error?.response?.data?.message,
            confirmButtonText: '확인'
          });

          if (result.isConfirmed) {
            navigate('/');
          }
        });
    }
  }, [orderId, navigate]);

  if (!paymentInfo) return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingSpinner}></div>
      <p className={styles.loadingText}>결제 정보를 불러오는 중입니다</p>
      <p className={styles.loadingSubText}>잠시만 기다려 주세요</p>
      <p className={styles.loadingHint}>1분 이상 소요되는 경우 새로고침을 시도해주세요</p>
    </div>
  );

  const handlePayment = async () => {
    const amountObj = { currency: "KRW", value: price };

    if (pg === 'TOSS') {
      if (!payment) {
        Swal.fire('오류', '결제 모듈을 불러오는 중입니다. 잠시 후 다시 시도해주세요.', 'error');
        return;
      }
      try {
        await payment.requestPayment({
          method: selectedMethod,
          amount: amountObj,
          orderId,
          orderName: paymentInfo.caregiverName,
          successUrl: window.location.origin + "/payment/success",
          failUrl: window.location.origin + "/payment/fail",
          customerEmail,
          customerName: paymentInfo.userName,
          customerMobilePhone: "01012341234",
          card: {
            useEscrow: false,
            flowMode: "DEFAULT",
            useCardPoint: false,
            useAppCardOnly: false,
          },
        });
      } catch (err) {
        console.error("Toss Payment Error:", err);
        Swal.fire('결제 오류', '결제 중 오류가 발생했습니다. 다시 시도해주세요.', 'error');
      }
    } else if (pg === 'KAKAO') {
      try {
        const response = await axiosInstance.post(`/transactions/kakao/ready/${orderId}`, {
          orderId: orderId,
        });
        const { redirectUrl } = response.data;
        window.location.href = redirectUrl;
      } catch (error) {
        console.error('Kakao Payment Error:', error);
        Swal.fire('카카오페이 오류', error?.response?.data?.message || '결제 준비 중 오류가 발생했습니다.', 'error');
      }
    }
  };

  return (
    <div className={styles.checkoutContainer}>
      <h1 className={styles.checkoutTitle}>주문서</h1>

      <div className={styles.infoSection}>
        <div>
          <h3 className={styles.infoTitle}>주문자 아이디:</h3>
          <p className={styles.infoContent}>{paymentInfo.userName}</p>
        </div>
        <div>
          <h3 className={styles.infoTitle}>매칭 요양사 이름:</h3>
          <p className={styles.infoContent}>{paymentInfo.caregiverName}</p>
        </div>
        <div>
          <h3 className={styles.infoTitle}>결제 금액:</h3>
          <p className={styles.priceAmount}>{price.toLocaleString()}원</p>
        </div>
      </div>

      {/* 결제수단 선택 및 이메일 입력 UI 개선 */}
      <div className={styles.paymentMethodSection}>
        <label className={styles.paymentMethodLabel}><b>PG사 선택</b></label>
        <div className={styles.methodButtonGroup}>
          <button
            type="button"
            className={pg === 'TOSS' ? `${styles.methodButton} ${styles.selectedMethodButton}` : styles.methodButton}
            onClick={() => setPg('TOSS')}
          >
            토스페이먼츠
          </button>
          <button
            type="button"
            className={pg === 'KAKAO' ? `${styles.methodButton} ${styles.selectedMethodButton}` : styles.methodButton}
            onClick={() => setPg('KAKAO')}
          >
            카카오페이
          </button>
        </div>
      </div>

      {pg === 'TOSS' && (
        <div className={styles.paymentMethodSection}>
          <label className={styles.paymentMethodLabel}><b>결제 수단 선택</b></label>
          <div className={styles.methodButtonGroup}>
            {[
              { key: "CARD", label: "카드" },
            ].map(method => (
              <button
                key={method.key}
                type="button"
                className={selectedMethod === method.key ? `${styles.methodButton} ${styles.selectedMethodButton}` : styles.methodButton}
                onClick={() => setSelectedMethod(method.key)}
              >
                {method.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={styles.paymentMethodSection}>
        <div className={styles.emailSection}>
          <label htmlFor="customerEmail" className={styles.emailLabel}><b>이메일(선택) </b></label>
          <input
            id="customerEmail"
            type="email"
            className={styles.emailInput}
            value={customerEmail}
            onChange={e => setCustomerEmail(e.target.value)}
            placeholder="이메일 주소를 입력해주세요."
            autoComplete="email"
          />
        </div>
      </div>

      <div className={styles.buttonSection}>
        <button
          type="button"
          className={styles.paymentButton}
          onClick={handlePayment}
        >
          결제하기
        </button>
      </div>
    </div>
  );
}

export default Checkout;
