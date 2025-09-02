import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../Header';
import '../../css/PointsManagement/Points.css';
import { exportToExcel } from '../../utils/exportToExcel';

const Points = () => {
  const [points, setPoints] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPoints, setFilteredPoints] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get('http://localhost:7778/api/points', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success && Array.isArray(response.data.points)) {
          const sorted = response.data.points.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setPoints(sorted);
          setFilteredPoints(sorted);
        }
      } catch (err) {
        console.error('포인트 내역 조회 실패:', err);
      }
    };

    fetchPoints();
  }, []);

  const handleSearch = () => {
    const result = points.filter(point =>
      point.user?.nickname?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPoints(result);
    setCurrentPage(1);
  };

  const handleExcelExport = () => {
    const exportData = filteredPoints.map((point, index) => ({
      번호: index + 1,
      닉네임: point.user?.nickname || '알 수 없음',
      유형: point.type,
      금액: point.amount,
      총액: point.totalAmount || '-',
      설명: point.description || '-',
      생성일: new Date(point.createdAt).toLocaleString(),
    }));

    exportToExcel(exportData, '전체_포인트_내역');
  };

  // 페이지네이션 계산
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentPoints = filteredPoints.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredPoints.length / itemsPerPage);

  // 블록형 페이지네이션
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
    <div className="points-container">
      <Header />
      <div className="points-content">
        <h1>전체 포인트 내역</h1>

        <div className="points-search-box">
          <input
            type="text"
            placeholder="닉네임 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={handleSearch}>검색</button>
        </div>

        <table className="points-table">
          <thead>
            <tr>
              <th>번호</th>
              <th>닉네임</th>
              <th>유형</th>
              <th>금액</th>
              <th>총액</th>
              <th>설명</th>
              <th>생성일</th>
            </tr>
          </thead>
          <tbody>
            {currentPoints.length === 0 ? (
              <tr><td colSpan="7">결과가 없습니다.</td></tr>
            ) : (
              currentPoints.map((point, index) => (
                <tr key={point._id}>
                  <td>{index + 1 + (currentPage - 1) * itemsPerPage}</td>
                  <td>{point.user?.nickname || '알 수 없음'}</td>
                  <td>{point.type}</td>
                  <td>{point.amount.toLocaleString()}</td>
                  <td>{point.totalAmount?.toLocaleString() || '-'}</td>
                  <td>{point.description || '-'}</td>
                  <td>{new Date(point.createdAt).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="point-pagination">
          <button
            onClick={handleBlockPrev}
            disabled={startPage === 1}
            className="point-pagination-btn"
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
            onClick={handleBlockNext}
            disabled={endPage === totalPages}
            className="point-pagination-btn"
          >
            다음
          </button>
        </div>

        <button onClick={handleExcelExport} className="excel-export-button">
          엑셀로 내보내기
        </button>
      </div>
    </div>
  );
};

export default Points;
