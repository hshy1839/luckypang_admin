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

    useEffect(() => {
        fetchProducts();
        // eslint-disable-next-line
    }, []);

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await axios.get('http://13.124.224.246:7778/api/products/allProduct', {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.success && Array.isArray(response.data.products)) {
                const sortedProducts = response.data.products.sort((a, b) => (
                    new Date(b.createdAt) - new Date(a.createdAt)
                ));
                setProducts(sortedProducts);
            }
        } catch (error) {
            console.error('상품 정보를 가져오는데 실패했습니다.', error);
        }
    };

    const handleSearch = async () => {
        if (!searchTerm) {
            fetchProducts();
            return;
        }
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await axios.get('http://13.124.224.246:7778/api/products/allProduct', {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.success && Array.isArray(response.data.products)) {
                let filteredProducts = response.data.products;
                filteredProducts = filteredProducts.filter((product) => {
                    if (searchCategory === 'all') {
                        return (
                            product.name.includes(searchTerm) ||
                            (product.category.includes(searchTerm) || product.category.sub?.includes(searchTerm))
                        );
                    } else if (searchCategory === 'name') {
                        return product.name.includes(searchTerm);
                    } else if (searchCategory === 'category') {
                        return (
                            product.category.includes(searchTerm) || product.category.sub?.includes(searchTerm)
                        );
                    }
                    return true;
                });
                setProducts(filteredProducts);
            }
        } catch (error) {
            console.error('상품 정보를 가져오는데 실패했습니다.', error);
        }
    };

    const getCategoryDisplay = (category) => category || 'Unknown Category';

    const handleProductClick = (id) => {
        navigate(`/products/productDetail/${id}`);
    };

    const indexOfLastProduct = currentPage * itemsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
    const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(products.length / itemsPerPage);

    // 👉 블록형 페이지네이션
    const pagesPerBlock = 10;
    const currentBlock = Math.floor((currentPage - 1) / pagesPerBlock);
    const startPage = currentBlock * pagesPerBlock + 1;
    const endPage = Math.min(startPage + pagesPerBlock - 1, totalPages);

    const handleBlockPrev = () => {
        if (startPage > 1) setCurrentPage(startPage - pagesPerBlock);
    };
    const handleBlockNext = () => {
        if (endPage < totalPages) setCurrentPage(endPage + 1);
    };

    const handleWriteClick = () => {
        navigate('/products/productCreate');
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('ko-KR', {
            style: 'decimal',
            maximumFractionDigits: 0,
        }).format(price);
    };

    return (
        <div className="products-container">
            <Header />
            <div className="products-content">
                <h1>상품 관리</h1>

                <div className="products-search-box">
                    <select
                        className="search-category"
                        value={searchCategory}
                        onChange={(e) => setSearchCategory(e.target.value)}
                    >
                        <option value="all">전체</option>
                        <option value="name">상품 이름</option>
                        <option value="category">박스종류</option>
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

                <table className="products-table">
                    <thead>
                        <tr>
                            <th>번호</th>
                            <th>상품 이름</th>
                            <th>박스종류</th>
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
                                    <td>{formatPrice(product.price || 0)} 원</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="no-results">
                                    데이터가 없습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                <div className="point-pagination">
                    <button
                        className="point-pagination-btn"
                        onClick={handleBlockPrev}
                        disabled={startPage === 1}
                    >
                        이전
                    </button>
                    {[...Array(endPage - startPage + 1)].map((_, idx) => {
                        const pageNum = startPage + idx;
                        return (
                            <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`point-pagination-btn${currentPage === pageNum ? ' active' : ''}`}
                            >
                                {pageNum}
                            </button>
                        );
                    })}
                    <button
                        className="point-pagination-btn"
                        onClick={handleBlockNext}
                        disabled={endPage === totalPages}
                    >
                        다음
                    </button>
                </div>

                <button className="excel-export-button" style={{marginTop: 40}} onClick={handleWriteClick}>
                    상품등록
                </button>
            </div>
        </div>
    );
};

export default Product;
