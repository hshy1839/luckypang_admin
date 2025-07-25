import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../css/UserManagement/Users.css';
import Header from '../Header.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faCheck, faTrash, faBan } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { exportToExcel } from '../../utils/exportToExcel.js';

const Users = () => {
    const [users, setUsers] = useState([]);  // 검색 후 표시할 사용자 리스트
    const [allUsers, setAllUsers] = useState([]);  // 전체 사용자 데이터 (원본 데이터)
    const [searchTerm, setSearchTerm] = useState('');  // 검색어 상태
    const [searchCategory, setSearchCategory] = useState('all');  // 검색 기준 상태
    const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
    const itemsPerPage = 10; // 페이지당 표시할 항목 수
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const response = await axios.get('http://localhost:7778/api/users/userinfo', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response.data && response.data.success) {
                    const users = response.data.users || [];
                    users.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                    setUsers(users);
                    setAllUsers(users);
                }
            } catch (error) {
                console.error('사용자 데이터를 가져오는데 실패했습니다.', error);
            }
        };
        fetchUsers();
    }, []);

    // 검색
    const handleSearch = () => {
        const filteredUsers = allUsers.filter((user) => {
            if (searchCategory === 'all') {
                return (
                    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.name?.toLowerCase().includes(searchTerm.toLowerCase())
                );
            } else if (searchCategory === 'user') {
                return user.username?.toLowerCase().includes(searchTerm.toLowerCase());
            } else if (searchCategory === 'name') {
                return user.name?.toLowerCase().includes(searchTerm.toLowerCase());
            }
            return true;
        });
        setUsers(filteredUsers);
        setCurrentPage(1);
    };

    // 엑셀 내보내기
    const handleExcelExport = () => {
        const exportData = users.map((user, index) => ({
            번호: index + 1 + (currentPage - 1) * itemsPerPage,
            아이디: user.username,
            이름: user.name,
            연락처: user.phoneNumber,
            타입: user.user_type === 3 ? '일반유저' :
                  user.user_type === 2 ? '부관리자' :
                  user.user_type === 1 ? '관리자' : '알 수 없음',
            가입일: new Date(user.created_at).toLocaleDateString(),
            상태: user.is_active ? '가입 승인' : '대기',
        }));
        exportToExcel(exportData, '사용자_목록');
    };

    // 페이지 관련
    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentUsers = users.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(users.length / itemsPerPage);

    // 액션
    const handleUserClick = (id) => {
        navigate(`/users/usersDetail/${id}`);
    };
    const handlePreviousPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };
    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // 승인/비활성/삭제
    const handleApprove = async (id) => {
        if (!window.confirm("해당 사용자 계정을 승인하시겠습니까?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:7778/api/users/userinfo/${id}`, { is_active: true },
                { headers: { Authorization: `Bearer ${token}` } });
            setUsers(prev =>
                prev.map(user => user._id === id ? { ...user, is_active: true } : user)
            );
        } catch (error) { alert('승인 실패'); }
    };

    const handleReject = async (id) => {
        if (!window.confirm("해당 사용자 계정을 사용중지 하시겠습니까?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:7778/api/users/userinfo/${id}`, { is_active: false },
                { headers: { Authorization: `Bearer ${token}` } });
            setUsers(prev =>
                prev.map(user => user._id === id ? { ...user, is_active: false } : user)
            );
        } catch (error) { alert('중지 실패'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("해당 사용자를 삭제하시겠습니까?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:7778/api/users/userinfo/${id}`,
                { headers: { Authorization: `Bearer ${token}` } });
            setUsers(prev => prev.filter(user => user._id !== id));
        } catch (error) { alert('삭제 실패'); }
    };

    return (
        <div className="users-container">
            <Header />
            <div className="users-content">
                <h1>사용자 관리</h1>
                <div className="users-search-box">
                    <select
                        className="search-category"
                        value={searchCategory}
                        onChange={e => setSearchCategory(e.target.value)}
                        style={{height: '48px'}}
                    >
                        <option value="all">전체</option>
                        <option value="user">이메일</option>
                        <option value="name">이름</option>
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

                <table className="users-table">
                    <thead>
                        <tr>
                            <th>번호</th>
                            <th>이메일</th>
                            <th>닉네임</th>
                            <th>연락처</th>
                            <th>타입</th>
                            <th>가입일</th>
                            <th>상태</th>
                            <th>액션</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentUsers.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="no-results">
                                    존재하지 않습니다.
                                </td>
                            </tr>
                        ) : (
                            currentUsers.map((user, index) => (
                                <tr key={user._id}>
                                    <td>{index + 1 + (currentPage - 1) * itemsPerPage}</td>
                                    <td>{user.email}</td>
                                    <td
                                        onClick={() => handleUserClick(user._id)}
                                        className='product-title'
                                    >
                                        {user.nickname || 'Unknown User'}
                                    </td>
                                    <td>{user.phoneNumber}</td>
                                    <td>
                                        {user.user_type === 3 ? '일반유저' :
                                         user.user_type === 2 ? '부관리자' :
                                         user.user_type === 1 ? '관리자' : '알 수 없음'}
                                    </td>
                                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                    <td>{user.is_active ? '가입 승인' : '대기'}</td>
                                    <td>
                                        <div className="actions-btns-users">
                                            <FontAwesomeIcon 
                                                icon={faCheck} 
                                                onClick={() => handleApprove(user._id)} 
                                                className="approve-btn-users"
                                                title="승인"
                                            />
                                            <FontAwesomeIcon 
                                                icon={faBan} 
                                                onClick={() => handleReject(user._id)} 
                                                className="reject-btn-users"
                                                title="비활성화"
                                            />
                                            <FontAwesomeIcon 
                                                icon={faTrash} 
                                                onClick={() => handleDelete(user._id)} 
                                                className="delete-btn-users"
                                                title="삭제"
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                <div className="point-pagination">
                    <button className="point-pagination-btn"
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}>이전</button>
                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i}
                            onClick={() => handlePageChange(i + 1)}
                            className={`point-pagination-btn${currentPage === i + 1 ? ' active' : ''}`}
                        >{i + 1}</button>
                    ))}
                    <button className="point-pagination-btn"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}>다음</button>
                </div>

                <button onClick={handleExcelExport} className="excel-export-button">
                    엑셀로 내보내기
                </button>
            </div>
        </div>
    );
};

export default Users;
