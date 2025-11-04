import axios from 'axios';
import config from '../config/config'

// clients 캐시: 서비스 키별로 하나의 axios 인스턴스만 생성
const clients = {};

// 토큰 갱신 진행 상태를 추적하는 변수 (전역 공유)
let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = (accessToken) => {
  refreshSubscribers.forEach(callback => callback(accessToken));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

// 인증 관련 요청은 401 에러 개별 처리
const isAuthRelatedRequest = (url) => {
  const authEndpoints = ['/user/login', '/user/signup'];
  return authEndpoints.some(endpoint => url.includes(endpoint));
};
const isAuthRelatedPage = () => {
  const authPages = ['/login', '/signup'];
  const currentPath = window.location.pathname;
  return authPages.some(page => currentPath === page || currentPath.startsWith(page));
};

// 논리적 서비스별 axios 인스턴스를 생성하는 팩토리
// 단, 이미 생성된 인스턴스는 캐시에서 재사용
const createApiClient = (serviceKey = 'platform') => {
  if (clients[serviceKey]) return clients[serviceKey];

  const baseURL = config.buildServiceUrl(serviceKey);
  const client = axios.create({
    baseURL,
    withCredentials: true,
  });

  // 요청 인터셉터: 공통 access token 삽입
  client.interceptors.request.use(
    (cfg) => {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        cfg.headers.Authorization = `Bearer ${accessToken}`;
      }
      return cfg;
    },
    (error) => Promise.reject(error)
  );

  // 응답 인터셉터: 토큰 저장 및 401 처리 (refresh는 platform으로 요청)
  client.interceptors.response.use(
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
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            // refresh는 platform 서비스로 직접 호출 (무한 루프 방지)
            const reissueUrl = config.buildServiceUrl('platform', '/token/reissue');
            const response = await axios.post(reissueUrl, null, {
              headers: { 'Refresh-Token': refreshToken }
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
              onRefreshed(newAccessToken);

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

      if (error.response?.status === 401) {
        if (!isAuthRelatedRequest(error.config.url) && !isAuthRelatedPage()) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }

      return Promise.reject(error);
    }
  );

  clients[serviceKey] = client;
  return client;
};

// 기본 플랫폼 인스턴스: 기존 코드와의 호환성 유지
const axiosInstance = createApiClient('platform');

const removeRefreshToken = async () => {
  const client = createApiClient('platform');
  await client.post('/token/remove', null, {
    headers: {
      'Refresh-Token': localStorage.getItem('refreshToken')
    }
  });
};

export default axiosInstance;
export { removeRefreshToken, createApiClient };
