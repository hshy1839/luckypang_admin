import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../Header';
import '../../css/ProductManagement/ProductDetail.css';

const ProductDetail = () => {
  const [product, setProduct] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get(
          `http://localhost:7778/api/products/Product/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data && response.data.success) {
          setProduct(response.data.product);
        }
      } catch (error) {
        console.error('상품 상세 정보를 가져오는데 실패했습니다.', error);
      }
    };

    fetchProductDetail();
  }, [id]);

  const handleEdit = () => {
    navigate(`/products/productDetail/${id}/update`);
  };

  const handleDelete = async () => {
    if (!window.confirm('이 상품을 삭제하시겠습니까?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `http://localhost:7778/api/products/delete/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data && response.data.success) {
        alert('상품이 삭제되었습니다.');
        navigate('/products');
      } else {
        alert('상품 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('상품 삭제 중 오류가 발생했습니다.', error);
    }
  };

  if (!product) return <div>로딩 중...</div>;

  return (
    <div className="product-detail-container">
      <Header />
      <h1>상품 정보</h1>
      <div className="product-detail-content">
        <div className="product-info">
          <p><strong>상품번호:</strong> {product.productNumber}</p>
          <p><strong>상품명:</strong> {product.name}</p>
          <p><strong>브랜드:</strong> {product.brand || '-'}</p>
          <p><strong>카테고리:</strong> {product.category}</p>
          <p><strong>노출 여부:</strong> {product.isVisible ? '노출' : '비노출'}</p>
          <p><strong>상태 상세:</strong> {product.statusDetail}</p>
          <p><strong>확률:</strong> {product.probability}</p>

          <div>
            <strong>대표 이미지:</strong><br />
            {product.mainImage && <img src={`http://localhost:7778${product.mainImage}`} alt="대표 이미지" style={{ width: '200px' }} />}
          </div>

          <div>
            <strong>상세 이미지:</strong>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {product.additionalImages?.map((url, idx) => (
                <img key={idx} src={`http://localhost:7778${url}`} alt={`상세 ${idx}`} style={{ width: '150px' }} />
              ))}
            </div>
          </div>

          <p><strong>소비자가:</strong> {product.consumerPrice?.toLocaleString()} 원</p>
          <p><strong>실구매가:</strong> {product.price?.toLocaleString()} 원</p>
          <p><strong>배송비:</strong> {product.shippingFee?.toLocaleString()} 원</p>
          <p><strong>총 결제금액:</strong> {product.totalPrice?.toLocaleString() || '자동 계산 예정'} 원</p>

          <p><strong>배송 정보:</strong> {product.shippingInfo}</p>
          <p><strong>상품 설명:</strong> {product.description}</p>
          <p><strong>발주처 링크:</strong> <a href={product.sourceLink} target="_blank" rel="noopener noreferrer">{product.sourceLink}</a></p>

          <p><strong>발주처 품절 여부:</strong> {product.isSourceSoldOut ? '품절' : '정상'}</p>
          <p><strong>등록일:</strong> {new Date(product.createdAt).toLocaleString()}</p>

          <div className="button-container">
            <button className="edit-button" onClick={handleEdit}>수정</button>
            <button className="delete-button" onClick={handleDelete}>삭제</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
