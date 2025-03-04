import React, { useState } from "react"; // ✅ useState 추가
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
import Community from './community/Community';
import CreatePost from "./community/CreatePost"
import PostDetail from "./community/PostDetail"
import UpdatePost from "./community/UpdatePost"
import ChatSidebar from "./chat/ChatSidebar";
import CreateRoomPage from "./chat/CreateRoomPage";


function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
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
              <Route path="/myPage/*" element={<MyPage />} />
              <Route path="/admin/cert" element={<Cert />} />
              <Route path="/community" element={<Community />} />
              <Route path="/create-post" element={<CreatePost />} />
              <Route path="/community/posts/:id" element={<PostDetail />} />
              <Route path="/community/posts/:id/update" element={<UpdatePost />} />
              <Route path="/create-room" element={<CreateRoomPage />} />
              <Route path="/chat-rooms" element={<Home />} />
            </Routes>
            {/* 채팅 사이드바 (기본적으로 닫혀 있음) */}
            <ChatSidebar isChatOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
          </main>
          <Footer />
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
