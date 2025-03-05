import { useState, useEffect, useRef, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import axiosInstance from "../../api/axiosInstance"
import styles from "./MyPosts.module.css"
import { Eye, Heart, MessageCircle } from "lucide-react"

function MyPosts() {
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState(null)

  // 추가된 참조 변수들
  const observer = useRef()
  const initialLoadDone = useRef(false)
  const isLoadingRef = useRef(false)
  const loadedPages = useRef(new Set()).current

  // 마지막 포스트 요소에 대한 참조 콜백 - Community.js 방식으로 개선
  const lastPostElementRef = useCallback(
    (node) => {
      if (loading || !hasMore || isLoadingRef.current) return

      if (observer.current) observer.current.disconnect()

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !loading && !isLoadingRef.current) {
            setPage((prevPage) => prevPage + 1)
          }
        },
        { threshold: 0.5 },
      )

      if (node) observer.current.observe(node)
    },
    [loading, hasMore],
  )

  // 게시글 데이터 가져오기 - Community.js 방식으로 개선
  const fetchPosts = useCallback(async () => {
    if (loading || !hasMore || isLoadingRef.current) return
    if (page > 0 && loadedPages.has(page)) {
      return
    }

    setLoading(true)
    isLoadingRef.current = true

    try {
      const response = await axiosInstance.get("/api/community/my-posts", {
        params: {
          page: page,
          size: 10,
        },
      })

      const newPosts = response.data.content

      if (newPosts && newPosts.length > 0) {
        setPosts((prevPosts) => {
          if (page === 0) {
            return [...newPosts] // 첫 페이지는 교체
          } else {
            return [...prevPosts, ...newPosts] // 이후 페이지는 추가
          }
        })
        loadedPages.add(page) // 로드된 페이지 추적
      } else {
        // 새 데이터가 없으면 hasMore를 false로 설정
        setHasMore(false)
      }

      // 마지막 페이지인 경우 hasMore를 false로 설정
      setHasMore(!response.data.last)
      setError(null)
    } catch (err) {
      console.error("게시글을 불러오는 중 오류가 발생했습니다:", err)
      setError("게시글을 불러오는 중 오류가 발생했습니다.")
      setHasMore(false) // 에러 발생 시 hasMore를 false로 설정
    } finally {
      setLoading(false)
      isLoadingRef.current = false
    }
  }, [page, loading, hasMore, loadedPages])

  // 초기 로드 또는 게시글이 비어있을 때
  useEffect(() => {
    if (!initialLoadDone.current || (posts.length === 0 && hasMore)) {
      fetchPosts()
      initialLoadDone.current = true
    }
  }, [fetchPosts, hasMore, posts.length])

  // 페이지가 변경될 때 추가 데이터 로드
  useEffect(() => {
    if (initialLoadDone.current && page > 0 && hasMore && !loading && !isLoadingRef.current) {
      fetchPosts()
    }
  }, [page, fetchPosts, hasMore, loading])

  // 컴포넌트가 언마운트될 때 observer 정리
  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect()
      }
    }
  }, [])

  // 게시글 클릭 시 상세 페이지로 이동
  const handlePostClick = (postId) => {
    navigate(`/community/posts/${postId}`)
  }

  return (
    <div className={styles.myPostsPage}>
      <h2>작성글 목록</h2>

      {posts.length === 0 && !loading && !error && <div className={styles.emptyState}>작성한 게시글이 없습니다.</div>}

      {error && <div className={styles.errorMessage}>{error}</div>}

      <div className={styles.postList}>
        {posts.map((post, index) => (
          <div
            key={post.id}
            className={styles.myPostItem}
            ref={index === posts.length - 1 ? lastPostElementRef : null}
            onClick={() => handlePostClick(post.id)}
          >
            <div className={styles.myPostContent}>
              <div className={styles.myPostTextContent}>
                <h3 className={styles.postTitle}>{post.title}</h3>
                <p className={styles.postText}>{post.content}</p>
              </div>
              {post.image && (
                <div className={styles.myPostImageContainer}>
                  <img
                    src={post.image || "/placeholder.svg"}
                    alt="게시물 이미지"
                    className={styles.myPostImage}
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.style.display = "none"
                    }}
                  />
                </div>
              )}
            </div>
            <div className={styles.myPostFooter}>
              <div className={styles.postInfo}>
                <span className={styles.categoryTab}>{post.category || "전체"}</span>
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
                  <MessageCircle size={16} /> {post.commentCount}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {loading && (
        <div className={styles.loadingIndicator}>
          <div className={styles.spinner}></div>
          <p>게시글을 불러오는 중...</p>
        </div>
      )}
    </div>
  )
}

export default MyPosts

