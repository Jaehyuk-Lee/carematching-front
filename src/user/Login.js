import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import config from "../config/config";
import { useAuth } from "../context/AuthContext";
import styles from './Login.module.css';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loginInput, setLoginInput] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    setLoginInput((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post(`${config.apiUrl}/api/user/login`, loginInput);
      if (res.status === 200) {
        login(res.data);
        navigate('/');
      }
    } catch (error) {
      setError("로그인에 실패했습니다.");
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <h2 className={styles.loginTitle}>로그인</h2>
        {error && <p className={styles.errorMessage}>{error}</p>}
        <form onSubmit={onLogin}>
          <div className={styles.inputGroup}>
            <label>아이디</label>
            <input
              type="text"
              name="username"
              value={loginInput.username}
              onChange={handleInputChange}
              placeholder="아이디를 입력하세요"
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label>비밀번호</label>
            <input
              type="password"
              name="password"
              value={loginInput.password}
              onChange={handleInputChange}
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>
          <div className={styles.loginActions}>
            <button
              type="button"
              className="btn-text"
              onClick={() => navigate('/signup')}
            >
              회원가입
            </button>
            <button
              type="submit"
              className={`btn-primary ${styles.submitArrow}`}
            >
              →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
