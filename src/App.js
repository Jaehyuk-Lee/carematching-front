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
import AppProvider from './context/AppProvider';
import LoadingSpinner from './components/LoadingSpinner';
import styles from './App.module.css';
import Community from './community/Community';
import CreatePost from "./community/CreatePost"
import PostDetail from "./community/PostDetail"
import UpdatePost from "./community/UpdatePost"

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
              <Route path="/caregiver" element={<CaregiverListPage />} />
              <Route path="/caregiver/:id" element={<CaregiverDetailPage />} />
              <Route path="/admin/cert" element={<Cert />} />
              <Route path="/community" element={<Community />} />
              <Route path="/create-post" element={<CreatePost />} />
              <Route path="/community/posts/:id" element={<PostDetail />} />
              <Route path="/community/posts/:id/update" element={<UpdatePost />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
