import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from "../api/axiosInstance";
import styles from './caregiverDetail.module.css';
import {
  MapPin,
  Clock,
  Briefcase,
  Award,
  Heart,
  Calendar,
  CheckCircle,
  ArrowLeft,
  Star,
  Phone,
  MessageSquare,
  AlertCircle
} from 'lucide-react';

function CaregiverDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caregiver, setCaregiver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    const fetchCaregiverDetail = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/api/caregivers/${id}`);
        setCaregiver(response.data);
        setError(null);

        // 즐겨찾기 상태 체크 (로그인 상태일 때)
        try {
          const favoriteResponse = await axiosInstance.get(`/api/users/favorites`);
          const isFav = favoriteResponse.data.some(fav => fav.caregiverId === parseInt(id));
          setIsFavorite(isFav);
        } catch (err) {
          console.log('로그인 상태가 아니거나 즐겨찾기 정보를 불러오는데 실패했습니다.');
        }
      } catch (err) {
        setError('케어기버 정보를 불러오는 중 오류가 발생했습니다.');
        console.error('Error fetching caregiver details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCaregiverDetail();
  }, [id]);

  const goBack = () => {
    navigate(-1);
  };

  const handleContactRequest = () => {
    // 로그인 상태 확인
    const isLoggedIn = localStorage.getItem('token');

    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }

    setShowContactInfo(true);
  };

  const handleFavoriteToggle = async () => {
    // 로그인 상태 확인
    const isLoggedIn = localStorage.getItem('token');

    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }

    try {
      if (isFavorite) {
        await axiosInstance.delete(`/api/users/favorites/${id}`);
      } else {
        await axiosInstance.post(`/api/users/favorites`, { caregiverId: id });
      }
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error('즐겨찾기 처리 중 오류가 발생했습니다:', err);
    }
  };

  const closeLoginPrompt = () => {
    setShowLoginPrompt(false);
  };

  const redirectToLogin = () => {
    navigate('/login', { state: { from: `/caregiver/${id}` } });
  };

  // 근무 유형 한글화
  const workTypeLabel = {
    'RESIDENT': '입주',
    'COMMUTE': '출퇴근'
  };

  // 선호 시간대 한글화
  const preferredTimeLabel = {
    'MORNING': '오전',
    'AFTERNOON': '오후',
    'EVENING': '저녁'
  };

  // 계약 유형 한글화
  const contractTypeLabel = {
    'CONTRACT': '정규직',
    'TEMPORARY': '임시직'
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>케어기버 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (error || !caregiver) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorMessage}>{error || '케어기버를 찾을 수 없습니다.'}</p>
        <button
          className={styles.backButton}
          onClick={goBack}
        >
          <ArrowLeft size={16} />
          <span>목록으로 돌아가기</span>
        </button>
      </div>
    );
  }

  return (
    <div className={styles.caregiverDetailContainer}>
      <div className={styles.backButtonContainer}>
        <button className={styles.backButton} onClick={goBack}>
          <ArrowLeft size={18} />
          <span>목록으로 돌아가기</span>
        </button>
      </div>

      <div className={styles.profileSection}>
        <div className={styles.imageAndActions}>
          <div className={styles.profileImageContainer}>
            <img
              src={caregiver.profileImage || "/default-avatar.png"}
              alt={`${caregiver.name} 프로필`}
              className={styles.profileImage}
            />
            {caregiver.status === 'OPEN' ? (
              <div className={styles.statusBadge} data-status="available">모집중</div>
            ) : (
              <div className={styles.statusBadge} data-status="unavailable">모집완료</div>
            )}
          </div>

          <div className={styles.actionsContainer}>
            <button
              className={`${styles.actionButton} ${isFavorite ? styles.favoriteActive : ''}`}
              onClick={handleFavoriteToggle}
              aria-label={isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
            >
              <Heart size={20} />
              <span>{isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}</span>
            </button>
          </div>
        </div>

        <div className={styles.profileInfo}>
          <div className={styles.nameAndRating}>
            <h1 className={styles.caregiverName}>{caregiver.name}</h1>
            <div className={styles.rating}>
              <Star size={16} className={styles.ratingIcon} />
              <span>{caregiver.rating || '4.8'}</span>
            </div>
          </div>

          <p className={styles.specialization}>{caregiver.specialization}</p>

          <div className={styles.detailsList}>
            <div className={styles.detailItem}>
              <MapPin size={18} className={styles.detailIcon} />
              <span>{caregiver.location}</span>
            </div>

            <div className={styles.detailItem}>
              <Briefcase size={18} className={styles.detailIcon} />
              <span>{workTypeLabel[caregiver.workType]}</span>
            </div>

            <div className={styles.detailItem}>
              <Clock size={18} className={styles.detailIcon} />
              <span>{preferredTimeLabel[caregiver.preferredTime]}</span>
            </div>

            <div className={styles.detailItem}>
              <Award size={18} className={styles.detailIcon} />
              <span>{caregiver.experience ? `경력 ${caregiver.experience}년` : '신입'}</span>
            </div>

            <div className={styles.detailItem}>
              <Calendar size={18} className={styles.detailIcon} />
              <span>{contractTypeLabel[caregiver.contractType]}</span>
            </div>
          </div>

          <div className={styles.salaryContainer}>
            <span className={styles.salaryLabel}>기본 급여</span>
            <span className={styles.salaryAmount}>{caregiver.salary.toLocaleString()}원</span>
            <span className={styles.salaryPeriod}>/월</span>
          </div>
        </div>
      </div>

      <div className={styles.detailSections}>
        <section className={styles.detailSection}>
          <h2 className={styles.sectionTitle}>자기소개</h2>
          <p className={styles.sectionContent}>
            {caregiver.introduction ||
              '안녕하세요, 저는 어르신들을 정성껏 케어해드리는 케어기버입니다. 노인 케어 분야에서의 풍부한 경험을 바탕으로 정성을 다해 어르신들을 모시겠습니다. 가족처럼 진심으로 대하며, 어르신들의 건강과 행복을 최우선으로 생각합니다.'}
          </p>
        </section>

        <section className={styles.detailSection}>
          <h2 className={styles.sectionTitle}>자격증</h2>
          {caregiver.certificates && caregiver.certificates.length > 0 ? (
            <ul className={styles.certificationsList}>
              {caregiver.certificates.map((cert, index) => (
                <li key={index} className={styles.certificationItem}>
                  <CheckCircle size={18} className={styles.checkIcon} />
                  <span>{cert}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.sectionContent}>등록된 자격증 정보가 없습니다.</p>
          )}
        </section>

        <section className={styles.detailSection}>
          <h2 className={styles.sectionTitle}>제공 서비스</h2>
          {caregiver.services && caregiver.services.length > 0 ? (
            <ul className={styles.servicesList}>
              {caregiver.services.map((service, index) => (
                <li key={index} className={styles.serviceItem}>
                  <CheckCircle size={18} className={styles.checkIcon} />
                  <span>{service}</span>
                </li>
              ))}
            </ul>
          ) : (
            <ul className={styles.servicesList}>
              <li className={styles.serviceItem}>
                <CheckCircle size={18} className={styles.checkIcon} />
                <span>식사 준비 및 보조</span>
              </li>
              <li className={styles.serviceItem}>
                <CheckCircle size={18} className={styles.checkIcon} />
                <span>개인위생 관리</span>
              </li>
              <li className={styles.serviceItem}>
                <CheckCircle size={18} className={styles.checkIcon} />
                <span>건강관리 및 투약관리</span>
              </li>
              <li className={styles.serviceItem}>
                <CheckCircle size={18} className={styles.checkIcon} />
                <span>이동 보조 및 동행</span>
              </li>
              <li className={styles.serviceItem}>
                <CheckCircle size={18} className={styles.checkIcon} />
                <span>정서 지원 및 말벗</span>
              </li>
            </ul>
          )}
        </section>
      </div>

      <div className={styles.contactSection}>
        {showContactInfo ? (
          <div className={styles.contactInfo}>
            <div className={styles.contactMethod}>
              <Phone size={20} className={styles.contactIcon} />
              <div>
                <h3 className={styles.contactTitle}>전화번호</h3>
                <p className={styles.contactDetail}>{caregiver.phone || '010-1234-5678'}</p>
              </div>
            </div>

            <div className={styles.contactMethod}>
              <MessageSquare size={20} className={styles.contactIcon} />
              <div>
                <h3 className={styles.contactTitle}>이메일</h3>
                <p className={styles.contactDetail}>{caregiver.email || 'care@example.com'}</p>
              </div>
            </div>

            <p className={styles.contactDisclaimer}>
              <AlertCircle size={16} />
              <span>연락처 정보는 채용 목적으로만 사용해주세요.</span>
            </p>
          </div>
        ) : (
          <button
            className={styles.contactButton}
            onClick={handleContactRequest}
          >
            연락처 보기
          </button>
        )}
      </div>

      {showLoginPrompt && (
        <div className={styles.loginPromptOverlay}>
          <div className={styles.loginPrompt}>
            <h3>로그인이 필요합니다</h3>
            <p>이 기능을 사용하려면 로그인이 필요합니다.</p>
            <div className={styles.promptButtons}>
              <button className={styles.cancelButton} onClick={closeLoginPrompt}>취소</button>
              <button className={styles.loginButton} onClick={redirectToLogin}>로그인하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CaregiverDetailPage;
