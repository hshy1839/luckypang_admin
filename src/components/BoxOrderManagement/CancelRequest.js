// src/components/BoxOrderManagement/CancelRequest.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../css/BoxOrderManagement/BoxOrder.css';
import Header from '../Header';
import * as XLSX from 'xlsx';

const API_BASE = 'http://13.124.224.246:7778';

const CancelRequest = () => {
  const [orders, setOrders] = useState([]);             
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]); 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCancelRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getAuthHeaders = () => {
    const raw = localStorage.getItem('token');
    const token = raw && raw !== 'undefined' && raw !== 'null' ? raw : '';
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  };

  const fetchCancelRequests = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/orders/all`, { headers: getAuthHeaders() });
      if (res.data?.success && Array.isArray(res.data.orders)) {
        const onlyCancelRequested = res.data.orders.filter(
          o => o.status === 'cancel_requested' || o.status === 'cancelled'
        );
        setOrders(onlyCancelRequested);
        setFilteredOrders(onlyCancelRequested);
        setCurrentPage(1);
      } else {
        setOrders([]);
        setFilteredOrders([]);
      }
    } catch (err) {
      console.error('취소 신청 목록 불러오기 실패:', err?.response?.status, err?.response?.data || err);
      setOrders([]);
      setFilteredOrders([]);
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

  const formatDate = (date) => (date ? new Date(date).toLocaleString('ko-KR') : '-');

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredOrders.map(o => ({
        주문번호: o._id,
        유저: o.user?.nickname || '',
        박스명: o.box?.name || '',
        결제수단: o.paymentType,
        결제금액: (o.paymentAmount || 0) + (o.pointUsed || 0),
        주문일자: formatDate(o.createdAt),
        상태: o.status,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '취소신청');
    XLSX.writeFile(workbook, 'cancel_requests.xlsx');
  };

  const renderStatusCell = (order) => {
    if (order.status === 'cancelled') {
      return <span style={{ color: 'red', fontWeight: 'bold' }}>취소완료</span>;
    }

    if (order.status === 'cancel_requested') {
      return (
        <select
          value={order.status}
          onChange={async (e) => {
            const next = e.target.value;
            if (!['cancel_requested', 'cancelled'].includes(next)) return;

            if (next === 'cancelled') {
              const ok = window.confirm('해당 주문을 "취소완료"로 처리하시겠습니까?');
              if (!ok) return;
            }

            const prevOrders = [...orders];
            const prevFiltered = [...filteredOrders];

            setOrders(curr => curr.map(o => (o._id === order._id ? { ...o, status: next } : o)));
            setFilteredOrders(curr => curr.map(o => (o._id === order._id ? { ...o, status: next } : o)));

            try {
              await axios.patch(
                `${API_BASE}/api/order/${order._id}`,
                { status: next },
                { headers: getAuthHeaders() }
              );
            } catch (err) {
              console.error('상태 변경 실패:', err?.response?.status, err?.response?.data || err);
              alert('상태 변경 실패');
              setOrders(prevOrders);
              setFilteredOrders(prevFiltered);
            }
          }}
        >
          <option value="cancel_requested">취소 요청</option>
          <option value="cancelled">취소완료</option>
        </select>
      );
    }

    return order.status;
  };

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
        <h1>취소 신청 관리</h1>

        <div className="boxorder-search-box">
          <input
            type="text"
            placeholder="유저명, 박스명 검색"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          <button className="search-button" onClick={handleSearch}>검색</button>
        </div>

        <table className="boxorder-table">
          <thead>
            <tr>
              <th>주문번호</th>
              <th>유저</th>
              <th>박스명</th>
              <th>결제수단</th>
              <th>결제금액</th>
              <th>주문일</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {currentOrders.length > 0 ? currentOrders.map(order => (
              <tr key={order._id}>
                <td>{order._id.slice(-6).toUpperCase()}</td>
                <td>{order.user?.nickname || 'Unknown'}</td>
                <td>{order.box?.name || '-'}</td>
                <td>{order.paymentType}</td>
                <td>{(order.paymentAmount || 0) + (order.pointUsed || 0)} 원</td>
                <td>{formatDate(order.createdAt)}</td>
                <td>{renderStatusCell(order)}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="7" className="no-results">데이터가 없습니다.</td>
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
              >{pageNum}</button>
            );
          })}
          <button
            className="point-pagination-btn"
            onClick={handleBlockNext}
            disabled={endPage === totalPages}
          >다음</button>
          <button className="excel-export-button" onClick={exportToExcel}>
            엑셀 다운로드
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelRequest;
