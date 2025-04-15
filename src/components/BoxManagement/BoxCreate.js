import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import heic2any from 'heic2any';
import '../../css/BoxManagement/BoxCreate.css';

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
  const [checkedProductIds, setCheckedProductIds] = useState([]);
  const [checkedSelectedProductIds, setCheckedSelectedProductIds] = useState([]);

  const [productSearch, setProductSearch] = useState('');
  const [searchType, setSearchType] = useState('name');
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

  const allChecked = selectedProducts.length > 0 && checkedSelectedProductIds.length === selectedProducts.length;

  const handleToggleAllSelectedProducts = () => {
    if (checkedSelectedProductIds.length === selectedProducts.length) {
      // 모두 체크된 상태면 해제
      setCheckedSelectedProductIds([]);
    } else {
      // 아니면 전체 선택
      const allIds = selectedProducts.map(item => item.product._id);
      setCheckedSelectedProductIds(allIds);
    }
  };

  const handleCheckSelectedProduct = (productId) => {
    setCheckedSelectedProductIds(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const allSearchChecked = searchResults.length > 0 && checkedProductIds.length === searchResults.length;

  const handleToggleAllSearchResults = () => {
    if (checkedProductIds.length === searchResults.length) {
      setCheckedProductIds([]);
    } else {
      const allIds = searchResults.map(p => p._id);
      setCheckedProductIds(allIds);
    }
  };

  
  const handleCheckProduct = (productId) => {
    setCheckedProductIds(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleAddCheckedProducts = () => {
    const toAdd = searchResults.filter(p =>
      checkedProductIds.includes(p._id) &&
      !selectedProducts.some(sel => sel.product._id === p._id)
    );
  
    const formatted = toAdd.map(p => ({
      product: p,
      probability: p.probability || 0,
    }));
  
    setSelectedProducts(prev => [...prev, ...formatted]);
    setCheckedProductIds([]); // 체크 초기화
  };

  const handleRemoveCheckedProducts = () => {
    const filtered = selectedProducts.filter(item => !checkedSelectedProductIds.includes(item.product._id));
    setSelectedProducts(filtered);
    setCheckedSelectedProductIds([]);
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
      const response = await axios.get(
        `http://localhost:7778/api/products/search?${searchType}=${productSearch}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success && Array.isArray(response.data.products)) {
        const products = response.data.products.map(p => ({
          ...p,
          probability: p.probability || 0
        }));
        setSearchResults(products);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error('검색 실패', err);
      setSearchResults([]);
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
    <div className="box-create-container">
      <h2>박스 등록</h2>
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

        <div className="box-create-field">
  <label>상품 검색</label>

  {/* 🔍 검색 입력 및 옵션 */}
  <div style={{ marginBottom: '8px' }}>
    <label>
      <input
        type="radio"
        value="name"
        checked={searchType === 'name'}
        onChange={(e) => setSearchType(e.target.value)}
      /> 이름
    </label>
    <label >
      <input
        type="radio"
        value="category"
        checked={searchType === 'category'}
        onChange={(e) => setSearchType(e.target.value)}
      /> 카테고리
    </label>
  </div>
<div className='box-create-search-container'>
  <input
  className='box-create-search-input'
    value={productSearch}
    onChange={(e) => setProductSearch(e.target.value)}
    placeholder="검색어 입력"
  />
  <button type="button" className='box-create-search-btn' onClick={searchProductByName}>검색</button>
  </div>
  {/* ✅ 전체 체크 박스 (리스트 바깥쪽) */}
  {searchResults.length > 0 && (
    <div style={{ margin: '16px 0 8px', fontWeight: 'bold' }}>
        <label>검색된 상품</label>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input
          type="checkbox"
          checked={checkedProductIds.length === searchResults.length}
          onChange={() => {
            if (checkedProductIds.length === searchResults.length) {
              setCheckedProductIds([]);
            } else {
              setCheckedProductIds(searchResults.map((p) => p._id));
            }
          }}
        />
        전체 선택
      </label>
    </div>
  )}

  {/* ✅ 검색 결과 목록 */}
  <div className="box-search-list">
    <ul style={{ listStyle: 'none', padding: 0, maxHeight: '300px', overflowY: 'auto' }}>
      {searchResults.map((p) => (
        <li key={p._id} style={{ marginBottom: '6px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={checkedProductIds.includes(p._id)}
              onChange={() => handleCheckProduct(p._id)}
            />
            <span>{p.name} / {p.category} / {p.probability}%</span>
          </label>
        </li>
      ))}
    </ul>

    {/* ✅ 추가 버튼 */}
    {checkedProductIds.length > 0 && (
      <button
        type="button"
        onClick={handleAddCheckedProducts}
        style={{
          marginTop: '15px',
          width: '20%',
          height: '20%',
          fontSize: '14px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        추가
      </button>
    )}
  </div>
</div>

<div className="box-create-field">
  <label>선택된 상품 및 확률</label>
  <div className="box-selected-list">
    <div style={{ marginBottom: '8px' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input
          type="checkbox"
          checked={allChecked}
          onChange={handleToggleAllSelectedProducts}
        />
        전체 선택
      </label>
    </div>

    <ul style={{ listStyle: 'none', padding: 0 }}>
      {selectedProducts.map((item, i) => {
        const { product, probability } = item;
        return (
          <li key={product._id} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              checked={checkedSelectedProductIds.includes(product._id)}
              onChange={() => handleCheckSelectedProduct(product._id)}
            />
            <span style={{ flex: 1 }}>
              {product.name} / {product.category} / {probability}%
            </span>
          </li>
        );
      })}
    </ul>

    {checkedSelectedProductIds.length > 0 && (
      <button
        type="button"
        onClick={handleRemoveCheckedProducts}
        style={{
            marginTop: '15px',
            width: '20%',
            height: '20%',
            fontSize: '14px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
        }}
      >
       삭제
      </button>
    )}
  </div>
</div>





        <button type="submit" className="box-create-button">등록</button>
      </form>
    </div>
  );
};

export default BoxCreate;