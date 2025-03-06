import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import axiosInstance from "../api/axiosInstance"
import styles from "./caregiverDetail.module.css"
import { MapPin, Award, Clock, Calendar, Briefcase, DollarSign, Star } from "lucide-react"

function CaregiverDetail() {
  const { id } = useParams()
  const [caregiver, setCaregiver] = useState(null)
  const [activeTab, setActiveTab] = useState("info")

  useEffect(() => {
    axiosInstance
      .get(`/api/caregivers/${id}`)
      .then((response) => {
        setCaregiver(response.data);
        console.log(response.data.experienceList);
      })
      .catch((err) => {
        console.error("데이터 로드 에러:", err);
      });
  }, [id]);

  const convertBinaryToDays = (binaryString) => {
    const daysOfWeek = ["월", "화", "수", "목", "금", "토", "일"]
    return binaryString
      .split("")
      .map((bit, index) => (bit === "1" ? daysOfWeek[index] : ""))
      .filter((day) => day !== "")
      .join(", ")
  }

  const formatSalary = (salary) => {
    return salary ? salary / 10000 : 0
  }

  return (
    <div className={styles.container}>
      <div className={styles.profileHeader}>
        <div className={styles.profileImageContainer}>
          <img
            src={caregiver?.profileImage || "/placeholder.svg?height=150&width=150"}
            alt={caregiver?.realName}
            className={styles.profileImage}
          />
        </div>

        <div className={styles.profileInfo}>
          <h1 className={styles.name}>{caregiver?.realName}</h1>
          <p className={styles.location}>
            <MapPin size={16} className={styles.icon} />
            {caregiver?.loc}
          </p>
          <div className={styles.specialtyTags}>
            {caregiver?.servNeeded.split(",").map((specialty, index) => (
              <span key={index} className={styles.tag}>
                {specialty.trim()}
              </span>
            ))}
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.contactButton}>채팅 시작하기</button>
        </div>
      </div>

      <div className={styles.tabsContainer}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === "info" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("info")}
          >
            요약 안내
          </button>
          <button
            className={`${styles.tab} ${activeTab === "profile" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            요양사 정보
          </button>
          <button
            className={`${styles.tab} ${activeTab === "schedule" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("schedule")}
          >
            후기/평판
          </button>
          <button
            className={`${styles.tab} ${activeTab === "experience" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("experience")}
          >
            요양사 경력
          </button>
        </div>
      </div>

      <div className={styles.contentContainer}>
        {activeTab === "info" && (
          <div className={styles.infoSection}>
            <h2 className={styles.sectionTitle}>요양사 한 마디</h2>

            <div className={styles.caringMethod}>
              <div className={styles.methodItem}>
                <p>* 정성과 배려로 편안한 일상을 만들어 드립니다.</p>
              </div>
              <div className={styles.methodItem}>
                <p>* 삶의 질을 높이는 맞춤형 케어를 제공합니다.</p>
              </div>
              <div className={styles.methodItem}>
                <p>* 신뢰와 배려로 가족 같은 돌봄을 실천합니다.</p>
              </div>
              <div className={styles.methodItem}>
                <p>
                  * 따뜻한 관심과 전문적인 케어로 여러분의 든든한 동반자가 되겠습니다.
                </p>
              </div>
              {caregiver?.servNeeded.includes("재활") && (<div className={styles.methodItem}>
                <p>
                  * 여러분의 재활을 위해 최선을 다하겠습니다.
                </p>
              </div>)}
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div className={styles.profileSection}>
            <div className={styles.infoCard}>
              <h3 className={styles.cardTitle}>기본 정보</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <Award className={styles.infoIcon} />
                  <div>
                    <strong>전문 분야</strong>
                    <p>{caregiver?.servNeeded}</p>
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <Calendar className={styles.infoIcon} />
                  <div>
                    <strong>근무 요일</strong>
                    <p>{convertBinaryToDays(caregiver?.workDays)}</p>
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <Clock className={styles.infoIcon} />
                  <div>
                    <strong>근무 시간</strong>
                    <p>
                      {caregiver?.workTime === "MORNING"
                        ? "오전"
                        : caregiver?.workTime === "AFTERNOON"
                          ? "오후"
                          : "풀타임"}
                    </p>
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <Briefcase className={styles.infoIcon} />
                  <div>
                    <strong>근무 형태</strong>
                    <p>{caregiver?.workForm === "COMMUTE" ? "출퇴근형" : "상주형"}</p>
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <Briefcase className={styles.infoIcon} />
                  <div>
                    <strong>고용 형태</strong>
                    <p>{caregiver?.employmentType === "CONTRACT" ? "계약직" : "정규직"}</p>
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <DollarSign className={styles.infoIcon} />
                  <div>
                    <strong>월급</strong>
                    <p>{formatSalary(caregiver?.salary)}만원</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "schedule" && (
          <div className={styles.reviewSection}>
            <div className={styles.reviewStats}>
              <div className={styles.ratingOverview}>
                <div className={styles.ratingScore}>
                  <span className={styles.score}>{caregiver?.reviewList?.stars || 0}</span>
                  <div className={styles.stars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={styles.starIcon} fill={star <= (caregiver?.reviewList?.stars || 0) ? "#FFD700" : "#E0E0E0"} color={star <= (caregiver?.reviewList?.stars || 0) ? "#FFD700" : "#E0E0E0"} />
                    ))}
                  </div>
                  <span className={styles.reviewCount}>총 {caregiver?.reviewList?.length || 0}개 후기</span>
                </div>
              </div>

              <div className={styles.reviewList}>
                {caregiver?.reviewList && caregiver?.reviewList.length > 0 ? (
                  caregiver?.reviewList.map((review, index) => (
                    <div key={index} className={styles.reviewItem}>
                      <div className={styles.reviewStars}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className={styles.starIcon} fill={star <= review.stars ? "#FFD700" : "#E0E0E0"} color={star <= review.stars ? "#FFD700" : "#E0E0E0"} />
                        ))}
                      </div>
                      <div className={styles.reviewContent}>
                        <p>{review.content}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className={styles.emptyReviews}>아직 등록된 후기가 없습니다.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "experience" && (
          <div className={styles.experienceSection}>
            {caregiver?.experienceList && caregiver.experienceList.length > 0 ? (
              caregiver.experienceList.map((experience, index) => (
                <div key={index} className={styles.experienceItem}>
                  <h3>{experience.title}</h3>
                  <p className={styles.experienceDetail}>
                    {experience.summary.split(",").map((sum, idx) => (
                      <span key={idx} className={styles.experienceTag}>{sum}</span>
                    ))}
                  </p>
                  <p className={styles.experienceLocation}>
                    <MapPin size={14} />
                    {experience.location}
                  </p>
                </div>
              ))
            ) : (
              <p>등록된 경력이 없습니다.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default CaregiverDetail;
