import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

// 아이콘 컴포넌트들
const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const MessageSquareIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const AwardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="7"/>
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);

const HeartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('caregivers');

  // 관리자 권한 감지: user가 ROLE_ADMIN일 경우 콘솔에 로그 출력
  useEffect(() => {
    if (user && user.role === 'ROLE_ADMIN') {
      // 관리자일 경우 primary color를 변경 (예시: #00c896)
      document.documentElement.style.setProperty('--primary-color', '#00c896');
    } else {
      // 일반 사용자일 경우 원래의 색상 (#ff8450)
      document.documentElement.style.setProperty('--primary-color', '#ff8450');
    }
  }, [user]);

  // 예시 데이터 (보통 API 호출로 받아옵니다)
  const featuredCaregivers = [
    {
      id: 1,
      name: "박지원",
      image: "https://via.placeholder.com/100",
      rating: 4.9,
      reviews: 124,
      specialties: ["노인 케어", "재활 보조"],
      experience: "5년",
      available: true
    },
    {
      id: 2,
      name: "이수진",
      image: "https://via.placeholder.com/100",
      rating: 4.8,
      reviews: 98,
      specialties: ["치매 케어", "가사 도움"],
      experience: "7년",
      available: true
    },
    {
      id: 3,
      name: "김태희",
      image: "https://via.placeholder.com/100",
      rating: 4.7,
      reviews: 87,
      specialties: ["장애인 케어", "물리치료 보조"],
      experience: "4년",
      available: false
    }
  ];

  const communityPosts = [
    {
      id: 1,
      title: "요양보호사 선택 시 체크해야 할 5가지",
      author: "건강지킴이",
      date: "2일 전",
      comments: 23,
      likes: 45,
      tags: ["가이드", "팁"]
    },
    {
      id: 2,
      title: "부모님 케어, 어떻게 시작해야 할까요?",
      author: "효심가득",
      date: "4일 전",
      comments: 17,
      likes: 32,
      tags: ["질문", "노인케어"]
    },
    {
      id: 3,
      title: "재활 운동 함께하는 방법 공유합니다",
      author: "건강한하루",
      date: "1주일 전",
      comments: 28,
      likes: 56,
      tags: ["정보", "재활"]
    }
  ];


  const handleAdminFeature = () => {
    navigate('/admin/cert');
  };

  return (
    <div className="home-container">
      {/* User Welcome Section */}
      <section className="welcome-section container">
        <div className="welcome-content">
          <div>
            {user ? (
              <div className="user-welcome">
                <div className="avatar">
                  <img src="https://via.placeholder.com/40" alt={user.username} />
                </div>
                <div>
                  <h2>{user.username}님, 환영합니다!</h2>
                  <p className="text-muted">오늘도 건강한 하루 되세요.</p>
                </div>
              </div>
            ) : (
              <div>
                <h2>요양의 패러다임을 바꾸는 케어매칭칭</h2>
                <p className="text-muted">서비스를 이용해보세요</p>
              </div>
            )}
          </div>
          <div className="welcome-buttons">
            {/* 관리자일 경우에만 자격증 관리 버튼 렌더링 */}
            {user?.role === 'ROLE_ADMIN' && (
              <button className="btn btn-outline" onClick={handleAdminFeature}>
                자격증 관리 <AwardIcon />
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
              className={`tab-button ${activeTab === 'caregivers' ? 'active' : ''}`}
              onClick={() => setActiveTab('caregivers')}
            >
              <UsersIcon /> 요양사 목록
            </button>
            <button
              className={`tab-button ${activeTab === 'community' ? 'active' : ''}`}
              onClick={() => setActiveTab('community')}
            >
              <MessageSquareIcon /> 커뮤니티
            </button>
          </div>

          {/* Caregivers Tab */}
          <div className={`tab-content ${activeTab === 'caregivers' ? 'active' : ''}`}>
            <div className="section-header">
              <h2>추천 요양사</h2>
              <button className="btn-text" onClick={() => navigate('/caregiver')}>
                전체보기 <ArrowRightIcon />
              </button>
            </div>

            {/* Search Bar */}
            <div className="search-container">
              <SearchIcon />
              <input
                type="text"
                placeholder="이름, 지역, 전문분야로 검색하세요"
                className="search-input"
              />
            </div>

            {/* Caregivers Grid */}
            <div className="caregivers-grid">
              {featuredCaregivers.map(caregiver => (
                <div key={caregiver.id} className="card">
                  <div className="card-header">
                    <div className="caregiver-info">
                      <div className="avatar">
                        <img src={caregiver.image || "/placeholder.svg"} alt={caregiver.name} />
                      </div>
                      <div>
                        <h3>{caregiver.name}</h3>
                        <div className="rating">
                          <StarIcon />
                          <span>{caregiver.rating}</span>
                          <span className="dot">•</span>
                          <span>{caregiver.reviews} 리뷰</span>
                        </div>
                      </div>
                    </div>
                    <span className={`badge ${caregiver.available ? 'badge-primary' : 'badge-secondary'}`}>
                      {caregiver.available ? "예약가능" : "예약중"}
                    </span>
                  </div>
                  <div className="card-content">
                    <div className="caregiver-details">
                      <div className="experience">
                        <AwardIcon />
                        <span>경력 {caregiver.experience}</span>
                      </div>
                      <div className="specialties">
                        {caregiver.specialties.map((specialty, i) => (
                          <span key={i} className="specialty-badge">
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="card-footer">
                    <button className="btn-text">
                      <CalendarIcon /> 예약하기
                    </button>
                    <button className="btn-text">
                      프로필 보기
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Community Tab */}
          <div className={`tab-content ${activeTab === 'community' ? 'active' : ''}`}>
            <div className="section-header">
              <h2>인기 커뮤니티 글</h2>
              <button className="btn-text" onClick={() => navigate('/community')}>
                전체보기 <ArrowRightIcon />
              </button>
            </div>

            {/* Community Posts */}
            <div className="community-posts">
              {communityPosts.map(post => (
                <div key={post.id} className="card">
                  <div className="card-header">
                    <div>
                      <h3>{post.title}</h3>
                      <p className="text-muted">작성자: {post.author}</p>
                    </div>
                    <div className="post-date">
                      <span>{post.date}</span>
                    </div>
                  </div>
                  <div className="card-content">
                    <div className="post-tags">
                      {post.tags.map((tag, i) => (
                        <span key={i} className="tag-badge">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="card-footer">
                    <div className="post-stats">
                      <div className="stat">
                        <MessageSquareIcon /> {post.comments}
                      </div>
                      <div className="stat">
                        <HeartIcon /> {post.likes}
                      </div>
                    </div>
                    <button className="btn-text">
                      읽기
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Post Button */}
            <div className="center-button">
              <button className="btn btn-primary" onClick={() => navigate('/community/new')}>
                새 글 작성하기 <ArrowRightIcon />
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
                <UsersIcon />
              </div>
              <h3>검증된 요양사</h3>
              <p>자격증과 경력이 검증된 전문 요양사들을 만나보세요. 철저한 신원 확인으로 안심하고 이용할 수 있습니다.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <MessageSquareIcon />
              </div>
              <h3>활발한 커뮤니티</h3>
              <p>다양한 경험과 정보를 공유하는 커뮤니티에서 유용한 팁과 조언을 얻고 함께 성장해보세요.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <CalendarIcon />
              </div>
              <h3>간편한 예약</h3>
              <p>원하는 시간에 필요한 서비스를 쉽고 빠르게 예약하세요. 실시간 일정 확인으로 편리하게 이용할 수 있습니다.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
