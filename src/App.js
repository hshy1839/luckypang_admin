import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Main from './components/Main';
import Loading from './components/Loading';
import Order from './components/Order';
import Users from './components/UserManagement/Users';
import UsersDetail from './components/UserManagement/UsersDetail';
import Notice from './components/NoticeManagement/Notice';
import Login from './components/Login';
import NoticeCreate from './components/NoticeManagement/NoticeCreate';
import NoticeDetail from './components/NoticeManagement/NoticeDetail';
import NoticeUpdate from './components/NoticeManagement/NoticeUpdate';
import Product from './components/ProductManagement/Product';
import { jwtDecode } from 'jwt-decode';
import ProductCreate from './components/ProductManagement/ProductCreate';
import ProductDetail from './components/ProductManagement/ProductDetail';
import ProductUpdate from './components/ProductManagement/ProductUpdate';
import Qna from './components/QnA/Qna';
import QnaDetail from './components/QnA/QnaDetail';
import Setting from './components/Setting';
import Coupon from './components/CouponManagement/Coupon';
import CouponCreate from './components/CouponManagement/CouponCreate';
import Promotion from './components/PromotionManagement/Promotion';
import PromotionUpdate from './components/PromotionManagement/PromotionUpdate';
import PromotionCreate from './components/PromotionManagement/PromotionCreate';
import HeaderPhone from './components/HeaderPhone';
import PromotionDetail from './components/PromotionManagement/PromotionDetail';
import Box from './components/BoxManagement/Box';
import BoxCreate from './components/BoxManagement/BoxCreate';
import BoxDetail from './components/BoxManagement/BoxDetail';
import BoxUpdate from './components/BoxManagement/BoxUpdate';
import Points from './components/PointManagement/Points';
import BoxOrder from './components/BoxOrderManagement/BoxOrder';
import BoxOrderDetail from './components/BoxOrderManagement/BoxOrderDetail';
import Event from './components/EventManagement/Event';
import EventCreate from './components/EventManagement/EventCreate';
import EventDetail from './components/EventManagement/EventDetail';
import EventUpdate from './components/EventManagement/EventUpdate';
import Unboxing from './components/UnboxingManagement/Unboxing';
import Withdrawal from './components/TermsManagement/WithdrawalTerms/Withdrawal';
import WithdrawalEdit from './components/TermsManagement/WithdrawalTerms/WithdrawalEdit';
import ServiceTerm from './components/TermsManagement/ServiceTerms/ServiceTerm';
import ServiceTermEdit from './components/TermsManagement/ServiceTerms/ServiceTermEdit';
import PrivacyTerm from './components/TermsManagement/PrivacyTerms/PrivacyTerm';
import PrivacyTermEdit from './components/TermsManagement/PrivacyTerms/PrivacyTermEdit';
import PurchaseTerm from './components/TermsManagement/PurchaseTerms/PurchaseTerm';
import PurchaseTermEdit from './components/TermsManagement/PurchaseTerms/PurchaseTermEdit';
import RefundTerm from './components/TermsManagement/RefundTerms/RefundTerm';
import RefundTermEdit from './components/TermsManagement/RefundTerms/RefundTermEdit';

