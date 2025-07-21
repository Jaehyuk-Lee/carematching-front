import { useEffect, useState } from "react";
import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";
import { nanoid } from "nanoid";
import styles from './Checkout.module.css';
import { useSearchParams } from 'react-router-dom';
import axiosInstance from "../api/axiosInstance";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

function Checkout() {
  const navigate = useNavigate();
  const [price, setPrice] = useState(0); // 실제 결제 가격
  // const [isDiscounted, setIsDiscounted] = useState(false); // 할인 적용 여부
  const [selectedMethod, setSelectedMethod] = useState("CARD"); // 결제수단
  const [payment, setPayment] = useState(null);

  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('id');
  const [paymentInfo, setPaymentInfo] = useState(null);

  const [customerEmail, setCustomerEmail] = useState("");

  const clientKey = process.env.REACT_APP_TOSS_CLIENT_KEY; // 환경변수에서 불러옴
  const customerKey = paymentInfo?.userName || ANONYMOUS;

  useEffect(() => {
    async function fetchPayment() {
      if (!paymentInfo) return;
      try {
        const tossPayments = await loadTossPayments(clientKey);
        const paymentObj = tossPayments.payment({ customerKey });
        setPayment(paymentObj);
      } catch (error) {
        console.error("Error fetching payment:", error);
      }
    }
    fetchPayment();
  }, [clientKey, customerKey, paymentInfo]);

  useEffect(() => {
    if (paymentId) {
      // 결제 ID로 결제 정보 조회
      axiosInstance.get(`/transactions/${paymentId}`)
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
  }, [paymentId, navigate]);

  // 할인 적용 처리 함수
  // const handleDiscountChange = (event) => {
  //   const applyDiscount = event.target.checked;
  //   setIsDiscounted(applyDiscount);
  //   setPrice(applyDiscount ? Math.round(paymentInfo.price * 0.9) : paymentInfo.price);
  // };

  if (!paymentInfo) return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingSpinner}></div>
      <p className={styles.loadingText}>결제 정보를 불러오는 중입니다</p>
      <p className={styles.loadingSubText}>잠시만 기다려 주세요</p>
      <p className={styles.loadingHint}>1분 이상 소요되는 경우 새로고침을 시도해주세요</p>
    </div>
  );

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

      {/* 할인 쿠폰 섹션 */}
      {/* <div className={styles.discountSection}>
        <label className={styles.discountLabel}>
          <input
            type="checkbox"
            className={styles.discountCheckbox}
            checked={isDiscounted}
            onChange={handleDiscountChange}
          />
          <span className={styles.discountText}>첫 결제 10% 할인 쿠폰 적용</span>
        </label>
      </div> */}


      {/* 결제수단 선택 및 이메일 입력 UI 개선 */}
      <div className={styles.paymentMethodSection}>
        <label className={styles.paymentMethodLabel}><b>결제 수단 선택</b></label>
        <div className={styles.methodButtonGroup}>
          {[
            { key: "CARD", label: "카드" },
            { key: "TRANSFER", label: "계좌이체" },
            { key: "MOBILE_PHONE", label: "휴대폰" },
            { key: "CULTURE_GIFT_CERTIFICATE", label: "문화상품권" }
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

      {/* 결제 버튼 */}
      <div className={styles.buttonSection}>
        <button
          type="button"
          className={styles.paymentButton}
          onClick={async () => {
            if (!payment) return;
            const orderId = nanoid();
            const amountObj = { currency: "KRW", value: price };
            await axiosInstance.post('/transactions/save-orderid', {
              transactionId: paymentId,
              orderId,
              price
            });
            try {
              switch (selectedMethod) {
                case "CARD":
                  await payment.requestPayment({
                    method: "CARD",
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
                  return;
                case "TRANSFER":
                  await payment.requestPayment({
                    method: "TRANSFER",
                    amount: amountObj,
                    orderId,
                    orderName: paymentInfo.caregiverName,
                    successUrl: window.location.origin + "/payment/success",
                    failUrl: window.location.origin + "/payment/fail",
                    customerEmail,
                    customerName: paymentInfo.userName,
                    transfer: {
                      cashReceipt: { type: "소득공제" },
                      useEscrow: false,
                    },
                  });
                  return;
                case "MOBILE_PHONE":
                  await payment.requestPayment({
                    method: "MOBILE_PHONE",
                    amount: amountObj,
                    orderId,
                    orderName: paymentInfo.caregiverName,
                    successUrl: window.location.origin + "/payment/success",
                    failUrl: window.location.origin + "/payment/fail",
                    customerEmail,
                    customerName: paymentInfo.userName,
                  });
                  return;
                case "CULTURE_GIFT_CERTIFICATE":
                  await payment.requestPayment({
                    method: "CULTURE_GIFT_CERTIFICATE",
                    amount: amountObj,
                    orderId,
                    orderName: paymentInfo.caregiverName,
                    successUrl: window.location.origin + "/payment/success",
                    failUrl: window.location.origin + "/payment/fail",
                    customerEmail,
                    customerName: paymentInfo.userName,
                  });
                  return;
                default:
                  alert("결제수단을 선택해주세요.");
                  return;
              }
            } catch (err) {
              console.log("err", err);
            }
          }}
        >
          결제하기
        </button>
      </div>
    </div>
  );
}

export default Checkout;
