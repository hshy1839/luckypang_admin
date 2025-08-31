import React, { useState, useEffect } from 'react';
import '../../css/EventManagement/Event.css';
import Header from '../Header.js';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Event = () => {
    const [events, setEvents] = useState([]);
    const [allEvents, setAllEvents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchCategory, setSearchCategory] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const response = await axios.get('http://13.124.224.246:7778/api/event', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response.data && response.data.success) {
                    const events = response.data.events || [];
                    events.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                    setEvents(events);
                    setAllEvents(events);
                }
            } catch (error) {
                console.error('이벤트 데이터를 가져오는데 실패했습니다.', error);
            }
        };
        fetchEvents();
    }, []);

    useEffect(() => {
        handleSearch();
        // eslint-disable-next-line
    }, [searchTerm, searchCategory]);

    const handleSearch = () => {
        const filtered = allEvents.filter((event) => {
            if (searchCategory === 'all') {
                return (
                    event.title?.includes(searchTerm) ||
                    event.authorName?.includes(searchTerm)
                );
            } else if (searchCategory === 'title') {
                return event.title?.includes(searchTerm);
            } else if (searchCategory === 'author') {
                return event.authorName?.includes(searchTerm);
            }
            return true;
        });
        setEvents(filtered);
        setCurrentPage(1);
    };

    const handleWriteClick = () => {
        navigate('/event/eventCreate');
    };
    const handleEventClick = (id) => {
        navigate(`/event/eventDetail/${id}`);
    };

    // 페이지네이션
    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentEvents = events.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(events.length / itemsPerPage);

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
        <div className="event-container">
            <Header />
            <div className="event-content">
                <h1>이벤트</h1>
                <div className="event-search-box">
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

                <table className="event-table">
                    <thead>
                        <tr>
                            <th>번호</th>
                            <th>제목</th>
                            <th>작성자</th>
                            <th>작성 날짜</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentEvents.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="no-results">
                                    존재하지 않습니다.
                                </td>
                            </tr>
                        ) : (
                            currentEvents.map((event, index) => (
                                <tr key={event._id}>
                                    <td>{index + 1 + (currentPage - 1) * itemsPerPage}</td>
                                    <td>
                                        <span
                                            className="event-title"
                                            style={{ cursor: 'pointer', color: '#3469f5', fontWeight: 500, fontSize: '16px'  }}
                                            onClick={() => handleEventClick(event._id)}
                                        >
                                            {event.title}
                                        </span>
                                    </td>
                                    <td>{event.authorName}</td>
                                    <td>{new Date(event.created_at).toLocaleDateString()}</td>
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

export default Event;
