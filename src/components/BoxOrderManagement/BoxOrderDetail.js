// BoxOrderDetail.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../Header';
import '../../css/BoxOrderManagement/BoxOrderDetail.css';

const BoxOrderDetail = () => {
  const [order, setOrder] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const [trackingNumber, setTrackingNumber] = useState(order?.trackingNumber || '');
  const [trackingCompany, setTrackingCompany] = useState(order?.trackingCompany || '');

  useEffect(() => {
    if (order?.trackingNumber) {
      setTrackingNumber(order.trackingNumber);
    }
  }, [order]);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`https://luckytang-server.onrender.com/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          setOrder(res.data.order);
        }
      } catch (err) {
        console.error('주문 상세 정보 로딩 실패:', err);
      }
    };

    fetchOrderDetail();
  }, [id]);

  if (!order) return <div>로딩 중...</div>;

  const handleSaveTracking = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.patch(
        `https://luckytang-server.onrender.com/api/order/${id}/tracking`,
        { trackingNumber, trackingCompany },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      if (res.data.success) {
        alert('운송장 정보가 저장되었습니다.');
        window.location.reload();
      } else {
        alert(res.data.message || '저장 실패');
      }
    } catch (err) {
      console.error('운송장 저장 오류:', err);
      alert('운송장 저장 중 오류 발생');
    }
  };

  return (
    <div className="box-order-detail-container">
      <Header />
      <h2>주문 상세 정보</h2>

      <table className="box-order-detail-table">
        <tbody>
          <tr><th>주문번호</th><td>{order._id}</td></tr>
          <tr><th>유저</th><td>{order.user?.nickname}</td></tr>
          <tr><th>결제 수단</th><td>{order.paymentType}</td></tr>
          <tr><th>포인트 사용</th><td>{order.pointUsed} P</td></tr>
          <tr><th>결제 금액</th><td>{order.paymentAmount} 원</td></tr>
          <tr><th>총 결제</th><td>{order.paymentAmount + (order.pointUsed || 0)} 원</td></tr>
          <tr><th>박스 수량</th><td>{order.boxCount}</td></tr>
          <tr><th>상태</th><td>{order.status}</td></tr>
          <tr><th>주문일</th><td>{new Date(order.createdAt).toLocaleString()}</td></tr>
          <tr><th>박스명</th><td>{order.box?.name}</td></tr>
          <tr><th>박스 타입</th><td>{order.box?.type}</td></tr>
          <tr><th>공개 여부</th><td>{order.box?.isPublic ? '공개' : '비공개'}</td></tr>
          <tr><th>가격</th><td>{order.box?.price?.toLocaleString()} 원</td></tr>
          <tr><th>박스 기간</th><td>{new Date(order.box?.availableFrom).toLocaleDateString()} ~ {new Date(order.box?.availableUntil).toLocaleDateString()}</td></tr>
          <tr><th>박스 설명</th><td>{order.box?.description}</td></tr>
          {order.status === 'shipped' && (
  <>
    <tr>
      <th>택배사</th>
      <td>
        <input
          type="text"
          value={trackingCompany}
          onChange={(e) => setTrackingCompany(e.target.value)}
          placeholder="예: CJ대한통운"
          style={{ width: '200px', marginRight: '12px' }}
        />
      </td>
    </tr>
    <tr>
      <th>운송장 번호</th>
      <td>
        <input
          type="text"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          placeholder="운송장 번호 입력"
          style={{ width: '200px', marginRight: '12px' }}
        />
        <button onClick={handleSaveTracking}>확인</button>
      </td>
    </tr>
  </>
)}

        </tbody>
      </table>

      <div className="box-order-detail-actions">
        <button onClick={() => navigate('/boxorder')}>목록으로</button>
      </div>
    </div>
  );
};

export default BoxOrderDetail;