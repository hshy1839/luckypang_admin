// src/components/ProductManagement/ProductDetail.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../Header';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import '../../css/ProductManagement/ProductDetail.css';

// ✅ 고정 URL (CRA + 로컬 개발)
const API_BASE = 'https://luckytang-server.onrender.com';

// key가 오면 /media/{key} 로 보여주기 (백엔드 프록시 필요)
function resolveImageSrc(value) {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value; // presigned or absolute URL
  return `${API_BASE.replace(/\/$/, '')}/media/${value}`; // 백엔드 프록시(/media/*)
}

const ProductDetail = () => {
  const [product, setProduct] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const resp = await axios.get(
          `${API_BASE}/api/products/Product/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (resp.data?.success) {
          setProduct(resp.data.product);
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
      const resp = await axios.delete(
        `${API_BASE}/api/products/delete/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (resp.data?.success) {
        alert('상품이 삭제되었습니다.');
        navigate('/products');
      } else {
        alert('상품 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('상품 삭제 중 오류가 발생했습니다.', error);
    }
  };

  const handleExportToExcel = () => {
    if (!product) return;

    const data = [
      {
        상품번호: product.productNumber,
        상품명: product.name,
        브랜드: product.brand,
        카테고리: product.category,
        '노출 여부': product.isVisible ? '노출' : '비노출',
        '상태 상세': product.statusDetail,
        확률: product.probability,
        소비자가: product.consumerPrice,
        실구매가: product.price,
        배송비: product.shippingFee,
        총결제금액: product.totalPrice,
        상품설명: product.description,
        '발주처 링크': product.sourceLink,
        '발주처 품절 여부': product.isSourceSoldOut ? '품절' : '정상',
        등록일: new Date(product.createdAt).toLocaleString(),
      }
    ];

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ProductDetail');

    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const file = new Blob([buf], { type: 'application/octet-stream' });
    saveAs(file, `상품_${product.name}_상세정보.xlsx`);
  };

  if (!product) return <div>로딩 중...</div>;

  // ✅ 프리사인 URL 우선, 없으면 key→/media/{key}
  const mainImageSrc =
    product.mainImageUrl || resolveImageSrc(product.mainImage);

  const additionalSrcs =
    (product.additionalImageUrls?.length
      ? product.additionalImageUrls
      : (product.additionalImages || []).map(k => resolveImageSrc(k)));

  return (
    <div className="product-detail-container">
      <Header />
      <h1 className="product-name">상품 정보</h1>
      <div className="product-detail-content">
        <table className="product-detail-table">
          <tbody>
            <tr><th>상품번호</th><td>{product.productNumber}</td></tr>
            <tr><th>상품명</th><td>{product.name}</td></tr>
            <tr><th>브랜드</th><td>{product.brand || '-'}</td></tr>
            <tr><th>카테고리</th><td>{product.category}</td></tr>
            <tr><th>노출 여부</th><td>{product.isVisible ? '노출' : '비노출'}</td></tr>
            <tr><th>상태 상세</th><td>{product.statusDetail}</td></tr>
            <tr><th>확률</th><td>{product.probability} %</td></tr>

            <tr>
              <th>대표 이미지</th>
              <td>
                {mainImageSrc
                  ? <img src={mainImageSrc} alt="대표 이미지" style={{ width: '200px' }} />
                  : <span>-</span>}
              </td>
            </tr>

            <tr>
              <th>상세 이미지</th>
              <td>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {additionalSrcs.length > 0
                    ? additionalSrcs.map((src, idx) => (
                        <img key={idx} src={src} alt={`상세 ${idx}`} style={{ width: '150px' }} />
                      ))
                    : <span>-</span>}
                </div>
              </td>
            </tr>

            <tr><th>소비자가</th><td>{product.consumerPrice?.toLocaleString()} 원</td></tr>
            <tr><th>실구매가</th><td>{product.price?.toLocaleString()} 원</td></tr>
            <tr><th>배송비</th><td>{product.shippingFee?.toLocaleString()} 원</td></tr>
            <tr><th>상품 설명</th><td>{product.description}</td></tr>
            <tr><th>발주처 링크</th><td><a href={product.sourceLink} target="_blank" rel="noopener noreferrer">{product.sourceLink}</a></td></tr>
            <tr><th>발주처 품절 여부</th><td>{product.isSourceSoldOut ? '품절' : '정상'}</td></tr>
            <tr><th>등록일</th><td>{new Date(product.createdAt).toLocaleString()}</td></tr>
          </tbody>
        </table>

        <div className="button-container">
          <button className="edit-button" onClick={handleEdit}>수정</button>
          <button className="delete-button" onClick={handleDelete}>삭제</button>
          <button className="export-button" onClick={handleExportToExcel}>엑셀로 저장</button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
