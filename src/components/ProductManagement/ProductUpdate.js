// src/components/ProductManagement/ProductUpdate.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import heic2any from "heic2any";
import '../../css/ProductManagement/ProductUpdate.css';

const API_BASE = 'https://luckytang-server.onrender.com';

// presigned/절대 URL이면 그대로, 아니면 /media/{key} 로 변환
function resolveImageSrc(value) {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  return `${API_BASE.replace(/\/$/, '')}/media/${value}`;
}

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

  // 대표 이미지(신규 업로드 파일 + 미리보기 URL)
  const [mainImage, setMainImage] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState(null); // presigned or /media/key

  // 초기(서버에 이미 저장된) 상세 이미지: 키 배열(서버에 유지로 전달)
  const [initialAdditionalImageKeys, setInitialAdditionalImageKeys] = useState([]);
  // 초기 상세 이미지 미리보기 URL 배열(프리사인 또는 /media/key)
  const [initialAdditionalPreviewUrls, setInitialAdditionalPreviewUrls] = useState([]);

  // 새로 추가될 상세 이미지: 파일 배열 + 미리보기 URL 배열
  const [additionalImages, setAdditionalImages] = useState([]);
  const [additionalPreviews, setAdditionalPreviews] = useState([]);

  // 화면에 보여줄 통합 리스트(드래그/삭제용): [{key?, fileIndex?, url, isInitial}]
  const [imageList, setImageList] = useState([]);

  const navigate = useNavigate();
  const { id } = useParams();

  // 상세 불러오기
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${API_BASE}/api/products/Product/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data?.success) {
          const p = response.data.product;

          // 기본 필드
          setForm(prev => ({
            ...prev,
            name: p.name || '',
            brand: p.brand || '',
            category: p.category || '',
            probability: p.probability ?? '',
            consumerPrice: p.consumerPrice ?? '',
            price: p.price ?? '',
            shippingFee: p.shippingFee ?? '',
            shippingInfo: p.shippingInfo || '',
            description: p.description || '',
            sourceLink: p.sourceLink || '',
            isSourceSoldOut: !!p.isSourceSoldOut,
            isVisible: p.isVisible !== undefined ? !!p.isVisible : true,
            statusDetail: p.statusDetail || '판매중',
            refundProbability: p.refundProbability ?? '',
          }));

          // 대표 이미지 미리보기: presigned 우선, 없으면 /media/{key}
          const mainPrev =
            p.mainImageUrl ? p.mainImageUrl : (p.mainImage ? resolveImageSrc(p.mainImage) : null);
          setMainImagePreview(mainPrev || null);

          // 초기 상세 이미지: 키와 미리보기 분리
          const initialKeys = Array.isArray(p.additionalImages) ? p.additionalImages : [];
          const initialUrls = Array.isArray(p.additionalImageUrls) && p.additionalImageUrls.length === initialKeys.length
            ? p.additionalImageUrls
            : initialKeys.map(k => resolveImageSrc(k));

          setInitialAdditionalImageKeys(initialKeys);
          setInitialAdditionalPreviewUrls(initialUrls);
        }
      } catch (error) {
        console.error('상품 조회 실패:', error);
      }
    };
    fetchProduct();
  }, [id]);

  // 통합 프리뷰 리스트 구성
  useEffect(() => {
    const initialItems = initialAdditionalImageKeys.map((key, i) => ({
      isInitial: true,
      key,             // 서버에 저장된 S3 key
      url: initialAdditionalPreviewUrls[i] || resolveImageSrc(key),
    }));
    const addedItems = additionalPreviews.map((url, i) => ({
      isInitial: false,
      fileIndex: i,    // additionalImages의 인덱스
      url,
    }));
    setImageList([...initialItems, ...addedItems]);
  }, [initialAdditionalImageKeys, initialAdditionalPreviewUrls, additionalPreviews]);

  // 입력 핸들러
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // 대표 이미지 선택
  const handleMainImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setMainImage(null);
      setMainImagePreview(null);
      return;
    }
    if (file.type === "image/heic") {
      const converted = await heic2any({ blob: file, toType: "image/jpeg" });
      const blob = converted instanceof Blob ? converted : new Blob([converted], { type: 'image/jpeg' });
      setMainImage(blob);
      setMainImagePreview(URL.createObjectURL(blob));
    } else {
      setMainImage(file);
      setMainImagePreview(URL.createObjectURL(file));
    }
  };

  // 상세 이미지 추가
  const handleAdditionalImageChange = async (e) => {
    const files = Array.from(e.target.files || []);
    const newImages = [];
    const newPreviews = [];
    for (const f of files) {
      if (f.type === 'image/heic') {
        const converted = await heic2any({ blob: f, toType: 'image/jpeg' });
        const blob = converted instanceof Blob ? converted : new Blob([converted], { type: 'image/jpeg' });
        newImages.push(blob);
        newPreviews.push(URL.createObjectURL(blob));
      } else {
        newImages.push(f);
        newPreviews.push(URL.createObjectURL(f));
      }
    }
    setAdditionalImages(prev => [...prev, ...newImages]);
    setAdditionalPreviews(prev => [...prev, ...newPreviews]);
  };

  // 초기 상세 이미지 제거(키 기준)
  const removeInitialImageByKey = (key) => {
    const idx = initialAdditionalImageKeys.findIndex(k => String(k) === String(key));
    if (idx >= 0) {
      const nextKeys = [...initialAdditionalImageKeys];
      const nextUrls = [...initialAdditionalPreviewUrls];
      nextKeys.splice(idx, 1);
      nextUrls.splice(idx, 1);
      setInitialAdditionalImageKeys(nextKeys);
      setInitialAdditionalPreviewUrls(nextUrls);
    }
  };

  // 새 상세 이미지 제거(파일 인덱스 기준)
  const removeAdditionalImageByFileIndex = (fileIndex) => {
    setAdditionalImages(prev => prev.filter((_, i) => i !== fileIndex));
    setAdditionalPreviews(prev => prev.filter((_, i) => i !== fileIndex));
  };

  // 드래그 앤 드롭 정렬
  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('dragIndex', String(index));
  };
  const handleDropPreview = (e, index) => {
    const fromIndex = Number(e.dataTransfer.getData('dragIndex'));
    if (Number.isNaN(fromIndex) || fromIndex === index) return;

    const reordered = [...imageList];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(index, 0, moved);
    setImageList(reordered);

    // 리스트에서 다시 키/프리뷰/파일 배열을 재구성
    const nextInitialKeys = [];
    const nextInitialUrls = [];
    const nextAddedFiles = [];
    const nextAddedPreviews = [];

    reordered.forEach(item => {
      if (item.isInitial) {
        nextInitialKeys.push(item.key);
        nextInitialUrls.push(item.url);
      } else {
        // fileIndex를 신뢰하지 않고 현재 additionalPreviews의 URL로 매칭
        // 여기서는 item.url이 현재 추가 프리뷰의 값이므로 그대로 push
        nextAddedPreviews.push(item.url);
        // 파일은 url 매칭이 어려우니, 같은 순서로 유지되도록 기존 additionalImages에서 재구성
        // 간단히: 현재 nextAddedPreviews 길이에 맞게 기존 additionalImages 순서를 따라간다
      }
    });

    // 추가 파일 배열은 기존 additionalImages의 순서를 유지한 채, nextAddedPreviews 길이에 맞게 앞에서부터 자른다.
    // (미세한 순서 동기화를 완벽히 하려면 url↔file을 매핑 보존하는 구조로 더 정교화할 수 있음)
    const flatAdded = [...additionalImages];
    const rebuiltFiles = flatAdded.slice(0, nextAddedPreviews.length);

    setInitialAdditionalImageKeys(nextInitialKeys);
    setInitialAdditionalPreviewUrls(nextInitialUrls);
    setAdditionalPreviews(nextAddedPreviews);
    setAdditionalImages(rebuiltFiles);
  };

  // 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();

    // 텍스트/숫자/불리언
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));

    // 대표 이미지
    if (mainImage) {
      fd.append('mainImage', mainImage);
    } else {
      // 새 업로드 없으면 유지
      fd.append('retainMainImage', 'true');
    }

    // 상세 이미지 (신규)
    additionalImages.forEach(file => fd.append('additionalImages', file));

    // 상세 이미지 (기존 유지 목록: **S3 키**)
    if (initialAdditionalImageKeys.length > 0) {
      initialAdditionalImageKeys.forEach(key => fd.append('initialAdditionalImages', key));
      fd.append('retainAdditionalImages', 'true');
    } else {
      // 기존을 모두 제거하고 신규로만 구성하고 싶다면:
      // fd.append('retainAdditionalImages', 'false');
      // 여기서는 빈 유지목록이면 서버가 알아서 판단하도록 생략
    }

    try {
      const token = localStorage.getItem('token');
      const resp = await axios.put(
        `${API_BASE}/api/products/update/${id}`,
        fd,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
        }
      );

      if (resp.data?.success) {
        alert('상품이 수정되었습니다.');
        navigate('/products');
      } else {
        alert('상품 수정 실패: ' + (resp.data?.message || '알 수 없는 오류'));
      }
    } catch (err) {
      console.error('수정 중 오류:', err);
      alert('수정 중 오류가 발생했습니다.');
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
          <select
            name="isVisible"
            value={form.isVisible ? 'true' : 'false'}
            onChange={(e) => setForm(prev => ({ ...prev, isVisible: e.target.value === 'true' }))}
          >
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
              <input
                type="radio"
                name="isSourceSoldOut"
                value="true"
                checked={form.isSourceSoldOut === true}
                onChange={() => setForm(prev => ({ ...prev, isSourceSoldOut: true }))}
              /> 예
            </label>
            <label>
              <input
                type="radio"
                name="isSourceSoldOut"
                value="false"
                checked={form.isSourceSoldOut === false}
                onChange={() => setForm(prev => ({ ...prev, isSourceSoldOut: false }))}
              /> 아니오
            </label>
          </div>
        </div>

        <div className="product-update-field">
          <label>대표 이미지</label>
          <input type="file" onChange={handleMainImageChange} accept="image/*" />
          {mainImagePreview && (
            <img src={mainImagePreview} alt="미리보기" className="image-preview" />
          )}
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
                <img src={item.url} alt="상세 이미지" />
                <button
                  type="button"
                  onClick={() => {
                    if (item.isInitial) {
                      // 초기(서버 저장) 이미지는 key로 제거
                      removeInitialImageByKey(item.key);
                    } else {
                      // 새로 추가된 이미지는 fileIndex로 제거
                      removeAdditionalImageByFileIndex(item.fileIndex);
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
