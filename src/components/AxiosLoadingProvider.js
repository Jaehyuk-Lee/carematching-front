import React, { useEffect } from 'react';
import { useLoading } from '../context/LoadingContext';
import axiosInstance from '../api/axiosInstance';

const AxiosLoadingProvider = ({ children }) => {
  const { setLoading } = useLoading();

  useEffect(() => {
    const requestInterceptor = axiosInstance.interceptors.request.use(
      (config) => {
        setLoading(true); // 로딩 시작
        return config;
      },
      (error) => {
        setLoading(false); // 로딩 종료
        return Promise.reject(error);
      }
    );

    const responseInterceptor = axiosInstance.interceptors.response.use(
      (response) => {
        setLoading(false); // 로딩 종료
        return response;
      },
      (error) => {
        setLoading(false); // 로딩 종료
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          throw error;
        }
        return Promise.reject(error);
      }
    );

    // 컴포넌트 언마운트 시 인터셉터 제거
    return () => {
      axiosInstance.interceptors.request.eject(requestInterceptor);
      axiosInstance.interceptors.response.eject(responseInterceptor);
    };
  }, [setLoading]);

  return <>{children}</>;
};

export default AxiosLoadingProvider;
