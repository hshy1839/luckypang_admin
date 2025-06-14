import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../css/UserManagement/Users.css';
import Header from '../Header.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faCheck, faTrash, faBan } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
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
                if (!token) {
                    return;
                }

                const response = await axios.get('http://13.124.224.246:7778/api/users/userinfo', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.data && response.data.success) {
                    const users = response.data.users; // 모든 유저 데이터
                    if (users && users.length > 0) {
                        // created_at 기준 내림차순 정렬
                        users.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                        setUsers(users);  // 현재 표시할 사용자 리스트
                        setAllUsers(users);  // 원본 데이터 저장
                    } else {
                        console.error('사용자 데이터가 없습니다.');
                    }
                } else {
                    console.log('사용자 정보 로드 실패');
                }
            } catch (error) {
                console.error('사용자 데이터를 가져오는데 실패했습니다.', error);
            }
        };

        fetchUsers();
    }, []);

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


  
    const exportToExcel = () => {
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
    
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, '사용자 목록');
    
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const file = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(file, '사용자_목록.xlsx');
    };


    const handleSearch = () => {
        // 검색 결과 필터링
        const filteredUsers = allUsers.filter((user) => {
            if (searchCategory === 'all') {
                return (
                    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.name.toLowerCase().includes(searchTerm.toLowerCase())
                );
            } else if (searchCategory === 'user') {
                return user.username.toLowerCase().includes(searchTerm.toLowerCase());
            } else if (searchCategory === 'name') {
                return user.name.toLowerCase().includes(searchTerm.toLowerCase());
            }
            return true;
        });
    
        setUsers(filteredUsers);  // 필터된 결과로 상태 업데이트
    };
    
    
    const indexOfLastNotice = currentPage * itemsPerPage;
    const indexOfFirstNotice = indexOfLastNotice - itemsPerPage;
    const currentNotices = users.slice(indexOfFirstNotice, indexOfLastNotice);
    const totalPages = Math.ceil(users.length / itemsPerPage);

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
    // 각 기능 핸들러
    const handleApprove = async (id) => {
        const isConfirmed = window.confirm("해당 사용자 계정을 승인하시겠습니까?");
        if (!isConfirmed) return;
    
        try {
            const token = localStorage.getItem('token');
            if (!token) return console.log('로그인 정보가 없습니다.');
    
            const response = await axios.put(
                `http://13.124.224.246:7778/api/users/userinfo/${id}`,
                { is_active: true },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
    
            if (response.data.success) {
                // 상태 업데이트
                setUsers((prevUsers) =>
                    prevUsers.map((user) =>
                        user._id === id ? { ...user, is_active: true } : user
                    )
                );
            } else {
                alert('승인 실패');
            }
        } catch (error) {
            console.error('승인 처리 중 오류 발생:', error);
        }
    };
    

    const handleReject = async (id) => {
        const isConfirmed = window.confirm("해당 사용자 계정을 사용중지 하시겠습니까?");

        if (!isConfirmed) {
            return;  // "아니오"를 선택하면 삭제 취소
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.log('로그인 정보가 없습니다.');
                return;
            }
    
            const response = await axios.put(
                `http://13.124.224.246:7778/api/users/userinfo/${id}`,
                { is_active: false },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
    
            if (response.data.success) {
                const updatedUsers = users.map((user) =>
                    user._id === id ? { ...user, is_active: false } : user
                );
                setUsers(updatedUsers);
            } else {
                console.log('거부 실패');
            }
        } catch (error) {
            console.error('거부 처리 중 오류 발생:', error);
        }
    };
    

    const handleDelete = async (id) => {
        const isConfirmed = window.confirm("해당 사용자를 삭제하시겠습니까?");

        if (!isConfirmed) {
            console.log("삭제가 취소되었습니다.");
            return;  // "아니오"를 선택하면 삭제 취소
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.log('로그인 정보가 없습니다.');
                return;
            }
    
            const response = await axios.delete(
                `http://13.124.224.246:7778/api/users/userinfo/${id}`,  // URL에 ID 포함
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
    
            if (response.data.success) {
                const updatedUsers = users.filter((user) => user._id !== id);
                setUsers(updatedUsers);
            } else {
                console.log('삭제 실패');
            }
        } catch (error) {
            console.error('삭제 처리 중 오류 발생:', error);
        }
    };
    
    return (
        <div className="users-management-container">
            <Header />
            <div className='users-management-container-container'>
                <div className='users-top-container-container'>
                    <h1>사용자 관리</h1>

                    {/* 검색 박스 */}
                    <div className="users-search-box">
                        <select
                            className="search-category"
                            value={searchCategory}
                            onChange={(e) => setSearchCategory(e.target.value)} // 검색 기준 변경
                        >
                            <option value="all">전체</option>
                            <option value="user">이메일</option>
                            <option value="name">이름</option>
                        </select>
                        <input
                            type="text"
                            placeholder="검색..."
                            value={searchTerm} // 입력된 검색어
                            onChange={(e) => setSearchTerm(e.target.value)} // 검색어 변경
                        />
                        <button className="search-button" onClick={handleSearch}>
                            검색
                        </button>
                    </div>

                    {/* 사용자 정보 테이블 */}
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
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan="10" className="no-results">
                                        존재하지 않습니다.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user, index) => (
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
                                            {user.user_type ==3 ? '일반유저' :
                                             user.user_type == 2 ? '부관리자' : 
                                             user.user_type ==1 ? '관리자' : 
                                             '알 수 없음'}
                                        </td>
                                        <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                        <td>{user.is_active ? '가입 승인' : '대기'}</td>
                                        <td>
                                            <div className="actions-btns-users">
                                                <FontAwesomeIcon 
                                                    icon={faCheck} 
                                                    onClick={() => handleApprove(user._id)} 
                                                    className="approve-btn-users"
                                                />
                                                <FontAwesomeIcon 
                                                    icon={faBan} 
                                                    onClick={() => handleReject(user._id)} 
                                                    className="reject-btn-users"
                                                />
                                                <FontAwesomeIcon 
                                                    icon={faTrash} 
                                                    onClick={() => handleDelete(user._id)} 
                                                    className="delete-btn-users"
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {/* 페이지 네비게이션 */}
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
                </div>
                <button onClick={handleExcelExport} className="excel-export-button">
  엑셀로 내보내기
</button>
            </div>
        </div>
    );
};

export default Users;
