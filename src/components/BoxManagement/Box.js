// src/components/Box/Box.js
import React, { useState, useEffect } from 'react';
import '../../css/BoxManagement/Box.css';
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

    useEffect(() => {
        fetchBoxes();
    }, []);

    const fetchBoxes = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const response = await axios.get('http://localhost:7778/api/box', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.data.success && Array.isArray(response.data.boxes)) {
                const sorted = response.data.boxes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setBoxes(sorted);
            }
        } catch (error) {
            console.error('박스 정보를 가져오는데 실패했습니다.', error);
        }
    };

    const handleSearch = () => {
        if (!searchTerm) {
            fetchBoxes();
            return;
        }
        axios.get('http://localhost:7778/api/box', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }).then(response => {
            if (response.data.success && Array.isArray(response.data.boxes)) {
                let filtered = response.data.boxes;
                filtered = filtered.filter((box) => {
                    if (searchCategory === 'all') {
                        return (
                            box.name.includes(searchTerm) ||
                            box.category?.includes(searchTerm) ||
                            box.category?.sub?.includes(searchTerm)
                        );
                    } else if (searchCategory === 'name') {
                        return box.name.includes(searchTerm);
                    } else if (searchCategory === 'category') {
                        return (
                            box.category?.includes(searchTerm) ||
                            box.category?.sub?.includes(searchTerm)
                        );
                    }
                    return true;
                });
                setBoxes(filtered);
                setCurrentPage(1);
            }
        });
    };

    // 페이지네이션 블록
    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentBoxes = boxes.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(boxes.length / itemsPerPage);
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

    const handleBoxClick = (id) => navigate(`/box/boxDetail/${id}`);
    const handleWriteClick = () => navigate('/box/create');
    const formatPrice = (price) => new Intl.NumberFormat('ko-KR').format(price);

    return (
        <div className="boxes-container">
            <Header />
            <div className="boxes-content">
                <h1>박스 관리</h1>
                <div className="boxes-search-box">
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
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    />
                    <button className="search-button" onClick={handleSearch}>
                        검색
                    </button>
                </div>

                <table className="boxes-table">
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
                                        {box.name || '-'}
                                    </td>
                                    <td>{box.isPublic ? '공개' : '비공개'}</td>
                                    <td>{box.type || '-'}</td>
                                    <td>
                                        {box.availableFrom
                                            ? new Date(box.availableFrom).toLocaleDateString('ko-KR', {
                                                year: 'numeric', month: '2-digit', day: '2-digit'
                                            })
                                            : '-'}
                                    </td>
                                    <td>
                                        {box.availableUntil
                                            ? new Date(box.availableUntil).toLocaleDateString('ko-KR', {
                                                year: 'numeric', month: '2-digit', day: '2-digit'
                                            })
                                            : '-'}
                                    </td>
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
                    박스등록
                </button>
            </div>
        </div>
    );
};

export default Box;
