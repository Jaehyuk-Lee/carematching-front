import { useEffect, useRef } from "react";
import { Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext";

const NotificationListener = () => {
  const { user } = useAuth(); // ✅ AuthContext에서 user 정보 가져오기
  const stompClientRef = useRef(null);

  useEffect(() => {
    if (!user || !user.username) {
      console.log("로그인 안 됨 → WebSocket 연결 안 함");
      return;
    }

    console.log("🔗 [INFO] WebSocket 연결 시도...");

    // ✅ WebSocket 연결
    const socket = new SockJS("http://localhost:8080/ws");
    const stompClient = Stomp.over(socket);
    stompClientRef.current = stompClient;

    stompClient.connect(
      {},
      (frame) => {
        console.log("✅ [INFO] WebSocket 연결 성공:", frame);

        // ✅ 사용자 username 기반 알림 채널 구독
        stompClient.subscribe(`/queue/notifications/${user.username}`, (message) => {
          console.log("📩 [알림 수신]:", message.body);

          // ✅ SweetAlert2 알림 + 알림 닫히면 페이지 새로고침
          Swal.fire({
            icon: "info",
            title: "새 알림 도착!",
            text: message.body,
            timer: 3000,
            showConfirmButton: false,
            willClose: () => {
              console.log("🔄 [INFO] 페이지 새로고침 실행");
              window.location.reload(); // ✅ 전체 페이지 새로고침
            }
          });
        });
      },
      (error) => {
        console.error("❌ [ERROR] WebSocket 연결 실패:", error);
      }
    );

    // ✅ 컴포넌트 언마운트 시 WebSocket 연결 해제
    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.disconnect();
        console.log("🔌 [INFO] WebSocket 연결 해제됨");
      }
    };
  }, [user]);

  return null;
};

export default NotificationListener;
