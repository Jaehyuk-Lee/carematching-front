import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
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

  async function handleLogin() {
    setError("");  // 에러 메시지 초기화

    // 필수 입력값 검증
    if (!loginInput.username.trim()) {
      setError("아이디를 입력해주세요.");
      return;
    }
    if (!loginInput.password.trim()) {
      setError("비밀번호를 입력해주세요.");
      return;
    }

    try {
      const res = await axiosInstance.post(`/api/user/login`, loginInput);
      if (res.status === 200) {
        login(res.data);
        navigate('/');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setError("아이디 또는 비밀번호가 일치하지 않습니다.");
      } else {
        setError((error.response?.data?.error || "로그인에 실패했습니다") + " (" + error?.response?.status + ")");
      }
      // 입력 필드 초기화
      setLoginInput({
        username: "",
        password: "",
      });
    }
  }

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <h2 className={styles.loginTitle}>로그인</h2>
        {error && <p className={styles.errorMessage}>{error}</p>}
        <form>
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
              onKeyUp={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleLogin();
                }
              }}
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
              type="button"
              className={`btn-primary ${styles.submitArrow}`}
              onClick={handleLogin}
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
