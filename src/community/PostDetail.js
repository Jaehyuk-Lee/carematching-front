import { useState, useEffect, useCallback, useRef } from "react"
import { useNavigate, useParams, Routes, Route } from "react-router-dom"
import { ArrowLeft, Heart, MessageCircle, Eye, Trash2 } from "lucide-react"
import styles from "./PostDetail.module.css"
import axiosInstance from "../api/axiosInstance"
import UpdatePost from "./UpdatePost"
import Swal from 'sweetalert2'

// 게시글 상세 컴포넌트
function PostDetailContent() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [comment, setComment] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [comments, setComments] = useState([])
  const [commentsPage, setCommentsPage] = useState(0)
  const [hasMoreComments, setHasMoreComments] = useState(true)
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const observer = useRef()
  const lastCommentElementRef = useCallback(
    (node) => {
      if (isLoadingComments) return
      if (observer.current) observer.current.disconnect()
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMoreComments) {
          setCommentsPage((prevPage) => prevPage + 1)
        }
      })
      if (node) observer.current.observe(node)
    },
    [isLoadingComments, hasMoreComments],
  )

  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString)
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")
    return `${month}/${day} ${hours}:${minutes}`
  }, [])

  const fetchComments = useCallback(async () => {
    if (!id || isLoadingComments || !hasMoreComments) return
    setIsLoadingComments(true)
    try {
      const response = await axiosInstance.get(`/api/community/comments`, {
        params: { postId: id, page: commentsPage, size: 10 },
      })
      const newComments = response.data.content.map((comment) => ({
        ...comment,
        createdAt: formatDate(comment.createdAt),
      }))
      setComments((prevComments) => {
        const updatedComments = [...prevComments]
        newComments.forEach((newComment) => {
          if (!updatedComments.some((comment) => comment.id === newComment.id)) {
            updatedComments.push(newComment)
          }
        })
        return updatedComments
      })
      setHasMoreComments(!response.data.last)
      setCommentsPage((prevPage) => prevPage + 1)
    } catch (error) {
      console.error("Failed to fetch comments:", error)
    } finally {
      setIsLoadingComments(false)
    }
  }, [id, commentsPage, formatDate, isLoadingComments, hasMoreComments])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) {
        setError("게시글 ID가 올바르지 않습니다.")
        setIsLoading(false)
        return
      }
      setIsLoading(true)
      setError(null)
      try {
        const response = await axiosInstance.get(`/api/community/posts/${id}`)
        const postData = response.data

        if (!postData) {
          throw new Error("서버에서 데이터를 받지 못했습니다.")
        }
        if (postData.id === undefined && postData.postId !== undefined) {
          postData.id = postData.postId
        }
        if (postData.id === undefined || postData.id === null) {
          console.error("Post ID is missing or null:", postData)
          throw new Error("게시글 ID가 없거나 유효하지 않습니다.")
        }
        if (!postData.title) {
          throw new Error("게시글 제목이 없습니다.")
        }
        if (!postData.content) {
          throw new Error("게시글 내용이 없습니다.")
        }

        setPost({
          ...postData,
          id: postData.id,
          createdAt: postData.createdAt ? formatDate(postData.createdAt) : "날짜 정보 없음",
        })
        setIsLiked(postData.liked || false)
      } catch (error) {
        console.error("Failed to fetch post:", error)
        setError(error.message || "게시글을 불러오는 데 실패했습니다. 다시 시도해 주세요.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPost()
  }, [id, formatDate])

  useEffect(() => {
    if (post) {
      fetchComments()
    }
  }, [post, fetchComments])

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (!comment.trim()) {
      await Swal.fire({
        title: '입력 오류',
        text: '댓글 내용을 입력해주세요.',
        icon: 'warning',
        confirmButtonText: '확인'
      })
      return
    }
    try {
      const response = await axiosInstance.post("/api/community/comment/add", {
        postId: post.id,
        content: comment,
        anonymous: isAnonymous,
      })
      const newComment = {
        ...response.data,
        createdAt: formatDate(response.data.createdAt),
      }
      setComments((prevComments) => [newComment, ...prevComments])
      setComment("")
      setIsAnonymous(false)
      await Swal.fire({
        title: '성공!',
        text: '댓글이 등록되었습니다.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      })
    } catch (error) {
      console.error("Failed to submit comment:", error)
      await Swal.fire({
        title: '오류',
        text: '댓글 등록에 실패했습니다. 다시 시도해 주세요.',
        icon: 'error',
        confirmButtonText: '확인'
      })
    }
  }

  const handleDeleteComment = async (commentId) => {
    const result = await Swal.fire({
      title: '댓글 삭제',
      text: '정말로 이 댓글을 삭제하시겠습니까?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '삭제',
      cancelButtonText: '취소'
    })

    if (result.isConfirmed) {
      try {
        await axiosInstance.post(`/api/community/comment/delete?commentId=${commentId}`)
        setComments((prevComments) => prevComments.filter((comment) => comment.id !== commentId))
        await Swal.fire({
          title: '성공!',
          text: '댓글이 삭제되었습니다.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        })
      } catch (error) {
        console.error("Failed to delete comment:", error)
        await Swal.fire({
          title: '오류',
          text: '댓글 삭제에 실패했습니다. 다시 시도해 주세요.',
          icon: 'error',
          confirmButtonText: '확인'
        })
      }
    }
  }

  const handleLike = async () => {
    if (!post || !post.id) {
      console.error("Post ID is missing")
      await Swal.fire({
        title: '오류',
        text: '게시글 정보가 올바르지 않습니다. 페이지를 새로고침 해주세요.',
        icon: 'error',
        confirmButtonText: '확인'
      })
      return
    }

    try {
      const requestData = {
        postId: post.id,
        liked: isLiked,
      }

      const response = await axiosInstance.post("/api/community/like", requestData)
      const { data } = response

      let success = false
      let newLikeCount = post.likeCount
      let serverMessage = ""

      if (typeof data === "string") {
        success = data === "좋아요 상태가 업데이트되었습니다."
        serverMessage = success ? "좋아요 처리가 완료되었습니다." : "좋아요 처리에 실패했습니다."
        newLikeCount = isLiked ? post.likeCount - 1 : post.likeCount + 1
      } else if (typeof data === "object") {
        success = data.success === true
        newLikeCount = data.likeCount !== undefined ? data.likeCount : isLiked ? post.likeCount - 1 : post.likeCount + 1
        serverMessage = data.message || (success ? "좋아요 처리가 완료되었습니다." : "좋아요 처리에 실패했습니다.")
      }

      if (success) {
        const newLikedState = !isLiked
        setIsLiked(newLikedState)
        setPost((prevPost) => ({
          ...prevPost,
          likeCount: newLikeCount,
        }))
        await Swal.fire({
          title: '성공!',
          text: newLikedState ? '좋아요가 완료되었습니다.' : '좋아요가 취소되었습니다.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        })
      } else {
        console.error("Server indicated failure:", data)
        await Swal.fire({
          title: '오류',
          text: serverMessage,
          icon: 'error',
          confirmButtonText: '확인'
        })
      }
    } catch (error) {
      console.error("Failed to like post:", error)
      await Swal.fire({
        title: '오류',
        text: '좋아요 처리 중 오류가 발생했습니다. 다시 시도해 주세요.',
        icon: 'error',
        confirmButtonText: '확인'
      })
    }
  }

  const handleEdit = () => {
    navigate(`/community/posts/${id}/update`)
  }

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: '게시글 삭제',
      text: '정말로 이 게시글을 삭제하시겠습니까?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '삭제',
      cancelButtonText: '취소'
    })

    if (result.isConfirmed) {
      try {
        await axiosInstance.post(`/api/community/posts/${id}/delete`)
        await Swal.fire({
          title: '성공!',
          text: '게시글이 삭제되었습니다.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        })
        navigate("/community")
      } catch (error) {
        console.error("Failed to delete post:", error)
        await Swal.fire({
          title: '오류',
          text: '게시글 삭제에 실패했습니다. 다시 시도해 주세요.',
          icon: 'error',
          confirmButtonText: '확인'
        })
      }
    }
  }

  if (isLoading) return <div className={styles.loading}>게시글을 불러오는 중입니다...</div>
  if (error) return <div className={styles.error}>{error}</div>
  if (!post) return <div className={styles.error}>게시글을 찾을 수 없습니다.</div>

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          <ArrowLeft size={24} />
          <span>목록</span>
        </button>
      </header>

      <article className={styles.article}>
        <div className={styles.authorInfo}>
          <div className={styles.authorProfile}>
            <img src={post.profileImage || "/placeholder.svg"} alt="" className={styles.authorImage} />
            <div className={styles.authorMeta}>
              <span className={styles.authorName}>{post.nickname || "익명"}</span>
              <span className={styles.authorRole}>{post.role || "역할 없음"}</span>
            </div>
          </div>
          <div className={styles.postMeta}>
            {post.author && (
              <div className={styles.actionButtons}>
                <button className={styles.editButton} onClick={handleEdit}>
                  수정
                </button>
                <button className={styles.deleteButton} onClick={handleDelete}>
                  삭제
                </button>
              </div>
            )}
          </div>
        </div>
        <div className={styles.divider}></div>
        <div className={styles.categoryDateWrapper}>
          <div className={styles.category}>{post.category || "카테고리 없음"}</div>
          <span className={styles.uploadDate}>{post.createdAt}</span>
        </div>
        <h1 className={styles.postTitle}>{post.title}</h1>
        <div className={styles.postContent}>
          <p className={styles.postText}>{post.content}</p>
          {post.image && (
            <div className={styles.postImage}>
              <img src={post.image || "/placeholder.svg"} alt="게시글 이미지" />
            </div>
          )}
        </div>

        <div className={styles.postStats}>
          <button className={`${styles.likeButton} ${isLiked ? styles.liked : ""}`} onClick={handleLike}>
            <Heart className={styles.icon} size={24} fill={isLiked ? "currentColor" : "none"} />
            <span>좋아요</span>
          </button>
          <div className={styles.statsInfo}>
            <span className={styles.statItem}>
              <Eye className={styles.icon} />
              {post.viewCount || 0}
            </span>
            <span className={styles.statItem}>
              <Heart className={styles.icon} />
              {post.likeCount || 0}
            </span>
            <span className={styles.statItem}>
              <MessageCircle className={styles.icon} />
              {comments.length}
            </span>
          </div>
        </div>
      </article>

      <section className={styles.comments}>
        <h2 className={styles.commentSectionTitle}>댓글 입력</h2>
        <form onSubmit={handleSubmitComment} className={styles.commentForm}>
          <label className={styles.anonymousCheck}>
            <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} />
            <span>익명</span>
          </label>
          <input
            type="text"
            placeholder="댓글을 입력해 주세요."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className={styles.commentInput}
          />
          <button type="submit" className={styles.commentSubmit}>
            등록
          </button>
        </form>

        <div className={styles.commentList}>
          {comments.map((comment, index) => (
            <div
              key={comment.id}
              className={styles.commentItem}
              ref={index === comments.length - 1 ? lastCommentElementRef : null}
            >
              <div className={styles.commentHeader}>
                <div className={styles.commentAuthor}>
                  <img src={comment.profileImage || "/placeholder.svg"} alt="" className={styles.commentAuthorImage} />
                  <div className={styles.commentAuthorInfo}>
                    <span className={styles.commentAuthorName}>{comment.nickname || "익명"}</span>
                    <span className={styles.commentAuthorRole}>{comment.role || "역할 없음"}</span>
                  </div>
                </div>
                {comment.author && (
                  <button className={styles.deleteCommentButton} onClick={() => handleDeleteComment(comment.id)}>
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <div className={styles.commentContent}>
                <p className={styles.commentText}>{comment.content}</p>
                <span className={styles.commentTime}>{comment.createdAt}</span>
              </div>
            </div>
          ))}
          {isLoadingComments && <div className={styles.loading}>댓글을 불러오는 중...</div>}
        </div>
      </section>
    </div>
  )
}

// 전체 라우트 구성
export default function PostDetail() {
  return (
    <Routes>
      <Route path="/" element={<PostDetailContent />} />
      <Route path="/update" element={<UpdatePost />} />
    </Routes>
  )
}

