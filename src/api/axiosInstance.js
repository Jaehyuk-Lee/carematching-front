import axios from 'axios';
import config from '../config/config'

const axiosInstance = axios.create({
  baseURL: `${config.apiUrl}/${config.apiPrefix}/${config.apiVersion}`,
  withCredentials: true,
});

// 토큰 갱신 진행 상태를 추적하는 변수
let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = (accessToken) => {
  refreshSubscribers.forEach(callback => callback(accessToken));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

const removeRefreshToken = async () => {
  await axiosInstance.post('/token/remove', null, {
    headers: {
      'Refresh-Token': localStorage.getItem('refreshToken')
    }
  });
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
          // ※ 다른 코드들과 달리 axiosInstance를 호출하지 않고 axios를 독립적으로 호출
          // 만약 토큰 갱신 요청(/token/reissue) 자체에 axiosInstance를 사용한다면
          // 이 요청이 실패했을 때 다시 토큰 갱신을 시도하게 되어 무한 루프가 발생할 수 있음
          const response = await axios.post(`${config.apiUrl}/${config.apiPrefix}/${config.apiVersion}/token/reissue`, null, {
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

    // 다른 오류이거나 토큰 갱신 실패 시
    if (error.response?.status === 401) {
      // 인증 관련 요청이나 페이지가 아닌 경우에만 리다이렉트
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

export default axiosInstance;
export { removeRefreshToken };
