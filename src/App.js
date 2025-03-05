import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import AppProvider from './context/AppProvider';
import LoadingSpinner from './components/LoadingSpinner';
import styles from './App.module.css';
import AppRouter from './router';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className={styles.appContainer}>
          <Header />
          <LoadingSpinner />
          <main className={styles.mainContent}>
            <AppRouter />
          </main>
          <Footer />
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
