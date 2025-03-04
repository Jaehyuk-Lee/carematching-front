import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import styles from "./caregiverInfo.module.css";

const CaregiverInfo = () => {
  const navigate = useNavigate();
  const [caregiver, setCaregiver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCaregiverData = async () => {
      try {
        const response = await axiosInstance.get("/api/caregivers/user");
        if (response.status === 200) {
          setCaregiver(response.data);
        }
      } catch (error) {
        console.error("요양사 정보를 불러오는 중 오류 발생:", error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCaregiverData();
  }, []);

  if (loading) return <div className={styles.message}>로딩중...</div>;
  if (error) return <div className={styles.message}>에러: {error.message}</div>;
  if (!caregiver) return <div className={styles.message}>등록된 요양사 정보가 없습니다.</div>;

  const formatSalary = (salary) => {
    return salary ? `${salary / 10000}만원` : "정보 없음";
  };

  // 근무 요일을 이진 문자열에서 한글 요일로 변환
  const convertBinaryToDays = (binaryString) => {
    const days = ["월", "화", "수", "목", "금", "토", "일"];
    return binaryString
      .split("")
      .map((bit, index) => (bit === "1" ? days[index] : ""))
      .join("");
  };

  return (
    <div className={styles.infoContainer}>
      <h2 className={styles.title}>요양사 정보</h2>
      <div className={styles.infoBox}>
        <p><strong>이름:</strong> {caregiver.realName}</p>
        <p><strong>희망 월급:</strong> {formatSalary(caregiver.salary)}</p>
        <p><strong>전문 분야:</strong> {caregiver.servNeeded}</p>
        <p><strong>거주 지역:</strong> {caregiver.loc}</p>
        <p><strong>고용 형태:</strong> {caregiver.employmentType === "CONTRACT" ? "계약직" : "정규직"}</p>
        <p><strong>근무 형태:</strong> {caregiver.workForm === "COMMUTE" ? "출퇴근형" : "상주형"}</p>
        <p><strong>근무 요일:</strong> {convertBinaryToDays(caregiver.workDays)}</p>
        <p><strong>근무 시간:</strong> {caregiver.workTime === "MORNING" ? "오전" : caregiver.workTime === "AFTERNOON" ? "오후" : "풀타임"}</p>
        <p><strong>공개 여부:</strong> {caregiver.status === "OPEN" ? "공개" : "비공개"}</p>
      </div>
      <button className={styles.editButton} onClick={() => navigate("/mypage/edit-caregiver")}>
        수정하기
      </button>
    </div>
  );
};

export default CaregiverInfo;
