import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../Header';
import '../../css/EventManagement/EventDetail.css';

const PromotionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [promotion, setPromotion] = useState(null);

  useEffect(() => {
    const fetchPromotionDetail = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('로그인 정보가 없습니다.');
          return;
        }

        const response = await axios.get(
          `http://13.124.224.246:7778/api/promotion/read/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data && response.data.success) {
          setPromotion(response.data.promotion);
        } else {
          console.log('Promotion 상세 데이터 로드 실패');
        }
      } catch (error) {
        console.error('Promotion 상세 정보를 가져오는데 실패했습니다.', error);
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

      const response = await axios.delete(
        `http://13.124.224.246:7778/api/promotion/delete/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data && response.data.success) {
        alert('이벤트이 삭제되었습니다.');
        navigate('/promotion');
      } else {
        alert('삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('상품 삭제 중 오류가 발생했습니다.', error);
      alert('삭제 중 오류 발생');
    }
  };

  if (!promotion) return <div>로딩 중...</div>;

  // 안전 처리: 날짜/이미지 필드 다양한 케이스 대응
  const createdAt = promotion.created_at || promotion.createdAt;
  const images =
    promotion.promotionImage ||
    promotion.images ||
    [];

  return (
    <div className="event-detail-container">
      <Header />
      <h1 className="event-title">이벤트 상세</h1>

      <div className="event-detail-content">
        <table className="event-detail-table">
          <tbody>
            <tr>
              <th>제목</th>
              <td>{ promotion.title}</td>
            </tr>
            
            <tr>
              <th>작성일</th>
              <td>{createdAt ? new Date(createdAt).toLocaleString() : '-'}</td>
            </tr>
            <tr>
              <th>이미지</th>
              <td>
                <div className="event-images">
                  {Array.isArray(images) && images.length > 0 ? (
                    images.map((img, i) => (
                      <img
                        key={i}
                        src={
                          String(img).startsWith('http')
                            ? img
                            : `http://13.124.224.246:7778${img.startsWith('/') ? img : `/${img}`}`
                        }
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
            {/* ✅ 이미지 아래 content 표시 */}
            <tr>
              <th>내용</th>
              <td>
                <div className="event-content">
                  {promotion.content && promotion.content.trim()
                    ? promotion.content
                    : '-'}
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
