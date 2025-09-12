// src/components/NoticeManagement/NoticeCreate.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../css/NoticeManagement/NoticeCreate.css';

const API_BASE = 'http://13.124.224.246:7778';

const NoticeCreate = () => {
  const [title, setTitle] = useState('');
  const [noticeImages, setNoticeImages] = useState([]);               // 여러 장 지원
  const [noticeImagePreviews, setNoticeImagePreviews] = useState([]); // 미리보기 배열
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleNoticeImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    setNoticeImages(files);

    // 미리보기 URL 생성
    const previews = files.map((f) => URL.createObjectURL(f));
    setNoticeImagePreviews(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('content', content.trim());
    // 서버 라우터가 upload.fields([{ name: 'noticeImage', maxCount: 10 }]) 이므로
    // 같은 필드명으로 여러 번 append
    noticeImages.forEach((file) => formData.append('noticeImage', file));

    try {
      setSubmitting(true);
      const response = await axios.post(`${API_BASE}/api/notice`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          // multipart는 브라우저가 boundary를 자동으로 넣으므로 명시만 해주면 됩니다.
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data?.success) {
        alert('공지사항이 성공적으로 등록되었습니다.');
        navigate('/notice');
      } else {
        alert('공지사항 등록 실패: ' + (response.data?.message || '알 수 없는 오류'));
      }
    } catch (error) {
      console.error('공지사항 등록 실패:', error);
      alert('공지사항 등록 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
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
          <textarea
            className="notice-create-textarea"
            id="content"
            rows={6}
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
            multiple                                   // 여러 장 업로드 지원
          />
          {noticeImagePreviews?.length > 0 && (
            <div className="notice-create-image-preview-grid">
              {noticeImagePreviews.map((src, idx) => (
                <img
                  key={idx}
                  src={src}
                  alt={`공지 이미지 미리보기 ${idx + 1}`}
                  className="notice-create-image-preview"
                />
              ))}
            </div>
          )}
        </div>

        <button type="submit" className="notice-create-button" disabled={submitting}>
          {submitting ? '등록 중...' : '등록'}
        </button>
      </form>
    </div>
  );
};

export default NoticeCreate;
