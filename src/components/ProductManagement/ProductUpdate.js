import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import heic2any from "heic2any";
import '../../css/ProductManagement/ProductCreate.css';

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
        const response = await axios.get(`http://localhost:7778/api/products/Product/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data?.success) {
          const product = response.data.product;
          setForm(product);
          if (product.mainImage) {
            setMainImagePreview(`http://localhost:7778${product.mainImage}`);
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

    // 상태 재구성
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
        `http://localhost:7778/api/products/update/${id}`,
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
    <div className="product-create-container">
      <h2>상품 수정</h2>
      <form onSubmit={handleSubmit} className="product-create-form">

        <div className="product-create-field">
          <label>대표 이미지</label>
          <input type="file" onChange={handleMainImageChange} accept="image/*" />
          {mainImagePreview && <img src={mainImagePreview} alt="미리보기" className="image-preview" />}
        </div>

        <div className="product-create-field">
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
                <img src={item.isInitial ? `http://localhost:7778${item.url}` : item.url} alt="상세 이미지" />
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

        <div className="product-create-field">
          <label>상품 설명</label>
          <textarea name="description" value={form.description} onChange={handleInputChange} required />
        </div>

        <button type="submit" className="product-create-button">수정</button>
      </form>
    </div>
  );
};

export default ProductUpdate;
