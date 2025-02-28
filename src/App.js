import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './user/Login';
import Signup from './user/Signup';
import MyPage from './user/MyPage';
import CaregiverListPage from './caregiver/caregiverList';
import CaregiverDetailPage from './caregiver/caregiverDetail';
import Cert from './admin/Cert';
import { AuthProvider } from './context/AuthContext';
import styles from './App.module.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className={styles.appContainer}>
          <Header />
          <main className={styles.mainContent}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/mypage/*" element={<MyPage />} />
              <Route path="/caregiver" element={<CaregiverListPage />} />
              <Route path="/caregiver/:id" element={<CaregiverDetailPage />} />
              <Route path="/admin/cert" element={<Cert />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
