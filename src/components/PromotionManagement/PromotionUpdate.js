// src/components/PromotionManagement/PromotionUpdate.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../Header';
import '../../css/PromotionManagement/PromotionUpdate.css';

const API_BASE = 'https://luckytang-server.onrender.com';

// presigned/절대 URL이면 그대로, 아니면 S3 key를 /media/{key}로 변환
function resolveImageSrc(value) {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  return `${API_BASE.replace(/\/$/, '')}/media/${value}`;
}

const PromotionUpdate = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [promotion, setPromotion] = useState(null);

  const [form, setForm] = useState({
    title: '',
    link: '',
    content: '',
  });

  useEffect(() => {
    const fetchPromotionDetail = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('로그인이 필요합니다.');
          return;
        }

        const res = await axios.get(`${API_BASE}/api/promotion/read/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data?.success && res.data.promotion) {
          const p = res.data.promotion;
          setPromotion(p);
          setForm({
            title: p.title || '',
            link: p.link || '',
            content: p.content || '',
          });
        } else {
          alert(res.data?.message || '프로모션 정보를 불러오지 못했습니다.');
        }
      } catch (e) {
        console.error('promotion 상세 조회 실패:', e);
        alert('데이터 조회 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchPromotionDetail();
  }, [id]);

  const createdAt = promotion?.createdAt || promotion?.created_at;

  // ✅ 이미지 소스: presigned 배열 우선, 없으면 key 배열 → /media/{key}
  const mainUrls = (promotion?.promotionImageUrls?.length
    ? promotion.promotionImageUrls
    : (Array.isArray(promotion?.promotionImage) ? promotion.promotionImage : [])
  ).map(resolveImageSrc);

  const detailUrls = (promotion?.promotionDetailImageUrls?.length
    ? promotion.promotionDetailImageUrls
    : (Array.isArray(promotion?.promotionDetailImage) ? promotion.promotionDetailImage : [])
  ).map(resolveImageSrc);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const onSave = async (e) => {
    e.preventDefault();
    if (!window.confirm('수정사항을 저장하시겠습니까?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      const payload = {
        title: form.title?.trim(),
        link: form.link?.trim(),
        content: form.content ?? '',
        // 여기서는 텍스트만 수정. 이미지 교체는 별도 업로드 화면/폼에서 처리(파일 업로드 필요)
      };

      const res = await axios.put(`${API_BASE}/api/promotion/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.success) {
        alert('프로모션이 수정되었습니다.');
        navigate(`/promotion/promotionDetail/${id}`);
      } else {
        alert(res.data?.message || '수정에 실패했습니다.');
      }
    } catch (e) {
      console.error('promotion 수정 실패:', e);
      alert('서버와의 연결에 문제가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const onCancel = () => {
    if (!window.confirm('수정을 취소하시겠습니까? 변경 내용이 저장되지 않습니다.')) return;
    navigate(`/promotion/promotionDetail/${id}`);
  };

  if (loading) return <div>로딩 중...</div>;
  if (!promotion) return <div>데이터가 없습니다.</div>;

  return (
    <div className="promotion-update-container">
      <Header />
      <h1 className="promotion-update-title">프로모션 수정</h1>

      <form onSubmit={onSave}>
        <div className="promotion-update-content">
          <table className="promotion-update-table">
            <tbody>
              <tr>
                <th>제목</th>
                <td>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={onChange}
                    placeholder="프로모션 제목을 입력하세요"
                    className="promotion-update-input"
                    required
                  />
                </td>
              </tr>

              <tr>
                <th>링크</th>
                <td>
                  <input
                    type="text"
                    name="link"
                    value={form.link}
                    onChange={onChange}
                    placeholder="관련 링크(선택)"
                    className="promotion-update-input"
                  />
                </td>
              </tr>

              <tr>
                <th>작성일</th>
                <td>{createdAt ? new Date(createdAt).toLocaleString() : '-'}</td>
              </tr>

              <tr>
                <th>메인 이미지</th>
                <td>
                  <div className="promotion-update-images">
                    {mainUrls.length > 0 ? (
                      mainUrls.map((src, i) => (
                        <img
                          key={`main-${i}`}
                          src={src}
                          alt={`프로모션 메인 이미지 ${i + 1}`}
                          className="promotion-update-image"
                        />
                      ))
                    ) : (
                      <span>-</span>
                    )}
                  </div>
                </td>
              </tr>

              <tr>
                <th>상세 이미지</th>
                <td>
                  <div className="promotion-update-images">
                    {detailUrls.length > 0 ? (
                      detailUrls.map((src, i) => (
                        <img
                          key={`detail-${i}`}
                          src={src}
                          alt={`프로모션 상세 이미지 ${i + 1}`}
                          className="promotion-update-image"
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
                  <textarea
                    name="content"
                    value={form.content}
                    onChange={onChange}
                    placeholder="프로모션 내용을 입력하세요"
                    className="promotion-update-textarea"
                    rows={8}
                  />
                </td>
              </tr>
            </tbody>
          </table>

          <div className="promotion-update-buttons">
            <button type="button" className="promotion-update-cancel" onClick={onCancel}>
              취소
            </button>
            <button type="submit" className="promotion-update-save">
              수정 저장
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PromotionUpdate;
