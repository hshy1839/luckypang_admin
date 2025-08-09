import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../css/BoxOrderManagement/BoxOrder.css';
import Header from '../Header';
import * as XLSX from 'xlsx';

const BoxOrder = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://13.124.224.246:7778/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success && Array.isArray(res.data.orders)) {
        setOrders(res.data.orders);
        setFilteredOrders(res.data.orders);
      }
    } catch (err) {
      console.error('주문 불러오기 실패:', err);
    }
  };

  const handleSearch = () => {
    if (!searchTerm) {
      setFilteredOrders(orders);
      setCurrentPage(1);
      return;
    }
    const lower = searchTerm.toLowerCase();
    const filtered = orders.filter(order =>
      order.user?.nickname?.toLowerCase().includes(lower) ||
      order.box?.name?.toLowerCase().includes(lower)
    );
    setFilteredOrders(filtered);
    setCurrentPage(1);
  };

  const formatDate = date => new Date(date).toLocaleString('ko-KR');

  const handleRefund = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `http://13.124.224.246:7778/api/orders/${orderId}/refund`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        alert('환불 완료');
        fetchOrders();
      } else {
        alert(res.data.message || '환불 실패');
      }
    } catch (err) {
      alert('환불 처리 중 오류 발생');
    }
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredOrders.map(o => ({
        주문번호: o._id,
        유저: o.user?.nickname || '',
        박스명: o.box?.name || '',
        결제수단: o.paymentType,
        결제금액: o.paymentAmount + (o.pointUsed || 0),
        상태: o.status,
        주문일자: formatDate(o.createdAt),
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '주문내역');
    XLSX.writeFile(workbook, 'box_orders.xlsx');
  };

  // 블록형 페이지네이션
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
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
        <h1>박스 주문 내역 관리</h1>
        <div className="boxorder-search-box">
          <input
            type="text"
            placeholder="유저명, 박스명 검색"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          <button className="search-button" onClick={handleSearch}>
            검색
          </button>
         
        </div>

        <table className="boxorder-table">
          <thead>
            <tr>
              <th>주문번호</th>
              <th>유저</th>
              <th>박스명</th>
              <th>결제수단</th>
              <th>결제금액</th>
              <th>상태</th>
              <th>주문일</th>
              <th>상세</th>
            </tr>
          </thead>
          <tbody>
            {currentOrders.map((order) => (
              <tr key={order._id}>
                <td>{order._id.slice(-6).toUpperCase()}</td>
                <td>{order.user?.nickname || 'Unknown'}</td>
                <td>{order.box?.name}</td>
                <td>{order.paymentType}</td>
                <td>{order.paymentAmount + (order.pointUsed || 0)} 원</td>
                <td>{order.status}</td>
                <td>{formatDate(order.createdAt)}</td>
                <td>
                    <div className="boxorder-btns">
                    <button onClick={() => navigate(`/boxorder/detail/${order._id}`)}>상세</button>
                    </div>
                </td>
               
              </tr>
            ))}
            {currentOrders.length === 0 && (
              <tr>
                <td colSpan="8" className="no-results">데이터가 없습니다.</td>
              </tr>
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
           <button className="excel-export-button" onClick={exportToExcel}>
            엑셀 다운로드
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default BoxOrder;
