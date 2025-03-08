import axios from 'axios';
import config from '../config/config'

const axiosInstance = axios.create({
  baseURL: config.apiUrl,
  withCredentials: true,
});

// 토큰 갱신 진행 상태를 추적하는 변수
let isRefreshing = false;
// 토큰 갱신 대기 중인 요청들의 배열
let refreshSubscribers = [];

// 토큰 갱신 후에 대기 중인 요청들을 처리하는 함수
const onRefreshed = (accessToken) => {
  refreshSubscribers.forEach(callback => callback(accessToken));
  refreshSubscribers = [];
};

// 토큰 갱신을 기다리는 함수
const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

// 요청 인터셉터 추가
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
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
    // 로그인 응답에서 accessToken과 refreshToken 저장
    if (response.data && response.data.accessToken && response.data.refreshToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 액세스 토큰이 만료되었고, 재시도하지 않은 요청인 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // 이미 토큰 갱신 중이면 새로운 토큰으로 요청 재시도를 대기열에 추가
        return new Promise((resolve) => {
          addRefreshSubscriber((accessToken) => {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            resolve(axios(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // refreshToken을 사용하여 새 accessToken 요청
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${config.apiUrl}/api/token/reissue`, {}, {
            headers: {
              'Refresh-Token': refreshToken
            }
          });

          // 새로운 토큰 저장
          if (response.data && response.data.accessToken) {
            const newAccessToken = response.data.accessToken;
            localStorage.setItem('accessToken', newAccessToken);
            // 새 refreshToken이 있다면 저장
            if (response.data.refreshToken) {
              localStorage.setItem('refreshToken', response.data.refreshToken);
            }

            // 새 토큰으로 헤더 설정
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            // 대기 중인 다른 요청들도 새 토큰으로 처리
            onRefreshed(newAccessToken);

            // 원래 요청 재시도
            return axios(originalRequest);
          }
        }
      } catch (refreshError) {
        // 토큰 갱신 실패 시 로그아웃 처리
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // 다른 오류이거나 토큰 갱신 실패 시
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
