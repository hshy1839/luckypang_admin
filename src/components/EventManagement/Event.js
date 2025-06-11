import React, { useState, useEffect } from 'react';
import '../../css/EventManagement/Event.css';
import Header from '../Header.js';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // useNavigate 임포트
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

const Event = () => {
    const [events, setEvents] = useState([]); // 전체 공지 데이터
    const [allEvents, setAllEvents] = useState([]); // 원본 데이터
    const [searchTerm, setSearchTerm] = useState(''); // 검색어 상태
    const [searchCategory, setSearchCategory] = useState('all'); // 검색 기준 상태

    const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
    const itemsPerPage = 10; // 페이지당 표시할 항목 수

    const navigate = useNavigate(); // navigate 함수 선언

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.log('로그인 정보가 없습니다.');
                    return;
                }

                const response = await axios.get('http://13.124.224.246:7778/api/event', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.data && response.data.success) {
                    const events = response.data.events;
                    if (events && events.length > 0) {
                        events.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // 날짜 내림차순 정렬
                        setEvents(events);
                        setAllEvents(events);
                    } else {
                        console.error('공지 데이터가 없습니다.');
                    }
                } else {
                    console.log('공지 데이터 로드 실패');
                }
            } catch (error) {
                console.error('공지 데이터를 가져오는데 실패했습니다.', error);
            }
        };

        fetchEvents();
    }, []);

    useEffect(() => {
        handleSearch();
    }, [searchTerm, searchCategory]);

    const handleSearch = () => {
        const filteredEvents = allEvents.filter((event) => {
            if (searchCategory === 'all') {
                return (
                    event.title.includes(searchTerm) ||
                    event.authorName.includes(searchTerm)
                );
            } else if (searchCategory === 'title') {
                return event.title.includes(searchTerm);
            } else if (searchCategory === 'author') {
                return event.authorName.includes(searchTerm);
            }
            return true;
        });

        setEvents(filteredEvents);
        setCurrentPage(1); // 검색 시 첫 페이지로 이동
    };


   

    const handleWriteClick = () => {
        navigate('/event/eventCreate');
    };

    const handleEventClick = (id) => {
        navigate(`/event/eventDetail/${id}`);
    };

    // 페이지네이션 관련 변수
    const indexOfLastEvent = currentPage * itemsPerPage;
    const indexOfFirstEvent = indexOfLastEvent - itemsPerPage;
    const currentEvents = events.slice(indexOfFirstEvent, indexOfLastEvent);
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
        <div className="event-management-container">
            <Header />
            <div className="event-management-container-container">
                <div className="event-top-container-container">
                    <h1>이벤트</h1>

                    {/* 검색 박스 */}
                    <div className="event-search-box">
                        <select
                            className="search-category"
                            value={searchCategory}
                            onChange={(e) => setSearchCategory(e.target.value)}
                        >
                            <option value="all">전체</option>
                            <option value="title">제목</option>
                            <option value="author">작성자</option>
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

                    {/* 공지 정보 테이블 */}
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
                                    <td colSpan="10" className="no-results">
                                        존재하지 않습니다.
                                    </td>
                                </tr>
                            ) : (
                                currentEvents.map((event, index) => (
                                    <tr key={event.authorId}>
                                       <td>{index + 1 + (currentPage - 1) * itemsPerPage}</td>
                                        <td>
                                            <a className='event-title'
                                                onClick={() => handleEventClick(event._id)}
                                            >
                                                {event.title}
                                            </a>
                                        </td>
                                        <td>{event.authorName}</td>
                                        <td>{new Date(event.created_at).toLocaleDateString()}</td>
                                      
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {/* 페이지네이션 */}
                    <div className="pagination">
                        <button className="prev-page-btn" onClick={handlePreviousPage} disabled={currentPage === 1}>
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
                        <button className='next-page-btn' onClick={handleNextPage} disabled={currentPage === totalPages}>
                            다음
                        </button>
                    </div>
                    <div className="write-btn-container">
                <button className="write-btn" onClick={handleWriteClick}>
                    글쓰기
                </button>
            </div>
                </div>
                 {/* 글쓰기 버튼 */}
        
            </div>

           
        </div>
    );
};

export default Event;
