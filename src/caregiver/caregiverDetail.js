import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

export default function CaregiverDetailPage() {
  const { id } = useParams();
  const [caregiver, setCaregiver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`/api/caregivers/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("네트워크 응답이 올바르지 않습니다.");
        }
        return res.json();
      })
      .then((data) => {
        setCaregiver(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("데이터 로드 에러:", err);
        setError(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div>로딩중...</div>;
  if (error) return <div>에러: {error.message}</div>;
  if (!caregiver) return <div>데이터가 없습니다.</div>;

  return (
    <div style={{ maxWidth: "800px", margin: "2rem auto", padding: "1rem" }}>
      <h1 style={{ marginBottom: "1rem", textAlign: "center" }}>요양사 상세 정보</h1>
      <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "1.5rem", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
        <p style={{ marginBottom: "0.5rem" }}>이름: {caregiver.realName}</p>
        <p style={{ marginBottom: "0.5rem" }}>주소: {caregiver.loc}</p>
        <p style={{ marginBottom: "0.5rem" }}>전문 분야: {caregiver.servNeeded}</p>
        <p style={{ marginBottom: "0.5rem" }}>근무 요일: {caregiver.workDays}</p>
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
        <p style={{ marginBottom: "0.5rem" }}>급여: {caregiver.salary}</p>
      </div>
    </div>
  );
}
