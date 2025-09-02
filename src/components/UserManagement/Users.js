import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../css/UserManagement/Users.css';
import Header from '../Header.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faCheck, faTrash, faBan } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { exportToExcel } from '../../utils/exportToExcel.js';

// 문자열/숫자 섞여 들어와도 안전하게 라벨 매핑
const getUserTypeLabel = (v) => {
  const map = { '1': '관리자', '2': '부관리자', '3': '일반유저' };
  return map[String(v)] ?? '알 수 없음';
};

// boolean/문자열 혼용을 안전하게 true/false로 정규화
const toBool = (v) => (v === true || String(v) === 'true');

const Users = () => {
  const [users, setUsers] = useState([]);          // 검색 후 표시할 사용자 리스트
  const [allUsers, setAllUsers] = useState([]);    // 전체 사용자 데이터 (원본)
  const [searchTerm, setSearchTerm] = useState(''); 
  const [searchCategory, setSearchCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }
        const response = await axios.get('http://localhost:7778/api/users/userinfo', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response?.data?.success) {
          const raw = Array.isArray(response.data.users) ? response.data.users : [];
          // 정규화 + 정렬(최신 가입순)
          const normalized = raw
            .map(u => ({
              ...u,
              user_type: String(u.user_type),              // '1'|'2'|'3'
              is_active: toBool(u.is_active),              // true/false
              created_at: u.created_at ?? u.createdAt ?? u.created, // 다양한 키 방어
            }))
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

          setUsers(normalized);
          setAllUsers(normalized);
        }
      } catch (error) {
        console.error('사용자 데이터를 가져오는데 실패했습니다.', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // 검색
  const handleSearch = () => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      setUsers(allUsers);
      setCurrentPage(1);
      return;
    }
    const filtered = allUsers.filter((user) => {
      const fields = {
        all: [
          user.username,   // 아이디
          user.name,       // 이름
          user.nickname,   // 닉네임 (테이블에 노출되므로 포함)
          user.email,      // 이메일
        ],
        user: [user.username],
        name: [user.name],
      };

      const targets = (fields[searchCategory] || []).filter(Boolean);
      return targets.some(v => String(v).toLowerCase().includes(term));
    });

    setUsers(filtered);
    setCurrentPage(1);
  };

  // 엑셀 내보내기
  const handleExcelExport = () => {
    const exportData = users.map((user, index) => ({
      번호: index + 1 + (currentPage - 1) * itemsPerPage,
      아이디: user.username ?? '',
      이름: user.name ?? '',
      닉네임: user.nickname ?? '',
      이메일: user.email ?? '',
      연락처: user.phoneNumber ?? '',
      타입: getUserTypeLabel(user.user_type), // 문자열 매핑
      가입일: user.created_at ? new Date(user.created_at).toLocaleDateString() : '',
      상태: user.is_active ? '가입 승인' : '대기',
    }));
    exportToExcel(exportData, '사용자_목록');
  };

  // 페이지네이션 계산 (메모)
  const totalPages = useMemo(() => Math.ceil(users.length / itemsPerPage) || 1, [users.length]);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentUsers = users.slice(indexOfFirst, indexOfLast);

  // 액션
  const handleUserClick = (id) => {
    navigate(`/users/usersDetail/${id}`);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // 승인/비활성/삭제
  const handleApprove = async (id) => {
    if (!window.confirm('해당 사용자 계정을 승인하시겠습니까?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:7778/api/users/userinfo/${id}`,
        { is_active: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(prev => prev.map(u => (u._id === id ? { ...u, is_active: true } : u)));
      setAllUsers(prev => prev.map(u => (u._id === id ? { ...u, is_active: true } : u)));
    } catch (error) {
      alert('승인 실패');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('해당 사용자 계정을 사용중지 하시겠습니까?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:7778/api/users/userinfo/${id}`,
        { is_active: false },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(prev => prev.map(u => (u._id === id ? { ...u, is_active: false } : u)));
      setAllUsers(prev => prev.map(u => (u._id === id ? { ...u, is_active: false } : u)));
    } catch (error) {
      alert('중지 실패');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('해당 사용자를 삭제하시겠습니까?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:7778/api/users/userinfo/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(prev => prev.filter(u => u._id !== id));
      setAllUsers(prev => prev.filter(u => u._id !== id));
    } catch (error) {
      alert('삭제 실패');
    }
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
            style={{ height: '48px' }}
          >
            <option value="all">전체</option>
            <option value="user">아이디</option>
            <option value="name">이름</option>
          </select>

          <input
            type="text"
            placeholder="검색..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
          />

          <button className="search-button" onClick={handleSearch}>
            검색
          </button>
        </div>

        {loading ? (
          <div className="users-loading">불러오는 중…</div>
        ) : (
          <>
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
                      <td>{user.email ?? ''}</td>
                      <td
                        onClick={() => handleUserClick(user._id)}
                        className="product-title"
                        title="상세 보기"
                      >
                        {user.nickname || 'Unknown User'}
                      </td>
                      <td>{user.phoneNumber ?? ''}</td>
                      <td>{getUserTypeLabel(user.user_type)}</td>
                      <td>{user.created_at ? new Date(user.created_at).toLocaleDateString() : ''}</td>
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
              <button
                className="point-pagination-btn"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                이전
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  className={`point-pagination-btn${currentPage === i + 1 ? ' active' : ''}`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                className="point-pagination-btn"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                다음
              </button>
            </div>

            <button onClick={handleExcelExport} className="excel-export-button">
              엑셀로 내보내기
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Users;
