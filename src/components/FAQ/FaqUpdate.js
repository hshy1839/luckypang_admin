import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import '../../css/NoticeManagement/NoticeUpdate.css';

const FaqUpdate = () => {
  const [form, setForm] = useState({
    category: '',
    question: '',
    answer: '',
  });

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchFaq = async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:7778/api/faq/detail/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setForm({
          category: response.data.faq.category,
          question: response.data.faq.question,
          answer: response.data.faq.answer,
        });
      }
    };
    fetchFaq();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    try {
      const response = await axios.put(`http://localhost:7778/api/faq/${id}`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        alert('FAQ가 성공적으로 수정되었습니다.');
        navigate('/faq');
      } else {
        alert('수정 실패: ' + response.data.message);
      }
    } catch (err) {
      console.error('FAQ 수정 오류:', err);
      alert('수정 중 오류 발생');
    }
  };

  return (
    <div className="notice-update-container">
      <h2 className="notice-update-title">FAQ 수정</h2>
      <form className="notice-update-form" onSubmit={handleSubmit}>
        <div className="notice-update-field">
          <label className="notice-update-label">카테고리</label>
          <input
            className="notice-update-input"
            type="text"
            name="category"
            value={form.category}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="notice-update-field">
          <label className="notice-update-label">질문</label>
          <input
            className="notice-update-input"
            type="text"
            name="question"
            value={form.question}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="notice-update-field">
          <label className="notice-update-label">답변</label>
          <textarea
            className="notice-update-textarea"
            name="answer"
            value={form.answer}
            onChange={handleInputChange}
            required
          />
        </div>
        <button type="submit" className="notice-update-button">수정</button>
      </form>
    </div>
  );
};

export default FaqUpdate;
