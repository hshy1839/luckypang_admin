// import React, { useState, useEffect } from 'react';
// import '../../css/NoticeManagement/Notice.css';
// import Header from '../Header.js';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// const Qna = () => {
//     const [qnaQuestions, setQnaQuestions] = useState([]); // QnA 데이터
//     const [allQnaQuestions, setAllQnaQuestions] = useState([]); // 원본 데이터
//     const [searchTerm, setSearchTerm] = useState(''); // 검색어 상태
//     const [searchCategory, setSearchCategory] = useState('all'); // 검색 기준 상태

//     const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
//     const itemsPerPage = 10; // 페이지당 표시할 항목 수

//     const navigate = useNavigate();

//     useEffect(() => {
//         const fetchQnaQuestions = async () => {
//             try {
//                 const token = localStorage.getItem('token');
//                 if (!token) {
//                     console.log('로그인 정보가 없습니다.');
//                     return;
//                 }

//                 const response = await axios.get('http://3.36.74.8:8865/api/qnaQuestion/getinfoAll', {
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                     },
//                 });

//                 if (response.data && response.data.success) {
//                     const questions = response.data.questions;
//                     if (questions && questions.length > 0) {
//                         questions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // 날짜 내림차순 정렬
//                         setQnaQuestions(questions);
//                         setAllQnaQuestions(questions);
//                     } else {
//                         console.error('질문 데이터가 없습니다.');
//                     }
//                 } else {
//                     console.log('질문 데이터 로드 실패');
//                 }
//             } catch (error) {
//                 console.error('질문 데이터를 가져오는데 실패했습니다.', error);
//             }
//         };

//         fetchQnaQuestions();
//     }, []);

//     useEffect(() => {
//         handleSearch();
//     }, [searchTerm, searchCategory]);

//     const handleSearch = () => {
//         const filteredQuestions = allQnaQuestions.filter((question) => {
//             if (searchCategory === 'all') {
//                 return (
//                     question.title.includes(searchTerm) ||
//                     question.userId.username.includes(searchTerm)
//                 );
//             } else if (searchCategory === 'title') {
//                 return question.title.includes(searchTerm);
//             } else if (searchCategory === 'author') {
//                 return question.userId.username.includes(searchTerm);
//             }
//             return true;
//         });

//         setQnaQuestions(filteredQuestions);
//         setCurrentPage(1); // 검색 시 첫 페이지로 이동
//     };


//     const handleQnaClick = (id) => {
//         navigate(`/QnA/qna/qnaDetail/${id}`, { state: { id }});
//     };

//     // 페이지네이션 관련 변수
//     const indexOfLastQuestion = currentPage * itemsPerPage;
//     const indexOfFirstQuestion = indexOfLastQuestion - itemsPerPage;
//     const currentQuestions = qnaQuestions.slice(indexOfFirstQuestion, indexOfLastQuestion);
//     const totalPages = Math.ceil(qnaQuestions.length / itemsPerPage);

//     const handlePreviousPage = () => {
//         if (currentPage > 1) setCurrentPage(currentPage - 1);
//     };

//     const handleNextPage = () => {
//         if (currentPage < totalPages) setCurrentPage(currentPage + 1);
//     };

//     const handlePageChange = (pageNumber) => {
//         setCurrentPage(pageNumber);
//     };

//     return (
//         <div className="notice-management-container">
//             <Header />
//             <div className="notice-management-container-container">
//                 <div className="notice-top-container-container">
//                     <h1>1:1 문의</h1>

//                     {/* 검색 박스 */}
//                     <div className="notice-search-box">
//                         <select
//                             className="search-category"
//                             value={searchCategory}
//                             onChange={(e) => setSearchCategory(e.target.value)}
//                         >
//                             <option value="all">전체</option>
//                             <option value="title">제목</option>
//                             <option value="author">작성자</option>
//                         </select>
//                         <input
//                             type="text"
//                             placeholder="검색..."
//                             value={searchTerm}
//                             onChange={(e) => setSearchTerm(e.target.value)}
//                         />
//                         <button className="search-button" onClick={handleSearch}>
//                             검색
//                         </button>
//                     </div>

//                     {/* QnA 정보 테이블 */}
//                     <table className="notice-table">
//                         <thead>
//                             <tr>
//                                 <th>번호</th>
//                                 <th>제목</th>
//                                 <th>작성자</th>
//                                 <th>작성 날짜</th>
//                                 <th>답변 상태</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {currentQuestions.length === 0 ? (
//                                 <tr>
//                                     <td colSpan="10" className="no-results">
//                                         존재하지 않습니다.
//                                     </td>
//                                 </tr>
//                             ) : (
//                                 currentQuestions.map((question, index) => {
//                                     const isAnswered = question.answers && question.answers.length > 0;

//                                     return (
//                                         <tr key={question._id}>
//                                             <td>{allQnaQuestions.length - (indexOfFirstQuestion + index)}</td>
//                                             <td>
//                                                 <a
//                                                     className="notice-title"
//                                                     onClick={() => handleQnaClick(question._id)}
//                                                 >
//                                                     {question.title}
//                                                 </a>
//                                             </td>
//                                             <td>{question.userId?.username || '알 수 없음'}</td>
//                                             <td>{new Date(question.createdAt).toLocaleDateString()}</td>
//                                             <td className={isAnswered ? 'answered' : 'unanswered'}>
//                                                 {isAnswered ? '답변 완료' : '답변 전'}
//                                             </td>
//                                         </tr>
//                                     );
//                                 })
//                             )}
//                         </tbody>
//                     </table>

//                     {/* 페이지네이션 */}
//                     <div className="pagination">
//                         <button
//                             className="prev-page-btn"
//                             onClick={handlePreviousPage}
//                             disabled={currentPage === 1}
//                         >
//                             이전
//                         </button>
//                         {[...Array(totalPages)].map((_, i) => (
//                             <button
//                                 key={i}
//                                 onClick={() => handlePageChange(i + 1)}
//                                 className={currentPage === i + 1 ? 'active' : ''}
//                                 id="page-number-btn"
//                             >
//                                 {i + 1}
//                             </button>
//                         ))}
//                         <button
//                             className="next-page-btn"
//                             onClick={handleNextPage}
//                             disabled={currentPage === totalPages}
//                         >
//                             다음
//                         </button>
//                     </div>
//                 </div>
              
//             </div>
//         </div>
//     );
// };

// export default Qna;
