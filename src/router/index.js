import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../user/Login';
import Signup from '../user/Signup';
import MyPage from '../user/MyPage';
import CaregiverListPage from '../caregiver/caregiverList';
import CaregiverDetailPage from '../caregiver/caregiverDetail';
import Checkout from '../payment/Checkout';
import Success from '../payment/Success';
import Fail from '../payment/Fail';
import Cert from '../admin/Cert';
import Community from '../community/Community';
import CreatePost from '../community/CreatePost';
import PostDetail from '../community/PostDetail';
import UpdatePost from '../community/UpdatePost';
import CreateRoomPage from '../chat/CreateRoomPage';
import NotFound from '../components/NotFound';
/**
 * 애플리케이션의 모든 라우트를 정의하는 컴포넌트
 * @returns {JSX.Element} 라우팅 구성이 포함된 Routes 컴포넌트
 */
function AppRouter() {
  return (
    <Routes>
      {/* 메인 페이지 */}
      <Route path="/" element={<Home />} />

      {/* 인증 */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* 사용자 */}
      <Route path="/mypage/*" element={<MyPage />} />

      {/* 케어기버 */}
      <Route path="/caregiver" element={<CaregiverListPage />} />
      <Route path="/caregiver/:id" element={<CaregiverDetailPage />} />

      {/* 결제 */}
      <Route path="/payment" element={<Checkout />} />
      <Route path="/payment/success" element={<Success />} />
      <Route path="/payment/fail" element={<Fail />} />

      {/* 관리자 */}
      <Route path="/admin/cert" element={<Cert />} />

      {/* 커뮤니티 */}
      <Route path="/community/*" element={<Community />} />
      <Route path="/create-post" element={<CreatePost />} />
      <Route path="/community/posts/:id" element={<PostDetail />} />
      <Route path="/community/posts/:id/update" element={<UpdatePost />} />

      {/* 채팅 */}
      <Route path="/create-room" element={<CreateRoomPage />} />

      {/* 404 - 찾을 수 없는 페이지 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRouter;
