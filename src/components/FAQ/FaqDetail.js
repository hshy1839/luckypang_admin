import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../Header';
import '../../css/NoticeManagement/NoticeDetail.css';

const FaqDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [faq, setFaq] = useState(null);

  useEffect(() => {
    const fetchFaq = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://13.124.224.246:7778/api/faq/detail/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data && response.data.success) {
          setFaq(response.data.faq);
        }
      } catch (err) {
        console.error('FAQ 조회 실패:', err);
      }
    };

    fetchFaq();
  }, [id]);

  const handleEdit = () => {
    navigate(`/faq/update/${id}`);
  };

  const handleDelete = async () => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`http://13.124.224.246:7778/api/faq/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        alert('삭제되었습니다.');
        navigate('/faq');
      } else {
        alert('삭제에 실패했습니다.');
      }
    } catch (err) {
      console.error('삭제 실패:', err);
      alert('삭제 중 오류 발생');
    }
  };

  if (!faq) return <div>로딩 중...</div>;

  return (
    <div className="notice-detail-container">
      <Header />
      <h1 className="notice-title">FAQ 상세</h1>
      <div className="notice-detail-content">
        <table className="notice-detail-table">
          <tbody>
            <tr>
              <th>카테고리</th>
              <td>{faq.category}</td>
            </tr>
            <tr>
              <th>질문</th>
              <td>{faq.question}</td>
            </tr>
            <tr>
              <th>답변</th>
              <td>{faq.answer}</td>
            </tr>
            <tr>
              <th>작성일</th>
              <td>{new Date(faq.created_at).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>

        <div className="button-container">
          <button className="edit-button" onClick={handleEdit}>수정</button>
          <button className="delete-button" onClick={handleDelete}>삭제</button>
        </div>
      </div>
    </div>
  );
};

export default FaqDetail;
