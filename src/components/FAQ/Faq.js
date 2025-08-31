import React, { useState, useEffect } from 'react';
import '../../css/FaqManagement/Faq.css'; // (아래 CSS 참고해서 확실히 최신으로 맞춰두세요)
import Header from '../Header.js';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Faq = () => {
    const [faqs, setFaqs] = useState([]);
    const [allFaqs, setAllFaqs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchCategory, setSearchCategory] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const response = await axios.get('https://luckytang-server.onrender.com/api/faq', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.data && response.data.success) {
                    const faqs = response.data.faqs;
                    faqs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                    setFaqs(faqs);
                    setAllFaqs(faqs);
                }
            } catch (error) {
                console.error('FAQ 데이터 로드 실패:', error);
            }
        };

        fetchFaqs();
    }, []);

    useEffect(() => {
        handleSearch();
        // eslint-disable-next-line
    }, [searchTerm, searchCategory]);

    const handleSearch = () => {
        const filtered = allFaqs.filter((faq) => {
            if (searchCategory === 'all') {
                return faq.question.includes(searchTerm) || faq.category.includes(searchTerm);
            } else if (searchCategory === 'question') {
                return faq.question.includes(searchTerm);
            } else if (searchCategory === 'category') {
                return faq.category.includes(searchTerm);
            }
            return true;
        });
        setFaqs(filtered);
        setCurrentPage(1);
    };

    const handleWriteClick = () => {
        navigate('/faq/create');
    };

    const handleFaqClick = (id) => {
        navigate(`/faq/detail/${id}`);
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = faqs.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(faqs.length / itemsPerPage);

    const handlePreviousPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className="faq-container">
            <Header />
            <div className="faq-content">
                <h1>자주 묻는 질문</h1>
                <div className="faq-search-box">
                    <select
                        className="search-category"
                        value={searchCategory}
                        onChange={e => setSearchCategory(e.target.value)}
                        style={{ height: '48px' }}
                    >
                        <option value="all">전체</option>
                        <option value="question">질문</option>
                        <option value="category">카테고리</option>
                    </select>
                    <input
                        type="text"
                        placeholder="검색..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <button className="search-button" onClick={handleSearch}>검색</button>
                </div>

                <table className="faq-table">
                    <thead>
                        <tr>
                            <th>번호</th>
                            <th>카테고리</th>
                            <th>질문</th>
                            <th>작성일</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="no-results">존재하지 않습니다.</td>
                            </tr>
                        ) : (
                            currentItems.map((faq, index) => (
                                <tr key={faq._id}>
                                    <td>{index + 1 + (currentPage - 1) * itemsPerPage}</td>
                                    <td>{faq.category}</td>
                                    <td>
                                        <span
                                            className="faq-title"
                                            style={{ cursor: 'pointer', color: '#3469f5', fontWeight: 500 }}
                                            onClick={() => handleFaqClick(faq._id)}
                                        >
                                            {faq.question}
                                        </span>
                                    </td>
                                    <td>{new Date(faq.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                <div className="point-pagination">
                    <button
                        className="point-pagination-btn"
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                    >이전</button>
                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i}
                            onClick={() => handlePageChange(i + 1)}
                            className={`point-pagination-btn${currentPage === i + 1 ? ' active' : ''}`}
                        >{i + 1}</button>
                    ))}
                    <button
                        className="point-pagination-btn"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                    >다음</button>
                </div>

                <button className="excel-export-button" onClick={handleWriteClick} style={{marginTop: 40}}>
                    글쓰기
                </button>
            </div>
        </div>
    );
};

export default Faq;
