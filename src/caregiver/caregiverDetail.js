import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

function CaregiverDetail() {
  const { id } = useParams();
  const [caregiver, setCaregiver] = useState(null);

  useEffect(() => {
    axiosInstance
      .get(`/api/caregivers/${id}`)
      .then((response) => {
        setCaregiver(response.data);
      })
      .catch((err) => {
        console.error("데이터 로드 에러:", err);
      });
  }, [id]);

  const convertBinaryToDays = (binaryString) => {
    const daysOfWeek = ["월", "화", "수", "목", "금", "토", "일"];
    return binaryString
      .split("")
      .map((bit, index) => (bit === "1" ? daysOfWeek[index] : ""))
      .join("");
  };

  if (!caregiver) return <div>데이터가 없습니다.</div>;

  return (
    <div style={{ maxWidth: "800px", margin: "2rem auto", padding: "1rem" }}>
      <h1 style={{ marginBottom: "1rem", textAlign: "center" }}>요양사 상세 정보</h1>
      <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "1.5rem", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
        <p style={{ marginBottom: "0.5rem" }}>이름: {caregiver.realName}</p>
        <p style={{ marginBottom: "0.5rem" }}>주소: {caregiver.loc}</p>
        <p style={{ marginBottom: "0.5rem" }}>전문 분야: {caregiver.servNeeded}</p>
        <p style={{ marginBottom: "0.5rem" }}>근무 요일: {convertBinaryToDays(caregiver.workDays)}</p>
        <p style={{ marginBottom: "0.5rem" }}>근무 시간:{" "}
          {caregiver.workTime === "MORNING"
            ? "오전"
            : caregiver.workTime === "AFTERNOON"
            ? "오후"
            : caregiver.workTime  === "FULLTIME"
            ? "풀타임"
            : caregiver.workTime}</p>
        <p style={{ marginBottom: "0.5rem" }}>근무 형태:{" "}
          {caregiver.workForm === "COMMUTE"
            ? "출퇴근형"
            : caregiver.workForm === "LIVE_IN"
            ? "상주형"
            : caregiver.workForm}</p>
        <p style={{ marginBottom: "0.5rem" }}>
          고용 형태:{" "}
          {caregiver.employmentType === "CONTRACT"
            ? "계약직"
            : caregiver.employmentType === "PERMANENT"
            ? "정규직"
            : caregiver.employmentType}
        </p>
        <p style={{ marginBottom: "0.5rem" }}>월급: {caregiver.salary}만원</p>
      </div>
    </div>
  );
}

export default CaregiverDetail;
