import React, { createContext, useState, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import { removeRefreshToken } from '../api/axiosInstance';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    const accessToken = localStorage.getItem('accessToken');

    if (savedUser && accessToken) {
      const decoded = jwtDecode(accessToken);
      return {
        ...JSON.parse(savedUser),
        role: decoded.role,
        username: decoded.username
      };
    }
    return null;
  });

  const login = (userData) => {
    if (userData.accessToken) {
      const decoded = jwtDecode(userData.accessToken);
      let newUserData = {
        ...userData,
        role: decoded.role,
        username: decoded.username,
      }
      setUser(newUserData);
      localStorage.setItem('accessToken', userData.accessToken);
      localStorage.setItem('refreshToken', userData.refreshToken);
      localStorage.setItem('user', JSON.stringify(newUserData));
    }
  };

  const logout = async () => {
    try {
      // 백엔드에서 refreshToken 제거
      await removeRefreshToken();
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
    } finally {
      // 로컬 스토리지와 상태 초기화
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
