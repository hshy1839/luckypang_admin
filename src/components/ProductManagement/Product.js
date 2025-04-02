import React, { useState, useEffect } from 'react';
import '../../css/ProductManagement/Product.css';
import Header from '../Header.js';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Product = () => {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchCategory, setSearchCategory] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const navigate = useNavigate();

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.log('로그인 정보가 없습니다.');
                return;
            }

            const response = await axios.get('http:///3.36.74.8:8865/api/products/allProduct', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.success && Array.isArray(response.data.products)) {
                // 최근에 만든 상품이 맨 위에 오도록 날짜순으로 정렬
                const sortedProducts = response.data.products.sort((a, b) => {
                    // createdAt 필드가 있다고 가정하고, 최신 상품이 먼저 오도록 정렬
                    return new Date(b.createdAt) - new Date(a.createdAt);
                });

                setProducts(sortedProducts);
            } else {
            }
        } catch (error) {
            console.error('상품 정보를 가져오는데 실패했습니다.', error);
        }
    };


    useEffect(() => {
        fetchProducts();
    }, []);

    const handleSearch = async () => {
        if (searchTerm === '') {
            fetchProducts();  // 검색어가 없으면 전체 제품을 다시 불러옵니다.
        } else {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.log('로그인 정보가 없습니다.');
                    return;
                }

                const response = await axios.get('http:///3.36.74.8:8865/api/products/allProduct', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.data.success && Array.isArray(response.data.products)) {
                    let filteredProducts = response.data.products;

                    // 검색 조건에 맞게 필터링
                    filteredProducts = filteredProducts.filter((product) => {
                        if (searchCategory === 'all') {
                            return (
                                product.name.includes(searchTerm) ||
                                (product.category.main.includes(searchTerm) || product.category.sub.includes(searchTerm))
                            );
                        } else if (searchCategory === 'name') {
                            return product.name.includes(searchTerm);
                        } else if (searchCategory === 'category') {
                            return (
                                product.category.main.includes(searchTerm) || product.category.sub.includes(searchTerm)
                            );
                        }
                        return true;
                    });

                    setProducts(filteredProducts); // 필터된 제품을 상태에 반영
                } else {
                    console.error('올바르지 않은 데이터 형식:', response.data);
                }
            } catch (error) {
                console.error('상품 정보를 가져오는데 실패했습니다.', error);
            }
        }
    };


    const getCategoryDisplay = (category) => {
        if (!category) return 'Unknown Category';
        return `${category.main} > ${category.sub}`;
    };

    const handleProductClick = (id) => {
        navigate(`/products/productDetail/${id}`);
    };

    const indexOfLastProduct = currentPage * itemsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
    const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(products.length / itemsPerPage);

    const handlePreviousPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const calculateTotalStock = (product) => {
        let totalStock = 0;
        if (product.sizeStock) {
            Object.values(product.sizeStock).forEach(stock => {
                if (stock > 0) {
                    totalStock += stock;
                }
            });
        }
        return totalStock;
    };

    const handleWriteClick = () => {
        navigate('/products/productCreate');
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('ko-KR', {
            style: 'decimal', // 'currency'로 변경하고 currency: 'KRW' 추가 가능
            maximumFractionDigits: 0, // 소수점 이하 자릿수
        }).format(price);
    };
    

    return (
        <div className="product-management-container">
            <Header />
            <div className="product-management-container-container">
                <div className="product-top-container-container">
                    <h1>상품 관리</h1>
                    <div className="product-search-box">
                        <select
                            className="search-category"
                            value={searchCategory}
                            onChange={(e) => setSearchCategory(e.target.value)}
                        >
                            <option value="all">전체</option>
                            <option value="name">상품 이름</option>
                            <option value="category">카테고리</option>
                        </select>
                        <input
                            type="text"
                            placeholder="검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="search-button" onClick={handleSearch}>
                            검색
                        </button>
                    </div>

                    <table className="product-table">
                        <thead>
                            <tr>
                                <th>번호</th>
                                <th>상품 이름</th>
                                <th>카테고리</th>
                                {/* <th>사이즈</th> */}
                                {/* <th>총 재고</th> */}
                                <th>가격</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentProducts.length > 0 ? (
                                currentProducts.map((product, index) => (
                                    <tr key={product._id}>
                                        <td>{index + 1 + (currentPage - 1) * itemsPerPage}</td>
                                        <td
                                            onClick={() => handleProductClick(product._id)}
                                            className='product-title'
                                        >
                                            {product.name || 'Unknown Product'}
                                        </td>
                                        <td>{getCategoryDisplay(product.category)}</td>

                                        {/* <td>
                                            {product.sizeStock ? (
                                                <div className="size-stock">
                                                    {Object.keys(product.sizeStock).map((size) => (
                                                        product.sizeStock[size] > 0 && (
                                                            <div key={size} className="size-item">
                                                                {size}
                                                            </div>
                                                        )
                                                    ))}
                                                </div>
                                            ) : (
                                                'Unknown Size'
                                            )}
                                        </td>
                                        <td>{calculateTotalStock(product)}</td> */}
                                        <td>{formatPrice(product.price || 0)} 원</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="no-results">
                                        데이터가 없습니다.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    <div className="pagination">
                        <button className='prev-page-btn' onClick={handlePreviousPage} disabled={currentPage === 1}>
                            이전
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => handlePageChange(i + 1)}
                                className={currentPage === i + 1 ? 'active' : ''}
                                id='page-number-btn'
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button className="next-page-btn" onClick={handleNextPage} disabled={currentPage === totalPages}>
                            다음
                        </button>
                    </div>
                </div>
                <div className="write-btn-container">
                    <button className="write-btn" onClick={handleWriteClick}>
                        상품등록
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Product;
