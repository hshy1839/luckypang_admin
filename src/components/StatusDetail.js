import React, { useState, useEffect } from 'react';
import '../css/NoticeManagement/Notice.css';
import Header from './Header.js';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const StatusDetail = () => {
    const [attendanceList, setAttendanceList] = useState([]);
    const [userNames, setUserNames] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [searchCategory, setSearchCategory] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const navigate = useNavigate();

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const token = localStåçrage.getItem('token');
                if (!token) {
                    return;
                }

                const response = await axios.get('http://3.36.74.8:8865/api/users/allAttendanceInfo', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (Array.isArray(response.data)) {
                    setAttendanceList(response.data);

                    // 출석 기록에 있는 각 userId에 대해 이름을 비동기적으로 가져오기
                    const newUserNames = {};
                    for (const record of response.data) {
                        if (record.userId && !newUserNames[record.userId]) {
                            const userResponse = await axios.get(`http://3.36.74.8:8865/api/users/userinfo/${record.userId}`, {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            });

                            if (userResponse.data && userResponse.data.success) {
                                newUserNames[record.userId] = userResponse.data.name; 
                            } else {
                                newUserNames[record.userId] = 'Unknown User';
                            }
                        }
                    }

                    setUserNames(newUserNames); // 유저 이름 상태 업데이트
                } else {
                }
            } catch (error) {
                console.error('출퇴근 데이터를 가져오는데 실패했습니다.', error);
            }
        };

        fetchAttendance();
    }, []);

    const handleSearch = () => {
        const filteredAttendance = attendanceList.filter((record) => {
            if (searchCategory === 'all') {
                return (
                    record.date.includes(searchTerm) ||
                    record.attendanceStatus.includes(searchTerm)
                );
            } else if (searchCategory === 'date') {
                return record.date.includes(searchTerm);
            } else if (searchCategory === 'status') {
                return record.attendanceStatus.includes(searchTerm);
            }
            return true;
        });

        setAttendanceList(filteredAttendance);
        setCurrentPage(1);
    };

    const handleWriteClick = () => {
        navigate('/noticeCreate');
    };

    const indexOfLastRecord = currentPage * itemsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - itemsPerPage;
    const currentRecords = attendanceList.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(attendanceList.length / itemsPerPage);

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
        <div className="notice-management-container">
            <Header />
            <div className="notice-management-container-container">
                <div className="notice-top-container-container">
                    <h1>출퇴근 세부 기록</h1>
                    <div className="notice-search-box">
                        <select
                            className="search-category"
                            value={searchCategory}
                            onChange={(e) => setSearchCategory(e.target.value)}
                        >
                            <option value="all">전체</option>
                            <option value="date">출근 날짜</option>
                            <option value="status">상태</option>
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

                    <table className="notice-table">
                        <thead>
                            <tr>
                                <th>번호</th>
                                <th>출근 시간</th>
                                <th>퇴근 시간</th>
                                <th>사용자 이름</th>
                                <th>출근 날짜</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentRecords.length > 0 ? (
                                currentRecords.map((record, index) => (
                                    <tr key={index}>
                                        <td>{index + 1 + (currentPage - 1) * itemsPerPage}</td>
                                        <td>{record.checkInTime || '-'}</td>
                                        <td>{record.checkOutTime || '-'}</td>
                                        <td>{userNames[record.userId] || 'Unknown User'}</td>
                                        <td>{new Date(record.date).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="no-results">
                                        데이터가 없습니다.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    <div className="pagination">
                        <button onClick={handlePreviousPage} disabled={currentPage === 1}>
                            이전
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => handlePageChange(i + 1)}
                                className={currentPage === i + 1 ? 'active' : ''}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                            다음
                        </button>
                    </div>
                </div>
                <div className="write-btn-container">
                    <button className="write-btn" onClick={handleWriteClick}>
                        글쓰기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StatusDetail;
