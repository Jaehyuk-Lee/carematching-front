import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from './caregiverList.module.css';

export default function CaregiverListPage() {
  const [caregivers, setCaregivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // 🔍 검색어 상태
  const [searchField, setSearchField] = useState("전체"); // 🔍 검색 필드 상태

  useEffect(() => {
    fetch("/api/caregivers")
      .then((res) => {
        if (!res.ok) throw new Error("네트워크 응답이 올바르지 않습니다.");
        return res.json();
      })
      .then((data) => {
        setCaregivers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("요양사 데이터를 가져오는 중 에러 발생:", err);
        setError(err);
        setLoading(false);
      });
  }, []);

  // 근무 요일을 이진 문자열에서 한글 요일 문자열로 변환
  const binaryToKoreanDays = (binaryStr) => {
    const days = ["월", "화", "수", "목", "금", "토", "일"];
    return binaryStr
      .split("")
      .map((bit, index) => (bit === "1" ? days[index] : ""))
      .join("");
  };

  // 검색어에 맞게 요양사 목록을 필터링
  const filteredCaregivers = caregivers.filter((caregiver) => {
    const workDaysKorean = binaryToKoreanDays(caregiver.workDays ?? "");

    const search = searchTerm.toLowerCase();

    switch (searchField) {
      case "이름":
        return (caregiver.realName?.toLowerCase() ?? "").includes(search);
      case "지역":
        return (caregiver.loc?.toLowerCase() ?? "").includes(search);
      case "전문 분야":
        return (caregiver.servNeeded?.toLowerCase() ?? "").includes(search);
      case "근무 요일":
        return workDaysKorean.includes(search);
      case "봉급":
        return String(caregiver.salary ?? "").includes(search);
      default: // "전체" 검색
        return (
          (caregiver.realName?.toLowerCase() ?? "").includes(search) ||
          (caregiver.loc?.toLowerCase() ?? "").includes(search) ||
          (caregiver.servNeeded?.toLowerCase() ?? "").includes(search) ||
          workDaysKorean.includes(search) ||
          String(caregiver.salary ?? "").includes(search) ||
          (caregiver.status?.toLowerCase() ?? "").includes(search)
        );
    }
  });

  if (loading) return <div className={styles.message}>로딩중...</div>;
  if (error) return <div className={styles.message}>에러: {error.message}</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>요양사 목록</h1>

      {/* 검색바와 검색 필드 선택 추가 */}
      <div className={styles.searchBar}>
        <select
          value={searchField}
          onChange={(e) => setSearchField(e.target.value)}
          className={styles.searchSelect}
        >
          <option value="전체">전체</option>
          <option value="이름">이름</option>
          <option value="지역">지역</option>
          <option value="전문 분야">전문 분야</option>
          <option value="근무 요일">근무 요일</option>
          <option value="봉급">봉급</option>
        </select>

        <input
          type="text"
          placeholder="검색어를 입력하세요..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.cardGrid}>
        {filteredCaregivers.length === 0 ? (
          <div className={styles.noResults}>검색 결과가 없습니다.</div>
        ) : (
          filteredCaregivers.map((caregiver) => (
            <Link
              key={caregiver.id}
              to={`/caregiver/${caregiver.id}`}
              className={styles.cardLink}
            >
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>{caregiver.realName}</h3>
                <p className={styles.cardText}>지역 | {caregiver.loc}</p>
                <p className={styles.cardText}>전문 분야 | {caregiver.servNeeded}</p>
                <p className={styles.cardText}>근무 요일 | {binaryToKoreanDays(caregiver.workDays)}</p>
                <p className={styles.cardText}>봉급 | {caregiver.salary}</p>
                <p className={styles.cardText}>{caregiver.status}</p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
