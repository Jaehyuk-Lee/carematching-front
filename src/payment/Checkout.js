import { useEffect, useState } from "react";
import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";
import { nanoid } from "nanoid";
import styles from './Checkout.module.css';
import { useSearchParams } from 'react-router-dom';
import axiosInstance from "../api/axiosInstance";

function Checkout() {
  const [widgets, setWidgets] = useState(null);
  const [originalPrice, setOriginalPrice] = useState(1000000); // 원래 가격
  const [price, setPrice] = useState(originalPrice); // 할인 적용된 가격
  const [isDiscounted, setIsDiscounted] = useState(false); // 할인 적용 여부
  const [paymentMethodWidget, setPaymentMethodWidget] = useState(null);

  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('id');
  const [paymentInfo, setPaymentInfo] = useState(null);

  const clientKey = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm"; // 테스트 키

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
  }, [clientKey]);

  useEffect(() => {
    if (paymentId) {
      // 결제 ID로 결제 정보 조회
      axiosInstance.get(`/api/payment/info/${paymentId}`)
        .then(response => {
          setPaymentInfo(response.data);
        })
        .catch(error => {
          console.error('결제 정보 조회 중 오류 발생:', error);
        });
    }
  }, [paymentId]);

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
          try {
            /**
             * 결제 요청
             * 결제를 요청하기 전에 orderId, amount를 서버에 저장하세요.
             * 결제 과정에서 악의적으로 결제 금액이 바뀌는 것을 확인하는 용도입니다.
             * @docs https://docs.tosspayments.com/sdk/v2/js#widgetsrequestpayment
             */
            await widgets.requestPayment({
              orderId: nanoid(),
              orderName: "토스 티셔츠 외 2건",
              successUrl: window.location.origin + "/payment/success",
              failUrl: window.location.origin + "/payment/fail",
              customerEmail: "customer123@gmail.com",
              customerName: "김토스",
              customerMobilePhone: "01012341234",
            });
          } catch (err) {
            // TODO: 에러 처리
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
  }, [widgets, paymentMethodWidget, price]);

  // 할인 적용 처리 함수
  const handleDiscountChange = (event) => {
    const applyDiscount = event.target.checked;
    setIsDiscounted(applyDiscount);
    setPrice(applyDiscount ? Math.round(originalPrice * 0.9) : originalPrice);
  };

  if (searchParams.get('test') === '1') setPaymentInfo({ amount: 1000000, productName: '토스 티셔츠 외 2건' });
  if (!paymentInfo) return <div>결제 정보를 찾을 수 없습니다.</div>;

  return (
    <div className={styles.checkoutContainer}>
      <h1 className={styles.checkoutTitle}>주문서</h1>

      {/* 결제 금액 섹션 */}
      <div className={styles.priceSection}>
        <h3 className={styles.priceTitle}>결제 금액:</h3>
        <div className={styles.priceContainer}>
          {isDiscounted && (
            <span className={styles.originalPrice}>{originalPrice.toLocaleString()}원</span>
          )}
          <h2 className={styles.priceAmount}>{price.toLocaleString()}원</h2>
        </div>
      </div>

      {/* 할인 쿠폰 섹션 */}
      <div className={styles.discountSection}>
        <label className={styles.discountLabel}>
          <input
            type="checkbox"
            className={styles.discountCheckbox}
            checked={isDiscounted}
            onChange={handleDiscountChange}
          />
          <span className={styles.discountText}>첫 결제 10% 할인 쿠폰 적용</span>
        </label>
      </div>

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
