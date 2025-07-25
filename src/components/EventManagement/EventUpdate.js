import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import '../../css/EventManagement/EventUpdate.css';

const EventUpdate = () => {
  const [form, setForm] = useState({
    title: '',
    content: '',
  });
  const [eventImage, setEventImage] = useState(null);
  const [eventImagePreview, setEventImagePreview] = useState(null);

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchEvent = async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:7778/api/event/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setForm({ title: response.data.event.title, content: response.data.event.content });
        if (response.data.event.eventImage?.length > 0) {
          setEventImagePreview(`http://localhost:7778${response.data.event.eventImage[0]}`);
        }
      }
    };
    fetchEvent();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEventImage(file);
      setEventImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('content', form.content);
    if (eventImage) formData.append('eventImage', eventImage);

    const token = localStorage.getItem('token');
    try {
      const response = await axios.put(`http://localhost:7778/api/event/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data.success) {
        alert('이벤트이 성공적으로 수정되었습니다.');
        navigate('/event');
      } else {
        alert('수정 실패: ' + response.data.message);
      }
    } catch (err) {
      console.error('수정 중 오류:', err);
      alert('수정 중 오류 발생');
    }
  };

  return (
    <div className="event-update-container">
      <h2 className="event-update-title">이벤트 수정</h2>
      <form className="event-update-form" onSubmit={handleSubmit}>
        <div className="event-update-field">
          <label className="event-update-label">제목</label>
          <input
            className="event-update-input"
            type="text"
            name="title"
            value={form.title}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="event-update-field">
          <label className="event-update-label">내용</label>
          <textarea
            className="event-update-textarea"
            name="content"
            value={form.content}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="event-update-field">
          <label className="event-update-label">이벤트 이미지</label>
          <input className="event-update-input" type="file" onChange={handleImageChange} accept="image/*" />
          {eventImagePreview && <img src={eventImagePreview} alt="미리보기" className="event-image-preview" />}
        </div>
        <button type="submit" className="event-update-button">수정</button>
      </form>
    </div>
  );
};

export default EventUpdate;
