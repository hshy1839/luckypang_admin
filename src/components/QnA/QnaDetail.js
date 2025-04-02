// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useNavigate, useLocation } from 'react-router-dom';
// import Header from '../Header';
// import '../../css/NoticeManagement/NoticeDetail.css';

// const QnaDetail = () => {
//     const [qna, setQna] = useState(null); // QnA 상세 정보 상태
//     const [newAnswer, setNewAnswer] = useState(''); // 새 답변 상태
//     const [answers, setAnswers] = useState([]); // 답변 목록 상태
//     const navigate = useNavigate(); // 페이지 이동을 위한 useNavigate 훅
//     const location = useLocation(); // 전달된 state 데이터 가져오기
//     const id = location.state?.id; // 전달받은 id

//     useEffect(() => {
//         if (!id) {
//             console.error('ID 정보가 없습니다.');
//             return;
//         }

//         // 질문 상세 정보 가져오기
//         const fetchQnaDetail = async () => {
//             try {
//                 const token = localStorage.getItem('token');
//                 if (!token) {
//                     console.log('로그인 정보가 없습니다.');
//                     return;
//                 }

//                 const response = await axios.get(
//                     `http://3.36.74.8:8865/api/qnaQuestion/getinfoByid/${id}`,
//                     {
//                         headers: {
//                             Authorization: `Bearer ${token}`,
//                         },
//                     }
//                 );

//                 if (response.data && response.data.success) {
//                     setQna(response.data.question);
//                 } else {
//                     console.log('QnA 상세 데이터 로드 실패');
//                 }
//             } catch (error) {
//                 console.error('QnA 상세 정보를 가져오는데 실패했습니다.', error);
//             }
//         };

//         // 답변 목록 가져오기
//         const fetchAnswers = async () => {
//             try {
//                 const token = localStorage.getItem('token');
//                 if (!token) {
//                     console.log('로그인 정보가 없습니다.');
//                     return;
//                 }

//                 const response = await axios.get(
//                     `http://3.36.74.8:8865/api/qnaQuestion/getAnswers/${id}`,
//                     {
//                         headers: {
//                             Authorization: `Bearer ${token}`,
//                         },
//                     }
//                 );

//                 if (response.data && response.data.success) {
//                     setAnswers(response.data.answers); // 답변 상태 업데이트
//                 } else {
//                     console.log('답변 데이터 로드 실패');
//                 }
//             } catch (error) {
//                 console.error('답변 데이터를 가져오는데 실패했습니다.', error);
//             }
//         };

//         fetchQnaDetail();
//         fetchAnswers();
//     }, [id]);

//     const handleAnswerSave = async () => {
//         if (!newAnswer.trim()) {
//             alert('답변을 입력해주세요.');
//             return;
//         }

//         try {
//             const token = localStorage.getItem('token');
//             if (!token) {
//                 alert('로그인 정보가 없습니다.');
//                 return;
//             }

//             const response = await axios.post(
//                 `http://3.36.74.8:8865/api/qnaQuestion/addAnswer/${id}`,
//                 { body: newAnswer },
//                 {
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                     },
//                 }
//             );

//             if (response.data && response.data.success) {
//                 setAnswers((prev) => [...prev, response.data.answer]); // 새로운 답변 추가
//                 setNewAnswer(''); // 답변 입력 필드 초기화
//                 alert('답변이 등록되었습니다.');
//             } else {
//                 alert('답변 등록에 실패했습니다.');
//             }
//         } catch (error) {
//             console.error('답변 저장 중 오류가 발생했습니다.', error);
//             alert('서버와의 연결에 문제가 발생했습니다. 다시 시도해주세요.');
//         }
//     };

//     if (!qna) {
//         return <div>로딩 중...</div>;
//     }

//     return (
//         <div className="notice-detail-container">
//             <Header />
//             <div className="notice-detail-container-container">
//                 <h1>{qna.title}</h1>
//                 <p>
//                     <strong>작성자:</strong> {qna.userId?.username || '알 수 없음'}
//                 </p>
//                 <p>
//                     <strong>작성 날짜:</strong> {new Date(qna.createdAt).toLocaleDateString()}
//                 </p>
//                 <div className="notice-content">
//                     <p>{qna.body}</p>
//                 </div>

//                 {/* 답변 표시 또는 작성 섹션 */}
//                 {answers.length > 0 ? (
//                     <div className="answer-section">
//                         <h2>답변</h2>
//                         {answers.map((answer) => (
//                             <div key={answer._id} className="answer-item">
//                                 <p><strong>작성자 : </strong>{answer.userId?.username || '알 수 없음'}</p>
//                                 <p className="answer-date"><strong>작성 날짜 : </strong>{new Date(answer.createdAt).toLocaleDateString()}</p>
//                                 <div className="notice-content"><p><strong>작성 내용</strong> : {answer.body}</p></div>
//                             </div>
//                         ))}
//                     </div>
//                 ) : (
//                     <div className="answer-container">
//                         <h2>답변 작성</h2>
//                         <textarea
//                             value={newAnswer}
//                             onChange={(e) => setNewAnswer(e.target.value)}
//                             className="edit-textarea"
//                             placeholder="답변을 입력하세요."
//                         />
//                         <button className="save-button" onClick={handleAnswerSave}>
//                             답변 저장
//                         </button>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default QnaDetail;
