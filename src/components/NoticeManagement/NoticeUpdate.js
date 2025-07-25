import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import '../../css/NoticeManagement/NoticeUpdate.css';

const NoticeUpdate = () => {
  const [form, setForm] = useState({
    title: '',
    content: '',
  });
  const [noticeImage, setNoticeImage] = useState(null);
  const [noticeImagePreview, setNoticeImagePreview] = useState(null);

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchNotice = async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:7778/api/notice/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setForm({ title: response.data.notice.title, content: response.data.notice.content });
        if (response.data.notice.noticeImage?.length > 0) {
          setNoticeImagePreview(`http://localhost:7778${response.data.notice.noticeImage[0]}`);
        }
      }
    };
    fetchNotice();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNoticeImage(file);
      setNoticeImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('content', form.content);
    if (noticeImage) formData.append('noticeImage', noticeImage);

    const token = localStorage.getItem('token');
    try {
      const response = await axios.put(`http://localhost:7778/api/notice/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data.success) {
        alert('공지사항이 성공적으로 수정되었습니다.');
        navigate('/notice');
      } else {
        alert('수정 실패: ' + response.data.message);
      }
    } catch (err) {
      console.error('수정 중 오류:', err);
      alert('수정 중 오류 발생');
    }
  };

  return (
    <div className="notice-update-container">
      <h2 className="notice-update-title">공지사항 수정</h2>
      <form className="notice-update-form" onSubmit={handleSubmit}>
        <div className="notice-update-field">
          <label className="notice-update-label">제목</label>
          <input
            className="notice-update-input"
            type="text"
            name="title"
            value={form.title}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="notice-update-field">
          <label className="notice-update-label">내용</label>
          <textarea
            className="notice-update-textarea"
            name="content"
            value={form.content}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="notice-update-field">
          <label className="notice-update-label">공지 이미지</label>
          <input className="notice-update-input" type="file" onChange={handleImageChange} accept="image/*" />
          {noticeImagePreview && <img src={noticeImagePreview} alt="미리보기" className="notice-image-preview" />}
        </div>
        <button type="submit" className="notice-update-button">수정</button>
      </form>
    </div>
  );
};

export default NoticeUpdate;
