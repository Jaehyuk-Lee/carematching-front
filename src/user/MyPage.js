import { useEffect, useState, useCallback, useRef } from "react"
import { useNavigate, Routes, Route } from "react-router-dom"
import axiosInstance from "../api/axiosInstance"
import { useAuth } from "../context/AuthContext"
import basicProfileImage from "../assets/basicprofileimage.png" // 기본 프로필 이미지
import styles from "./MyPage.module.css"
import CaregiverEdit from "../caregiver/caregiverEdit"
import CaregiverInfo from "../caregiver/caregiverInfo"
import EditProfile from "./myPage/EditProfile"
import MyPosts from "./myPage/MyPosts"
import MyComments from "./myPage/MyComments"
import MyLikes from "./myPage/MyLikes"
import Swal from "sweetalert2"

function MyPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isCaregiverRegistered, setIsCaregiverRegistered] = useState(false)
  const [userInfo, setUserInfo] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)

  const checkCaregiverStatus = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/api/caregivers/check")
      if (response.status === 200) {
        setIsCaregiverRegistered(response.data)
      } else {
        setIsCaregiverRegistered(false)
      }
    } catch (error) {
      console.error("Caregiver 등록 여부 확인 실패:", error)
      setIsCaregiverRegistered(false)
    }
  }, [])

  const fetchUserInfo = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await axiosInstance.get("/api/community/user-info")
      setUserInfo(response.data)
    } catch (error) {
      console.error("사용자 정보 가져오기 실패:", error)
      Swal.fire({
        icon: "error",
        title: "오류",
        text: "사용자 정보를 불러오는데 실패했습니다.",
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user?.username) {
      checkCaregiverStatus()
      fetchUserInfo()
    }
  }, [user?.username, checkCaregiverStatus, fetchUserInfo])

  const handleProfileImageClick = () => {
    fileInputRef.current.click()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // 파일 크기 제한 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: "error",
        title: "파일 크기 초과",
        text: "프로필 이미지는 5MB 이하여야 합니다.",
      })
      return
    }

    // 이미지 파일 타입 확인
    if (!file.type.startsWith("image/")) {
      Swal.fire({
        icon: "error",
        title: "잘못된 파일 형식",
        text: "이미지 파일만 업로드 가능합니다.",
      })
      return
    }

    const formData = new FormData()
    formData.append("imageFile", file)

    try {
      setIsUploading(true)
      await axiosInstance.post("/api/user/update/profile-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      // 프로필 이미지 업데이트 성공 후 사용자 정보 다시 불러오기
      await fetchUserInfo()

      Swal.fire({
        icon: "success",
        title: "성공",
        text: "프로필 이미지가 업데이트되었습니다.",
        timer: 1500,
        showConfirmButton: false,
      })
    } catch (error) {
      console.error("프로필 이미지 업데이트 실패:", error)
      Swal.fire({
        icon: "error",
        title: "오류",
        text: "프로필 이미지 업데이트에 실패했습니다.",
      })
    } finally {
      setIsUploading(false)
      // 파일 입력 초기화
      e.target.value = ""
    }
  }

  async function handleDeleteUser() {
    const result = await Swal.fire({
      title: "정말로 탈퇴하시겠습니까?",
      text: "작성한 게시글과 댓글, 좋아요 등의 모든 데이터가 삭제됩니다.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "네",
      cancelButtonText: "아니요",
    })

    if (result.isConfirmed) {
      try {
        const res = await axiosInstance.post(`/api/user/delete`)
        if (res.status !== 200) {
          throw new Error("회원 탈퇴 실패")
        }

        // 로그아웃 처리 및 로컬 스토리지 클리어
        logout()
        Swal.fire({
          icon: "success",
          title: "탈퇴 완료",
          text: "회원 탈퇴가 완료되었습니다.",
        })
        navigate("/")
      } catch (error) {
        console.error("회원 탈퇴 중 오류 발생:", error)
        Swal.fire({
          icon: "error",
          title: "오류",
          text: "회원 탈퇴 중 오류가 발생했습니다.",
        })
      }
    }
  }

  return (
    <div className={styles.myPageContainer}>
      <div className={styles.profileSection}>
        <div
          className={`${styles.profileImageContainer} ${!isLoading && !isUploading ? styles.profileImageClickable : ""}`}
          onClick={!isLoading && !isUploading ? handleProfileImageClick : undefined}
        >
          {isUploading ? (
            <div className={styles.uploadingOverlay}>
              <div className={styles.spinner}></div>
            </div>
          ) : (
            <>
              <img src={userInfo?.profileImage || basicProfileImage} alt="프로필" className={styles.profileImage} />
              {!isLoading && !isUploading && (
                <div className={styles.editOverlay}>
                  <span>수정</span>
                </div>
              )}
            </>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className={styles.fileInput}
          />
        </div>
        <h2 className={styles.profileName}>{userInfo?.nickname || user?.username || "사용자"}</h2>
        <div className={styles.profileStats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>작성글</span>
            <span className={styles.statValue}>{userInfo?.postCount || 0}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>댓글</span>
            <span className={styles.statValue}>{userInfo?.commentCount || 0}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>좋아요</span>
            <span className={styles.statValue}>{userInfo?.likeCount || 0}</span>
          </div>
        </div>
        {isLoading && <div className={styles.loadingIndicator}>정보를 불러오는 중...</div>}
      </div>
      <div className={styles.contentWrapper}>
        <div className={styles.actionButtons}>
          <button className={`${styles.actionButton} ${styles.gray}`} onClick={() => navigate("/myPage/my-posts")}>
            작성글
          </button>
          <button className={`${styles.actionButton} ${styles.gray}`} onClick={() => navigate("/myPage/my-comments")}>
            댓글
          </button>
          <button className={`${styles.actionButton} ${styles.gray}`} onClick={() => navigate("/myPage/my-likes")}>
            좋아요
          </button>
          <button
            className={`${styles.actionButton} ${styles.orange}`}
            onClick={() => navigate("/myPage/edit-profile")}
          >
            내 정보 수정
          </button>
          {isCaregiverRegistered ? (
            <button
              className={`${styles.actionButton} ${styles.orange}`}
              onClick={() => navigate("/mypage/caregiver-info")}
            >
              요양사 정보 보기
            </button>
          ) : (
            <button
              className={`${styles.actionButton} ${styles.orange}`}
              onClick={() => navigate("/mypage/edit-caregiver")}
            >
              요양사 등록
            </button>
          )}
          <button className={`${styles.actionButton} ${styles.gray} ${styles.deleteUser}`} onClick={handleDeleteUser}>
            회원 탈퇴
          </button>
        </div>
        <div className={styles.contentSection}>
          <Routes>
            <Route path="edit-profile" element={<EditProfile />} />
            <Route path="my-posts" element={<MyPosts />} />
            <Route path="my-comments" element={<MyComments />} />
            <Route path="my-likes" element={<MyLikes />} />
            <Route path="edit-caregiver" element={<CaregiverEdit isRegistered={isCaregiverRegistered} />} />
            <Route path="caregiver-info" element={<CaregiverInfo />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default MyPage

