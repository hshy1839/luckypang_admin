import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../Header';
import '../../css/PromotionManagement/PromotionUpdate.css'; // 전용 CSS

const PromotionUpdate = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [promotion, setPromotion] = useState(null);

  // ✅ name → title 로 변경
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
          alert('로그인 정보가 없습니다.');
          return;
        }

        const res = await axios.get(
          `https://luckytang-server.onrender.com/api/promotion/read/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data?.success && res.data.promotion) {
          const p = res.data.promotion;
          setPromotion(p);
          setForm({
            title: p.title || '',
            link: p.link || '',
            content: p.content || '',
          });
        } else {
          alert('프로모션 정보를 불러오지 못했습니다.');
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

  const createdAt = promotion?.created_at || promotion?.createdAt;
  const images = promotion?.promotionImage || [];

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
        alert('로그인 정보가 없습니다.');
        return;
      }

      // ✅ title 전송
      const payload = {
        title: form.title?.trim(),
        link: form.link?.trim(),
        content: form.content ?? '',
      };

      const res = await axios.put(
        `https://luckytang-server.onrender.com/api/promotion/${id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.success) {
        alert('프로모션이 수정되었습니다.');
        navigate(`/promotion/promotionDetail/${id}`);
      } else {
        alert('수정에 실패했습니다.');
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
                    name="title"                // ✅ name=title
                    value={form.title}          // ✅ value=title
                    onChange={onChange}
                    placeholder="프로모션 제목을 입력하세요"
                    className="promotion-update-input"
                    required
                  />
                </td>
              </tr>

            

              <tr>
                <th>작성일</th>
                <td>{createdAt ? new Date(createdAt).toLocaleString() : '-'}</td>
              </tr>

              <tr>
                <th>이미지</th>
                <td>
                  <div className="promotion-update-images">
                    {images.length > 0 ? (
                      images.map((img, i) => (
                        <img
                          key={i}
                          src={
                            String(img).startsWith('http')
                              ? img
                              : `https://luckytang-server.onrender.com${String(img).startsWith('/') ? img : `/${img}`}`
                          }
                          alt={`프로모션 이미지 ${i + 1}`}
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
