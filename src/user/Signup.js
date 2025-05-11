import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import styles from './Signup.module.css';
import Swal from 'sweetalert2';

function Signup() {
  const navigate = useNavigate();
  const [signupInput, setSignupInput] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    nickname: "",
  });
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    setSignupInput((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSignup = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axiosInstance.post(`/user/signup`, signupInput);
      if (res.status === 200) {
        Swal.fire({
          icon: 'success',
          title: '회원가입 완료',
          text: '회원가입이 완료되었습니다. 로그인해주세요.'
        });
        navigate('/login');
      }
    } catch (error) {
      console.log(error);
      setError(error.response?.data?.message || "회원가입 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className={styles.signupPage}>
      <div className={styles.signupContainer}>
        <h2 className={styles.signupTitle}>회원가입</h2>
        {error && <p className={styles.errorMessage}>{error}</p>}
        <form onSubmit={onSignup}>
          <div className={styles.inputGroup}>
            <label>아이디 (필수)</label>
            <input
              type="text"
              name="username"
              value={signupInput.username}
              onChange={handleInputChange}
              placeholder="아이디를 입력하세요"
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label>비밀번호 (필수)</label>
            <input
              type="password"
              name="password"
              value={signupInput.password}
              onChange={handleInputChange}
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label>비밀번호 확인 (필수)</label>
            <input
              type="password"
              name="confirmPassword"
              value={signupInput.confirmPassword}
              onChange={handleInputChange}
              placeholder="비밀번호를 다시 입력하세요"
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label>닉네임 (필수)</label>
            <input
              type="text"
              name="nickname"
              value={signupInput.nickname}
              onChange={handleInputChange}
              placeholder="닉네임을 입력하세요"
              required
            />
          </div>
          <div className={styles.signupActions}>
            <button type="submit" className={styles.signupButton}>완료</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Signup;
