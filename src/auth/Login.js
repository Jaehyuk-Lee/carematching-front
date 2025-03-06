import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Auth.module.css';
import { Eye, EyeOff } from 'lucide-react';

function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // 이전 페이지에서 리디렉션 된 경우 해당 경로로 돌아가기 위함
  const from = location.state?.from || '/';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // 필드 입력 시 해당 필드의 에러 메시지 초기화
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }

    // 로그인 에러 메시지 초기화
    if (loginError) {
      setLoginError('');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = '아이디를 입력해주세요';
    }

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await login(formData.username, formData.password);
      navigate(from);
    } catch (error) {
      console.error('로그인 오류:', error);
      setLoginError(
        error.response?.data?.message ||
        '로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h1 className={styles.authTitle}>로그인</h1>
          <p className={styles.authSubtitle}>
            케어매칭 서비스를 이용하려면 로그인해주세요
          </p>
        </div>

        {loginError && (
          <div className={styles.errorAlert}>
            {loginError}
          </div>
        )}

        <form className={styles.authForm} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="username" className={styles.formLabel}>아이디</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`${styles.formControl} ${errors.username ? styles.errorInput : ''}`}
              placeholder="아이디를 입력하세요"
              autoComplete="username"
            />
            {errors.username && <span className={styles.errorMessage}>{errors.username}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.formLabel}>비밀번호</label>
            <div className={styles.passwordInputContainer}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`${styles.formControl} ${errors.password ? styles.errorInput : ''}`}
                placeholder="비밀번호를 입력하세요"
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <span className={styles.errorMessage}>{errors.password}</span>}
          </div>

          <div className={styles.formOptions}>
            <div className={styles.rememberMe}>
              <input
                type="checkbox"
                id="rememberMe"
                className={styles.checkbox}
              />
              <label htmlFor="rememberMe" className={styles.checkboxLabel}>아이디 저장</label>
            </div>
            <Link to="/forgot-password" className={styles.forgotPassword}>
              비밀번호 찾기
            </Link>
          </div>

          <button
            type="submit"
            className={styles.authButton}
            disabled={loading}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className={styles.authFooter}>
          <p className={styles.authText}>
            아직 계정이 없으신가요?{' '}
            <Link to="/register" className={styles.authLink}>
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
