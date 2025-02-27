"use client"

import styles from './caregiverEdit.module.css';
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from 'react-router-dom';

const CaregiverRegister = ({ onRegisterSuccess }) => {
  const [formData, setFormData] = useState({
    realName: "",
    salary: "",
    servNeeded: "",
    loc: "",
    employmentType: "CONTRACT",
    workForm: "COMMUTE",
    workTime: "MORNING",
    workDays: "",
    status: "OPEN",
  });

  const [workDaysInput, setWorkDaysInput] = useState(""); // 사용자가 입력하는 값을 따로 저장
  const { user } = useAuth();
  const navigate = useNavigate();

  const convertDaysToBinary = (daysString) => {
    if (!daysString) return "";
    const days = ["월", "화", "수", "목", "금", "토", "일"];
    return days.map((day) => (daysString.includes(day) ? "1" : "0")).join("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "workDays") {
      setWorkDaysInput(value); // 사용자 입력을 그대로 유지
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleWorkDaysBlur = () => {
    setFormData({
      ...formData,
      workDays: convertDaysToBinary(workDaysInput), // 입력이 끝나면 변환 실행
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/caregivers/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "username": user?.username || "", // AuthContext에서 username 가져오기
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "요양사 등록 중 오류가 발생했습니다.");
      }

      alert("요양사 등록이 완료되었습니다!");
      onRegisterSuccess();
      navigate("/mypage/update-caregiver");
    } catch (error) {
      console.error("요양사 등록 실패:", error);
      alert(`요양사 등록 실패: ${error.message}`);
    }
  }

  return (
    <div className={styles.editCaregiverPage}>
      <h2>요양사 등록</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className={styles.inputGroup}>
          <label>실명</label>
          <input
            type="text"
            id="realName"
            name="realName"
            value={formData.realName}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <label>희망 월급</label>
          <input
            type="number"
            id="salary"
            name="salary"
            value={formData.salary}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <label>전문 분야</label>
          <input
            type="text"
            id="servNeeded"
            name="servNeeded"
            value={formData.servNeeded}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <label>거주 지역</label>
          <input
            type="text"
            id="loc"
            name="loc"
            value={formData.loc}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <label>고용 형태</label>
          <select
            name="employmentType"
            value={formData.employmentType}
            onChange={handleChange}
            required
          >
            <option value="CONTRACT">계약직</option>
            <option value="PERMANENT">정규직</option>
          </select>
        </div>
        <div className={styles.inputGroup}>
          <label>근무 형태</label>
          <select
            name="workForm"
            value={formData.workForm}
            onChange={handleChange}
            required
          >
            <option value="COMMUTE">출퇴근형</option>
            <option value="LIVE_IN">상주형</option>
          </select>
        </div>
        <div className={styles.inputGroup}>
          <label>근무 요일 (예: 월화수)</label>
          <input
            type="text"
            id="workDays"
            name="workDays"
            value={workDaysInput}
            onChange={handleChange}
            onBlur={handleWorkDaysBlur}
            placeholder="월화수"
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <label>근무 시간</label>
          <select
            name="workTime"
            value={formData.workTime}
            onChange={handleChange}
            required
          >
            <option value="MORNING">오전</option>
            <option value="AFTERNOON">오후</option>
            <option value="FULLTIME">풀타임</option>
          </select>
        </div>
        <div className={styles.inputGroup}>
          <label>공개 여부</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
          >
            <option value="OPEN">정보 공개</option>
            <option value="CLOSE">비공개</option>
          </select>
        </div>
        <button type="submit" className={styles.submitButton}>등록하기</button>
      </form>
    </div>
  )
}

export default CaregiverRegister;
