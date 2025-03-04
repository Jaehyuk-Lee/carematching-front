import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './user/Login';
import Signup from './user/Signup';
import MyPage from './user/MyPage';
import Cert from './admin/Cert';
import { AuthProvider } from './context/AuthContext';
import styles from './App.module.css';
import Community from './community/Community';
import CreatePost from "./community/CreatePost"
import PostDetail from "./community/PostDetail"
import UpdatePost from "./community/UpdatePost"

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
    </AuthProvider>
  );
}

export default App;
