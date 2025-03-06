import { useState, useEffect, useRef, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import axiosInstance from "../../api/axiosInstance"
import styles from "./MyComments.module.css"

function MyComments() {
  const navigate = useNavigate()
  const [comments, setComments] = useState([])
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState(null)

  // 추가된 참조 변수들
  const observer = useRef()
  const initialLoadDone = useRef(false)
  const isLoadingRef = useRef(false)
  const loadedPages = useRef(new Set()).current

  // 마지막 댓글 요소에 대한 참조 콜백
  const lastCommentElementRef = useCallback(
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

  // 댓글 데이터 가져오기
  const fetchComments = useCallback(async () => {
    if (loading || !hasMore || isLoadingRef.current) return
    if (page > 0 && loadedPages.has(page)) {
      return
    }

    setLoading(true)
    isLoadingRef.current = true

    try {
      const response = await axiosInstance.get("/api/community/my-comments", {
        params: {
          page: page,
          size: 10,
        },
      })

      const newComments = response.data.content

      if (newComments && newComments.length > 0) {
        setComments((prevComments) => {
          if (page === 0) {
            return [...newComments] // 첫 페이지는 교체
          } else {
            return [...prevComments, ...newComments] // 이후 페이지는 추가
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
      console.error("댓글을 불러오는 중 오류가 발생했습니다:", err)
      setError("댓글을 불러오는 중 오류가 발생했습니다.")
      setHasMore(false) // 에러 발생 시 hasMore를 false로 설정
    } finally {
      setLoading(false)
      isLoadingRef.current = false
    }
  }, [page, loading, hasMore, loadedPages])

  // 초기 로드 또는 댓글이 비어있을 때
  useEffect(() => {
    if (!initialLoadDone.current || (comments.length === 0 && hasMore)) {
      fetchComments()
      initialLoadDone.current = true
    }
  }, [fetchComments, hasMore, comments.length])

  // 페이지가 변경될 때 추가 데이터 로드
  useEffect(() => {
    if (initialLoadDone.current && page > 0 && hasMore && !loading && !isLoadingRef.current) {
      fetchComments()
    }
  }, [page, fetchComments, hasMore, loading])

  // 컴포넌트가 언마운트될 때 observer 정리
  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect()
      }
    }
  }, [])

  // 댓글 클릭 시 해당 게시글로 이동
  const handleCommentClick = (postId) => {
    navigate(`/community/posts/${postId}`)
  }

  return (
    <div className={styles.myCommentsPage}>
      <h2>댓글 목록</h2>

      {comments.length === 0 && !loading && !error && <div className={styles.emptyState}>작성한 댓글이 없습니다.</div>}

      {error && <div className={styles.errorMessage}>{error}</div>}

      <div className={styles.commentList}>
        {comments.map((comment, index) => (
          <div
            key={`${comment.postId}-${index}`}
            className={styles.commentItem}
            ref={index === comments.length - 1 ? lastCommentElementRef : null}
            onClick={() => handleCommentClick(comment.postId)}
          >
            <div className={styles.commentContent}>
              <p className={styles.commentText}>{comment.content}</p>
            </div>
            <span className={styles.commentTime}>{comment.relativeTime}</span>
          </div>
        ))}
      </div>

      {loading && (
        <div className={styles.loadingIndicator}>
          <div className={styles.spinner}></div>
          <p>댓글을 불러오는 중...</p>
        </div>
      )}
    </div>
  )
}

export default MyComments

