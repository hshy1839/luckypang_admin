import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../Header';
import '../../css/ProductManagement/ProductDetail.css'; // 스타일 시트 경로 수정

const ProductDetail = () => {
    const [product, setProduct] = useState(null); // 상품 상세 정보 상태
    const { id } = useParams(); // URL에서 상품 ID를 가져옴
    const navigate = useNavigate(); // 페이지 이동을 위한 useNavigate 훅

    useEffect(() => {
        const fetchProductDetail = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.log('로그인 정보가 없습니다.');
                    return;
                }

                const response = await axios.get(
                    `http://3.36.74.8:8865/api/products/Product/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.data && response.data.success) {
                    setProduct(response.data.product);
                } else {
                    console.log('상품 상세 데이터 로드 실패');
                }
            } catch (error) {
                console.error('상품 상세 정보를 가져오는데 실패했습니다.', error);
            }
        };

        fetchProductDetail();
    }, [id]);

    // 수정 버튼 클릭 핸들러
    const handleEdit = () => {
        navigate(`/products/productDetail/${id}/update`); // 수정 페이지로 이동
    };

    // 삭제 버튼 클릭 핸들러
    const handleDelete = async () => {
        const confirmation = window.confirm('이 상품을 삭제하시겠습니까?');
        if (!confirmation) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.log('로그인 정보가 없습니다.');
                return;
            }

            const response = await axios.delete(
                `http://3.36.74.8:8865/api/products/delete/${id}`, // URL 수정
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data && response.data.success) {
                alert('상품이 삭제되었습니다.');
                navigate('/products'); // 상품 목록 페이지로 리디렉션
            } else {
                alert('상품 삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('상품 삭제 중 오류가 발생했습니다.', error);
        }
    };

    if (!product) {
        return <div>로딩 중...</div>;
    }

    return (
        <div className="product-detail-container">
            <Header />
            <h1>상품 정보</h1>
            <div className="product-detail-content">
                <div className="product-info">
                    <h1 className="product-name">상품명: {product.name}</h1>

                    {/* 카테고리 상위 및 하위 표시 */}
                    <p className="product-category">
                        <strong>카테고리:</strong> {product.category.main} &gt; {product.category.sub}
                    </p>

                    <p className="product-price">
                        <strong>가격:</strong> {product.price.toLocaleString()} 원
                    </p>

                    {/* 사이즈별 재고 */}
                    {/* <div className="product-stock">
                        <strong>사이즈별 재고</strong>
                        <ul>
                            {product.sizeStock
                                ? Object.entries(product.sizeStock)
                                      .filter(([_, stock]) => stock > 0) // 재고가 0보다 큰 항목만 표시
                                      .map(([size, stock]) => (
                                          <li key={size} className="stock-item">
                                              <span className="stock-size">{size}</span>:{" "}
                                              <span className="stock-quantity">{stock}개</span>
                                          </li>
                                      ))
                                : <span>재고 정보 없음</span>}
                        </ul>
                    </div> */}

                    <p className="product-description">
                        <strong>상세 설명:</strong> {product.description}
                    </p>

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
