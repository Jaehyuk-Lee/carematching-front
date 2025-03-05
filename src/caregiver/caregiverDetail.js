import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import styles from "./caregiverDetail.module.css";

export default function CaregiverDetailPage() {
  const { id } = useParams();
  const [caregiver, setCaregiver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("info"); // 탭 상태 추가
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    axiosInstance
      .get(`/api/caregivers/${id}`)
      .then((response) => {
        setCaregiver(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("데이터 로드 에러:", err);
        setError(err);
        setLoading(false);
      });
  }, [id]);

  const convertBinaryToDays = (binaryString) => {
    const daysOfWeek = ["월", "화", "수", "목", "금", "토", "일"];
    return binaryString
      .split("")
      .map((bit, index) => (bit === "1" ? daysOfWeek[index] : ""))
      .filter(day => day !== "")
      .join(", ");
  };

  const handleMatchClick = async () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      console.log("📦 [REQUEST] 방 생성 요청:", {
        requesterUserId: Number(user.id),
        caregiverId: Number(id),
      });

      const response = await axiosInstance.post("/api/rooms", {
        requesterUserId: Number(user.id),
        caregiverId: Number(id),
      });

      console.log("🚀 [SUCCESS] 방 생성 성공:", response.data);

      if (response.data.roomId) {
        navigate(`/rooms/${response.data.roomId}`);
      }
    } catch (error) {
      console.error("❌ [ERROR] 방 생성 중 오류:", error.response?.data || error.message);
      alert("방 생성 중 오류가 발생했습니다.");
    }
  };

  if (loading) return <div className="loading-container">로딩중...</div>;
  if (error) return <div className="error-container">에러: {error.message}</div>;
  if (!caregiver) return <div className="no-data-container">데이터가 없습니다.</div>;

  return (
    <div className="caregiver-detail-container">
      <div className="caregiver-detail-grid">
        {/* 요양사 프로필 이미지 */}
        <div className="caregiver-image-container">
          <div className="caregiver-image">
            <img
              src={caregiver.profileImage || "/placeholder.svg?height=400&width=400&text=프로필"}
              alt={caregiver.realName}
            />
          </div>
        </div>

        {/* 요양사 기본 정보 */}
        <div className="caregiver-info-container">
          <div className="caregiver-header">
            <h1 className="caregiver-name">{caregiver.realName} 요양사</h1>
            <div className="caregiver-rating">
              <span className="star-icon">★</span>
              <span>4.8 (리뷰 12개)</span>
            </div>
          </div>

          <div className="caregiver-details">
            <div className="detail-item">
              <span className="detail-icon">📍</span>
              <span>{caregiver.loc}</span>
            </div>
            <div className="detail-item">
              <span className="detail-icon">🏆</span>
              <span>{caregiver.servNeeded}</span>
            </div>
            <div className="detail-item">
              <span className="detail-icon">📅</span>
              <span>{convertBinaryToDays(caregiver.workDays)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-icon">⏰</span>
              <span>
                {caregiver.workTime === "MORNING"
                  ? "오전"
                  : caregiver.workTime === "AFTERNOON"
                  ? "오후"
                  : caregiver.workTime === "FULLTIME"
                  ? "풀타임"
                  : caregiver.workTime}
              </span>
            </div>
          </div>

          <div className="caregiver-price-action">
            <div className="caregiver-price">
              <p className="price-amount">{caregiver.salary}만원</p>
              <p className="price-label">월급</p>
            </div>
            <button className="match-button" onClick={handleMatchClick}>
              매칭하기
            </button>
          </div>
        </div>
      </div>

      {/* 상세 정보 탭 */}
      <div className="caregiver-tabs">
        <div className="tabs-header">
          <button
            className={`tab-button ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            기본 정보
          </button>
          <button
            className={`tab-button ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            서비스
          </button>
          <button
            className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            리뷰
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'info' && (
            <div className="info-tab">
              <div className="info-card">
                <h3 className="card-title">요양사 정보</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">근무 형태</span>
                    <span className="info-value">
                      {caregiver.workForm === "COMMUTE"
                        ? "출퇴근형"
                        : caregiver.workForm === "LIVE_IN"
                        ? "상주형"
                        : caregiver.workForm}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">고용 형태</span>
                    <span className="info-value">
                      {caregiver.employmentType === "CONTRACT"
                        ? "계약직"
                        : caregiver.employmentType === "PERMANENT"
                        ? "정규직"
                        : caregiver.employmentType}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">근무 요일</span>
                    <span className="info-value">{convertBinaryToDays(caregiver.workDays)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">근무 시간</span>
                    <span className="info-value">
                      {caregiver.workTime === "MORNING"
                        ? "오전"
                        : caregiver.workTime === "AFTERNOON"
                        ? "오후"
                        : caregiver.workTime === "FULLTIME"
                        ? "풀타임"
                        : caregiver.workTime}
                    </span>
                  </div>
                </div>
              </div>

              <div className="info-card">
                <h3 className="card-title">자기 소개</h3>
                <p className="bio-text">
                  안녕하세요, {caregiver.realName} 요양사입니다. 저는 {caregiver.servNeeded} 분야에 전문성을 가지고 있으며,
                  환자분들의 건강과 행복을 위해 최선을 다하고 있습니다.
                  {caregiver.workForm === "COMMUTE" ? "출퇴근형" : "상주형"} 근무를 통해
                  필요하신 시간에 최상의 케어를 제공해 드리겠습니다.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'services' && (
            <div className="services-tab">
              <div className="info-card">
                <h3 className="card-title">제공 서비스</h3>
                <div className="services-list">
                  <div className="service-tag">일상생활 지원</div>
                  <div className="service-tag">식사 준비</div>
                  <div className="service-tag">약 복용 관리</div>
                  <div className="service-tag">병원 동행</div>
                  <div className="service-tag">{caregiver.servNeeded}</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="reviews-tab">
              <div className="info-card">
                <h3 className="card-title">이용자 리뷰</h3>
                <div className="reviews-list">
                  <div className="review-item">
                    <div className="review-header">
                      <span className="reviewer-name">이용자A</span>
                      <div className="review-rating">
                        <span className="star-icon">★★★★★</span>
                      </div>
                      <span className="review-date">2023-10-15</span>
                    </div>
                    <p className="review-text">
                      매우 친절하고 전문적인 케어를 제공해주셨습니다. 어머니가 매우 만족하셨어요.
                    </p>
                  </div>
                  <div className="review-item">
                    <div className="review-header">
                      <span className="reviewer-name">이용자B</span>
                      <div className="review-rating">
                        <span className="star-icon">★★★★★</span>
                      </div>
                      <span className="review-date">2023-09-22</span>
                    </div>
                    <p className="review-text">
                      정확한 시간 약속과 세심한 케어가 인상적이었습니다. 다음에도 꼭 부탁드리고 싶어요.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
