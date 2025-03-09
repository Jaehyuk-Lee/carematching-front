import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, MessageSquare, Users, Award, ArrowRight, Heart} from "lucide-react"
import CaregiverList from "../caregiver/caregiverList"
import basicProfileImage from "../assets/basicprofileimage.png"
import './Home.css';

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
                  <img src={user.profileImage || basicProfileImage} alt={user.username} />
                </div>
                <div>
                  <h2>{user.username}님, 환영합니다!</h2>
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
            {user?.role === 'ROLE_ADMIN' && (
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
              className={`tab-button ${activeTab === 'caregivers' ? 'active' : ''}`}
              onClick={() => setActiveTab('caregivers')}
            >
              <Users /> 요양사 목록
            </button>
            <button
              className={`tab-button ${activeTab === 'community' ? 'active' : ''}`}
              onClick={() => setActiveTab('community')}
            >
              <MessageSquare /> 커뮤니티
            </button>
          </div>

          {/* Caregivers Tab */}
          <div className={`tab-content ${activeTab === 'caregivers' ? 'active' : ''}`}>
            <CaregiverList containerClassName="global-no-padding" />
          </div>

          {/* Community Tab */}
          <div className={`tab-content ${activeTab === 'community' ? 'active' : ''}`}>
            <div className="section-header">
              <h2>인기 커뮤니티 글</h2>
              <button className="btn-text" onClick={() => navigate('/community')}>
                전체보기 <ArrowRight />
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
                        <MessageSquare /> {post.comments}
                      </div>
                      <div className="stat">
                        <Heart /> {post.likes}
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
                새 글 작성하기 <ArrowRight />
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
              <p>자격증과 경력이 검증된 전문 요양사들을 만나보세요. 철저한 신원 확인으로 안심하고 이용할 수 있습니다.</p>
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
                <Calendar/>
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
