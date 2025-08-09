import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../Header';
import '../../css/PromotionManagement/Promotion.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

const Promotion = () => {
    const [promotions, setPromotions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredPromotions, setFilteredPromotions] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const navigate = useNavigate();

    useEffect(() => {
        fetchPromotions();
    }, []);

    const fetchPromotions = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await axios.get('http://13.124.224.246:7778/api/promotion/read', {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.success && Array.isArray(response.data.promotions)) {
                const sortedPromotions = response.data.promotions.sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                );
                setPromotions(sortedPromotions);
                setFilteredPromotions(sortedPromotions);
            }
        } catch (error) {
            console.error('이벤트 정보를 가져오는데 실패했습니다.', error);
        }
    };

    const handleSearch = () => {
        if (!searchTerm) {
            setFilteredPromotions(promotions);
            setCurrentPage(1);
            return;
        }
        const results = promotions.filter(promotion =>
            promotion.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredPromotions(results);
        setCurrentPage(1);
    };

    const handlePromotionClick = (id) => {
        navigate(`/promotion/promotionDetail/${id}`);
    };

    const handleCreatePromotionClick = () => {
        navigate('/promotion/create');
    };

    const handleDelete = async (id) => {
        if (!window.confirm('이벤트을 삭제하시겠습니까?')) return;

        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await axios.delete(`http://13.124.224.246:7778/api/promotion/delete/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.success) {
                alert('이벤트이 삭제되었습니다.');
                fetchPromotions();
            }
        } catch (error) {
            console.error('이벤트 삭제 실패:', error);
        }
    };

    // 페이지네이션 블록
    const indexOfLastPromotion = currentPage * itemsPerPage;
    const indexOfFirstPromotion = indexOfLastPromotion - itemsPerPage;
    const currentPromotions = filteredPromotions.slice(indexOfFirstPromotion, indexOfLastPromotion);
    const totalPages = Math.ceil(filteredPromotions.length / itemsPerPage);

    // 블록형 페이지네이션 (10개씩)
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

    return (
        <div className="promotion-container">
            <Header />
            <div className="promotion-content">
                <h1>이벤트 관리</h1>
                <div className="promotion-search-box">
                    <input
                        type="text"
                        placeholder="이벤트 이름 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="search-button" onClick={handleSearch}>
                        검색
                    </button>
                </div>
                <table className="promotion-table">
                    <thead>
                        <tr>
                            <th>번호</th>
                            <th>이벤트 이름</th>
                            <th>생성 날짜</th>
                            <th>액션</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentPromotions.length > 0 ? (
                            currentPromotions.map((promotion, index) => (
                                <tr key={promotion._id}>
                                    <td>{index + 1 + (currentPage - 1) * itemsPerPage}</td>
                                    <td
                                        onClick={() => handlePromotionClick(promotion._id)}
                                        className='promotion-title'
                                    >
                                        {promotion.title || 'Unknown Promotion'}
                                    </td>
                                    <td>
                                        {promotion.createdAt
                                            ? new Date(promotion.createdAt).toLocaleDateString()
                                            : 'Unknown'}
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <FontAwesomeIcon
                                                icon={faTrash}
                                                onClick={() => handleDelete(promotion._id)}
                                                className="delete-btn-promotion"
                                                title="삭제"
                                            />
                                        </div>
                                    </td>
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
                <button className="excel-export-button" style={{marginTop: 40}} onClick={handleCreatePromotionClick}>
                    이벤트 등록
                </button>
            </div>
        </div>
    );
};

export default Promotion;
