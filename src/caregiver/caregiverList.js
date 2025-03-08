import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axiosInstance from "../api/axiosInstance"
import styles from "./caregiverList.module.css"
import { MapPin, Calendar, Briefcase, DollarSign, Star, Search } from "lucide-react"
import basicProfileImage from "../assets/basicprofileimage.png"

function CaregiverList() {
  const [caregivers, setCaregivers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [searchField, setSearchField] = useState("전체")
  const [reviews, setReviews] = useState([])
  const [workFormFilter, setWorkFormFilter] = useState("전체")

  useEffect(() => {
    axiosInstance
      .get("/api/caregivers")
      .then((response) => {
        setCaregivers(response.data)
      })
      .catch((err) => {
        console.error("요양사 데이터를 가져오는 중 에러 발생:", err)
      })
  }, [])

  // 근무 요일을 이진 문자열에서 한글 요일 문자열로 변환
  const convertBinaryToDays = (binaryStr) => {
    if (!binaryStr) return ""
    const days = ["월", "화", "수", "목", "금", "토", "일"]
    return binaryStr
      .split("")
      .map((bit, index) => (bit === "1" ? days[index] : ""))
      .filter(Boolean)
      .join(", ")
  }

  const formatWorkForm = (workForm) => {
    switch (workForm) {
      case "LIVE_IN":
        return "상주형"
      case "COMMUTE":
        return "출퇴근형"
      default:
        return "정보 없음" // 기본값
    }
  }

  const formatSalary = (salary) => {
    return salary ? `${(salary / 10000).toFixed(0)}만원` : "0만원"
  }

  // 리뷰 개수를 포맷하는 함수
  const formatReviewCount = (count) => {
    if (count >= 1000) {
      return `${Math.round(count / 100) / 10}k`; // 1000 이상일 경우 k로 표시
    }
    return count; // 1000 미만일 경우 원래 숫자 반환
  }

  // 검색어에 맞게 요양사 목록을 필터링
  const filteredCaregivers = caregivers.filter((caregiver) => {
    const workDaysKorean = convertBinaryToDays(caregiver.workDays ?? "")
    const search = searchTerm.toLowerCase()

    // 근무 형태 필터링
    const workFormMatches = workFormFilter === "전체" ||
      (workFormFilter === "출퇴근형" && caregiver.workForm === "COMMUTE") ||
      (workFormFilter === "상주형" && caregiver.workForm === "LIVE_IN")

    // 검색 필터링
    const searchMatches = searchField === "이름" ? (caregiver.realName?.toLowerCase() ?? "").includes(search) :
      searchField === "지역" ? (caregiver.loc?.toLowerCase() ?? "").includes(search) :
      searchField === "전문 분야" ? (caregiver.servNeeded?.toLowerCase() ?? "").includes(search) :
      searchField === "근무 요일" ? workDaysKorean.includes(search) :
      searchField === "전체" ? (
        (caregiver.realName?.toLowerCase() ?? "").includes(search) ||
        (caregiver.loc?.toLowerCase() ?? "").includes(search) ||
        (caregiver.servNeeded?.toLowerCase() ?? "").includes(search) ||
        workDaysKorean.includes(search)
      ) : false

    return workFormMatches && searchMatches
  })

  // 근무 형태 필터 변경 핸들러
  const handleWorkFormFilterChange = (form) => {
    setWorkFormFilter(form)
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>요양사 목록</h1>

      <div className={styles.searchBar}>
        <select value={searchField} onChange={(e) => setSearchField(e.target.value)} className={styles.searchSelect}>
          <option value="전체">전체</option>
          <option value="이름">이름</option>
          <option value="지역">지역</option>
          <option value="전문 분야">전문 분야</option>
          <option value="근무 요일">근무 요일</option>
          <option value="월급">월급</option>
        </select>
        <div className={styles.searchContainer}>
          <Search size={20} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="검색어를 입력하세요..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className={styles.filterContainer}>
        <button onClick={() => handleWorkFormFilterChange("전체")}>전체</button>
        <button onClick={() => handleWorkFormFilterChange("출퇴근형")}>출퇴근형</button>
        <button onClick={() => handleWorkFormFilterChange("상주형")}>상주형</button>
      </div>

      <div className={styles.cardGrid}>
        {filteredCaregivers.length === 0 ? (
          <div className={styles.noResults}>검색 결과가 없습니다.</div>
        ) : (
          filteredCaregivers.map((caregiver) => (
            <Link key={caregiver.id} to={`/caregiver/${caregiver.id}`} className={styles.cardLink}>
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.caregiverInfo}>
                    <div className={styles.avatar}>
                      <img src={caregiver.image || basicProfileImage} alt={caregiver.realName} />
                    </div>
                    <div>
                      <h3 className={styles.cardTitle}>{caregiver.realName || "이름 없음"}</h3>
                      <div className={styles.rating}>
                        <Star size={16} className={styles.icon} />
                        <span>{caregiver?.reviews?.star}3.5</span>
                        <span className={styles.dot}>•</span>
                        <span>{formatReviewCount(caregiver?.reviews?.count)} 리뷰</span>
                      </div>
                    </div>
                  </div>
                  <span className={styles.servNeeded}>
                    {caregiver.servNeeded
                      ? caregiver.servNeeded.split(",").map((specialty, i) => (
                          <span key={i} className={styles.servNeededBadge}>
                            {specialty.trim()}
                          </span>
                        ))
                      : "분야 미정"}
                  </span>
                </div>
                <div className={styles.cardContent}>
                  <p className={styles.cardText}>
                    <MapPin size={16} className={styles.icon} />
                    <span className={styles.cardTextLabel}>지역:</span> {caregiver.loc || "지역 미정"}
                  </p>
                  <p className={styles.cardText}>
                    <Briefcase size={16} className={styles.icon} />
                    <span className={styles.cardTextLabel}>근무 형태:</span> {formatWorkForm(caregiver.workForm)}
                  </p>
                  <p className={styles.cardText}>
                    <Calendar size={16} className={styles.icon} />
                    <span className={styles.cardTextLabel}>근무 요일:</span>{" "}
                    {convertBinaryToDays(caregiver.workDays) || "요일 미정"}
                  </p>
                  <p className={styles.cardText}>
                    <DollarSign size={16} className={styles.icon} />
                    <span className={styles.cardTextLabel}>월급:</span> {formatSalary(caregiver.salary)}
                  </p>
                </div>
                <div className="card-footer">
                  <button className="btn-text">
                    <Calendar size={22} className={styles.icon} />
                    예약하기
                  </button>
                  <button className="btn-text">
                    프로필 보기
                  </button>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}

export default CaregiverList
