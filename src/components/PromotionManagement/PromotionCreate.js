import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../css/PromotionManagement/PromotionCreate.css';

const PromotionCreate = () => {
  const [name, setName] = useState('');
  const [promotionImage, setPromotionImage] = useState(null);
  const [promotionImagePreview, setPromotionImagePreview] = useState(null); // 프로모션 이미지 미리보기
  const navigate = useNavigate();

  const handlePromotionImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPromotionImage(file);
      const previewUrl = URL.createObjectURL(file); // 미리보기 URL 생성
      setPromotionImagePreview(previewUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 필수 필드 확인
    if (!name || !promotionImage) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('promotionImage', promotionImage);


    const token = localStorage.getItem('token');

    try {
      const response = await axios.post(
        'http://3.36.74.8:8865/api/promotion/create',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
        }
      );

      if (response.status === 200) {
        alert('프로모션이 성공적으로 등록되었습니다.');
        navigate('/promotion');
      } else {
        alert('프로모션 등록 실패: ' + response.data.message);
      }
    } catch (error) {
      console.error('프로모션 등록 실패:', error.message);
      alert('프로모션 등록 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="promotion-create-container">
      <h2 className="promotion-create-title">프로모션 등록</h2>
      <form className="promotion-create-form" onSubmit={handleSubmit}>
        {/* Promotion Name */}
        <div className="promotion-create-field">
          <label className="promotion-create-label" htmlFor="name">프로모션 이름</label>
          <input
            className="promotion-create-input"
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="프로모션 이름을 입력하세요"
            required
          />
        </div>

        {/* Promotion Image */}
        <div className="promotion-create-field">
          <label className="promotion-create-label" htmlFor="promotionImage">프로모션 이미지</label>
          <input
            className="promotion-create-input"
            type="file"
            id="promotionImage"
            onChange={handlePromotionImageChange}
            accept="image/*"
          />
          {promotionImage && (
            <img
              src={promotionImagePreview}
              alt="프로모션 이미지 미리보기"
              className="image-preview"
            />
          )}
        </div>

        <button type="submit" className="promotion-create-button">등록</button>
      </form>
    </div>
  );
};

export default PromotionCreate;
