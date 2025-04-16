import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../Header';
import '../../css/UserManagement/UserDetail.css';

const UsersDetail = () => {
  const [user, setUser] = useState(null);
  const [points, setPoints] = useState([]);
  const [pointForm, setPointForm] = useState({
    type: '추가',
    amount: '',
    description: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 5;

const indexOfLast = currentPage * itemsPerPage;
const indexOfFirst = indexOfLast - itemsPerPage;
const currentPoints = points.slice(indexOfFirst, indexOfLast);
const totalPages = Math.ceil(points.length / itemsPerPage);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetail = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get(`http://localhost:7778/api/users/userinfo/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data?.success) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.error('사용자 정보 로드 실패:', error);
      }
    };

    const fetchUserPoints = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get(`http://localhost:7778/api/points/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data?.success) {
            const sorted = response.data.points.sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
            setPoints(sorted);
          }
          
      } catch (err) {
        console.error('포인트 정보 로드 실패:', err);
      }
    };

    fetchUserDetail();
    fetchUserPoints();
  }, [id]);

  const handlePointSubmit = async () => {
    if (!pointForm.amount || isNaN(pointForm.amount)) {
      alert('유효한 금액을 입력하세요.');
      return;
    }
  
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
  
      const payload = {
        ...pointForm,
        targetUserId: id  // 👈 추가
      };
  
      const res = await axios.post(`http://localhost:7778/api/points/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (res.data?.success) {
        alert('포인트가 반영되었습니다.');
        setPointForm({ type: '추가', amount: '', description: '' });
        setPoints(prev => [res.data.point, ...prev]);
      } else {
        alert('포인트 반영 실패');
      }
    } catch (error) {
      console.error('포인트 지급 오류:', error);
      alert('서버 오류');
    }
  };
  

  const handleDelete = async () => {
    const confirmation = window.confirm('이 사용자를 삭제하시겠습니까?');
    if (!confirmation) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.delete(`http://localhost:7778/api/users/userinfo/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data?.success) {
        alert('사용자가 삭제되었습니다.');
        navigate('/users');
      } else {
        alert('사용자 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('사용자 삭제 중 오류가 발생했습니다.', error);
    }
  };

  if (!user) return <div>로딩 중...</div>;

  return (
    <div className="user-detail-container">
      <Header />
      <h1 className="product-name">사용자 정보</h1>
      <div className="user-detail-content">
        <table className="user-detail-table">
          <tbody>
            <tr><th>닉네임</th><td>{user.nickname}</td></tr>
            <tr><th>이메일</th><td>{user.email}</td></tr>
            <tr><th>전화번호</th><td>{user.phoneNumber}</td></tr>
            <tr><th>추천 코드</th><td>{user.referralCode}</td></tr>
            <tr><th>이벤트 수신 동의</th><td>{user.eventAgree ? '동의' : '거부'}</td></tr>
          </tbody>
        </table>

        <div className="button-container">
          <button className="delete-button" onClick={handleDelete}>삭제</button>
        </div>

        <h2 style={{ marginTop: '30px' }}>포인트 수동 지급/차감</h2>
        <div className="manual-point-form">
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <select
              value={pointForm.type}
              onChange={(e) => setPointForm({ ...pointForm, type: e.target.value })}
            >
              <option value="추가">추가</option>
              <option value="감소">감소</option>
              <option value="환불">환불</option>
            
            </select>
            <input
              type="number"
              placeholder="금액"
              value={pointForm.amount}
              onChange={(e) => setPointForm({ ...pointForm, amount: e.target.value })}
            />
            <input
              type="text"
              placeholder="설명 (선택)"
              value={pointForm.description}
              onChange={(e) => setPointForm({ ...pointForm, description: e.target.value })}
            />
            <button type="button" onClick={handlePointSubmit}>
              포인트 반영
            </button>
          </div>
        </div>

        <h2>포인트 내역</h2>
        <table className="user-detail-table">
          <thead>
            <tr>
              <th>유형</th>
              <th>금액</th>
              <th>총액</th>
              <th>설명</th>
              <th>생성일</th>
            </tr>
          </thead>
          <tbody>
            {currentPoints.map((point) => (
              <tr key={point._id}>
                <td>{point.type}</td>
                <td>{point.amount.toLocaleString()}</td>
                <td>{point.totalAmount.toLocaleString()}</td>
                <td>{point.description || '-'}</td>
                <td>{new Date(point.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pagination">
  <button
    onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
    disabled={currentPage === 1}
  >
    이전
  </button>
  <span style={{ margin: '0 10px' }}>{currentPage} </span>
  <button
    onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
    disabled={currentPage === totalPages}
  >
    다음
  </button>
</div>
      </div>
    </div>
  );
};

export default UsersDetail;
