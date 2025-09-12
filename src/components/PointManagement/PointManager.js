import React, { useState } from 'react';
import axios from 'axios';
import Header from '../Header';
import '../../css/PointsManagement/PointManager.css';

let debounceTimer;

const PointManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [pointForm, setPointForm] = useState({
    type: '추가',
    amount: '',
    description: '',
  });

  const handleSearch = async (keyword = searchTerm) => {
    if (!keyword.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://13.124.224.246:7778/api/users/search?keyword=${keyword}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.success) {
        setSearchResults(res.data.users);
      } else {
        alert('검색 실패');
      }
    } catch (error) {
      console.error('유저 검색 오류:', error);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      handleSearch(value);
    }, 300);
  };

  const toggleUserSelection = (user) => {
    const alreadySelected = selectedUsers.find((u) => u._id === user._id);
    if (alreadySelected) {
      setSelectedUsers(selectedUsers.filter((u) => u._id !== user._id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleSubmit = async () => {
    if (selectedUsers.length === 0) {
      alert('유저를 선택하세요.');
      return;
    }

    if (!pointForm.amount || isNaN(pointForm.amount)) {
      alert('유효한 금액을 입력하세요.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      for (const user of selectedUsers) {
        const payload = {
          ...pointForm,
          targetUserId: user._id,
        };

        await axios.post(`http://13.124.224.246:7778/api/points/${user._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      alert('모든 유저에게 포인트가 반영되었습니다.');
      setPointForm({ type: '추가', amount: '', description: '' });
      setSelectedUsers([]);
    } catch (error) {
      console.error('포인트 지급 오류:', error);
      alert('서버 오류');
    }
  };

  return (
    <div className="point-manager-container">
      <Header />
      <h1>포인트 수동 지급/차감</h1>

      {/* 검색 영역 */}
      <div className="user-search-box">
        <input
          type="text"
          placeholder="닉네임, 이메일, 전화번호로 검색"
          value={searchTerm}
          onChange={handleChange}
          className="search-input"
        />
        <button className="search-btn" onClick={() => handleSearch(searchTerm)}>
          검색
        </button>

        {searchResults.length > 0 && (
          <ul className="search-dropdown">
            {searchResults.map((user) => (
              <li key={user._id}>
                <button
                  className={`search-result-button ${
                    selectedUsers.find((u) => u._id === user._id) ? 'selected' : ''
                  }`}
                  onClick={() => toggleUserSelection(user)}
                >
                  {user.nickname} ({user.email})
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 선택된 유저들 */}
      {selectedUsers.length > 0 && (
        <div className="selected-user-box">
          <strong>선택된 유저:</strong>
          <ul style={{ marginTop: '8px' }}>
            {selectedUsers.map((user) => (
              <li key={user._id}>
                {user.nickname} ({user.email})
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 포인트 지급 폼 */}
      <div className="point-form">
        <select
          value={pointForm.type}
          onChange={(e) => setPointForm({ ...pointForm, type: e.target.value })}
        >
          <option value="추가">추가</option>
          <option value="감소">감소</option>
          <option value="환불">환불</option>
        </select>
        <input
          type="number"
          placeholder="금액"
          value={pointForm.amount}
          onChange={(e) => setPointForm({ ...pointForm, amount: e.target.value })}
        />
        <input
          type="text"
          placeholder="설명"
          value={pointForm.description}
          onChange={(e) => setPointForm({ ...pointForm, description: e.target.value })}
        />
        <button onClick={handleSubmit}>포인트 반영</button>
      </div>
    </div>
  );
};

export default PointManager;
