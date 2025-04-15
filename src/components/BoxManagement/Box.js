import React, { useState, useEffect } from 'react';
import '../../css/ProductManagement/Product.css';
import Header from '../Header.js';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Box = () => {
    const [boxes, setBoxes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchCategory, setSearchCategory] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const navigate = useNavigate();

    const fetchBoxes = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.log('로그인 정보가 없습니다.');
                return;
            }

            const response = await axios.get('http:///localhost:7778/api/box', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.success && Array.isArray(response.data.boxes)) {
                // 최근에 만든 박스이 맨 위에 오도록 날짜순으로 정렬
                const sortedBoxes = response.data.boxes.sort((a, b) => {
                    // createdAt 필드가 있다고 가정하고, 최신 박스이 먼저 오도록 정렬
                    return new Date(b.createdAt) - new Date(a.createdAt);
                });

                setBoxes(sortedBoxes);
            } else {
            }
        } catch (error) {
            console.error('박스 정보를 가져오는데 실패했습니다.', error);
        }
    };


    useEffect(() => {
        fetchBoxes();
    }, []);

    const handleSearch = async () => {
        if (searchTerm === '') {
            fetchBoxes();  // 검색어가 없으면 전체 제품을 다시 불러옵니다.
        } else {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.log('로그인 정보가 없습니다.');
                    return;
                }

                const response = await axios.get('http:///localhost:7778/api/box', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.data.success && Array.isArray(response.data.boxes)) {
                    let filteredBoxes = response.data.boxes;

                    // 검색 조건에 맞게 필터링
                    filteredBoxes = filteredBoxes.filter((box) => {
                        if (searchCategory === 'all') {
                            return (
                                box.name.includes(searchTerm) ||
                                (box.category.includes(searchTerm) || box.category.sub.includes(searchTerm))
                            );
                        } else if (searchCategory === 'name') {
                            return box.name.includes(searchTerm);
                        } else if (searchCategory === 'category') {
                            return (
                                box.category.includes(searchTerm) || box.category.sub.includes(searchTerm)
                            );
                        }
                        return true;
                    });

                    setBoxes(filteredBoxes); // 필터된 제품을 상태에 반영
                } else {
                    console.error('올바르지 않은 데이터 형식:', response.data);
                }
            } catch (error) {
                console.error('박스 정보를 가져오는데 실패했습니다.', error);
            }
        }
    };


    const getCategoryDisplay = (category) => {
        if (!category) return 'Unknown Category';
        return `${category}`;
    };

    const handleBoxClick = (id) => {
        navigate(`/box/boxDetail/${id}`);
    };

    const indexOfLastBox = currentPage * itemsPerPage;
    const indexOfFirstBox = indexOfLastBox - itemsPerPage;
    const currentBoxes = boxes.slice(indexOfFirstBox, indexOfLastBox);
    const totalPages = Math.ceil(boxes.length / itemsPerPage);

    const handlePreviousPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const calculateTotalStock = (box) => {
        let totalStock = 0;
        if (box.sizeStock) {
            Object.values(box.sizeStock).forEach(stock => {
                if (stock > 0) {
                    totalStock += stock;
                }
            });
        }
        return totalStock;
    };

    const handleWriteClick = () => {
        navigate('/box/create');
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
                    <h1>박스 관리</h1>
                    <div className="product-search-box">
                        <select
                            className="search-category"
                            value={searchCategory}
                            onChange={(e) => setSearchCategory(e.target.value)}
                        >
                            <option value="all">전체</option>
                            <option value="name">박스 이름</option>
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

                    <table className="product-table">
                        <thead>
                            <tr>
                                <th>번호</th>
                                <th>박스 이름</th>
                                <th>공개 여부</th>
                                <th>박스 종류</th>
                                <th>판매 시작</th>
                                <th>판매 종료</th>
                                <th>가격</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentBoxes.length > 0 ? (
                                currentBoxes.map((box, index) => (
                                    <tr key={box._id}>
                                        <td>{index + 1 + (currentPage - 1) * itemsPerPage}</td>
                                        <td
                                            onClick={() => handleBoxClick(box._id)}
                                            className='product-title'
                                        >
                                            {box.name || 'Unknown Product'}
                                        </td>
                                        <td>{box.isPublic ? '공개' : '비공개'}</td>
                                        <td>{box.type}</td>
                                        <td>{new Date(box.availableFrom).toLocaleDateString('ko-KR', {
                                            year: 'numeric',
                                            month: '2-digit',
                                            day: '2-digit',
                                        })}</td>

                                        <td>{new Date(box.availableUntil).toLocaleDateString('ko-KR', {
                                            year: 'numeric',
                                            month: '2-digit',
                                            day: '2-digit',
                                        })}</td>
                                        <td>{formatPrice(box.price || 0)} 원</td>
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
                        박스등록
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Box;
