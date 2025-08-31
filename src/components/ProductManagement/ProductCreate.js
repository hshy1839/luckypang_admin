import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import heic2any from "heic2any";
import '../../css/ProductManagement/ProductCreate.css';

const ProductCreate = () => {
  const [form, setForm] = useState({
    name: '',
    brand: '',
    category: '',
    probability: '',
    consumerPrice: '',
    price: '',
    shippingFee: '',
    shippingInfo: '',
    description: '',
    sourceLink: '',
    isSourceSoldOut: false,
    isVisible: true,
    statusDetail: '판매중',
    refundProbability: '',
  });

  const [mainImage, setMainImage] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [additionalPreviews, setAdditionalPreviews] = useState([]);
  const [boxOptions, setBoxOptions] = useState([]);
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

  useEffect(() => {
    const fetchBoxList = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://13.124.224.246:7778/api/box', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (res.data.success && Array.isArray(res.data.boxes)) {
          setBoxOptions(res.data.boxes.map(box => box.name));
        }
      } catch (err) {
        console.error('박스 목록 불러오기 실패:', err);
      }
    };
  
    fetchBoxList();
  }, []);

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

  const moveImage = (fromIndex, toIndex) => {
    const updatedImages = [...additionalImages];
    const updatedPreviews = [...additionalPreviews];
    const [movedImage] = updatedImages.splice(fromIndex, 1);
    const [movedPreview] = updatedPreviews.splice(fromIndex, 1);
    updatedImages.splice(toIndex, 0, movedImage);
    updatedPreviews.splice(toIndex, 0, movedPreview);
    setAdditionalImages(updatedImages);
    setAdditionalPreviews(updatedPreviews);
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('dragIndex', index);
  };

  const handleDropPreview = (e, index) => {
    const fromIndex = Number(e.dataTransfer.getData('dragIndex'));
    if (fromIndex !== index) moveImage(fromIndex, index);
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
        'http://13.124.224.246:7778/api/products/productCreate',
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
        {[{ label: '상품 이름', name: 'name' }, { label: '브랜드', name: 'brand' }, { label: '카테고리', name: 'category' }, { label: '소비자가', name: 'consumerPrice', type: 'number' }, { label: '실구매가', name: 'price', type: 'number' }, { label: '배송비', name: 'shippingFee', type: 'number' }].map(({ label, name, type = 'text' }) => {
          if (name === 'category') {
            return (
              <div key={name} className="product-create-field">
                <label>{label}</label>
                <div key="category" className="product-create-field">
  <select name="category" value={form.category} onChange={handleInputChange} required>
    <option value="" disabled hidden>선택하세요</option>
    {boxOptions.map((boxName) => (
      <option key={boxName} value={boxName}>
        {boxName}
      </option>
    ))}
  </select>
</div>

              </div>
            );
          }

          return (
            <div key={name} className="product-create-field">
              <label>{label}</label>
              <input type={type} name={name} value={form[name]} onChange={handleInputChange} required={['name', 'category', 'price'].includes(name)} />
            </div>
          );
        })}

        <div className="product-create-field">
          <label>확률 카테고리</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input type="number" name="probability" value={form.probability} onChange={handleInputChange} min="0" max="100" step="1" required style={{ width: '80px' }} />
            <span style={{ marginLeft: '8px' }}>%</span>
          </div>
        </div>

        <div className="product-create-field">
          <label>노출 여부</label>
          <select name="isVisible" value={form.isVisible ? 'true' : 'false'} onChange={(e) => setForm((prev) => ({ ...prev, isVisible: e.target.value === 'true' }))}>
            <option value="true">노출</option>
            <option value="false">비노출</option>
          </select>
        </div>

        <div className="product-create-field">
  <label>포인트 환급률</label>
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <input
      type="number"
      name="refundProbability"
      value={form.refundProbability}
      onChange={handleInputChange}
      min="0"
      max="100"
      step="1"
      required
      style={{ width: '80px' }}
    />
    <span style={{ marginLeft: '8px' }}>%</span>
  </div>
</div>
        <div className="product-create-field">
          <label>상태 상세</label>
          <select name="statusDetail" value={form.statusDetail} onChange={handleInputChange}>
            <option value="판매중">판매중</option>
            <option value="테스트">테스트</option>
            <option value="품절">품절</option>
            <option value="비노출">비노출</option>
          </select>
        </div>

        <div className="product-create-field">
          <label>발주처 링크</label>
          <input type="text" name="sourceLink" value={form.sourceLink} onChange={handleInputChange} placeholder="http, https로 시작하는 도메인을 입력하세요" required />
        </div>

        <div className="product-create-field">
          <label>발주처 품절 여부</label>
          <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
            <label>
              <input type="radio" name="isSourceSoldOut" value="true" checked={form.isSourceSoldOut === true} onChange={() => setForm((prev) => ({ ...prev, isSourceSoldOut: true }))} /> 예
            </label>
            <label>
              <input type="radio" name="isSourceSoldOut" value="false" checked={form.isSourceSoldOut === false} onChange={() => setForm((prev) => ({ ...prev, isSourceSoldOut: false }))} /> 아니오
            </label>
          </div>
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
              <div key={i} className="preview-item" draggable onDragStart={(e) => handleDragStart(e, i)} onDrop={(e) => handleDropPreview(e, i)} onDragOver={(e) => e.preventDefault()}>
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
