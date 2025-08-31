import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../Header';
import * as XLSX from 'xlsx';
import '../../css/BoxOrderManagement/BoxOrder.css';

const UnboxingManagement = () => {
  const [unboxings, setUnboxings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchUnboxings();
  }, []);

  const fetchUnboxings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://13.124.224.246:7778/api/orders/unboxed/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success && Array.isArray(res.data.orders)) {
        setUnboxings(res.data.orders);
        setFiltered(res.data.orders);
      }
    } catch (err) {
      console.error('언박싱 내역 불러오기 실패:', err);
    }
  };

  const handleSearch = () => {
    if (!searchTerm) {
      setFiltered(unboxings);
      setCurrentPage(1);
      return;
    }
    const lower = searchTerm.toLowerCase();
    const result = unboxings.filter(order =>
      order.user?.nickname?.toLowerCase().includes(lower) ||
      order.box?.name?.toLowerCase().includes(lower) ||
      order.unboxedProduct?.product?.name?.toLowerCase().includes(lower)
    );
    setFiltered(result);
    setCurrentPage(1);
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filtered.map(o => ({
        주문ID: o._id,
        유저: o.user?.nickname || '',
        박스명: o.box?.name || '',
        당첨상품: o.unboxedProduct?.product?.name || '',
        결제수단: o.paymentType,
        결제금액: o.paymentAmount + (o.pointUsed || 0),
        언박싱일: new Date(o.unboxedProduct?.decidedAt).toLocaleString('ko-KR')
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '언박싱내역');
    XLSX.writeFile(workbook, 'unboxings.xlsx');
  };

  const formatDate = date => date ? new Date(date).toLocaleString('ko-KR') : '-';

  // --- 페이지네이션 블록 로직 ---
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const current = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
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
    <div className="boxorder-container">
      <Header />
      <div className="boxorder-content">
        <h1>언박싱 내역 관리</h1>
        <div className="boxorder-search-box">
          <input
            type="text"
            placeholder="유저명, 박스명, 상품명 검색"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          <button className="search-button" onClick={handleSearch}>검색</button>
          
        </div>
        <table className="boxorder-table">
          <thead>
            <tr>
              <th>박스ID</th>
              <th>유저</th>
              <th>박스명</th>
              <th>상품명</th>
              <th>결제수단</th>
              <th>결제금액</th>
              <th>언박싱일</th>
            </tr>
          </thead>
          <tbody>
            {current.length > 0 ? current.map(order => (
              <tr key={order._id}>
                <td>{order._id.slice(-6).toUpperCase()}</td>
                <td>{order.user?.nickname || '-'}</td>
                <td>{order.box?.name || '-'}</td>
                <td>{order.unboxedProduct?.product?.name || '-'}</td>
                <td>{order.paymentType}</td>
                <td>{order.paymentAmount + (order.pointUsed || 0)} 원</td>
                <td>{formatDate(order.unboxedProduct?.decidedAt)}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} className="no-results">데이터가 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="point-pagination">
          <button
            className="point-pagination-btn"
            onClick={handleBlockPrev}
            disabled={startPage === 1}
          >이전</button>
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
          >다음</button>
        <button className="excel-export-button" onClick={exportToExcel}>엑셀 다운로드</button>

        </div>
      </div>
    </div>
  );
};

export default UnboxingManagement;
