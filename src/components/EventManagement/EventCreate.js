import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../css/EventManagement/EventCreate.css';

const EventCreate = () => {
  const [title, setTitle] = useState('');
  const [eventImage, setEventImage] = useState(null);
  const [eventImagePreview, setEventImagePreview] = useState(null);
  const [content, setContent] = useState('');
  const navigate = useNavigate();

  const handleEventImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEventImage(file);
      const previewUrl = URL.createObjectURL(file);
      setEventImagePreview(previewUrl);
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
    formData.append('eventImage', eventImage);

    const token = localStorage.getItem('token');

    try {
      const response = await axios.post(
        'http://13.124.224.246:7778/api/event',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        alert('이벤트이 성공적으로 등록되었습니다.');
        navigate('/event');
      } else {
        alert('이벤트 등록 실패: ' + response.data.message);
      }
    } catch (error) {
      console.error('이벤트 등록 실패:', error.message);
      alert('이벤트 등록 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="event-create-container">
      <h2 className="event-create-title">이벤트 등록</h2>
      <form className="event-create-form" onSubmit={handleSubmit}>
        <div className="event-create-field">
          <label className="event-create-label" htmlFor="title">제목</label>
          <input
            className="event-create-input"
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="이벤트 제목을 입력하세요"
            required
          />
        </div>
        <div className="event-create-field">
          <label className="event-create-label" htmlFor="content">내용</label>
          <input
            className="event-create-input"
            type="text"
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 입력하세요"
            required
          />
        </div>

        <div className="event-create-field">
          <label className="event-create-label" htmlFor="eventImage">이벤트 이미지</label>
          <input
            className="event-create-input"
            type="file"
            id="eventImage"
            onChange={handleEventImageChange}
            accept="image/*"
          />
          {eventImage && (
            <img
              src={eventImagePreview}
              alt="이벤트 이미지 미리보기"
              className="event-create-image-preview"
            />
          )}
        </div>

        <button type="submit" className="event-create-button">등록</button>
      </form>
    </div>
  );
};

export default EventCreate;