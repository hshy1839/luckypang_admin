import React, { useState, useEffect } from 'react';
import '../../css/NoticeManagement/Notice.css';
import Header from '../Header.js';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Notice = () => {
    const [notices, setNotices] = useState([]);
    const [allNotices, setAllNotices] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchCategory, setSearchCategory] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchNotices = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const response = await axios.get('https://luckytang-server.onrender.com/api/notice', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response.data && response.data.success) {
                    const notices = response.data.notices || [];
                    notices.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                    setNotices(notices);
                    setAllNotices(notices);
                }
            } catch (error) {
                console.error('공지 데이터를 가져오는데 실패했습니다.', error);
            }
        };
        fetchNotices();
    }, []);

    // 검색
    useEffect(() => {
        handleSearch();
        // eslint-disable-next-line
    }, [searchTerm, searchCategory]);

    const handleSearch = () => {
        const filtered = allNotices.filter((notice) => {
            if (searchCategory === 'all') {
                return (
                    notice.title?.includes(searchTerm) ||
                    notice.authorName?.includes(searchTerm)
                );
            } else if (searchCategory === 'title') {
                return notice.title?.includes(searchTerm);
            } else if (searchCategory === 'author') {
                return notice.authorName?.includes(searchTerm);
            }
            return true;
        });
        setNotices(filtered);
        setCurrentPage(1);
    };

    const handleWriteClick = () => {
        navigate('/notice/noticeCreate');
    };

    const handleNoticeClick = (id) => {
        navigate(`/notice/noticeDetail/${id}`);
    };

    // 페이지네이션
    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentNotices = notices.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(notices.length / itemsPerPage);

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
        <div className="notice-container">
            <Header />
            <div className="notice-content">
                <h1>공지사항</h1>
                <div className="notice-search-box">
                    <select
                        className="search-category"
                        value={searchCategory}
                        onChange={e => setSearchCategory(e.target.value)}
                        style={{ height: '48px' }}
                    >
                        <option value="all">전체</option>
                        <option value="title">제목</option>
                        <option value="author">작성자</option>
                    </select>
                    <input
                        type="text"
                        placeholder="검색..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <button className="search-button" onClick={handleSearch}>
                        검색
                    </button>
                </div>

                <table className="notice-table">
                    <thead>
                        <tr>
                            <th>번호</th>
                            <th>제목</th>
                            <th>작성자</th>
                            <th>작성 날짜</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentNotices.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="no-results">
                                    존재하지 않습니다.
                                </td>
                            </tr>
                        ) : (
                            currentNotices.map((notice, index) => (
                                <tr key={notice._id}>
                                    <td>{index + 1 + (currentPage - 1) * itemsPerPage}</td>
                                    <td>
                                        <span
                                            className="notice-title"
                                            style={{ cursor: 'pointer', color: '#3469f5', fontWeight: 500, fontSize: '16px' }}
                                            onClick={() => handleNoticeClick(notice._id)}
                                        >
                                            {notice.title}
                                        </span>
                                    </td>
                                    <td>{notice.authorName}</td>
                                    <td>{new Date(notice.created_at).toLocaleDateString()}</td>
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

export default Notice;
