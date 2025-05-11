import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axiosInstance from "../api/axiosInstance"
import styles from "./caregiverInfo.module.css"
import basicProfileImage from "../assets/basicprofileimage.png"

const CaregiverInfo = () => {
  const navigate = useNavigate()
  const [caregiver, setCaregiver] = useState(null)

  useEffect(() => {
    const fetchCaregiverData = async () => {
      try {
        const response = await axiosInstance.get("/caregivers/user")
        if (response.status === 200) {
          setCaregiver(response.data)
        }
      } catch (error) {
        console.error("요양사 정보를 불러오는 중 오류 발생:", error)
      }
    }

    fetchCaregiverData()
  }, [])

  if (!caregiver) return <div className={styles.message}>등록된 요양사 정보가 없습니다.</div>

  const formatSalary = (salary) => {
    return salary ? salary / 10000 : 0
  }

  // 근무 요일을 이진 문자열에서 한글 요일로 변환
  const convertBinaryToDays = (binaryString) => {
    const days = ["월", "화", "수", "목", "금", "토", "일"]
    return binaryString
      .split("")
      .map((bit, index) => (bit === "1" ? days[index] : ""))
      .filter((day) => day !== "")
      .join(", ")
  }

  return (
    <div className={styles.infoContainer}>
      <h2 className={styles.title}>요양사 정보</h2>

      {/* 프로필 이미지 섹션 추가 */}
      <div className={styles.profileImageSection}>
        <img
          src={caregiver.caregiverImage || basicProfileImage}
          alt={`${caregiver.realName} 프로필`}
          className={styles.profileImage}
        />
      </div>

      <div className={styles.infoBox}>
        <p>
          <strong>이름:</strong> {caregiver.realName}
        </p>
        <p>
          <strong>희망 월급:</strong> {formatSalary(caregiver.salary)}만원
        </p>
        <p>
          <strong>전문 분야:</strong> {caregiver.servNeeded}
        </p>
        <p>
          <strong>거주 지역:</strong> {caregiver.loc}
        </p>
        <p>
          <strong>고용 형태:</strong> {caregiver.employmentType === "CONTRACT" ? "계약직" : "정규직"}
        </p>
        <p>
          <strong>근무 형태:</strong> {caregiver.workForm === "COMMUTE" ? "출퇴근형" : "상주형"}
        </p>
        <p>
          <strong>근무 요일:</strong> {convertBinaryToDays(caregiver.workDays)}
        </p>
        <p>
          <strong>근무 시간:</strong>{" "}
          {caregiver.workTime === "MORNING" ? "오전" : caregiver.workTime === "AFTERNOON" ? "오후" : "풀타임"}
        </p>
        <p>
          <strong>공개 여부:</strong> {caregiver.status === "OPEN" ? "공개" : "비공개"}
        </p>

        {/* 경력 정보 섹션 */}
        {caregiver.experienceList && caregiver.experienceList.length > 0 && (
          <div className={styles.experienceSection}>
            <h3 className={styles.experienceTitle}>경력 정보</h3>
            <div className={styles.experienceList}>
              {caregiver.experienceList.map((experience, index) => (
                <div key={index} className={styles.experienceItem}>
                  <div className={styles.experienceHeader}>
                    <span className={styles.experienceNumber}>경력 #{index + 1}</span>
                  </div>
                  <div className={styles.experienceContent}>
                    {experience.title && (
                      <p>
                        <strong>이력:</strong> {experience.title}
                      </p>
                    )}
                    {experience.summary && (
                      <p>
                        <strong>요약:</strong> {experience.summary}
                      </p>
                    )}
                    {experience.location && (
                      <p>
                        <strong>장소:</strong> {experience.location}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <button className={styles.editButton} onClick={() => navigate("/mypage/edit-caregiver")}>
        수정하기
      </button>
    </div>
  )
}

export default CaregiverInfo

