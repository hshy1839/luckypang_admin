import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../css/NoticeManagement/NoticeCreate.css';

const NoticeCreate = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');  // 작성자 이름 상태 추가
  const [loggedInUserId, setLoggedInUserId] = useState(null); // 로그인한 사용자 ID 상태
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('로그인 정보가 없습니다.');
          return;
        }

        const response = await axios.get('http://3.36.74.8:8865/api/users/userinfo', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data && response.data.success) {
          const users = response.data.users;
          if (users && users.length > 0) {
            const loggedInUser = users[0];  // 로그인한 사용자 정보
            setLoggedInUserId(loggedInUser.id); // 로그인한 사용자 ID 저장
            setAuthorName(loggedInUser.name); // 작성자 이름 자동 설정
          }
        } else {
          console.log('유저 정보 로드 실패');
        }
      } catch (error) {
        console.error('유저 데이터를 가져오는데 실패했습니다.', error);
      }
    };

    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const isConfirmed = window.confirm("해당 공지사항을 등록 하시겠습니까?");
    if (!isConfirmed) {
        console.log("등록이 취소되었습니다.");
        return;  // "아니오"를 선택하면 등록 취소
    }

    // 서버로 보낼 데이터 객체
    const noticeData = {
      title,
      content,
      created_at: new Date().toISOString(),  // 현재 시간을 ISO 문자열로 생성
      authorName,  // 작성자 이름 자동 추가
    };
  
    // 로컬 스토리지에서 토큰을 가져오기
    const token = localStorage.getItem('token');
  
    try {
      // POST 요청 보내기 (헤더에 토큰 포함)
      const response = await axios.post(
        'http://3.36.74.8:8865/api/users/notice', 
        noticeData, 
        {
          headers: {
            'Authorization': `Bearer ${token}`  // Bearer 방식으로 토큰 추가
          }
        }
      );
  
      if (response.status === 200) {
        // 성공적으로 공지사항이 저장되면 다른 페이지로 이동
        navigate('/notice');  // 예시로 공지사항 목록 페이지로 이동
      }
    } catch (error) {
      console.error('Error creating notice:', error);
      // 오류 처리 로직 추가
      if (error.response && error.response.status === 401) {
        // 401 오류 (Unauthorized) 시 로그인 페이지로 리다이렉션
        navigate('/login');
      }
    }
  };
  
  return (
    <div className="notice-create-container">
      <h2 className="notice-create-title">공지사항 작성</h2>
      <form className="notice-create-form" onSubmit={handleSubmit}>
        <div className="notice-create-field">
          <label className="notice-create-label" htmlFor="title">
            제목
          </label>
          <input
            className="notice-create-input"
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="공지사항 제목을 입력하세요"
            required
          />
        </div>
        <div className="notice-create-field">
          <label className="notice-create-label" htmlFor="content">
            내용
          </label>
          <textarea
            className="notice-create-textarea"
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="공지사항 내용을 입력하세요"
            required
          />
        </div>
        {/* 작성자 이름은 로그인한 사용자의 이름으로 자동 설정 */}
        <div className="notice-create-field">
          <label className="notice-create-label" htmlFor="authorName">
            작성자 이름
          </label>
          <input
            className="notice-create-input"
            type="text"
            id="authorName"
            value={authorName}  // 자동으로 설정된 작성자 이름
            readOnly  // 작성자 이름은 수정할 수 없도록 설정
          />
        </div>
        <button type="submit" className="notice-create-button">
          글쓰기
        </button>
      </form>
    </div>
  );
};

export default NoticeCreate;
