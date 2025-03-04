import { useState, useCallback, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import styles from "./Community.module.css"
import axiosInstance from "../api/axiosInstance"
import { useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { Eye, Heart, MessageCircle } from "lucide-react"

export default function Community() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [activeMainTab, setActiveMainTab] = useState("전체")
  const [activeSubTab, setActiveSubTab] = useState("전체")
  const [userInfo, setUserInfo] = useState(null)
  const [posts, setPosts] = useState([])
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const initialLoadDone = useRef(false)
  const loginCheckDone = useRef(false)

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

  const getMainTabs = useCallback(() => {
    if (!user) return ["전체"]
    const tabs = ["전체"]
    if (user.role === "ROLE_USER_CATEGORY" || user.role === "ROLE_ADMIN") {
      tabs.push("요양사")
    }
    tabs.push("내 활동")
    return tabs
  }, [user])

  const subTabs = {
    "내 활동": ["작성글", "댓글", "좋아요"],
    전체: ["전체", "인기글"],
    요양사: ["전체", "인기글"],
  }

  const getAccessParam = useCallback((tab) => {
    switch (tab) {
      case "전체":
        return "ALL"
      case "요양사":
        return "CAREGIVER"
      default:
        return "ALL"
    }
  }, [])

  const fetchPosts = useCallback(async () => {
    if (loading || !hasMore) return

    setLoading(true)
    try {
      let endpoint = "/api/community/posts"
      let params = {
        access: getAccessParam(activeMainTab),
        page,
        size: 10,
      }

      if (isSearching && searchKeyword.trim() !== "") {
        endpoint = "/api/community/search"
        params = {
          ...params,
          keyword: searchKeyword,
        }
      } else if (activeSubTab === "인기글") {
        endpoint = "/api/community/popular-posts"
      } else if (activeMainTab === "내 활동") {
        if (activeSubTab === "작성글") {
          endpoint = "/api/community/my-posts"
        } else if (activeSubTab === "댓글") {
          endpoint = "/api/community/my-comments"
        } else if (activeSubTab === "좋아요") {
          endpoint = "/api/community/my-likes"
        }
      }

      const response = await axiosInstance.get(endpoint, { params })
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
  }, [activeMainTab, activeSubTab, isSearching, page, hasMore, searchKeyword, getAccessParam, loading])

  useEffect(() => {
    setPosts([])
    setPage(0)
    setHasMore(true)
    initialLoadDone.current = false
  }, [activeMainTab, activeSubTab, isSearching])

  useEffect(() => {
    if (!initialLoadDone.current || (posts.length === 0 && hasMore)) {
      fetchPosts()
      initialLoadDone.current = true
    }
  }, [fetchPosts, hasMore, posts.length])

  useEffect(() => {
    if (initialLoadDone.current && page > 0) {
      fetchPosts()
    }
  }, [page, fetchPosts])

  useEffect(() => {
    const checkLoginAndFetchData = async () => {
      if (loginCheckDone.current) return

      if (!user) {
        alert("로그인이 필요합니다.")
        navigate("/login", { state: { from: location.pathname } })
      } else {
        try {
          const response = await axiosInstance.get("/api/community/user-info")
          setUserInfo(response.data)
        } catch (error) {
          console.error("Failed to fetch user info:", error)
        }
      }
      loginCheckDone.current = true
    }

    checkLoginAndFetchData()
  }, [user, navigate, location.pathname])

  const handleSubTabClick = (tab) => {
    if (tab !== activeSubTab) {
      setActiveSubTab(tab)
      if (!isSearchBarVisible()) {
        setIsSearching(false)
        setSearchKeyword("")
      }
      setPosts([])
      setPage(0)
      setHasMore(true)
      initialLoadDone.current = false
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchKeyword.trim() !== "") {
      setIsSearching(true)
    } else {
      setIsSearching(false)
    }
    setPosts([])
    setPage(0)
    setHasMore(true)
    initialLoadDone.current = false
  }

  const handleStatClick = (statType) => {
    let newSubTab
    switch (statType) {
      case "posts":
        newSubTab = "작성글"
        break
      case "comments":
        newSubTab = "댓글"
        break
      case "likes":
        newSubTab = "좋아요"
        break
      default:
        return // 잘못된 statType이 전달된 경우 함수 종료
    }

    // 현재 상태와 동일한 경우 아무 작업도 하지 않음
    if (activeMainTab === "내 활동" && activeSubTab === newSubTab) {
      return
    }

    setActiveMainTab("내 활동")
    setActiveSubTab(newSubTab)
    setPosts([])
    setPage(0)
    setHasMore(true)
    initialLoadDone.current = false
  }

  const currentSubTabs = subTabs[activeMainTab] || subTabs["전체"]

  const isSearchBarVisible = () => {
    return (
      (activeMainTab === "전체" && activeSubTab === "전체") || (activeMainTab === "요양사" && activeSubTab === "전체")
    )
  }

  const renderPostItem = (post, index) => {
    const isMyPostsView = activeMainTab === "내 활동" && activeSubTab === "작성글"
    const isMyCommentsView = activeMainTab === "내 활동" && activeSubTab === "댓글"

    const handlePostClick = () => {
      navigate(`/community/posts/${post.id}`)
    }

    if (isMyCommentsView) {
      return (
        <div
          key={`${post.postId}-${index}`}
          className={styles.commentItem}
          ref={index === posts.length - 1 ? lastPostElementRef : null}
          onClick={() => navigate(`/community/posts/${post.postId}`)}
        >
          <h3 className={styles.commentPostTitle}>{post.postTitle}</h3>
          <div className={styles.commentContent}>
            <p className={styles.commentText}>{post.content}</p>
          </div>
          {!(activeMainTab === "내 활동" && activeSubTab === "댓글") && (
            <div className={styles.postStats}>
              <span className={styles.viewCount}>
                <Eye size={16} /> {post.viewCount}
              </span>
              <span className={styles.likeCount}>
                <Heart size={16} /> {post.likeCount}
              </span>
              <span className={styles.commentCount}>
                <MessageCircle size={16} /> {post.commentCount}
              </span>
            </div>
          )}
          <span className={styles.commentTime}>{post.relativeTime}</span>
        </div>
      )
    }

    if (isMyPostsView) {
      return (
        <div
          key={`${post.id}-${index}`}
          className={styles.myPostItem}
          ref={index === posts.length - 1 ? lastPostElementRef : null}
          onClick={handlePostClick}
        >
          <div className={styles.myPostContent}>
            <div className={styles.myPostTextContent}>
              <h3 className={styles.postTitle}>{post.title}</h3>
              <p className={styles.postText}>{post.content}</p>
            </div>
            {post.image && (
              <div className={styles.myPostImageContainer}>
                <img src={post.image || "/placeholder.svg"} alt="게시물 이미지" className={styles.myPostImage} />
              </div>
            )}
          </div>
          <div className={styles.myPostFooter}>
            <div className={styles.postInfo}>
              <span className={styles.categoryTab}>{post.category || "전체"}</span>
              <span className={styles.postTime}>{post.relativeTime}</span>
            </div>
            {!(activeMainTab === "내 활동" && activeSubTab === "댓글") && (
              <div className={styles.postStats}>
                <span className={styles.viewCount}>
                  <Eye size={16} /> {post.viewCount}
                </span>
                <span className={styles.likeCount}>
                  <Heart size={16} /> {post.likeCount}
                </span>
                <span className={styles.commentCount}>
                  <MessageCircle size={16} /> {post.commentCount}
                </span>
              </div>
            )}
          </div>
        </div>
      )
    }

    return (
      <div
        key={`${post.id}-${index}`}
        className={styles.postItem}
        ref={index === posts.length - 1 ? lastPostElementRef : null}
        onClick={handlePostClick}
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
          {!(activeMainTab === "내 활동" && activeSubTab === "댓글") && (
            <div className={styles.postStats}>
              <span className={styles.viewCount}>
                <Eye size={16} /> {post.viewCount}
              </span>
              <span className={styles.likeCount}>
                <Heart size={16} /> {post.likeCount}
              </span>
              <span className={styles.commentCount}>
                <MessageCircle size={16} /> {post.commentCount}
              </span>
            </div>
          )}
        </div>
      </div>
    )
  }

  const handleCreatePost = () => {
    navigate("/create-post", { state: { from: location.pathname } })
  }

  return (
    <div className={styles.container}>
      <div className={styles.mainTabsContainer}>
        <div className={styles.mainTabs}>
          {getMainTabs().map((tab) => (
            <button
              key={tab}
              className={`${styles.mainTab} ${activeMainTab === tab ? styles.activeMainTab : ""}`}
              onClick={() => {
                setActiveMainTab(tab)
                if (tab === "내 활동") {
                  setActiveSubTab("작성글")
                } else {
                  setActiveSubTab("전체")
                }
                if (tab === "내 활동" || tab !== "전체") {
                  setIsSearching(false)
                  setSearchKeyword("")
                }
              }}
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
              <div className={styles.statItem} onClick={() => handleStatClick("posts")}>
                <div className={styles.statLabel}>게시글</div>
                <div className={styles.statValue}>{userInfo?.postCount || 0}</div>
              </div>
              <div className={styles.statItem} onClick={() => handleStatClick("comments")}>
                <div className={styles.statLabel}>댓글</div>
                <div className={styles.statValue}>{userInfo?.commentCount || 0}</div>
              </div>
              <div className={styles.statItem} onClick={() => handleStatClick("likes")}>
                <div className={styles.statLabel}>좋아요</div>
                <div className={styles.statValue}>{userInfo?.likeCount || 0}</div>
              </div>
            </div>
            <button className={styles.writeButton} onClick={handleCreatePost}>
              게시글 작성
            </button>
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

          {isSearchBarVisible() && (
            <form onSubmit={handleSearch} className={styles.searchContainer}>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="검색어를 입력하세요"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
              <button type="submit" className={styles.searchButton} aria-label="검색"></button>
            </form>
          )}

          <div className={styles.postList}>{posts.map((post, index) => renderPostItem(post, index))}</div>
          {loading && <div className={styles.loading}>Loading...</div>}
        </div>
      </div>
    </div>
  )
}

