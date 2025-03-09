"use client"

import { useState } from "react"
import { BrowserRouter as Router } from "react-router-dom"
import Header from "./components/Header"
import Footer from "./components/Footer"
import AppProvider from "./context/AppProvider"
import LoadingSpinner from "./components/LoadingSpinner"
import ChatSidebar from "./chat/ChatSidebar"
import AppRouter from "./router"
import styles from "./App.module.css"

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false)

  // 사이드바 열기 예시 (버튼 등에서 호출)
  const handleOpenSidebar = () => {
    setIsChatOpen(true)
  }

  // 사이드바 닫기
  const handleCloseSidebar = () => {
    setIsChatOpen(false)
  }

  return (
    <AppProvider>
      <Router>
        <div className={styles.appContainer}>
          <Header onOpenSidebar={handleOpenSidebar} />
          <LoadingSpinner />
          <main className={styles.mainContent}>
            <AppRouter />

            {/* 사이드바 */}
            <ChatSidebar isChatOpen={isChatOpen} onClose={handleCloseSidebar} />
          </main>
          <Footer />
        </div>
      </Router>
    </AppProvider>
  )
}

export default App

