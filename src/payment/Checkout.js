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
  const [widgets, setWidgets] = useState(null);
  const [price, setPrice] = useState(0); // 실제 결제 가격
  // const [isDiscounted, setIsDiscounted] = useState(false); // 할인 적용 여부
  const [paymentMethodWidget, setPaymentMethodWidget] = useState(null);

  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('id');
  const [paymentInfo, setPaymentInfo] = useState(null);

  const clientKey = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm"; // 테스트 키

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

  useEffect(() => {
    async function fetchPaymentWidgets() {
      try {
        const tossPayments = await loadTossPayments(clientKey); // SDK 초기화
        const widgets = tossPayments.widgets({ customerKey:ANONYMOUS }); // 결제위젯 객체 생성
        setWidgets(widgets);
      } catch (error) {
        console.error("결제위젯을 불러올 수 없습니다:", error);
      }
    }

    fetchPaymentWidgets();
  }, [paymentInfo]);

  useEffect(() => {
    async function renderPaymentWidgets() {
      if (!widgets) return;
      try {
        await widgets.setAmount({
          currency: "KRW",
          value: price
        });

        let paymentMethodWidgetInstance;
        await Promise.all([
          /**
           * 결제창을 렌더링합니다.
           * @docs https://docs.tosspayments.com/sdk/v2/js#widgetsrenderpaymentmethods
           */
          paymentMethodWidgetInstance = await widgets.renderPaymentMethods({
            selector: "#payment-method",
            // 렌더링하고 싶은 결제 UI의 variantKey
            // 결제 수단 및 스타일이 다른 멀티 UI를 직접 만들고 싶다면 계약이 필요해요.
            // @docs https://docs.tosspayments.com/guides/v2/payment-widget/admin#새로운-결제-ui-추가하기
            variantKey: "DEFAULT",
          }),
          /**
           * 약관을 렌더링합니다.
           * @docs https://docs.tosspayments.com/reference/widget-sdk#renderagreement선택자-옵션
           */
          widgets.renderAgreement({ selector: "#agreement", variantKey: "AGREEMENT" }),
        ]);
        setPaymentMethodWidget(paymentMethodWidgetInstance);

        const paymentRequestButton = document.getElementById('payment-request-button');

        paymentRequestButton.addEventListener('click', async () => {
          const orderId = nanoid();
          try {
            /**
             * 결제 요청
             * 결제를 요청하기 전에 orderId, amount를 서버에 저장하세요.
             * 결제 과정에서 악의적으로 결제 금액이 바뀌는 것을 확인하는 용도입니다.
             * @docs https://docs.tosspayments.com/sdk/v2/js#widgetsrequestpayment
             */
            await axiosInstance.post('/transactions/save-orderid', {
              transactionId: paymentId,
              orderId,
              price
            });
            await widgets.requestPayment({
              orderId: orderId,
              orderName: paymentInfo.caregiverName,
              successUrl: window.location.origin + "/payment/success",
              failUrl: window.location.origin + "/payment/fail",
              customerEmail: "customer123@gmail.com",
              customerName: paymentInfo.userName,
              customerMobilePhone: "01012341234",
            });
          } catch (err) {
            console.log("err", err);
          }
        });
      } catch (error) {
        console.error("결제위젯을 렌더링할 수 없습니다:", error);
      }
    }
    renderPaymentWidgets();
    // 클린업: 결제 UI가 존재하면 제거합니다.
    return () => {
      if (paymentMethodWidget) {
        paymentMethodWidget.destroy();
        setPaymentMethodWidget(null);
      }
    };
  }, [widgets, paymentMethodWidget, price, paymentId, paymentInfo]);

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

      {/* 결제 수단 선택 (API에서 자동 생성) */}
      <div id="payment-method" />

      {/* 약관 동의 (API에서 자동 생성) */}
      <div id="agreement" className="w-100"></div>

      {/* 결제 버튼 */}
      <div className={styles.buttonSection}>
        <button id="payment-request-button" className={styles.paymentButton}>
          결제하기
        </button>
      </div>
    </div>
  );
}

export default Checkout;
