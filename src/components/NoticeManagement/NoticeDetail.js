import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../Header';
import '../../css/NoticeManagement/NoticeDetail.css';

const NoticeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:7778/api/notice/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data && response.data.success) {
          setNotice(response.data.notice);
        }
      } catch (err) {
        console.error('공지사항 조회 실패:', err);
      }
    };

    fetchNotice();
  }, [id]);

  const handleEdit = () => {
    navigate(`/notice/noticeUpdate/${id}`);
  };

  const handleDelete = async () => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`http://localhost:7778/api/notice/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        alert('삭제되었습니다.');
        navigate('/notice');
      } else {
        alert('삭제에 실패했습니다.');
      }
    } catch (err) {
      console.error('삭제 실패:', err);
      alert('삭제 중 오류 발생');
    }
  };

  if (!notice) return <div>로딩 중...</div>;

  return (
    <div className="notice-detail-container">
      <Header />
      <h1 className="notice-title">공지사항 상세</h1>
      <div className="notice-detail-content">
        <table className="notice-detail-table">
          <tbody>
            <tr>
              <th>제목</th>
              <td>{notice.title}</td>
            </tr>
            <tr>
              <th>내용</th>
              <td>{notice.content}</td>
            </tr>
            <tr>
              <th>작성일</th>
              <td>{new Date(notice.created_at).toLocaleString()}</td>
            </tr>
            <tr>
              <th>이미지</th>
              <td>
                <div className="notice-images">
                  {notice.noticeImage?.map((img, i) => (
                    <img
                      key={i}
                      src={`http://localhost:7778${img}`}
                      alt={`공지 이미지 ${i + 1}`}
                      className="notice-image"
                    />
                  ))}
                </div>
              </td>
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

export default NoticeDetail;
