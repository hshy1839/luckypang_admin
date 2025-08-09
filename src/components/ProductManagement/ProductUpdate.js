import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import heic2any from "heic2any";
import '../../css/ProductManagement/ProductUpdate.css';

const ProductUpdate = () => {
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
  const [initialAdditionalImages, setInitialAdditionalImages] = useState([]);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [additionalPreviews, setAdditionalPreviews] = useState([]);
  const [imageList, setImageList] = useState([]);

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://13.124.224.246:7778/api/products/Product/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data?.success) {
          const product = response.data.product;
          setForm(product);
          if (product.mainImage) {
            setMainImagePreview(`http://13.124.224.246:7778${product.mainImage}`);
          }
          if (product.additionalImages) {
            setInitialAdditionalImages(product.additionalImages);
          }
        }
      } catch (error) {
        console.error('상품 조회 실패:', error);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    const merged = [
      ...initialAdditionalImages.map((url) => ({ url, isInitial: true })),
      ...additionalPreviews.map((url, i) => ({ url, isInitial: false, index: i })),
    ];
    setImageList(merged);
  }, [initialAdditionalImages, additionalPreviews]);

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
    const newImages = [];
    const newPreviews = [];

    for (const file of files) {
      if (file.type === 'image/heic') {
        const converted = await heic2any({ blob: file, toType: "image/jpeg" });
        newImages.push(converted);
        newPreviews.push(URL.createObjectURL(converted));
      } else {
        newImages.push(file);
        newPreviews.push(URL.createObjectURL(file));
      }
    }

    setAdditionalImages(prev => [...prev, ...newImages]);
    setAdditionalPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeInitialImage = (index) => {
    setInitialAdditionalImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeAdditionalImage = (index) => {
    setAdditionalImages(prev => prev.filter((_, i) => i !== index));
    setAdditionalPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('dragIndex', index);
  };

  const handleDropPreview = (e, index) => {
    const fromIndex = Number(e.dataTransfer.getData('dragIndex'));
    if (fromIndex === index) return;

    const reordered = [...imageList];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(index, 0, moved);
    setImageList(reordered);

    const newInitial = [];
    const newPreviews = [];
    const newFiles = [];

    reordered.forEach((item) => {
      if (item.isInitial) newInitial.push(item.url);
      else {
        newPreviews.push(item.url);
        newFiles.push(additionalImages[item.index]);
      }
    });

    setInitialAdditionalImages(newInitial);
    setAdditionalPreviews(newPreviews);
    setAdditionalImages(newFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    if (mainImage) formData.append('mainImage', mainImage);
    else formData.append('retainMainImage', 'true');

    additionalImages.forEach(img => formData.append('additionalImages', img));
    if (initialAdditionalImages.length > 0) {
      initialAdditionalImages.forEach(url =>
        formData.append('initialAdditionalImages', url)
      );
      formData.append('retainAdditionalImages', 'true');
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://13.124.224.246:7778/api/products/update/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
        }
      );

      if (response.data.success) {
        alert('상품이 수정되었습니다.');
        navigate('/products');
      } else {
        alert('상품 수정 실패: ' + response.data.message);
      }
    } catch (error) {
      console.error('수정 중 오류:', error);
      alert('등록 중 오류 발생');
    }
  };

  return (
    <div className="product-update-container">
      <h2>상품 수정</h2>
      <form onSubmit={handleSubmit} className="product-update-form">

        {[
          { label: '상품 이름', name: 'name' },
          { label: '브랜드', name: 'brand' },
          { label: '소비자가', name: 'consumerPrice', type: 'number' },
          { label: '실구매가', name: 'price', type: 'number' },
          { label: '배송비', name: 'shippingFee', type: 'number' },
        ].map(({ label, name, type = 'text' }) => (
          <div key={name} className="product-update-field">
            <label>{label}</label>
            <input
              type={type}
              name={name}
              value={form[name]}
              onChange={handleInputChange}
              required={['name', 'price'].includes(name)}
            />
          </div>
        ))}

        <div className="product-update-field">
          <label>카테고리</label>
          <select name="category" value={form.category} onChange={handleInputChange} required>
            <option value="" disabled hidden>선택하세요</option>
            <option value="5,000원 박스">5,000원 박스</option>
            <option value="10,000원 박스">10,000원 박스</option>
          </select>
        </div>

        <div className="product-update-field">
          <label>확률 카테고리 (%)</label>
          <input
            type="number"
            name="probability"
            min="0"
            max="100"
            step="1"
            value={form.probability}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="product-update-field">
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
        <div className="product-update-field">
          <label>상태 상세</label>
          <select name="statusDetail" value={form.statusDetail} onChange={handleInputChange}>
            <option value="판매중">판매중</option>
            <option value="테스트">테스트</option>
            <option value="품절">품절</option>
            <option value="비노출">비노출</option>
          </select>
        </div>

        <div className="product-update-field">
          <label>발주처 링크</label>
          <input type="text" name="sourceLink" value={form.sourceLink} onChange={handleInputChange} required />
        </div>

        <div className="product-update-field">
          <label>발주처 품절 여부</label>
          <div style={{ display: 'flex', gap: '20px' }}>
            <label>
              <input type="radio" name="isSourceSoldOut" value="true" checked={form.isSourceSoldOut === true} onChange={() => setForm((prev) => ({ ...prev, isSourceSoldOut: true }))} /> 예
            </label>
            <label>
              <input type="radio" name="isSourceSoldOut" value="false" checked={form.isSourceSoldOut === false} onChange={() => setForm((prev) => ({ ...prev, isSourceSoldOut: false }))} /> 아니오
            </label>
          </div>
        </div>

        <div className="product-update-field">
          <label>대표 이미지</label>
          <input type="file" onChange={handleMainImageChange} accept="image/*" />
          {mainImagePreview && <img src={mainImagePreview} alt="미리보기" className="image-preview" />}
        </div>

        <div className="product-update-field">
          <label>상세 이미지</label>
          <input type="file" multiple onChange={handleAdditionalImageChange} accept="image/*" />
          <div className="image-preview-list">
            {imageList.map((item, i) => (
              <div
                key={i}
                className="preview-item"
                draggable
                onDragStart={(e) => handleDragStart(e, i)}
                onDrop={(e) => handleDropPreview(e, i)}
                onDragOver={(e) => e.preventDefault()}
              >
                <img src={item.isInitial ? `http://13.124.224.246:7778${item.url}` : item.url} alt="상세 이미지" />
                <button
                  type="button"
                  onClick={() => {
                    if (item.isInitial) {
                      const idx = initialAdditionalImages.indexOf(item.url);
                      removeInitialImage(idx);
                    } else {
                      removeAdditionalImage(item.index);
                    }
                  }}
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="product-update-field">
          <label>상품 설명</label>
          <textarea name="description" value={form.description} onChange={handleInputChange} required />
        </div>

        <button type="submit" className="product-update-button">수정</button>
      </form>
    </div>
  );
};

export default ProductUpdate;
