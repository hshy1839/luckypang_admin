import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../css/PromotionManagement/PromotionCreate.css';

const PromotionCreate = () => {
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [promotionImage, setPromotionImage] = useState(null);
  const [promotionDetailImages, setPromotionDetailImages] = useState([]);
  const [promotionImagePreview, setPromotionImagePreview] = useState(null);
  const [promotionDetailPreview, setPromotionDetailPreview] = useState([]);

  const navigate = useNavigate();

  const handlePromotionImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPromotionImage(file);
      setPromotionImagePreview(URL.createObjectURL(file));
    }
  };

  const handlePromotionDetailImageChange = (e) => {
    const files = Array.from(e.target.files);
    setPromotionDetailImages(files);
    setPromotionDetailPreview(files.map(file => URL.createObjectURL(file)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !title || !promotionImage || promotionDetailImages.length === 0) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('title', title);
    formData.append('content', content);
    formData.append('promotionImage', promotionImage);
    promotionDetailImages.forEach((file) =>
      formData.append('promotionDetailImage', file)
    );

    const token = localStorage.getItem('token');

    try {
      const response = await axios.post(
        'http://localhost:7778/api/promotion/create',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.status === 200) {
        alert('프로모션이 등록되었습니다.');
        navigate('/promotion');
      } else {
        alert('등록 실패: ' + response.data.message);
      }
    } catch (error) {
      console.error('등록 오류:', error);
      alert('등록 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="promotion-create-container">
      <h2 className="promotion-create-title">프로모션 등록</h2>
      <form className="promotion-create-form" onSubmit={handleSubmit}>
        <div className="promotion-create-field">
          <label htmlFor="name">프로모션 이름</label>
          <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div className="promotion-create-field">
          <label htmlFor="title">제목</label>
          <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div className="promotion-create-field">
          <label htmlFor="content">내용</label>
          <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows={4} />
        </div>

        <div className="promotion-create-field">
          <label htmlFor="promotionImage">메인 이미지</label>
          <input type="file" id="promotionImage" onChange={handlePromotionImageChange} accept="image/*" />
          {promotionImagePreview && <img src={promotionImagePreview} alt="미리보기" className="image-preview" />}
        </div>

        <div className="promotion-create-field">
          <label htmlFor="promotionDetailImage">상세 이미지</label>
          <input type="file" id="promotionDetailImage" onChange={handlePromotionDetailImageChange} multiple accept="image/*" />
          <div className="multi-image-preview">
            {promotionDetailPreview.map((url, idx) => (
              <img key={idx} src={url} alt={`상세 ${idx}`} className="image-preview" />
            ))}
          </div>
        </div>

        <button type="submit" className="promotion-create-button">등록</button>
      </form>
    </div>
  );
};

export default PromotionCreate;
