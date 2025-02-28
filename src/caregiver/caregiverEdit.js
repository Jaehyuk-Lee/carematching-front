import { useEffect, useState } from "react";
import styles from './caregiverEdit.module.css';
import axiosInstance from "../api/axiosInstance";

const CaregiverEdit = ({ isRegistered, onSuccess }) => {
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

  const [workDaysInput, setWorkDaysInput] = useState("");

  useEffect(() => {
    const fetchCaregiverData = async () => {
      try {
        const response = await axiosInstance.get("/api/caregivers/user");
        if (response.status === 200) {
          setFormData(response.data);
          setWorkDaysInput(convertBinaryToDays(response.data.workDays));
        }
      } catch (error) {
        console.error("Caregiver 데이터를 불러오는 중 오류 발생:", error);
      }
    };

    if (isRegistered) {
      fetchCaregiverData();
    }
  }, [isRegistered]);

  const convertDaysToBinary = (daysString) => {
    if (!daysString) return "";
    const days = ["월", "화", "수", "목", "금", "토", "일"];
    return days.map((day) => (daysString.includes(day) ? "1" : "0")).join("");
  };

  const convertBinaryToDays = (binaryString) => {
    const days = ["월", "화", "수", "목", "금", "토", "일"];
    return binaryString
        .split("")
        .map((bit, index) => (bit === "1" ? days[index] : ""))
        .join("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "workDays") {
      setWorkDaysInput(value);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleWorkDaysBlur = () => {
    setFormData({
      ...formData,
      workDays: convertDaysToBinary(workDaysInput),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const endpoint = isRegistered ? "/api/caregivers/update" : "/api/caregivers/add";
        const method = "post";
        const response = await axiosInstance[method](endpoint, formData);
        if (response.status === 201) {
            alert(`요양사 ${isRegistered ? "수정" : "등록"}이 완료되었습니다!`);
            onSuccess();
            window.location.reload();
        }
    } catch (error) {
      console.error(isRegistered ? "요양사 업데이트 실패:" : "요양사 등록 실패:", error);
      alert(isRegistered ? "요양사 정보 수정 중 오류가 발생했습니다." : "요양사 등록 중 오류가 발생했습니다.");
    }
  };

  if (!formData) return <div>로딩 중...</div>;

  return (
    <div className={styles.editCaregiverPage}>
      <h2>{isRegistered ? '요양사 정보 수정' : '요양사 등록'}</h2>
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
        <button type="submit" className={styles.submitButton}>
          {isRegistered ? '수정하기' : '등록하기'}
        </button>
      </form>
    </div>
  );
};

export default CaregiverEdit;
