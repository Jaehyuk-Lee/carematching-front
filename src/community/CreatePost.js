import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import axiosInstance from "../api/axiosInstance"
import styles from "./CreatePost.module.css"
import Swal from "sweetalert2"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB in bytes

export default function CreatePost() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [category, setCategory] = useState("자유게시판")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [image, setImage] = useState(null)

  useEffect(() => {
    const handlePopState = () => {
      navigate("/community", { replace: true })
    }

    window.addEventListener("popstate", handlePopState)

    return () => {
      window.removeEventListener("popstate", handlePopState)
    }
  }, [navigate])

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
      const response = await axiosInstance.post("/api/community/add", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      await Swal.fire({
        title: "성공!",
        text: "게시글이 등록되었습니다.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      })
      navigate("/community", { replace: true })
    } catch (error) {
      console.error("Failed to create post:", error)
      Swal.fire({
        title: "오류",
        text: "게시글 등록에 실패했습니다.",
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
      }
    }
  }

  const handleCancel = () => {
    navigate("/community", { replace: true })
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>게시글 작성</h1>
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
              {user.role !== "ROLE_USER" && <option value="요양사">요양사</option>}
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
            placeholder="제목 작성"
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
            placeholder="내용 작성"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>이미지 (최대 10MB)</label>
          <div className={styles.imageUpload}>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: "none" }}
              id="image-upload"
            />
            <label htmlFor="image-upload" className={styles.uploadButton}>
              업로드
            </label>
            {image && <span className={styles.fileName}>{image.name}</span>}
          </div>
        </div>

        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.submitButton}>
            게시
          </button>
          <button type="button" onClick={handleCancel} className={styles.cancelButton}>
            취소
          </button>
        </div>
      </form>
    </div>
  )
}