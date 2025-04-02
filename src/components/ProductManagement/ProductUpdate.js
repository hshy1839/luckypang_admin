import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../Header';
import '../../css/ProductManagement/ProductUpdate.css';

const ProductUpdate = () => {
    const [product, setProduct] = useState(null);
    const [updatedProduct, setUpdatedProduct] = useState({
        name: '',
        category: {
            main: '', // 상위 카테고리
            sub: ''   // 하위 카테고리
        },
        price: 0,
        description: '',
        sizeStock: {} // 사이즈별 재고를 위한 객체
    });
    const { id } = useParams();
    const navigate = useNavigate();

    const categories = {
        "일반의류": ["남성의류", "여성의류", "지갑", "가방", "신발", "기타"],
        "골프의류": ["남성골프", "여성골프", "골프가방", "골프신발", "골프기타"]
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
                    `http://3.36.74.8:8865/api/products/Product/${id}`,
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
                        category: { main, sub },
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
        const { name, value } = e.target;
        if (name === 'category-main') {
            setUpdatedProduct(prev => ({
                ...prev,
                category: {
                    main: value,
                    sub: '' // 상위 카테고리가 변경되면 하위 카테고리 초기화
                }
            }));
        } else {
            setUpdatedProduct(prev => ({
                ...prev,
                category: {
                    ...prev.category,
                    sub: value
                }
            }));
        }
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
                `http://3.36.74.8:8865/api/products/update/${id}`,
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

                {/* Category */}
                <div className="product-update-field">
                    <label className="product-update-label" htmlFor="category">상위 카테고리</label>
                    <select
                        className="product-update-input"
                        id="category-main"
                        name="category-main"
                        value={updatedProduct.category.main}
                        onChange={handleCategoryChange}
                        required
                    >
                        <option value="">상위 카테고리를 선택하세요</option>
                        {Object.keys(categories).map(category => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Subcategory */}
                <div className="product-update-field">
                    <label className="product-update-label" htmlFor="subCategory">하위 카테고리</label>
                    <select
                        className="product-update-input"
                        id="category-sub"
                        name="category-sub"
                        value={updatedProduct.category.sub}
                        onChange={handleCategoryChange}
                        required
                        disabled={!updatedProduct.category.main}
                    >
                        <option value="">하위 카테고리를 선택하세요</option>
                        {updatedProduct.category.main &&
                            categories[updatedProduct.category.main].map(subCategory => (
                                <option key={subCategory} value={subCategory}>
                                    {subCategory}
                                </option>
                            ))}
                    </select>
                </div>

                {/* Size Stock */}
                {/* <div className="product-update-field">
                    <label className="product-update-label">사이즈별 재고</label>
                    {updatedProduct.category.sub === "신발" ? (
                        <div className="product-update-size-range">
                            {Array.from({ length: 21 }, (_, i) => 200 + i * 5).map(size => (
                                <div key={size} className="product-update-size-field">
                                    <label className="product-update-size-label">{size} mm</label>
                                    <input
                                        className="product-update-input"
                                        type="number"
                                        name={`size_${size}`}
                                        value={updatedProduct.sizeStock[size] || ''}
                                        onChange={handleChange}
                                        placeholder={`${size}mm 재고`}
                                        min="0"
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        ['S', 'M', 'L', 'XL', 'free'].map(size => (
                            <div key={size} className="product-update-size-field">
                                <label className="product-update-size-label">{size} 사이즈</label>
                                <input
                                    className="product-update-input"
                                    type="number"
                                    name={`size_${size}`}
                                    value={updatedProduct.sizeStock[size] || ''}
                                    onChange={handleChange}
                                    placeholder={`${size} 사이즈의 재고 수량`}
                                />
                            </div>
                        ))
                    )}
                </div> */}

                {/* Description */}
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
