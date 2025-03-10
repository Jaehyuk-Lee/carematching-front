"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Calendar, MessageSquare, Users, Award, ArrowRight, Heart, Eye, PenSquare } from "lucide-react"
import CaregiverList from "../caregiver/caregiverList"
import basicProfileImage from "../assets/basicprofileimage.png"
import axiosInstance from "../api/axiosInstance"
import styles from "../community/Community.module.css"
import "./Home.css"

function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("caregivers")
  const [popularPosts, setPopularPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [userInfo, setUserInfo] = useState(null)

  // 관리자 권한 감지: user가 ROLE_ADMIN일 경우 콘솔에 로그 출력
  useEffect(() => {
    if (user && user.role === "ROLE_ADMIN") {
      // 관리자일 경우 primary color를 변경 (예시: #00c896)
      document.documentElement.style.setProperty("--primary-color", "#00c896")
    } else {
      // 일반 사용자일 경우 원래의 색상 (#ff8450)
      document.documentElement.style.setProperty("--primary-color", "#ff8450")
    }
  }, [user])

  // 사용자 정보 불러오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!user) return

      try {
        const response = await axiosInstance.get("/api/community/user-info")
        setUserInfo(response.data)
      } catch (error) {
        console.error("Failed to fetch user info:", error)
      }
    }

    fetchUserInfo()
  }, [user])

  // 인기 게시글 불러오기
  useEffect(() => {
    const fetchPopularPosts = async () => {
      if (activeTab !== "community") return

      setLoading(true)
      try {
        const response = await axiosInstance.get("/api/community/popular-posts", {
          params: {
            access: "ALL", // 자유게시판
            page: 0,
            size: 3, // 3개만 가져오기
          },
        })

        if (response.data && response.data.content) {
          setPopularPosts(response.data.content)
        }
      } catch (error) {
        console.error("Failed to fetch popular posts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPopularPosts()
  }, [activeTab])

  const handleAdminFeature = () => {
    navigate("/admin/cert")
  }

  const handleCreatePost = () => {
    navigate("/community/create-post")
  }

  const handlePostClick = (postId) => {
    navigate(`/community/posts/${postId}`)
  }

  // 게시글 렌더링 함수
  const renderPostItem = (post, index) => {
    return (
      <div key={`${post.id}-${index}`} className={styles.postItem} onClick={() => handlePostClick(post.id)}>
        <div className={styles.postContent}>
          <div className={styles.postTextContent}>
            <h3 className={styles.postTitle}>{post.title}</h3>
            <p className={styles.postText}>{post.content}</p>
          </div>
          {post.image && (
            <div className={styles.postImageContainer}>
              <img src={post.image || "/placeholder.svg"} alt="게시물 이미지" className={styles.postImage} />
            </div>
          )}
        </div>
        <div className={styles.postFooter}>
          <div className={styles.authorInfo}>
            <img src={post.profileImage || basicProfileImage} alt="" className={styles.authorImage} />
            <span className={styles.authorName}>{post.nickname}</span>
            <span className={styles.postTime}>{post.relativeTime}</span>
          </div>
          <div className={styles.postStats}>
            <span className={styles.viewCount}>
              <Eye size={16} /> {post.viewCount}
            </span>
            <span className={styles.likeCount}>
              <Heart size={16} /> {post.likeCount}
            </span>
            <span className={styles.commentCount}>
              <MessageSquare size={16} /> {post.commentCount}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="home-container">
      {/* User Welcome Section */}
      <section className="welcome-section container">
        <div className="welcome-content">
          <div>
            {user ? (
              <div className="user-welcome">
                <div className="avatar">
                  <img src={userInfo?.profileImage || basicProfileImage} alt={user.username} />
                </div>
                <div>
                  <h2>{userInfo?.nickname || user.username}님, 환영합니다!</h2>
                  <p className="text-muted">오늘도 건강한 하루 되세요.</p>
                </div>
              </div>
            ) : (
              <div>
                <h2>요양의 패러다임을 바꾸는 케어매칭</h2>
                <p className="text-muted">서비스를 이용해보세요</p>
              </div>
            )}
          </div>
          <div className="welcome-buttons">
            {/* 관리자일 경우에만 자격증 관리 버튼 렌더링 */}
            {user?.role === "ROLE_ADMIN" && (
              <button className="btn btn-outline" onClick={handleAdminFeature}>
                자격증 관리 <Award />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="main-content container">
        <div className="tabs">
          <div className="tabs-list">
            <button
              className={`tab-button ${activeTab === "caregivers" ? "active" : ""}`}
              onClick={() => setActiveTab("caregivers")}
            >
              <Users /> 요양사 목록
            </button>
            <button
              className={`tab-button ${activeTab === "community" ? "active" : ""}`}
              onClick={() => setActiveTab("community")}
            >
              <MessageSquare /> 커뮤니티
            </button>
          </div>

          {/* Caregivers Tab */}
          <div className={`tab-content ${activeTab === "caregivers" ? "active" : ""}`}>
            <CaregiverList containerClassName="global-no-padding" avatarClassName="caregiver-avatar" />
          </div>

          {/* Community Tab */}
          <div className={`tab-content ${activeTab === "community" ? "active" : ""}`}>
            <div className="section-header">
              <h2>인기 커뮤니티 글</h2>
              <button className="btn-text" onClick={() => navigate("/community")}>
                전체보기 <ArrowRight />
              </button>
            </div>

            {/* Community Posts */}
            <div className="community-posts">
              {loading ? (
                <div className={styles.loadingMore}>
                  <div className={styles.loadingSpinner}></div>
                  <span>게시글을 불러오는 중...</span>
                </div>
              ) : popularPosts.length > 0 ? (
                <div className="home-post-list">{popularPosts.map((post, index) => renderPostItem(post, index))}</div>
              ) : (
                <div className={styles.emptyState}>
                  <p>인기 게시글이 없습니다</p>
                  <button
                    className={`${styles.emptyStateButton} ${user?.role === "ROLE_ADMIN" ? styles.admin : ""}`}
                    onClick={handleCreatePost}
                  >
                    첫 게시글 작성하기
                  </button>
                </div>
              )}
            </div>

            {/* Quick Post Button */}
            <div className="center-button">
              <button
                className={`btn btn-primary ${user?.role === "ROLE_ADMIN" ? "admin-button" : ""}`}
                onClick={handleCreatePost}
              >
                새 글 작성하기 <PenSquare size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">서비스 특징</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <Users />
              </div>
              <h3>검증된 요양사</h3>
              <p>
                자격증과 경력이 검증된 전문 요양사들을 만나보세요. 철저한 신원 확인으로 안심하고 이용할 수 있습니다.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <MessageSquare />
              </div>
              <h3>활발한 커뮤니티</h3>
              <p>다양한 경험과 정보를 공유하는 커뮤니티에서 유용한 팁과 조언을 얻고 함께 성장해보세요.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Calendar />
              </div>
              <h3>간편한 예약</h3>
              <p>
                원하는 시간에 필요한 서비스를 쉽고 빠르게 예약하세요. 실시간 일정 확인으로 편리하게 이용할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home

