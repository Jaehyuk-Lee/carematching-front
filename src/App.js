import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './user/Login';
import Signup from './user/Signup';
import MyPage from './user/MyPage';
import Cert from './admin/Cert';
import AppProvider from './context/AppProvider';
import LoadingSpinner from './components/LoadingSpinner';
import styles from './App.module.css';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className={styles.appContainer}>
          <Header />
          <LoadingSpinner />
          <main className={styles.mainContent}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/mypage/*" element={<MyPage />} />
              <Route path="/admin/cert" element={<Cert />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
