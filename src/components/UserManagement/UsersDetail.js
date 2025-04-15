import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../Header';
import '../../css/UserManagement/UserDetail.css'; // 스타일 시트 경로 수정

const UsersDetail = () => {
  const [user, setUser] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetail = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('로그인 정보가 없습니다.');
          return;
        }

        const response = await axios.get(
          `http://localhost:7778/api/users/userinfo/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data && response.data.success) {
          setUser(response.data.user);
        } else {
          console.log('사용자 상세 데이터 로드 실패');
        }
      } catch (error) {
        console.error('사용자 상세 정보를 가져오는데 실패했습니다.', error);
      }
    };

    fetchUserDetail();
  }, [id]);

  const handleDelete = async () => {
    const confirmation = window.confirm('이 사용자를 삭제하시겠습니까?');
    if (!confirmation) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.delete(
        `http://localhost:7778/api/users/userinfo/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.success) {
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
      </div>
    </div>
  );
};

export default UsersDetail;
