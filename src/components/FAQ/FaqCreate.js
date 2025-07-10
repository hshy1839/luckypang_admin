import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../css/NoticeManagement/NoticeCreate.css'; // 재사용

const FaqCreate = () => {
  const [category, setCategory] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!category || !question || !answer) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    const token = localStorage.getItem('token');

    try {
      const response = await axios.post(
        'http://13.124.224.246:7778/api/faq',
        { category, question, answer },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 201) {
        alert('FAQ가 성공적으로 등록되었습니다.');
        navigate('/faq'); // FAQ 리스트 페이지로 이동
      } else {
        alert('FAQ 등록 실패: ' + response.data.message);
      }
    } catch (error) {
      console.error('FAQ 등록 실패:', error);
      alert('FAQ 등록 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="notice-create-container">
      <h2 className="notice-create-title">FAQ 등록</h2>
      <form className="notice-create-form" onSubmit={handleSubmit}>
        <div className="notice-create-field">
          <label className="notice-create-label" htmlFor="category">카테고리</label>
          <input
            className="notice-create-input"
            type="text"
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="예: 회원, 주문, 배송, 결제 등"
            required
          />
        </div>
        <div className="notice-create-field">
          <label className="notice-create-label" htmlFor="question">질문</label>
          <input
            className="notice-create-input"
            type="text"
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="자주 묻는 질문을 입력하세요"
            required
          />
        </div>
        <div className="notice-create-field">
          <label className="notice-create-label" htmlFor="answer">답변</label>
          <textarea
            className="notice-create-input"
            id="answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="질문에 대한 답변을 입력하세요"
            required
            rows={4}
          />
        </div>
        <button type="submit" className="notice-create-button">등록</button>
      </form>
    </div>
  );
};

export default FaqCreate;
