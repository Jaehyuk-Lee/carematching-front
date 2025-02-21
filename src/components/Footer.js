import React from 'react';
import styles from './Footer.module.css';

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerInfo}>
          <p>프로젝트명 : 케어매칭(요양사 매칭 및 커뮤니티 서비스)</p>
          <p>팀명 : QUADCORE | 팀소개 : 4명의 핵심 멤버</p>
          <p>참여교육생 : 김채연(팀장), 김진원, 이재혁, 이지윤</p>
        </div>
        <div className={styles.footerCopyright}>
          © 2025 QUADCORE INC. All RIGHTS RESERVED
        </div>
      </div>
    </footer>
  );
}

export default Footer;
