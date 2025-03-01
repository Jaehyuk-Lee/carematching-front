"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import styles from "./Community.module.css"
import axiosInstance from "../api/axiosInstance"

export default function Community() {
  const [activeMainTab, setActiveMainTab] = useState("전체")
  const [activeSubTab, setActiveSubTab] = useState("전체")
  const [userInfo, setUserInfo] = useState(null)
  const [posts, setPosts] = useState([])
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const initialLoadDone = useRef(false)

  const observer = useRef()
  const lastPostElementRef = useCallback(
    (node) => {
      if (loading) return
      if (observer.current) observer.current.disconnect()
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1)
        }
      })
      if (node) observer.current.observe(node)
    },
    [loading, hasMore],
  )

  const mainTabs = ["전체", "요양사", "수급자", "내 활동"]
  const subTabs = {
    "내 활동": ["작성글", "댓글", "좋아요"],
    전체: ["전체", "인기글"],
    요양사: ["전체", "인기글"],
    수급자: ["전체", "인기글"],
  }

  const getAccessParam = (tab) => {
    switch (tab) {
      case "전체":
        return "ALL"
      case "요양사":
        return "CAREGIVER"
      case "수급자":
        return "USER"
      default:
        return "ALL"
    }
  }

  const fetchPosts = useCallback(async () => {
    if (loading || !hasMore) return

    setLoading(true)
    try {
      const endpoint = activeSubTab === "인기글" ? "/api/community/popular-posts" : "/api/community/posts"
      const response = await axiosInstance.get(endpoint, {
        params: {
          access: getAccessParam(activeMainTab),
          page,
          size: 10,
        },
      })
      const { content, last } = response.data
      setPosts((prevPosts) => {
        const newPosts = content.filter((newPost) => !prevPosts.some((existingPost) => existingPost.id === newPost.id))
        return [...prevPosts, ...newPosts]
      })
      setHasMore(!last)
    } catch (error) {
      console.error("Failed to fetch posts:", error)
    } finally {
      setLoading(false)
    }
  }, [activeMainTab, activeSubTab, page, hasMore, getAccessParam, loading]) // Added getAccessParam and loading to dependencies

  useEffect(() => {
    if (!initialLoadDone.current || (posts.length === 0 && hasMore)) {
      fetchPosts()
      initialLoadDone.current = true
    }
  }, [fetchPosts, posts.length, hasMore])

  useEffect(() => {
    if (initialLoadDone.current && page > 0) {
      fetchPosts()
    }
  }, [page, fetchPosts])

  useEffect(() => {
    setPosts([])
    setPage(0)
    setHasMore(true)
    initialLoadDone.current = false
  }, [activeMainTab, activeSubTab])

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axiosInstance.get("/api/community/user-info")
        setUserInfo(response.data)
      } catch (error) {
        console.error("Failed to fetch user info:", error)
      }
    }

    fetchUserInfo()
  }, [])

  const handleSubTabClick = (tab) => {
    if (tab !== activeSubTab) {
      setActiveSubTab(tab)
      setPosts([])
      setPage(0)
      setHasMore(true)
      initialLoadDone.current = false
    }
  }

  const currentSubTabs = subTabs[activeMainTab] || subTabs["전체"]

  return (
    <div className={styles.container}>
      <div className={styles.mainTabsContainer}>
        <div className={styles.mainTabs}>
          {mainTabs.map((tab) => (
            <button
              key={tab}
              className={`${styles.mainTab} ${activeMainTab === tab ? styles.activeMainTab : ""}`}
              onClick={() => setActiveMainTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.contentWrapper}>
        <div className={styles.sidebar}>
          <div className={styles.profile}>
            <div className={styles.profileImage}>
              <img src={userInfo?.profileImage || "/placeholder.svg"} alt="프로필 이미지" className={styles.avatar} />
            </div>
            <div className={styles.profileName}>{userInfo?.nickname || "로딩 중..."}</div>
            <div className={styles.profileStats}>
              <div className={styles.statItem}>
                <div className={styles.statLabel}>게시글</div>
                <div className={styles.statValue}>{userInfo?.postCount || 0}</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statLabel}>댓글</div>
                <div className={styles.statValue}>{userInfo?.commentCount || 0}</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statLabel}>좋아요</div>
                <div className={styles.statValue}>{userInfo?.likeCount || 0}</div>
              </div>
            </div>
            <button className={styles.writeButton}>게시글 작성</button>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.subTabs}>
            {currentSubTabs.map((tab) => (
              <button
                key={tab}
                className={`${styles.subTab} ${activeSubTab === tab ? styles.activeSubTab : ""}`}
                onClick={() => handleSubTabClick(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className={styles.searchContainer}>
            <input type="text" className={styles.searchInput} placeholder="검색어를 입력하세요" />
            <button className={styles.searchButton} aria-label="검색"></button>
          </div>

          <div className={styles.postList}>
            {posts.map((post, index) => (
              <div
                key={`${post.id}-${index}`}
                className={styles.postItem}
                ref={index === posts.length - 1 ? lastPostElementRef : null}
              >
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
                    <img src={post.profileImage || "/placeholder.svg"} alt="" className={styles.authorImage} />
                    <span className={styles.authorName}>{post.nickname}</span>
                    <span className={styles.postTime}>{post.relativeTime}</span>
                  </div>
                  <div className={styles.postStats}>
                    <div className={styles.postStat}>
                      <span className={styles.viewCount}>{post.viewCount}</span>
                    </div>
                    <div className={styles.postStat}>
                      <span className={styles.likeCount}>{post.likeCount}</span>
                    </div>
                    <div className={styles.postStat}>
                      <span className={styles.commentCount}>{post.commentCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {loading && <div className={styles.loading}>Loading...</div>}
          </div>
        </div>
      </div>
    </div>
  )
}

