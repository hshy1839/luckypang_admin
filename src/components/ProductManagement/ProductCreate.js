// 업그레이드된 ProductCreate.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import heic2any from "heic2any";
import '../../css/ProductManagement/ProductCreate.css';

const ProductCreate = () => {
  const [form, setForm] = useState({
    name: '',
    brand: '',
    category: '',
    probabilityCategory: '',
    consumerPrice: '',
    price: '',
    shippingFee: '',
    shippingInfo: '',
    option: '',
    description: '',
    sourceLink: '',
    isSourceSoldOut: false,
  });

  const [mainImage, setMainImage] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [additionalPreviews, setAdditionalPreviews] = useState([]);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleMainImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === "image/heic") {
        const converted = await heic2any({ blob: file, toType: "image/jpeg" });
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
        const converted = await heic2any({ blob: file, toType: "image/jpeg" });
        setAdditionalImages((prev) => [...prev, converted]);
        setAdditionalPreviews((prev) => [...prev, URL.createObjectURL(converted)]);
      } else {
        setAdditionalImages((prev) => [...prev, file]);
        setAdditionalPreviews((prev) => [...prev, URL.createObjectURL(file)]);
      }
    }
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
    additionalImages.forEach((img) => formData.append('additionalImages', img));

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:7778/api/products/productCreate',
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        alert('상품이 성공적으로 등록되었습니다.');
        navigate('/products');
      } else {
        alert('상품 등록 실패: ' + response.data.message);
      }
    } catch (err) {
      console.error('상품 등록 에러:', err);
      alert('등록 중 오류 발생');
    }
  };

  return (
    <div className="product-create-container">
      <h2>상품 등록</h2>
      <form onSubmit={handleSubmit} className="product-create-form">
        {[
          { label: '상품 이름', name: 'name' },
          { label: '브랜드', name: 'brand' },
          { label: '카테고리', name: 'category' },
          { label: '확률 카테고리', name: 'probabilityCategory' },
          { label: '소비자가', name: 'consumerPrice', type: 'number' },
          { label: '실구매가', name: 'price', type: 'number' },
          { label: '배송비', name: 'shippingFee', type: 'number' },
          { label: '배송정보', name: 'shippingInfo' },
          { label: '옵션', name: 'option' },
          { label: '발주처 링크', name: 'sourceLink' },
        ].map(({ label, name, type = 'text' }) => (
          <div key={name} className="product-create-field">
            <label>{label}</label>
            <input
              type={type}
              name={name}
              value={form[name]}
              onChange={handleInputChange}
              required={['name', 'category', 'price'].includes(name)}
            />
          </div>
        ))}

        <div className="product-create-field">
          <label>발주처 품절 여부</label>
          <input type="checkbox" name="isSourceSoldOut" checked={form.isSourceSoldOut} onChange={handleInputChange} />
        </div>

        <div className="product-create-field">
          <label>대표 이미지</label>
          <input type="file" onChange={handleMainImageChange} accept="image/*" />
          {mainImagePreview && <img src={mainImagePreview} alt="미리보기" className="image-preview" />}
        </div>

        <div className="product-create-field">
          <label>상세 이미지</label>
          <input type="file" multiple onChange={handleAdditionalImageChange} accept="image/*" />
          <div className="image-preview-list">
            {additionalPreviews.map((url, i) => (
              <div key={i} className="preview-item">
                <img src={url} alt="상세 이미지" />
                <button type="button" onClick={() => removeAdditionalImage(i)}>삭제</button>
              </div>
            ))}
          </div>
        </div>

        <div className="product-create-field">
          <label>상품 설명</label>
          <textarea name="description" value={form.description} onChange={handleInputChange} required />
        </div>

        <button type="submit" className="product-create-button">등록</button>
      </form>
    </div>
  );
};

export default ProductCreate;
