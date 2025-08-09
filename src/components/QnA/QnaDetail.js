import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../Header';
import '../../css/QnaManagement/QnaDetail.css';

const QnaDetail = () => {
  const [qna, setQna] = useState(null);
  const [newAnswer, setNewAnswer] = useState('');
  const [answers, setAnswers] = useState([]);
  const [editingAnswerId, setEditingAnswerId] = useState(null);
  const [editedAnswer, setEditedAnswer] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const id = location.state?.id;

  useEffect(() => {
    if (!id) {
      console.error('ID 정보가 없습니다.');
      return;
    }

    const fetchQnaDetail = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get(
          `https://luckytang-server.onrender.com/api/qnaQuestion/getinfoByid/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data?.success) {
          setQna(response.data.question);
        } else {
          console.log('QnA 상세 데이터 로드 실패');
        }
      } catch (error) {
        console.error('QnA 상세 정보를 가져오는데 실패했습니다.', error);
      }
    };

    const fetchAnswers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get(
          `https://luckytang-server.onrender.com/api/qnaQuestion/getAnswers/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data?.success) {
          setAnswers(response.data.answers);
        } else {
          console.log('답변 데이터 로드 실패');
        }
      } catch (error) {
        console.error('답변 데이터를 가져오는데 실패했습니다.', error);
      }
    };

    fetchQnaDetail();
    fetchAnswers();
  }, [id]);

  const handleAnswerSave = async () => {
    if (!newAnswer.trim()) {
      alert('답변을 입력해주세요.');
      return;
    }

    if (!qna?.category) {
      alert('카테고리 정보가 없어 답변을 저장할 수 없습니다.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.post(
        `https://luckytang-server.onrender.com/api/qnaQuestion/addAnswer/${id}`,
        {
          body: newAnswer,
          category: qna.category,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.success) {
        setAnswers([response.data.answer]);
        setNewAnswer('');
        alert('답변이 등록되었습니다.');
      } else {
        alert('답변 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('답변 저장 중 오류:', error);
      alert('서버와의 연결에 문제가 발생했습니다.');
    }
  };

  const handleDelete = async (answerId) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.delete(
        `https://luckytang-server.onrender.com/api/qnaAnswer/${answerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.success) {
        setAnswers([]);
        alert('삭제되었습니다.');
      } else {
        alert('삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('삭제 중 오류:', error);
      alert('삭제 중 문제가 발생했습니다.');
    }
  };

  const handleEditStart = (answer) => {
    setEditingAnswerId(answer._id);
    setEditedAnswer(answer.body);
  };

  const handleEditSave = async (answerId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.put(
        `https://luckytang-server.onrender.com/api/qnaAnswer/${answerId}`,
        {
          body: editedAnswer,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.success) {
        setAnswers([response.data.answer]);
        setEditingAnswerId(null);
        setEditedAnswer('');
        alert('수정되었습니다.');
      } else {
        alert('수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('수정 중 오류:', error);
      alert('수정 중 문제가 발생했습니다.');
    }
  };

  if (!qna) return <div>로딩 중...</div>;

  return (
    <div className="qna-detail-container">
      <Header />
      <div className="qna-detail-content-wrapper">
        <table className="qna-detail-table">
          <h3>QnA 상세 정보</h3>
          <tbody>
            <tr>
              <th>제목</th>
              <td>{qna.title}</td>
            </tr>
            <tr>
              <th>카테고리</th>
              <td>{qna.category || '없음'}</td>
            </tr>
            <tr>
              <th>작성자</th>
              <td>{qna.userId?.nickname || '알 수 없음'}</td>
            </tr>
            <tr>
              <th>작성 날짜</th>
              <td>{new Date(qna.createdAt).toLocaleDateString()}</td>
            </tr>
            <tr>
              <th>내용</th>
              <td><div className="qna-content">{qna.body}</div></td>
            </tr>
          </tbody>
        </table>

        {answers.length === 0 ? (
          <div className="qna-answer-form">
            <h2>답변 작성</h2>
            <textarea
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              className="qna-textarea"
              placeholder="답변을 입력하세요."
            />
            <button className="qna-save-button" onClick={handleAnswerSave}>
              답변 저장
            </button>
          </div>
        ) : (
          <div className="qna-answer-section">
            <h2>답변</h2>
            {answers.map((answer) => (
              <table key={answer._id} className="qna-detail-table" style={{ marginBottom: '24px' }}>
                <tbody>
                  <tr>
                    <th>작성 날짜</th>
                    <td>{new Date(answer.createdAt).toLocaleDateString()}</td>
                  </tr>
                  <tr>
                    <th>답변 내용</th>
                    <td>
                      {editingAnswerId === answer._id ? (
                        <textarea
                          value={editedAnswer}
                          onChange={(e) => setEditedAnswer(e.target.value)}
                          className="qna-textarea"
                        />
                      ) : (
                        <div className="qna-content">{answer.body}</div>
                      )}
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="2">
                      <div className="qna-button-group">
                        {editingAnswerId === answer._id ? (
                          <>
                            <button onClick={() => handleEditSave(answer._id)} className="qna-button edit">저장</button>
                            <button onClick={() => setEditingAnswerId(null)} className="qna-button delete">취소</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleEditStart(answer)} className="qna-button edit">수정</button>
                            <button onClick={() => handleDelete(answer._id)} className="qna-button delete">삭제</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                </tfoot>
              </table>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QnaDetail;
