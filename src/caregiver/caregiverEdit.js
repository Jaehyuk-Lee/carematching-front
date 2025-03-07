import { useEffect, useState } from "react";
import styles from "./caregiverEdit.module.css";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Plus, X } from "lucide-react";

const CaregiverEdit = ({ isRegistered }) => {
  const navigate = useNavigate()
  const daysOfWeek = ["월", "화", "수", "목", "금", "토", "일"]

  // experienceList 상태 관리
  const [experienceList, setExperienceList] = useState(null)

  const [formData, setFormData] = useState({
    realName: "",
    salary: "",
    servNeeded: "",
    loc: "",
    employmentType: "CONTRACT",
    workForm: "COMMUTE",
    workTime: "MORNING",
    workDays: "0000000",
    status: "OPEN",
    experienceList: [],

  })

  useEffect(() => {
    const fetchCaregiverData = async () => {
      try {
        const response = await axiosInstance.get("/api/caregivers/user")
        if (response.status === 200) {
          const data = response.data
          setFormData({
            ...data,
            salary: data.salary ? Math.floor(data.salary / 10000) : "", // DB에서 가져온 값을 만 단위로 변환
          })

          // experienceList 데이터가 있으면 설정
          console.log("data", data);
          if (data.experienceList && data.experienceList.length > 0) {
            setExperienceList(data.experienceList)
          }
        }
      } catch (error) {
        console.error("Caregiver 데이터를 불러오는 중 오류 발생:", error)
      }
    }

    if (isRegistered) {
      fetchCaregiverData()
    }
  }, [isRegistered])

  const handleWorkDaysChange = (index) => {
    const workDaysArray = formData.workDays.split("") // 현재 이진 문자열을 배열로 변환
    workDaysArray[index] = workDaysArray[index] === "1" ? "0" : "1" // 선택 상태 변경
    setFormData({ ...formData, workDays: workDaysArray.join("") }) // 다시 이진 문자열로 저장
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  // 경험 카드 관련 함수들
  const handleAddExperience = () => {
    // experienceList가 null이면 새 배열 생성, 아니면 기존 배열에 추가
    const newList =
      experienceList === null
        ? [{ title: "", summary: "", location: "" }]
        : [...experienceList, { title: "", summary: "", location: "" }]

    setExperienceList(newList)
  }

  const handleRemoveExperience = (index) => {
    const newList = [...experienceList]
    newList.splice(index, 1)

    // 모든 카드가 삭제되면 experienceList를 null로 설정
    if (newList.length === 0) {
      setExperienceList(null)
    } else {
      setExperienceList(newList)
    }
  }

  const handleExperienceChange = (index, field, value) => {
    const newList = [...experienceList]
    newList[index][field] = value
    setExperienceList(newList)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const updatedFormData = {
        ...formData,
        salary: Number(formData.salary) * 10000, // 입력된 값 * 10,000을 적용하여 DB에 저장
        experienceList: experienceList || [], // experienceList가 null이면 빈 배열 전송
      }
      console.log("updatedFormData", updatedFormData);
      const endpoint = "/api/caregivers/build"
      const response = await axiosInstance.post(endpoint, updatedFormData)
      if (response.status === 201) {
        Swal.fire({
          icon: "success",
          title: `${isRegistered ? "수정" : "등록"} 완료`,
          text: `요양사 ${isRegistered ? "수정" : "등록"}이 완료되었습니다!`,
        })
        navigate("/mypage/caregiver-info")
      }
    } catch (error) {
      console.error(isRegistered ? "요양사 업데이트 실패:" : "요양사 등록 실패:", error)
      Swal.fire({
        icon: "error",
        title: "오류 발생",
        text: `요양사 정보 ${isRegistered ? "수정" : "등록"} 중 오류가 발생했습니다.`,
      })
    }
  }

  return (
    <div className={styles.editCaregiverPage}>
      <h2>{isRegistered ? "요양사 정보 수정" : "요양사 등록"}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className={styles.inputGroup}>
          <label>실명</label>
          <input type="text" id="realName" name="realName" value={formData.realName} onChange={handleChange} required />
        </div>
        <div className={styles.inputGroup}>
          <label>희망 월급</label>
          <div className={styles.salaryInputContainer}>
            <input
              type="number"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              required
              className={styles.salaryInput} // 스타일 적용
            />
            <span className={styles.salaryUnit}>만원</span> {/* "만원"이 옆에 붙음 */}
          </div>
        </div>
        <div className={styles.inputGroup}>
          <label>전문 분야</label>
          <input
            type="text"
            id="servNeeded"
            name="servNeeded"
            value={formData.servNeeded}
            onChange={handleChange}
            placeholder="여러 개일 경우 ,로 구분해주세요."
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <label>거주 지역</label>
          <input type="text" id="loc" name="loc" value={formData.loc} onChange={handleChange} required />
        </div>
        <div className={styles.inputGroup}>
          <label>고용 형태</label>
          <select name="employmentType" value={formData.employmentType} onChange={handleChange} required>
            <option value="CONTRACT">계약직</option>
            <option value="PERMANENT">정규직</option>
          </select>
        </div>
        <div className={styles.inputGroup}>
          <label>근무 형태</label>
          <select name="workForm" value={formData.workForm} onChange={handleChange} required>
            <option value="COMMUTE">출퇴근형</option>
            <option value="LIVE_IN">상주형</option>
          </select>
        </div>
        <div className={styles.inputGroup}>
          <label>근무 요일</label>
          <div className={styles.checkboxRow}>
            {daysOfWeek.map((day, index) => (
              <div key={index} className={styles.checkboxItem}>
                <span>{day}</span>
                <input
                  type="checkbox"
                  checked={formData.workDays[index] === "1"} // 현재 이진 값에 따라 체크 여부 설정
                  onChange={() => handleWorkDaysChange(index)} // 체크 시 상태 업데이트
                />
              </div>
            ))}
          </div>
        </div>
        <div className={styles.inputGroup}>
          <label>근무 시간</label>
          <select name="workTime" value={formData.workTime} onChange={handleChange} required>
            <option value="MORNING">오전</option>
            <option value="AFTERNOON">오후</option>
            <option value="FULLTIME">풀타임</option>
          </select>
        </div>
        <div className={styles.inputGroup}>
          <label>공개 여부</label>
          <select name="status" value={formData.status} onChange={handleChange} required>
            <option value="OPEN">정보 공개</option>
            <option value="CLOSE">비공개</option>
          </select>
        </div>

        {/* 경력 섹션 헤더 */}
        <div className={styles.experienceSectionHeader}>
          <h3>경력 정보</h3>
          <button type="button" className={styles.addButton} onClick={handleAddExperience}>
            <Plus size={16} />
            <span>추가</span>
          </button>
        </div>

        {/* 경력 카드 영역 */}
        {experienceList && experienceList.length > 0 && (
          <div className={styles.experienceCardsContainer}>
            {experienceList.map((experience, index) => (
              <div key={index} className={styles.experienceCard}>
                <div className={styles.cardHeader}>
                  <span>경력 #{index + 1}</span>
                  <button
                    type="button"
                    className={styles.removeCardButton}
                    onClick={() => handleRemoveExperience(index)}
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className={styles.cardContent}>
                  <div className={styles.inputGroup}>
                    <label>이력</label>
                    <input
                      type="text"
                      value={experience.title}
                      onChange={(e) => handleExperienceChange(index, "title", e.target.value)}
                      placeholder="어떤 일을 했는지 입력해주세요"
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>요약</label>
                    <input
                      type="text"
                      value={experience.summary}
                      onChange={(e) => handleExperienceChange(index, "summary", e.target.value)}
                      placeholder="한 일을 요약하세요 (여럿일 경우 ,로 구분해주세요)"
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>장소</label>
                    <input
                    type="text"
                      value={experience.location}
                      onChange={(e) => handleExperienceChange(index, "location", e.target.value)}
                      placeholder="경력을 쌓은 장소를 적어주세요."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <button type="submit" className={styles.submitButton}>
          {isRegistered ? "수정하기" : "등록하기"}
        </button>
      </form>
    </div>
  )
}

export default CaregiverEdit
