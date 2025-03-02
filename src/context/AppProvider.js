import React from 'react';
import { AuthProvider } from './AuthContext';
import { LoadingProvider } from './LoadingContext';
import AxiosLoadingProvider from '../components/AxiosLoadingProvider';

const AppProvider = ({ children }) => {
  return (
    <AuthProvider>
      <LoadingProvider>
        <AxiosLoadingProvider>
          {children}
        </AxiosLoadingProvider>
      </LoadingProvider>
    </AuthProvider>
  );
};

export default AppProvider;
