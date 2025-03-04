import React from 'react';
import { useLoading } from '../context/LoadingContext';
import styles from './LoadingSpinner.module.css';

const LoadingSpinner = () => {
  const { loading } = useLoading();

  if (!loading) return null;

  return (
    <div className={styles.spinner}>
      <div className={styles.loader}></div>
    </div>
  );
};

export default LoadingSpinner;
