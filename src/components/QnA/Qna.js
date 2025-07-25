import React, { useState, useEffect } from 'react';
import '../../css/QnaManagement/Qna.css';
import Header from '../Header.js';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Qna = () => {
    const [qnaQuestions, setQnaQuestions] = useState([]);
    const [allQnaQuestions, setAllQnaQuestions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchCategory, setSearchCategory] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const navigate = useNavigate();

    useEffect(() => {
        const fetchQnaQuestions = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const response = await axios.get('http://localhost:7778/api/qnaQuestion/getinfoAll', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.data && response.data.success) {
                    const questions = response.data.questions || [];
                    questions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    setQnaQuestions(questions);
                    setAllQnaQuestions(questions);
                }
            } catch (error) {
                console.error('질문 데이터를 가져오는데 실패했습니다.', error);
            }
        };
        fetchQnaQuestions();
    }, []);

   

  const handleSearch = () => {
    const filteredQuestions = allQnaQuestions.filter((question) => {
        const titleMatch = question.title?.includes(searchTerm);
        const authorMatch = question.userId?.nickname?.includes(searchTerm);
        const categoryMatch = question.category?.includes(searchTerm);

        if (searchCategory === 'all') {
            return titleMatch || authorMatch || categoryMatch;
        } else if (searchCategory === 'title') {
            return titleMatch;
        } else if (searchCategory === 'author') {
            return authorMatch;
        } else if (searchCategory === 'category') {
            return categoryMatch;
        }
        return true;
    });

    setQnaQuestions(filteredQuestions);
    setCurrentPage(1);
};


    const handleQnaClick = (id) => {
        navigate(`/QnA/qna/qnaDetail/${id}`, { state: { id } });
    };

    // 페이지네이션 블록
    const indexOfLastQuestion = currentPage * itemsPerPage;
    const indexOfFirstQuestion = indexOfLastQuestion - itemsPerPage;
    const currentQuestions = qnaQuestions.slice(indexOfFirstQuestion, indexOfLastQuestion);
    const totalPages = Math.ceil(qnaQuestions.length / itemsPerPage);

    // 블록형 페이지네이션 (10개씩)
    const pagesPerBlock = 10;
    const currentBlock = Math.floor((currentPage - 1) / pagesPerBlock);
    const startPage = currentBlock * pagesPerBlock + 1;
    const endPage = Math.min(startPage + pagesPerBlock - 1, totalPages);

    const handleBlockPrev = () => {
        if (startPage > 1) setCurrentPage(startPage - pagesPerBlock);
    };
    const handleBlockNext = () => {
        if (endPage < totalPages) setCurrentPage(endPage + 1);
    };

    return (
        <div className="qna-container">
            <Header />
            <div className="qna-content">
                <h1>1:1 문의</h1>

                <div className="qna-search-box">
                    <div className="search-select-wrapper">
  <select
    className="search-category"
    value={searchCategory}
    onChange={(e) => setSearchCategory(e.target.value)}
  >
    <option value="all">전체</option>
    <option value="title">제목</option>
    <option value="author">작성자</option>
    <option value="category">카테고리</option>
  </select>
  <span className="select-icon">▼</span>
</div>

                    <input
                        type="text"
                        placeholder="검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="search-button" onClick={handleSearch}>
                        검색
                    </button>
                </div>

                <table className="qna-table">
                    <thead>
                        <tr>
                            <th>번호</th>
                            <th>제목</th>
                            <th>카테고리</th>
                            <th>작성자</th>
                            <th>작성 날짜</th>
                            <th>답변 상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentQuestions.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="no-results">
                                    존재하지 않습니다.
                                </td>
                            </tr>
                        ) : (
                            currentQuestions.map((question, index) => {
                                const isAnswered = question.answers && question.answers.length > 0;
                                return (
                                    <tr key={question._id}>
                                        <td>{allQnaQuestions.length - (indexOfFirstQuestion + index)}</td>
                                        <td>
                                            <span
                                                className="qna-title"
                                                onClick={() => handleQnaClick(question._id)}
                                            >
                                                {question.title}
                                            </span>
                                        </td>
                                        <td>{question.category || '-'}</td>
                                        <td>{question.userId?.nickname || '알 수 없음'}</td>
                                        <td>{new Date(question.createdAt).toLocaleDateString()}</td>
                                        <td className={isAnswered ? 'answered' : 'unanswered'}>
                                            {isAnswered ? '답변 완료' : '답변 전'}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>

                <div className="point-pagination">
                    <button
                        className="point-pagination-btn"
                        onClick={handleBlockPrev}
                        disabled={startPage === 1}
                    >
                        이전
                    </button>
                    {[...Array(endPage - startPage + 1)].map((_, idx) => {
                        const pageNum = startPage + idx;
                        return (
                            <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`point-pagination-btn${currentPage === pageNum ? ' active' : ''}`}
                            >
                                {pageNum}
                            </button>
                        );
                    })}
                    <button
                        className="point-pagination-btn"
                        onClick={handleBlockNext}
                        disabled={endPage === totalPages}
                    >
                        다음
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Qna;
