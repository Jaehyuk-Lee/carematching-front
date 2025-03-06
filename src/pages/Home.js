import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Home.module.css';

const Home = () => {
  return (
    <div className={styles.homeContainer}>
      {/* 히어로 섹션 */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            전문 케어기버와 함께<br />
            <span className={styles.highlight}>편안한 돌봄</span>을 경험하세요
          </h1>
          <p className={styles.heroSubtitle}>
            케어매칭은 신뢰할 수 있는 전문 케어기버와 돌봄이 필요한 분들을
            연결해주는 서비스입니다
          </p>
          <div className={styles.heroCta}>
            <Link to="/caregiver" className={styles.primaryButton}>
              케어기버 찾기
            </Link>
            <Link to="/register" className={styles.secondaryButton}>
              회원가입하기
            </Link>
          </div>
        </div>
        <div className={styles.heroImageContainer}>
          <img
            src="/images/hero-image.jpg"
            alt="케어기버와 어르신"
            className={styles.heroImage}
          />
        </div>
      </section>

      {/* 서비스 특징 섹션 */}
      <section className={styles.featuresSection}>
        <h2 className={styles.sectionTitle}>케어매칭 서비스의 특징</h2>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIconContainer}>
              <img src="/icons/verified.svg" alt="검증된 케어기버" className={styles.featureIcon} />
            </div>
            <h3 className={styles.featureTitle}>검증된 케어기버</h3>
            <p className={styles.featureDescription}>
              철저한 신원 확인과 자격 검증을 거친 전문 케어기버만 활동합니다
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIconContainer}>
              <img src="/icons/matching.svg" alt="맞춤형 매칭" className={styles.featureIcon} />
            </div>
            <h3 className={styles.featureTitle}>맞춤형 매칭</h3>
            <p className={styles.featureDescription}>
              필요한 서비스와 조건에 맞는 최적의 케어기버를 찾아드립니다
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIconContainer}>
              <img src="/icons/secure.svg" alt="안전한 계약" className={styles.featureIcon} />
            </div>
            <h3 className={styles.featureTitle}>안전한 계약</h3>
            <p className={styles.featureDescription}>
              표준화된 계약 시스템으로 안전하고 투명한 서비스를 제공합니다
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIconContainer}>
              <img src="/icons/support.svg" alt="지속적인 관리" className={styles.featureIcon} />
            </div>
            <h3 className={styles.featureTitle}>지속적인 관리</h3>
            <p className={styles.featureDescription}>
              서비스 시작 후에도 지속적인 모니터링과 피드백을 통해 관리합니다
            </p>
          </div>
        </div>
      </section>

      {/* 서비스 이용 방법 섹션 */}
      <section className={styles.howItWorksSection}>
        <h2 className={styles.sectionTitle}>서비스 이용 방법</h2>
        <div className={styles.stepsContainer}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <h3 className={styles.stepTitle}>회원가입</h3>
            <p className={styles.stepDescription}>
              간단한 정보 입력으로 케어매칭 서비스에 가입합니다
            </p>
          </div>

          <div className={styles.stepArrow}>→</div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <h3 className={styles.stepTitle}>케어기버 검색</h3>
            <p className={styles.stepDescription}>
              필요한 조건에 맞는 케어기버를 찾아봅니다
            </p>
          </div>

          <div className={styles.stepArrow}>→</div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <h3 className={styles.stepTitle}>매칭 신청</h3>
            <p className={styles.stepDescription}>
              마음에 드는 케어기버에게 매칭을 신청합니다
            </p>
          </div>

          <div className={styles.stepArrow}>→</div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <h3 className={styles.stepTitle}>서비스 시작</h3>
            <p className={styles.stepDescription}>
              매칭 성공 후 케어 서비스를 시작합니다
            </p>
          </div>
        </div>
      </section>

      {/* 케어기버 추천 섹션 */}
      <section className={styles.recommendationSection}>
        <h2 className={styles.sectionTitle}>추천 케어기버</h2>
        <div className={styles.caregiverCards}>
          <div className={styles.caregiverCard}>
            <img
              src="/images/caregiver1.jpg"
              alt="김민지 케어기버"
              className={styles.caregiverImage}
            />
            <div className={styles.caregiverInfo}>
              <h3 className={styles.caregiverName}>김민지</h3>
              <p className={styles.caregiverSpecialty}>노인 케어 전문</p>
              <div className={styles.caregiverRating}>
                ★★★★★ <span className={styles.ratingScore}>4.9</span>
              </div>
              <Link to="/caregiver/1" className={styles.viewProfileButton}>
                프로필 보기
              </Link>
            </div>
          </div>

          <div className={styles.caregiverCard}>
            <img
              src="/images/caregiver2.jpg"
              alt="이준호 케어기버"
              className={styles.caregiverImage}
            />
            <div className={styles.caregiverInfo}>
              <h3 className={styles.caregiverName}>이준호</h3>
              <p className={styles.caregiverSpecialty}>재활 치료 전문</p>
              <div className={styles.caregiverRating}>
                ★★★★☆ <span className={styles.ratingScore}>4.7</span>
              </div>
              <Link to="/caregiver/2" className={styles.viewProfileButton}>
                프로필 보기
              </Link>
            </div>
          </div>

          <div className={styles.caregiverCard}>
            <img
              src="/images/caregiver3.jpg"
              alt="박소연 케어기버"
              className={styles.caregiverImage}
            />
            <div className={styles.caregiverInfo}>
              <h3 className={styles.caregiverName}>박소연</h3>
              <p className={styles.caregiverSpecialty}>간병 케어 전문</p>
              <div className={styles.caregiverRating}>
                ★★★★★ <span className={styles.ratingScore}>5.0</span>
              </div>
              <Link to="/caregiver/3" className={styles.viewProfileButton}>
                프로필 보기
              </Link>
            </div>
          </div>
        </div>
        <div className={styles.viewAllContainer}>
          <Link to="/caregiver" className={styles.viewAllButton}>
            모든 케어기버 보기
          </Link>
        </div>
      </section>

      {/* 사용자 후기 섹션 */}
      <section className={styles.testimonialsSection}>
        <h2 className={styles.sectionTitle}>이용자 후기</h2>
        <div className={styles.testimonialCards}>
          <div className={styles.testimonialCard}>
            <div className={styles.testimonialContent}>
              <p className={styles.testimonialText}>
                "케어매칭을 통해 어머니를 돌봐주실 케어기버를 만나게 되었습니다.
                전문적인 케어로 어머니의 건강이 많이 좋아졌고,
                가족처럼 챙겨주셔서 정말 감사합니다."
              </p>
            </div>
            <div className={styles.testimonialAuthor}>
              <img
                src="/images/user1.jpg"
                alt="이지영 님"
                className={styles.testimonialAvatar}
              />
              <div>
                <p className={styles.testimonialName}>이지영 님</p>
                <p className={styles.testimonialLocation}>서울시 강남구</p>
              </div>
            </div>
          </div>

          <div className={styles.testimonialCard}>
            <div className={styles.testimonialContent}>
              <p className={styles.testimonialText}>
                "아버지의 재활을 위해 케어기버를 찾던 중 케어매칭을 알게 되었습니다.
                경험이 풍부한 케어기버 선생님 덕분에 아버지의 재활 속도가
                눈에 띄게 빨라졌습니다."
              </p>
            </div>
            <div className={styles.testimonialAuthor}>
              <img
                src="/images/user2.jpg"
                alt="김현우 님"
                className={styles.testimonialAvatar}
              />
              <div>
                <p className={styles.testimonialName}>김현우 님</p>
                <p className={styles.testimonialLocation}>경기도 분당시</p>
              </div>
            </div>
          </div>

          <div className={styles.testimonialCard}>
            <div className={styles.testimonialContent}>
              <p className={styles.testimonialText}>
                "할머니를 위한 케어기버를 찾기 어려웠는데, 케어매칭에서
                정말 좋은 선생님을 만났습니다. 할머니도 너무 만족하시고
                저희 가족의 부담도 크게 줄었습니다."
              </p>
            </div>
            <div className={styles.testimonialAuthor}>
              <img
                src="/images/user3.jpg"
                alt="박민준 님"
                className={styles.testimonialAvatar}
              />
              <div>
                <p className={styles.testimonialName}>박민준 님</p>
                <p className={styles.testimonialLocation}>인천시 연수구</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>지금 바로 케어매칭과 함께하세요</h2>
          <p className={styles.ctaDescription}>
            신뢰할 수 있는 케어기버가 필요하신가요?<br />
            케어매칭이 도와드리겠습니다.
          </p>
          <div className={styles.ctaButtons}>
            <Link to="/caregiver" className={styles.primaryButton}>
              케어기버 찾기
            </Link>
            <Link to="/contact" className={styles.secondaryButton}>
              문의하기
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
