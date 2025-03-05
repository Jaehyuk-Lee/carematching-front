import { React, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import AppProvider from './context/AppProvider';
import LoadingSpinner from './components/LoadingSpinner';
import ChatSidebar from './chat/ChatSidebar';
import AppRouter from './router';
import styles from './App.module.css';

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  return (
    <AppProvider>
      <Router>
        <div className={styles.appContainer}>
          <Header />
          <LoadingSpinner />
          <main className={styles.mainContent}>
            <AppRouter />
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
