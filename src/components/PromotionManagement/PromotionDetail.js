// src/components/EventManagement/EventDetail.js  (파일 경로는 네 프로젝트 구조에 맞춰)
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../Header';
import '../../css/EventManagement/EventDetail.css';

const API_BASE = 'http://13.124.224.246:7778';

// presigned/절대 URL이면 그대로, 아니면 S3 key를 /media/{key}로 변환
function resolveImageSrc(value) {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  return `${API_BASE.replace(/\/$/, '')}/media/${value}`;
}

const PromotionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [promotion, setPromotion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPromotionDetail = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('로그인 정보가 없습니다.');
          setLoading(false);
          return;
        }

        const resp = await axios.get(
          `${API_BASE}/api/promotion/read/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (resp.data?.success) {
          setPromotion(resp.data.promotion);
        } else {
          console.log(resp.data?.message || 'Promotion 상세 데이터 로드 실패');
        }
      } catch (error) {
        console.error('Promotion 상세 정보를 가져오는데 실패했습니다.', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPromotionDetail();
  }, [id]);

  const handleEdit = () => {
    navigate(`/promotion/promotionDetail/${id}/update`);
  };

  const handleDelete = async () => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('로그인 정보가 없습니다.');
        return;
      }

      const resp = await axios.delete(
        `${API_BASE}/api/promotion/delete/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (resp.data?.success) {
        alert('이벤트이 삭제되었습니다.');
        navigate('/promotion');
      } else {
        alert(resp.data?.message || '삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('이벤트 삭제 중 오류가 발생했습니다.', error);
      alert('삭제 중 오류 발생');
    }
  };

  if (loading) return <div>로딩 중...</div>;
  if (!promotion) return <div>데이터가 없습니다.</div>;

  // 날짜 필드 안전 처리
  const createdAt = promotion.createdAt || promotion.created_at || promotion.created;

  // ✅ 이미지 소스 만들기
  // 1) presigned 배열 우선 사용
  // 2) 없으면 key 배열을 /media/{key} 로 변환
  const mainUrls = (promotion.promotionImageUrls?.length
    ? promotion.promotionImageUrls
    : (Array.isArray(promotion.promotionImage) ? promotion.promotionImage : [])
  ).map(resolveImageSrc);

  const detailUrls = (promotion.promotionDetailImageUrls?.length
    ? promotion.promotionDetailImageUrls
    : (Array.isArray(promotion.promotionDetailImage) ? promotion.promotionDetailImage : [])
  ).map(resolveImageSrc);

  // 메인 + 상세 합쳐서 보여주기 (원하면 섹션 나눠도 OK)
  const allImages = [...mainUrls, ...detailUrls];

  return (
    <div className="event-detail-container">
      <Header />
      <h1 className="event-title">이벤트 상세</h1>

      <div className="event-detail-content">
        <table className="event-detail-table">
          <tbody>
            <tr>
              <th>제목</th>
              <td>{promotion.title}</td>
            </tr>
            <tr>
              <th>작성일</th>
              <td>{createdAt ? new Date(createdAt).toLocaleString() : '-'}</td>
            </tr>
            <tr>
              <th>이미지</th>
              <td>
                <div className="event-images">
                  {allImages.length > 0 ? (
                    allImages.map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt={`이벤트 이미지 ${i + 1}`}
                        className="event-image"
                      />
                    ))
                  ) : (
                    <span>-</span>
                  )}
                </div>
              </td>
            </tr>
            <tr>
              <th>내용</th>
              <td>
                <div className="event-content">
                  {promotion.content && promotion.content.trim() ? promotion.content : '-'}
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

export default PromotionDetail;
