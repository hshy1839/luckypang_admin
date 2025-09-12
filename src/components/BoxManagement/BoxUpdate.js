import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import heic2any from 'heic2any';
import '../../css/BoxManagement/BoxCreate.css';

const BoxUpdate = () => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    isPublic: true,
    type: 'normal',
    availableFrom: '',
    availableUntil: '',
    purchaseLimit: '',
  });

  const [mainImage, setMainImage] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState(null);
  const [initialAdditionalImages, setInitialAdditionalImages] = useState([]);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [additionalPreviews, setAdditionalPreviews] = useState([]);

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchBox = async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get(`https://luckytang-server.onrender.com/api/box/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        const box = response.data.box;
        setForm({
          name: box.name,
          description: box.description,
          price: box.price,
          isPublic: box.isPublic,
          type: box.type,
          availableFrom: box.availableFrom?.substr(0, 10),
          availableUntil: box.availableUntil?.substr(0, 10),
          purchaseLimit: box.purchaseLimit || '',
        });
        if (box.mainImage) setMainImagePreview(`https://luckytang-server.onrender.com${box.mainImage}`);
        if (box.additionalImages) setInitialAdditionalImages(box.additionalImages);
      }
    };
    fetchBox();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleMainImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === 'image/heic') {
        const converted = await heic2any({ blob: file, toType: 'image/jpeg' });
        setMainImagePreview(URL.createObjectURL(converted));
        setMainImage(converted);
      } else {
        setMainImagePreview(URL.createObjectURL(file));
        setMainImage(file);
      }
    }
  };

  const handleAdditionalImageChange = async (e) => {
    const files = e.target.files;
    for (const file of files) {
      if (file.type === 'image/heic') {
        const converted = await heic2any({ blob: file, toType: 'image/jpeg' });
        setAdditionalImages((prev) => [...prev, converted]);
        setAdditionalPreviews((prev) => [...prev, URL.createObjectURL(converted)]);
      } else {
        setAdditionalImages((prev) => [...prev, file]);
        setAdditionalPreviews((prev) => [...prev, URL.createObjectURL(file)]);
      }
    }
  };

  const removeInitialImage = (index) => {
    setInitialAdditionalImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeAdditionalImage = (index) => {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
    setAdditionalPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    if (mainImage) formData.append('mainImage', mainImage);
    else formData.append('retainMainImage', 'true');

    additionalImages.forEach((img) => formData.append('additionalImages', img));
    initialAdditionalImages.forEach((url) => formData.append('initialAdditionalImages', url));
    if (initialAdditionalImages.length > 0) formData.append('retainAdditionalImages', 'true');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`https://luckytang-server.onrender.com/api/box/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data.success) {
        alert('박스가 성공적으로 수정되었습니다.');
        navigate('/box');
      } else {
        alert('수정 실패: ' + response.data.message);
      }
    } catch (err) {
      console.error('수정 에러:', err);
      alert('수정 중 오류 발생');
    }
  };

  return (
    <div className="box-create-container">
      <h2>박스 수정</h2>
      <form onSubmit={handleSubmit} className="box-create-form">
        <div className="box-create-field">
          <label>박스 이름</label>
          <input type="text" name="name" value={form.name} onChange={handleInputChange} required />
        </div>
        <div className="box-create-field">
          <label>설명</label>
          <textarea name="description" value={form.description} onChange={handleInputChange} required />
        </div>
        <div className="box-create-field">
          <label>가격</label>
          <input type="number" name="price" value={form.price} onChange={handleInputChange} required />
        </div>
        <div className="box-create-field">
          <label>공개 여부</label>
          <select name="isPublic" value={form.isPublic ? 'true' : 'false'} onChange={(e) => setForm((prev) => ({ ...prev, isPublic: e.target.value === 'true' }))}>
            <option value="true">공개</option>
            <option value="false">비공개</option>
          </select>
        </div>
        <div className="box-create-field">
          <label>박스 유형</label>
          <select name="type" value={form.type} onChange={handleInputChange}>
            <option value="normal">일반</option>
            <option value="event">이벤트</option>
            <option value="limited">한정</option>
          </select>
        </div>
        <div className="box-create-field">
          <label>판매 시작일</label>
          <input type="date" name="availableFrom" value={form.availableFrom} onChange={handleInputChange} />
        </div>
        <div className="box-create-field">
          <label>판매 종료일</label>
          <input type="date" name="availableUntil" value={form.availableUntil} onChange={handleInputChange} />
        </div>
        <div className="box-create-field">
          <label>구매 제한 수량</label>
          <input type="number" name="purchaseLimit" value={form.purchaseLimit} onChange={handleInputChange} />
        </div>
        <div className="box-create-field">
          <label>대표 이미지</label>
          <input type="file" onChange={handleMainImageChange} accept="image/*" />
          {mainImagePreview && <img src={mainImagePreview} alt="미리보기" className="image-preview" />}
        </div>
        <div className="box-create-field">
          <label>상세 이미지</label>
          <input type="file" multiple onChange={handleAdditionalImageChange} accept="image/*" />
          <div className="image-preview-list">
            {initialAdditionalImages.map((url, i) => (
              <div key={`initial-${i}`} className="preview-item">
                <img src={`https://luckytang-server.onrender.com${url}`} alt="기존 상세 이미지" />
                <button type="button" onClick={() => removeInitialImage(i)}>삭제</button>
              </div>
            ))}
            {additionalPreviews.map((url, i) => (
              <div key={`new-${i}`} className="preview-item">
                <img src={url} alt="신규 상세 이미지" />
                <button type="button" onClick={() => removeAdditionalImage(i)}>삭제</button>
              </div>
            ))}
          </div>
        </div>
        <button type="submit" className="box-create-button">수정</button>
      </form>
    </div>
  );
};

export default BoxUpdate;