function App() {
  const [loading, setLoading] = useState(true); // 초기 로딩 상태를 true로 설정
  const location = useLocation(); // URL 추적

  useEffect(() => {
    const handleLoad = () => {
      setLoading(false); // 로딩 완료
    };
  
    setLoading(true); // 로딩 시작
  
    if (document.readyState === 'complete') {
      handleLoad(); // 이미 로드된 경우 바로 종료
    } else {
      window.addEventListener('load', handleLoad);
    }
  
    return () => {
      window.removeEventListener('load', handleLoad);
    };
  }, [location]);
  

  return (
    <div className="App">
      {loading ? (
        <Loading /> // 로딩 중일 때 로딩 페이지 표시
      ) : (
        <Routes>
          <Route path="/" element={<PrivateRoute><Header /><Main /></PrivateRoute>} />
          <Route path="/headerphone" element={<PrivateRoute><HeaderPhone /></PrivateRoute>} />
         {/* 유저관리 */}
          <Route path="/users" element={<PrivateRoute><Users /></PrivateRoute>} />
          <Route path="/users/usersDetail/:id" element={<PrivateRoute><UsersDetail /></PrivateRoute>} />
        {/* 공지관리 */}
          <Route path="/notice" element={<PrivateRoute><Header /><Notice /></PrivateRoute>} />
          <Route path="/notice/noticeCreate" element={<PrivateRoute><Header /><NoticeCreate /></PrivateRoute>} />
          <Route path="/notice/noticeDetail/:id" element={<PrivateRoute><NoticeDetail /></PrivateRoute>} />
          <Route path="/notice/noticeUpdate/:id" element={<PrivateRoute><NoticeUpdate /></PrivateRoute>} />
       {/*이벤트 관리 */}
       <Route path="/event" element={<PrivateRoute><Header /><Event /></PrivateRoute>} />
          <Route path="/event/eventCreate" element={<PrivateRoute><Header /><EventCreate /></PrivateRoute>} />
          <Route path="/event/eventDetail/:id" element={<PrivateRoute><EventDetail /></PrivateRoute>} />
          <Route path="/event/eventUpdate/:id" element={<PrivateRoute><EventUpdate /></PrivateRoute>} />



          <Route path="/login" element={<Login />} />
       {/* 상품관리 */}
          <Route path="/products" element={<PrivateRoute><Header /><Product /></PrivateRoute>} />
          <Route path="/products/productCreate" element={<PrivateRoute><Header /><ProductCreate /></PrivateRoute>} />
          <Route path="/products/productDetail/:id" element={<PrivateRoute><Header /><ProductDetail /></PrivateRoute>} />
          <Route path="/products/productDetail/:id/update" element={<PrivateRoute><Header /><ProductUpdate /></PrivateRoute>} />
          {/* <Route path="/order" element={<PrivateRoute><Header /><Order /></PrivateRoute>} /> */}
          <Route path="/QnA/qna" element={<PrivateRoute><Header /><Qna /></PrivateRoute>} />
          <Route path="/setting" element={<PrivateRoute><Header /><Setting /></PrivateRoute>} />
          <Route path="/QnA/qna/qnaDetail/:id" element={<PrivateRoute><Header /><QnaDetail/></PrivateRoute>} />
          <Route path="/coupon" element={<PrivateRoute><Header /><Coupon/></PrivateRoute>} />
          <Route path="/coupon/create" element={<PrivateRoute><Header /><CouponCreate/></PrivateRoute>} />
          {/* 광고 */}
          <Route path="/promotion" element={<PrivateRoute><Header /><Promotion/></PrivateRoute>} />
          <Route path="/promotion/create" element={<PrivateRoute><Header /><PromotionCreate/></PrivateRoute>} />
          <Route path="/promotion/promotionDetail/:id" element={<PrivateRoute><Header /><PromotionDetail /></PrivateRoute>} />
          <Route path="/promotion/promotionDetail/:id/update" element={<PrivateRoute><Header /><PromotionUpdate /></PrivateRoute>} />
          {/* 박스 */}
          <Route path="/box" element={<PrivateRoute><Header /><Box /></PrivateRoute>} />
          <Route path="/box/create" element={<PrivateRoute><Header /><BoxCreate /></PrivateRoute>} />
          <Route path="/box/boxDetail/:id" element={<PrivateRoute><Header /><BoxDetail /></PrivateRoute>} />
          <Route path="/box/boxUpdate/:id" element={<PrivateRoute><Header /><BoxUpdate /></PrivateRoute>} />
          {/* 포인트 관리 */}
          <Route path="/points" element={<PrivateRoute><Header /><Points /></PrivateRoute>} />
          {/* 박스 주문 내역 */}
          <Route path="/boxorder" element={<PrivateRoute><Header /><BoxOrder /></PrivateRoute>} />
          <Route path="/boxorder/detail/:id" element={<PrivateRoute><Header /><BoxOrderDetail /></PrivateRoute>} />
          {/*언박싱 내역 */}
          <Route path="/unboxing" element={<PrivateRoute><Header /><Unboxing /></PrivateRoute>} />
          {/* 약관 */}
          <Route path="/terms/withdrawal" element={<PrivateRoute><Header /><Withdrawal /></PrivateRoute>} />
          <Route path="/terms/withdrawal/edit" element={<PrivateRoute><Header /><WithdrawalEdit /></PrivateRoute>} />
          <Route path="/terms/serviceTerm" element={<PrivateRoute><Header /><ServiceTerm /></PrivateRoute>} />
          <Route path="/terms/serviceTerm/edit" element={<PrivateRoute><Header /><ServiceTermEdit /></PrivateRoute>} />
          <Route path="/terms/privacyTerm" element={<PrivateRoute><Header /><PrivacyTerm /></PrivateRoute>} />
          <Route path="/terms/privacyTerm/edit" element={<PrivateRoute><Header /><PrivacyTermEdit /></PrivateRoute>} />
          <Route path="/terms/purchaseTerm" element={<PrivateRoute><Header /><PurchaseTerm /></PrivateRoute>} />
          <Route path="/terms/purchaseTerm/edit" element={<PrivateRoute><Header /><PurchaseTermEdit /></PrivateRoute>} />
          <Route path="/terms/refundTerm" element={<PrivateRoute><Header /><RefundTerm /></PrivateRoute>} />
          <Route path="/terms/refundTerm/edit" element={<PrivateRoute><Header /><RefundTermEdit /></PrivateRoute>} />
        </Routes>
      )}
    </div>
  );
}

function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

// PrivateRoute: 로그인 여부와 토큰 유효성 체크
const PrivateRoute = ({ children }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token'); // 로컬스토리지에서 토큰 가져오기

  useEffect(() => {
    if (!token) {
      navigate('/login'); // 토큰이 없으면 로그인 페이지로 리디렉션
      return;
    }

    try {
      const decodedToken = jwtDecode(token); // jwtDecode 함수로 토큰을 디코딩합니다.
      const currentTime = Date.now() / 1000; // 현재 시간 (초 단위)

      if (decodedToken.exp < currentTime) {
        // 토큰 만료 시간 비교
        localStorage.removeItem('token'); // 만료된 토큰 제거
        navigate('/login'); // 로그인 페이지로 리디렉션
      }
    } catch (error) {
      console.error('토큰 디코딩 오류:', error);
      localStorage.removeItem('token');
      navigate('/login'); // 오류 발생 시 로그인 페이지로 리디렉션
    }
  }, [token, navigate]);

  return children;
};

export default AppWrapper;