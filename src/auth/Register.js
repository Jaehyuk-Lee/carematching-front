import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Auth.module.css';
import { Eye, EyeOff, Check, AlertCircle } from 'lucide-react';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    name: '',
    role: 'ROLE_USER'
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // 필드 입력 시 해당 필드의 에러 메시지 초기화
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }

    // 등록 에러 메시지 초기화
    if (registerError) {
      setRegisterError('');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validateForm = () => {
    const newErrors = {};

    // 아이디 검증
    if (!formData.username.trim()) {
      newErrors.username = '아이디를 입력해주세요';
    } else if (formData.username.length < 4) {
      newErrors.username = '아이디는 최소 4자 이상이어야 합니다';
    }

    // 이메일 검증
    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '유효한 이메일 주소를 입력해주세요';
    }

    // 비밀번호 검증
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요';
    } else if (formData.password.length < 8) {
      newErrors.password = '비밀번호는 최소 8자 이상이어야 합니다';
    }

    // 비밀번호 확인 검증
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다';
    }

    // 이름 검증
    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요';
    }

    // 전화번호 검증
    if (!formData.phone.trim()) {
      newErrors.phone = '전화번호를 입력해주세요';
    } else if (!/^\d{10,11}$/.test(formData.phone.replace(/-/g, ''))) {
      newErrors.phone = '유효한 전화번호를 입력해주세요 (10-11자리)';
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
      await register(formData);
      setRegisterSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('회원가입 오류:', error);
      setRegisterError(
        error.response?.data?.message ||
        '회원가입에 실패했습니다. 다시 시도해주세요.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (registerSuccess) {
    return (
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <div className={styles.successMessage}>
            <div className={styles.successIcon}>
              <Check size={40} />
            </div>
            <h2>회원가입 성공!</h2>
            <p>
              회원가입이 성공적으로 완료되었습니다.<br />
              잠시 후 로그인 페이지로 이동합니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h1 className={styles.authTitle}>회원가입</h1>
          <p className={styles.authSubtitle}>
            케어매칭 서비스에 가입해 전문적인 케어 서비스를 이용하세요
          </p>
        </div>

        {registerError && (
          <div className={styles.errorAlert}>
            <AlertCircle size={18} />
            <span>{registerError}</span>
          </div>
        )}

        <form className={styles.authForm} onSubmit={handleSubmit}>
          <div className={styles.formRow}>
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
              />
              {errors.username && <span className={styles.errorMessage}>{errors.username}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.formLabel}>이메일</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`${styles.formControl} ${errors.email ? styles.errorInput : ''}`}
                placeholder="이메일을 입력하세요"
              />
              {errors.email && <span className={styles.errorMessage}>{errors.email}</span>}
            </div>
          </div>

          <div className={styles.formRow}>
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

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword" className={styles.formLabel}>비밀번호 확인</label>
              <div className={styles.passwordInputContainer}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`${styles.formControl} ${errors.confirmPassword ? styles.errorInput : ''}`}
                  placeholder="비밀번호를 다시 입력하세요"
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={toggleConfirmPasswordVisibility}
                  aria-label={showConfirmPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && <span className={styles.errorMessage}>{errors.confirmPassword}</span>}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.formLabel}>이름</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`${styles.formControl} ${errors.name ? styles.errorInput : ''}`}
                placeholder="이름을 입력하세요"
              />
              {errors.name && <span className={styles.errorMessage}>{errors.name}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="phone" className={styles.formLabel}>전화번호</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`${styles.formControl} ${errors.phone ? styles.errorInput : ''}`}
                placeholder="전화번호를 입력하세요"
              />
              {errors.phone && <span className={styles.errorMessage}>{errors.phone}</span>}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>회원 유형</label>
            <div className={styles.radioGroup}>
              <div className={styles.radioOption}>
                <input
                  type="radio"
                  id="roleUser"
                  name="role"
                  value="ROLE_USER"
                  checked={formData.role === 'ROLE_USER'}
                  onChange={handleChange}
                  className={styles.radioInput}
                />
                <label htmlFor="roleUser" className={styles.radioLabel}>
                  일반 회원
                  <small className={styles.optionDesc}>케어기버를 이용하려면 선택하세요</small>
                </label>
              </div>

              <div className={styles.radioOption}>
                <input
                  type="radio"
                  id="roleCaregiver"
                  name="role"
                  value="ROLE_CAREGIVER"
                  checked={formData.role === 'ROLE_CAREGIVER'}
                  onChange={handleChange}
                  className={styles.radioInput}
                />
                <label htmlFor="roleCaregiver" className={styles.radioLabel}>
                  케어기버
                  <small className={styles.optionDesc}>케어기버로 등록하려면 선택하세요</small>
                </label>
              </div>
            </div>
          </div>

          <div className={styles.termsGroup}>
            <div className={styles.checkboxContainer}>
              <input
                type="checkbox"
                id="agreeTerms"
                className={styles.checkbox}
                required
              />
              <label htmlFor="agreeTerms" className={styles.checkboxLabel}>
                <a href="/terms" target="_blank" className={styles.termsLink}>이용약관</a>과
                <a href="/privacy" target="_blank" className={styles.termsLink}>개인정보 처리방침</a>에 동의합니다
              </label>
            </div>
          </div>

          <button
            type="submit"
            className={styles.authButton}
            disabled={loading}
          >
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <div className={styles.authFooter}>
          <p className={styles.authText}>
            이미 계정이 있으신가요?{' '}
            <Link to="/login" className={styles.authLink}>
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
