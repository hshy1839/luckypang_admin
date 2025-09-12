// src/components/PromotionManagement/PromotionCreate.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../css/PromotionManagement/PromotionCreate.css';

const API_BASE = 'http://13.124.224.246:7778';

const PromotionCreate = () => {
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const [promotionImage, setPromotionImage] = useState(null);
  const [promotionImagePreview, setPromotionImagePreview] = useState(null);

  const [promotionDetailImages, setPromotionDetailImages] = useState([]);
  const [promotionDetailPreview, setPromotionDetailPreview] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // 미리보기 URL revoke (메모리 누수 방지)
    return () => {
      if (promotionImagePreview) URL.revokeObjectURL(promotionImagePreview);
      promotionDetailPreview.forEach((u) => URL.revokeObjectURL(u));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePromotionImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (promotionImagePreview) URL.revokeObjectURL(promotionImagePreview);
      setPromotionImage(file);
      setPromotionImagePreview(URL.createObjectURL(file));
    } else {
      setPromotionImage(null);
      if (promotionImagePreview) URL.revokeObjectURL(promotionImagePreview);
      setPromotionImagePreview(null);
    }
  };

  const handlePromotionDetailImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    // 기존 미리보기 URL revoke
    promotionDetailPreview.forEach((u) => URL.revokeObjectURL(u));

    setPromotionDetailImages(files);
    setPromotionDetailPreview(files.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !title || !promotionImage || promotionDetailImages.length === 0) {
      alert('필수 항목(이름, 제목, 메인 이미지, 상세 이미지)을 모두 입력/선택하세요.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('title', title.trim());
    formData.append('content', content.trim());
    formData.append('promotionImage', promotionImage); // 대표 이미지 1장
    promotionDetailImages.forEach((file) => formData.append('promotionDetailImage', file)); // 상세 여러 장

    try {
      setSubmitting(true);
      const resp = await axios.post(`${API_BASE}/api/promotion/create`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        // 필요시 timeout 설정 가능
      });

      if (resp.data?.success) {
        alert('프로모션이 등록되었습니다.');
        navigate('/promotion');
      } else {
        alert(resp.data?.message || '등록에 실패했습니다.');
      }
    } catch (err) {
      console.error('등록 오류:', err);
      alert('등록 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="promotion-create-container">
      <h2 className="promotion-create-title">프로모션 등록</h2>
      <form className="promotion-create-form" onSubmit={handleSubmit}>
        <div className="promotion-create-field">
          <label htmlFor="name">프로모션 이름</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="예) 가을맞이 프로모션"
          />
        </div>

        <div className="promotion-create-field">
          <label htmlFor="title">제목</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="예) 최대 50% 할인!"
          />
        </div>

        <div className="promotion-create-field">
          <label htmlFor="content">내용</label>
          <textarea
            id="content"
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="프로모션 상세 내용을 입력하세요"
          />
        </div>

        <div className="promotion-create-field">
          <label htmlFor="promotionImage">메인 이미지</label>
          <input
            type="file"
            id="promotionImage"
            onChange={handlePromotionImageChange}
            accept="image/*"
          />
          {promotionImagePreview && (
            <img src={promotionImagePreview} alt="메인 미리보기" className="image-preview" />
          )}
        </div>

        <div className="promotion-create-field">
          <label htmlFor="promotionDetailImage">상세 이미지</label>
          <input
            type="file"
            id="promotionDetailImage"
            onChange={handlePromotionDetailImageChange}
            multiple
            accept="image/*"
          />
          <div className="multi-image-preview">
            {promotionDetailPreview.map((url, idx) => (
              <img key={idx} src={url} alt={`상세 ${idx + 1}`} className="image-preview" />
            ))}
          </div>
        </div>

        <button type="submit" className="promotion-create-button" disabled={submitting}>
          {submitting ? '등록 중...' : '등록'}
        </button>
      </form>
    </div>
  );
};

export default PromotionCreate;
