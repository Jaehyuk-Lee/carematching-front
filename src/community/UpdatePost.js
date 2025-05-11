import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import axiosInstance from "../api/axiosInstance"
import styles from "./UpdatePost.module.css"
import Swal from "sweetalert2"
import { ArrowLeft, Upload } from "lucide-react"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB in bytes

const truncateFilename = (filename, maxLength = 40) => {
  if (!filename) return ""
  if (filename.length <= maxLength) return filename
  const extension = filename.split(".").pop()
  const nameWithoutExtension = filename.slice(0, filename.lastIndexOf("."))
  const truncatedName = nameWithoutExtension.slice(0, maxLength - 3 - extension.length)
  return `${truncatedName}...${extension}`
}

export default function UpdatePost() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useAuth()
  const [category, setCategory] = useState("자유게시판")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [image, setImage] = useState(null)
  const [currentImage, setCurrentImage] = useState("")
  const [imagePreview, setImagePreview] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axiosInstance.get(`/community/posts/${id}/update`)
        const { category, isAnonymous, title, content, image } = response.data
        setCategory(category)
        setIsAnonymous(isAnonymous)
        setTitle(title)
        setContent(content)
        setCurrentImage(image)
        if (image) {
          setImagePreview(image)
        }
        setIsLoading(false)
      } catch (error) {
        console.error("Failed to fetch post:", error)
        navigate("/community")
      }
    }

    fetchPost()
  }, [id, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const formData = new FormData()

      const postRequest = {
        category,
        isAnonymous,
        title,
        content,
      }

      formData.append("postRequest", new Blob([JSON.stringify(postRequest)], { type: "application/json" }))

      if (image) {
        formData.append("imageFile", image)
      }

      // eslint-disable-next-line no-unused-vars
      const response = await axiosInstance.post(`/community/posts/${id}/update`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      await Swal.fire({
        title: "성공!",
        text: "게시글 수정이 완료되었습니다.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      })
      navigate(`/community/posts/${id}`, { replace: true })
    } catch (error) {
      console.error("Failed to update post:", error)
      Swal.fire({
        title: "오류",
        text: "게시글 수정에 실패했습니다.",
        icon: "error",
        confirmButtonText: "확인",
      })
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        Swal.fire({
          title: "파일 크기 초과",
          text: "최대 10MB 크기의 이미지만 업로드할 수 있습니다.",
          icon: "warning",
          confirmButtonText: "확인",
        })
        e.target.value = null // 파일 선택 초기화
      } else {
        setImage(file)

        // Create image preview
        const reader = new FileReader()
        reader.onloadend = () => {
          setImagePreview(reader.result)
          setCurrentImage("") // Clear the current image reference
        }
        reader.readAsDataURL(file)
      }
    }
  }

  useEffect(() => {
    const handlePopState = () => {
      navigate(`/community/posts/${id}`, { replace: true })
    }

    window.addEventListener("popstate", handlePopState)

    return () => {
      window.removeEventListener("popstate", handlePopState)
    }
  }, [id, navigate])

  const handleCancel = () => {
    navigate(`/community/posts/${id}`, { replace: true })
  }

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>게시글을 불러오는 중입니다...</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={handleCancel}>
          <ArrowLeft size={20} />
          <span>돌아가기</span>
        </button>
        <h1 className={styles.title}>게시글 수정</h1>
      </div>

      <div className={styles.formCard}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formHeader}>
            <div className={styles.formGroup}>
              <label htmlFor="category" className={styles.label}>
                카테고리
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={styles.select}
                disabled={user.role === "ROLE_USER"}
              >
                <option value="자유게시판">자유게시판</option>
                {user.role !== "ROLE_USER" && <option value="요양사게시판">요양사게시판</option>}
              </select>
            </div>
            <div className={styles.formGroup}>
              <span className={styles.label}>익명 여부</span>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className={styles.checkbox}
                />
                <span className={styles.checkboxText}>익명</span>
              </label>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="title" className={styles.label}>
              게시글 제목
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={styles.input}
              placeholder="제목을 입력하세요"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="content" className={styles.label}>
              게시글 내용
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={styles.textarea}
              placeholder="내용을 입력하세요"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>이미지 첨부 (최대 10MB)</label>
            {!imagePreview ? (
              <div className={styles.imageUpload}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                  id="image-upload"
                />
                <label htmlFor="image-upload" className={styles.uploadButton}>
                  <Upload size={16} />
                  이미지 업로드
                </label>
              </div>
            ) : (
              <div className={styles.imagePreviewContainer}>
                <img src={imagePreview || "/placeholder.svg"} alt="Preview" className={styles.imagePreview} />
                <span className={styles.fileName}>
                  {image
                    ? truncateFilename(image.name)
                    : currentImage
                      ? truncateFilename(currentImage.split("/").pop())
                      : ""}
                </span>
              </div>
            )}
          </div>

          <div className={styles.buttonGroup}>
            <button
              type="submit"
              className={`${styles.submitButton} ${user?.role === "ROLE_ADMIN" ? styles.admin : ""}`}
            >
              수정하기
            </button>
            <button type="button" onClick={handleCancel} className={styles.cancelButton}>
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

