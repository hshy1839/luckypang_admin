import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import heic2any from "heic2any";
import '../../css/ProductManagement/ProductCreate.css';

const ProductCreate = () => {
  const [name, setName] = useState('');
  const [categoryMain, setCategoryMain] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // 대표 이미지 미리보기
const [imagePreviews, setImagePreviews] = useState([]); // 추가 이미지 미리보기
  const [price, setPrice] = useState('');
  const [brand, setBrand] = useState('');

  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);  // 추가 이미지 배열
  const navigate = useNavigate();

  const handleCategoryMainChange = (e) => {
    setCategoryMain(e.target.value);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // HEIC 파일인지 확인
      if (file.type === "image/heic") {
        try {
          const convertedBlob = await heic2any({
            blob: file,
            toType: "image/jpeg",
          });
          const previewUrl = URL.createObjectURL(convertedBlob);
          setImagePreview(previewUrl);
        } catch (error) {
          console.error("Error converting HEIC to JPEG:", error);
          alert("HEIC 이미지 변환 실패");
        }
      } else {
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
      }
      setImage(file);
    }
  };


  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    const convertedImages = [];
  
    for (const file of files) {
      if (file.type === "image/heic") {
        // HEIC 파일을 JPEG로 변환
        try {
          const convertedBlob = await heic2any({
            blob: file,
            toType: "image/jpeg",
          });
          convertedImages.push(convertedBlob);
          const previewUrl = URL.createObjectURL(convertedBlob);
          setImagePreviews(prev => [...prev, previewUrl]);
        } catch (error) {
          console.error("HEIC 파일 변환 에러:", error);
        }
      } else {
        convertedImages.push(file);
        const previewUrl = URL.createObjectURL(file);
        setImagePreviews(prev => [...prev, previewUrl]);
      }
    }
  
    // 상태에 변환된 이미지들 저장
    setImages(prev => [...prev, ...convertedImages]);
  };

  // 이미지 삭제 함수
  const handleImageDelete = (index) => {
    const updatedImages = images.filter((_, idx) => idx !== index);
    const updatedPreviews = imagePreviews.filter((_, idx) => idx !== index);
    setImages(updatedImages);
    setImagePreviews(updatedPreviews);
};

  
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 필수 필드 확인
    if (!name || !categoryMain || !price) {
        alert('모든 필드를 입력해주세요.');
        return;
    }

   

    const formData = new FormData();
    formData.append('name', name);
    formData.append('categoryMain', categoryMain);
    formData.append('price', price);
    formData.append('description', description);
    formData.append('brand', brand);


    if (image) {
        formData.append('mainImage', image); // mainImage에 파일 객체
    }

    images.forEach((img) => {
        formData.append('additionalImages', img); // 추가 이미지도 파일 객체
    });


    const token = localStorage.getItem('token');

    try {
        const response = await axios.post(
            'http://localhost:7778/api/products/productCreate',
            formData,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // 'Content-Type': 'multipart/form-data'는 생략
                },
            }
        );

        if (response.status === 200) {
            alert('상품이 성공적으로 등록되었습니다.');
            navigate('/products');
        } else {
            alert('상품 등록 실패: ' + response.data.message);
        }
    } catch (error) {
        console.error('상품 등록 실패:', error.message);
        alert('상품 등록 중 오류가 발생했습니다.');
    }
};


  
  
  return (
    <div className="product-create-container">
      <h2 className="product-create-title">상품 등록</h2>
      <form className="product-create-form" onSubmit={handleSubmit}>
        {/* Product Name */}
        <div className="product-create-field">
          <label className="product-create-label" htmlFor="name">상품 이름</label>
          <input
            className="product-create-input"
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="상품 이름을 입력하세요"
            required
          />
        </div>
        

        <div className="product-create-field">
  <label className="product-create-label" htmlFor="brand">브랜드명</label>
  <input
    className="product-create-input"
    type="text"
    id="brand"
    value={brand}
    onChange={(e) => setBrand(e.target.value)}
    placeholder="브랜드명을 입력하세요"
  />
</div>

        {/* Category */}
        <div className="product-create-field">
          <label className="product-create-label" htmlFor="categoryMain">카테고리</label>
          <select
            className="product-create-input"
            id="categoryMain"
            value={categoryMain}
            onChange={handleCategoryMainChange}
            required
          >
            <option value="">상품 박스를 선택하세요</option>
            <optgroup label="박스종류">
                <option value="5,000원 박스">5,000원 박스</option>
                <option value="10,000원 박스">10,000원 박스</option>
            </optgroup>
          </select>
        </div>

        

        {/* Main Image */}
        <div className="product-create-field">
          <label className="product-create-label" htmlFor="image">대표 이미지</label>
          <input
            className="product-create-input"
            type="file"
            id="image"
            onChange={handleImageChange}
            accept="image/*"
          />
          {image && <img src={imagePreview} alt="대표 이미지 미리보기" className="image-preview" />}
        </div>

        {/* Additional Images */}
    <div className="product-create-field">
    <label className="product-create-label" htmlFor="images">상세 이미지</label>
    <input
        className="product-create-input"
        type="file"
        id="images"
        onChange={handleFileUpload}
        accept="image/*"
        multiple
    />
    <div className="product-create-preview-images">
        {imagePreviews.map((previewUrl, index) => (
            <div key={index} className="product-create-image-item">
                <img 
                    src={previewUrl} 
                    alt={`상세 이미지 ${index + 1}`} 
                    className="description-image-preview" 
                />
                <button 
                    className="delete-image-button"
                    onClick={() => handleImageDelete(index)}
                >
                    x
                </button>
            </div>
        ))}
    </div>
</div>


        {/* Size Selection */}
        {/* <div className="product-create-field">
    <label className="product-create-label">사이즈</label>
    <div className="product-create-sizes">{renderSizeOptions()}</div>
  </div> */}

        {/* Price */}
        <div className="product-create-field">
          <label className="product-create-label" htmlFor="price">가격</label>
          <input
            className="product-create-input"
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="가격을 입력하세요"
            required
          />
        </div>

        {/* Product Description */}
        <div className="product-create-field">
          <label className="product-create-label" htmlFor="description">상품 설명</label>
          <textarea
            className="product-create-input"
            id="description"
            value={description}
            onChange={handleDescriptionChange}
            placeholder="상품 설명을 입력하세요"
            required
          />
        </div>

        <button type="submit" className="product-create-button">등록</button>
      </form>
    </div>
  );
};

export default ProductCreate;
