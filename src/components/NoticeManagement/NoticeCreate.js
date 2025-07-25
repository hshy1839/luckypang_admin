import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../css/NoticeManagement/NoticeCreate.css';

const NoticeCreate = () => {
  const [title, setTitle] = useState('');
  const [noticeImage, setNoticeImage] = useState(null);
  const [noticeImagePreview, setNoticeImagePreview] = useState(null);
  const [content, setContent] = useState('');
  const navigate = useNavigate();

  const handleNoticeImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNoticeImage(file);
      const previewUrl = URL.createObjectURL(file);
      setNoticeImagePreview(previewUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !content) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('noticeImage', noticeImage);

    const token = localStorage.getItem('token');

    try {
      const response = await axios.post(
        'http://localhost:7778/api/notice',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        alert('공지사항이 성공적으로 등록되었습니다.');
        navigate('/notice');
      } else {
        alert('공지사항 등록 실패: ' + response.data.message);
      }
    } catch (error) {
      console.error('공지사항 등록 실패:', error.message);
      alert('공지사항 등록 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="notice-create-container">
      <h2 className="notice-create-title">공지사항 등록</h2>
      <form className="notice-create-form" onSubmit={handleSubmit}>
        <div className="notice-create-field">
          <label className="notice-create-label" htmlFor="title">제목</label>
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
          <label className="notice-create-label" htmlFor="content">내용</label>
          <input
            className="notice-create-input"
            type="text"
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 입력하세요"
            required
          />
        </div>

        <div className="notice-create-field">
          <label className="notice-create-label" htmlFor="noticeImage">공지사항 이미지</label>
          <input
            className="notice-create-input"
            type="file"
            id="noticeImage"
            onChange={handleNoticeImageChange}
            accept="image/*"
          />
          {noticeImage && (
            <img
              src={noticeImagePreview}
              alt="공지사항 이미지 미리보기"
              className="notice-create-image-preview"
            />
          )}
        </div>

        <button type="submit" className="notice-create-button">등록</button>
      </form>
    </div>
  );
};

export default NoticeCreate;