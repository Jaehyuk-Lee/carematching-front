import React from 'react';
import styles from './MyPosts.module.css';

function MyPosts() {
  // 샘플 데이터
  const posts = [
    { id: 1, title: "첫 번째 글", comments: 5, likes: 10, views: 100 },
    { id: 2, title: "두 번째 글", comments: 2, likes: 5, views: 50 },
    { id: 3, title: "세 번째 글", comments: 8, likes: 20, views: 200 },
  ];

  return (
    <div className={styles.myPostsPage}>
      <h2>작성글 목록</h2>
      {posts.map((post) => (
        <div key={post.id} className={styles.postCard}>
          <div className={styles.postTitle}>{post.title}</div>
          <div className={styles.postStats}>
            <div className={styles.postStat}>
              <span className={styles.postStatIcon}>👁️</span> {post.views}
            </div>
            <div className={styles.postStat}>
              <span className={styles.postStatIcon}>❤️</span> {post.likes}
            </div>
            <div className={styles.postStat}>
              <span className={styles.postStatIcon}>💬</span> {post.comments}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default MyPosts;
