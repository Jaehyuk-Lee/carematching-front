import { useState, useCallback, useRef, useEffect } from "react"
import { useNavigate, useLocation, Routes, Route } from "react-router-dom"
import styles from "./Community.module.css"
import axiosInstance from "../api/axiosInstance"
import { useAuth } from "../context/AuthContext"
import { Eye, Heart, MessageCircle, Search, PenSquare } from "lucide-react"
import CreatePost from "./CreatePost"
import PostDetail from "./PostDetail"
import Swal from "sweetalert2"
import basicProfileImage from "../assets/basicprofileimage.png"

// 커뮤니티 메인 콘텐츠 컴포넌트
function CommunityContent() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [activeMainTab, setActiveMainTab] = useState("자유게시판")
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
  const isLoadingRef = useRef(false)
  const loadedPages = useRef(new Set()).current

  const observer = useRef()
  const lastPostElementRef = useCallback(
    (node) => {
      if (loading || !hasMore || isLoadingRef.current) return
      if (observer.current) observer.current.disconnect()
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !isLoadingRef.current) {
          setPage((prevPage) => prevPage + 1)
        }
      })
      if (node) observer.current.observe(node)
    },
    [loading, hasMore],
  )

  const getMainTabs = useCallback(() => {
    if (!user) return ["자유게시판"]
    const tabs = ["자유게시판"]
    if (user.role === "ROLE_USER_CAREGIVER" || user.role === "ROLE_ADMIN") {
      tabs.push("요양사게시판")
    }
    tabs.push("내 활동")
    return tabs
  }, [user])

  const subTabs = {
    "내 활동": ["작성글", "댓글", "좋아요"],
    자유게시판: ["전체", "인기글"],
    요양사게시판: ["전체", "인기글"],
  }

  const getAccessParam = useCallback((tab) => {
    switch (tab) {
      case "자유게시판":
        return "ALL"
      case "요양사게시판":
        return "CAREGIVER"
      default:
        return "ALL"
    }
  }, [])

  const fetchPosts = useCallback(async () => {
    if (loading || !hasMore || isLoadingRef.current) return
    if (page > 0 && loadedPages.has(page)) {
      return
    }

    setLoading(true)
    isLoadingRef.current = true

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

      if (content && content.length > 0) {
        setPosts((prevPosts) => {
          if (page === 0) {
            return [...content] // 첫 페이지는 교체
          } else {
            return [...prevPosts, ...content] // 이후 페이지는 추가
          }
        })
        loadedPages.add(page) // 로드된 페이지 추적
      } else {
        // 새 데이터가 없으면 hasMore를 false로 설정
        setHasMore(false)
      }

      // 마지막 페이지인 경우 hasMore를 false로 설정
      setHasMore(!last)
    } catch (error) {
      console.error("Failed to fetch posts:", error)
      setHasMore(false) // 에러 발생 시 hasMore를 false로 설정
    } finally {
      setLoading(false)
      isLoadingRef.current = false
    }
  }, [getAccessParam, page, activeMainTab, activeSubTab, isSearching, searchKeyword, loading, hasMore, loadedPages])

  // Reset posts when tab or search changes
  useEffect(() => {
    setPosts([])
    setPage(0)
    setHasMore(true)
    initialLoadDone.current = false
    loadedPages.clear() // 로드된 페이지 목록 초기화
  }, [activeMainTab, activeSubTab, isSearching, loadedPages])

  // Initial load or when posts are empty
  useEffect(() => {
    if (!initialLoadDone.current || (posts.length === 0 && hasMore)) {
      fetchPosts()
      initialLoadDone.current = true
    }
  }, [fetchPosts, hasMore, posts.length])

  // Load more posts when page changes
  useEffect(() => {
    if (initialLoadDone.current && page > 0 && hasMore && !loading && !isLoadingRef.current) {
      fetchPosts()
    }
  }, [page, fetchPosts, hasMore, loading])

  // Check login and fetch user info
  useEffect(() => {
    const checkLoginAndFetchData = async () => {
      if (loginCheckDone.current) return

      if (!user) {
        await Swal.fire({
          title: "로그인 필요",
          text: "로그인이 필요한 서비스입니다.",
          icon: "warning",
          confirmButtonText: "로그인하기",
          showCancelButton: true,
          cancelButtonText: "취소",
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/login", { state: { from: location.pathname } })
          }
        })
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
      (activeMainTab === "자유게시판" && activeSubTab === "전체") ||
      (activeMainTab === "요양사게시판" && activeSubTab === "전체")
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
            <img src={post.profileImage || basicProfileImage} alt="" className={styles.authorImage} />
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
    navigate("/community/create-post")
  }

  const renderEmptyState = () => {
    if (loading) {
      return (
        <div className={styles.emptyState}>
          <div className={styles.loadingSpinner}></div>
        </div>
      )
    }

    if (activeMainTab === "내 활동" && activeSubTab === "댓글") {
      return (
        <div className={styles.emptyState}>
          <p>댓글이 없습니다.</p>
        </div>
      )
    }

    return (
      <div className={styles.emptyState}>
        <p>게시글이 없습니다</p>
        <button
          className={`${styles.emptyStateButton} ${user?.role === "ROLE_ADMIN" ? styles.admin : ""}`}
          onClick={handleCreatePost}
        >
          첫 게시글 작성하기
        </button>
      </div>
    )
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
                if (tab === "내 활동" || tab !== "자유게시판") {
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
              <img src={userInfo?.profileImage || basicProfileImage} alt="프로필 이미지" className={styles.avatar} />
            </div>
            <div className={styles.profileName}>{userInfo?.nickname || "로딩 중..."}</div>
            <div className={styles.profileStats}>
              <div className={styles.statItem} onClick={() => handleStatClick("posts")}>
                <div className={styles.statLabel}>작성글</div>
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
            <button
              className={`${styles.writeButton} ${user?.role === "ROLE_ADMIN" ? styles.admin : ""}`}
              onClick={handleCreatePost}
            >
              <PenSquare size={16} />
              게시글 작성
            </button>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.contentHeader}>
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
                <Search className={styles.searchIcon} size={18} />
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder="검색어를 입력하세요"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                />
                <button type="submit" className={styles.searchButton}>
                  검색
                </button>
              </form>
            )}
          </div>

          <div className={styles.postList}>
            {posts.length > 0 ? posts.map((post, index) => renderPostItem(post, index)) : renderEmptyState()}
          </div>

          {loading && posts.length > 0 && (
            <div className={styles.loadingMore}>
              <div className={styles.loadingSpinner}></div>
              <span>게시글을 불러오는 중...</span>
            </div>
          )}

          <div className={styles.mobileWriteButtonContainer}>
            <button
              className={`${styles.mobileWriteButton} ${user?.role === "ROLE_ADMIN" ? styles.admin : ""}`}
              onClick={handleCreatePost}
            >
              <PenSquare size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// 전체 라우트 구성 컴포넌트
export default function Community() {
  return (
    <Routes>
      <Route path="/" element={<CommunityContent />} />
      <Route path="/posts/:id/*" element={<PostDetail />} />
      <Route path="/create-post" element={<CreatePost />} />
    </Routes>
  )
}
