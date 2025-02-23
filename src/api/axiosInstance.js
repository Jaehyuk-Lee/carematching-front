import axios from 'axios';
import config from '../config/config'

const axiosInstance = axios.create({
  baseURL: config.apiUrl,
  withCredentials: true,
});

// 요청 인터셉터 추가
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 추가
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // 토큰이 만료되었거나 유효하지 않은 경우
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // 에러를 throw하여 각 컴포넌트에서 처리하도록 함
      throw error;
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
