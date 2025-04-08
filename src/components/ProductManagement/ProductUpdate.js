import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../Header';
import '../../css/ProductManagement/ProductUpdate.css';

const ProductUpdate = () => {
    const [product, setProduct] = useState(null);
    const [updatedProduct, setUpdatedProduct] = useState({
        name: '',
        category: '',
        price: 0,
        description: '',
        sizeStock: {} // 사이즈별 재고를 위한 객체
    });
    const { id } = useParams();
    const navigate = useNavigate();

    const categories = {
        "5,000원 박스": [],
        "10,000원 박스": []
    };

    useEffect(() => {
        const fetchProductDetail = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.log('로그인 정보가 없습니다.');
                    return;
                }

                const response = await axios.get(
                    `http://localhost:7778/api/products/Product/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.data && response.data.success) {
                    setProduct(response.data.product);
                    const { main, sub } = response.data.product.category;
                    setUpdatedProduct({
                        name: response.data.product.name,
                        category: response.data.product.category || '', // 문자열로 설정
                        price: response.data.product.price,
                        description: response.data.product.description,
                        sizeStock: response.data.product.sizeStock || {},
                    });
                } else {
                    console.log('상품 상세 데이터 로드 실패');
                }
            } catch (error) {
                console.error('상품 상세 정보를 가져오는데 실패했습니다.', error);
            }
        };

        fetchProductDetail();
    }, [id]);

    const handleCategoryChange = (e) => {
        const value = e.target.value;
        setUpdatedProduct(prev => ({
            ...prev,
            category: value
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('size')) {
            const size = name.split('_')[1];
            setUpdatedProduct(prev => ({
                ...prev,
                sizeStock: {
                    ...prev.sizeStock,
                    [size]: value
                }
            }));
        } else {
            setUpdatedProduct(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const confirmation = window.confirm('수정사항을 저장하시겠습니까?');
        if (!confirmation) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('로그인 정보가 없습니다.');
                return;
            }

            const response = await axios.put(
                `http://localhost:7778/api/products/update/${id}`,
                updatedProduct,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data && response.data.success) {
                alert('상품이 수정되었습니다.');
                navigate(`/products`);
            } else {
                alert('상품 수정에 실패했습니다.');
            }
        } catch (error) {
            console.error('상품 수정 중 오류가 발생했습니다.', error);
            alert('서버와의 연결에 문제가 발생했습니다. 다시 시도해주세요.');
        }
    };

    if (!product) {
        return <div>로딩 중...</div>;
    }

    return (
        <div className="product-update-container">
            <h2 className="product-update-title">상품 수정</h2>
            <form className="product-update-form" onSubmit={handleSave}>
                {/* Product Name */}
                <div className="product-update-field">
                    <label className="product-update-label" htmlFor="name">상품 이름</label>
                    <input
                        className="product-update-input"
                        type="text"
                        id="name"
                        name="name"
                        value={updatedProduct.name}
                        onChange={handleChange}
                        placeholder="상품 이름을 입력하세요"
                        required
                    />
                </div>

                <div className="product-update-field">
  <label className="product-update-label" htmlFor="price">가격</label>
  <input
    className="product-update-input"
    type="number"
    id="price"
    name="price"
    value={updatedProduct.price}
    onChange={handleChange}
    placeholder="상품 가격을 입력하세요"
    required
  />
</div>

                {/* Category */}
                <div className="product-update-field">
                    <label className="product-update-label" htmlFor="category">상위 카테고리</label>
                    <select
                        className="product-update-input"
                        id="category"
                        name="category"
                        value={updatedProduct.category}
                        onChange={handleCategoryChange}
                        required
                    >
                        <option value="">박스 종류를 선택하세요</option>
                        <option value="5,000원 박스">5,000원 박스</option>
                        <option value="10,000원 박스">10,000원 박스</option>
                    </select>
                </div>




                <div className="product-update-field">
                    <label className="product-update-label" htmlFor="description">상품 설명</label>
                    <textarea
                        className="product-update-input"
                        id="description"
                        name="description"
                        value={updatedProduct.description}
                        onChange={handleChange}
                        placeholder="상품 설명을 입력하세요"
                        rows="4"
                    />
                </div>

                <button type="submit" className="product-update-button">수정 저장</button>
            </form>
        </div>
    );
};

export default ProductUpdate;
