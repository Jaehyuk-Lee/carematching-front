import React, { useEffect, useState } from "react";
import styles from './EditProfile.module.css';
import axiosInstance from "../../api/axiosInstance";
import Swal from 'sweetalert2';
import { useNavigate } from "react-router-dom";

function EditProfile() {
  const navigate = useNavigate();

  const [profileInput, setProfileInput] = useState({
    nickname: "",
    phoneNumber: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    certno: "",
  });

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axiosInstance.get("/api/user/info");
        setProfileInput(response.data);
      } catch (error) {
        console.error("사용자 정보 가져오기 실패:", error);
      }
    };
    fetchUserInfo();
  }, []);

  const handleInputChange = (e) => {
    setProfileInput((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (profileInput.newPassword !== profileInput.confirmPassword) {
      Swal.fire({
        icon: 'warning',
        title: '비밀번호 불일치',
        text: "새 비밀번호와 새 비밀번호 확인이 일치하지 않습니다."
      });
      return;
    }

    try {
      const response = await axiosInstance.post("/api/user/update", profileInput);

      if (response.status !== 200) {
        throw new Error(response.data?.message || "프로필 업데이트에 실패했습니다.");
      }

      const result = await Swal.fire({
        icon: 'success',
        title: '프로필 업데이트',
        text: "프로필이 성공적으로 업데이트되었습니다."
      });

      if (result.isConfirmed) {
        navigate("/mypage");
      }
    } catch (error) {
      console.error("프로필 업데이트 오류:", error);
      Swal.fire({
        icon: 'error',
        title: '업데이트 오류',
        text: error.response?.data?.message || "프로필 업데이트 중 오류가 발생했습니다."
      });
    }
  };

  return (
    <div className={styles.editProfilePage}>
      <h2>내 정보 수정</h2>
      <form onSubmit={onSubmit}>
        <div className={styles.inputGroup}>
          <label>현재 비밀번호 (필수)</label>
          <input
            type="password"
            name="currentPassword"
            value={profileInput.currentPassword}
            onChange={handleInputChange}
            placeholder="현재 비밀번호를 입력하세요"
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <label>새 비밀번호</label>
          <input
            type="password"
            name="newPassword"
            value={profileInput.newPassword}
            onChange={handleInputChange}
            placeholder="새 비밀번호를 입력하세요 (선택)"
          />
        </div>
        <div className={styles.inputGroup}>
          <label>비밀번호 확인</label>
          <input
            type="password"
            name="confirmPassword"
            value={profileInput.confirmPassword}
            onChange={handleInputChange}
            placeholder="새 비밀번호를 다시 입력하세요 (선택)"
          />
        </div>
        <div className={styles.inputGroup}>
          <label>닉네임</label>
          <input
            type="text"
            name="nickname"
            value={profileInput.nickname}
            onChange={handleInputChange}
            placeholder="닉네임을 입력하세요"
          />
        </div>
        <div className={styles.inputGroup}>
          <label>전화번호</label>
          <input
            type="text"
            name="phoneNumber"
            value={profileInput.phoneNumber}
            onChange={handleInputChange}
            placeholder="전화번호를 입력하세요"
          />
        </div>
        <div className={styles.inputGroup}>
          <label>자격증 번호</label>
          <input
            type="text"
            name="certno"
            value={profileInput.certno}
            onChange={handleInputChange}
            placeholder="자격증 번호를 입력하세요"
          />
        </div>
        <button type="submit" className={styles.submitButton}>수정 완료</button>
      </form>
    </div>
  );
}

export default EditProfile;
