import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import heic2any from 'heic2any';
import '../../css/ProductManagement/ProductCreate.css';

const BoxCreate = () => {
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
  const [additionalImages, setAdditionalImages] = useState([]);
  const [additionalPreviews, setAdditionalPreviews] = useState([]);

  const [productSearch, setProductSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);

  const navigate = useNavigate();

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

  const removeAdditionalImage = (index) => {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
    setAdditionalPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const searchProductByName = async () => {
    if (!productSearch.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:7778/api/products/search?name=${productSearch}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        const products = response.data.products.map(p => ({
          ...p,
          probability: p.probability || 0
        }));
        setSearchResults(products);
      }
    } catch (err) {
      console.error('검색 실패', err);
    }
  };

  const addProductToBox = (product) => {
    if (selectedProducts.some(p => p.product._id === product._id)) return;
    setSelectedProducts(prev => [...prev, { product, probability: product.probability || 0 }]);
  };

  const removeSelectedProduct = (index) => {
    const updated = [...selectedProducts];
    updated.splice(index, 1);
    setSelectedProducts(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });
    if (mainImage) formData.append('mainImage', mainImage);
    additionalImages.forEach((img) => formData.append('additionalImages', img));

    selectedProducts.forEach(({ product, probability }) => {
      formData.append('products[]', JSON.stringify({ product: product._id, probability }));
    });

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:7778/api/box', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.status === 200) {
        alert('박스가 성공적으로 등록되었습니다.');
        navigate('/box');
      } else {
        alert('등록 실패: ' + response.data.message);
      }
    } catch (err) {
      console.error('등록 에러:', err);
      alert('등록 중 오류 발생');
    }
  };

  return (
    <div className="product-create-container">
      <h2>박스 등록</h2>
      <form onSubmit={handleSubmit} className="product-create-form">
        <div className="product-create-field">
          <label>박스 이름</label>
          <input type="text" name="name" value={form.name} onChange={handleInputChange} required />
        </div>

        <div className="product-create-field">
          <label>설명</label>
          <textarea name="description" value={form.description} onChange={handleInputChange} required />
        </div>

        <div className="product-create-field">
          <label>가격</label>
          <input type="number" name="price" value={form.price} onChange={handleInputChange} required />
        </div>

        <div className="product-create-field">
          <label>공개 여부</label>
          <select name="isPublic" value={form.isPublic ? 'true' : 'false'} onChange={(e) => setForm((prev) => ({ ...prev, isPublic: e.target.value === 'true' }))}>
            <option value="true">공개</option>
            <option value="false">비공개</option>
          </select>
        </div>

        <div className="product-create-field">
          <label>박스 유형</label>
          <select name="type" value={form.type} onChange={handleInputChange}>
            <option value="normal">일반</option>
            <option value="event">이벤트</option>
            <option value="limited">한정</option>
          </select>
        </div>

        <div className="product-create-field">
          <label>판매 시작일</label>
          <input type="date" name="availableFrom" value={form.availableFrom} onChange={handleInputChange} />
        </div>

        <div className="product-create-field">
          <label>판매 종료일</label>
          <input type="date" name="availableUntil" value={form.availableUntil} onChange={handleInputChange} />
        </div>

        <div className="product-create-field">
          <label>구매 제한 수량</label>
          <input type="number" name="purchaseLimit" value={form.purchaseLimit} onChange={handleInputChange} />
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
                <button type="button" onClick={() => removeAdditionalImage(i)}>
                  삭제
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="product-create-field">
          <label>상품 검색</label>
          <input value={productSearch} onChange={(e) => setProductSearch(e.target.value)} />
          <button type="button" onClick={searchProductByName}>검색</button>
          <ul>
            {searchResults.map(p => (
              <li key={p._id}>{p.name} <button type="button" onClick={() => addProductToBox(p)}>추가</button></li>
            ))}
          </ul>
        </div>

        <div className="product-create-field">
          <label>선택된 상품 및 확률</label>
          <ul>
            {selectedProducts.map((p, i) => (
              <li key={p.product._id}>
                {p.product.name} - {p.probability} %
                <button type="button" onClick={() => removeSelectedProduct(i)}>삭제</button>
              </li>
            ))}
          </ul>
        </div>

        <button type="submit" className="product-create-button">등록</button>
      </form>
    </div>
  );
};

export default BoxCreate;