// src/components/NoticeManagement/NoticeDetail.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../Header';
import '../../css/NoticeManagement/NoticeDetail.css';

const API_BASE = 'http://13.124.224.246:7778';

// key가 오면 /media/{key}로 프록시(백엔드 프록시 라우트 필요). 프리사인/절대 URL이면 그대로 사용.
function resolveImageSrc(value) {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value; // presigned or absolute URL
  return `${API_BASE.replace(/\/$/, '')}/media/${value}`;
}

const NoticeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE}/api/notice/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data?.success) {
          setNotice(response.data.notice);
        } else {
          alert(response.data?.message || '공지사항을 불러오지 못했습니다.');
        }
      } catch (err) {
        console.error('공지사항 조회 실패:', err);
        alert('공지사항 조회 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
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
      const response = await axios.delete(`${API_BASE}/api/notice/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data?.success) {
        alert('삭제되었습니다.');
        navigate('/notice');
      } else {
        alert(response.data?.message || '삭제에 실패했습니다.');
      }
    } catch (err) {
      console.error('삭제 실패:', err);
      alert('삭제 중 오류 발생');
    }
  };

  if (loading) return <div>로딩 중...</div>;
  if (!notice) return <div>데이터가 없습니다.</div>;

  // ✅ 이미지 소스 만들기: 1) presigned 배열 우선  2) 없으면 key 배열을 /media/{key}로 변환
  const imageSrcs = (notice.noticeImageUrls?.length
    ? notice.noticeImageUrls
    : (Array.isArray(notice.noticeImage) ? notice.noticeImage : [])
  ).map(resolveImageSrc);

  // createdAt 필드명 호환 (스키마에 맞춰 우선순위 처리)
  const created =
    notice.createdAt || notice.created_at || notice.created || Date.now();

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
              <td>{new Date(created).toLocaleString()}</td>
            </tr>
            <tr>
              <th>이미지</th>
              <td>
                <div className="notice-images">
                  {imageSrcs.length > 0 ? (
                    imageSrcs.map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt={`공지 이미지 ${i + 1}`}
                        className="notice-image"
                      />
                    ))
                  ) : (
                    <span>-</span>
                  )}
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
