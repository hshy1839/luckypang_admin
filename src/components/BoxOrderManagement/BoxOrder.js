// BoxOrder.js (관리자 주문 내역서 관리 - 전체 기능 포함)
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
      const res = await axios.get('http://localhost:7778/api/orders', {
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
    if (!searchTerm) return setFilteredOrders(orders);
    const filtered = orders.filter(order =>
      order.user?.nickname?.includes(searchTerm) ||
      order.box?.name?.includes(searchTerm)
    );
    setFilteredOrders(filtered);
    setCurrentPage(1);
  };

  const formatDate = date => new Date(date).toLocaleString('ko-KR');

  const handleRefund = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `http://localhost:7778/api/orders/${orderId}/refund`,
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
      console.error('환불 처리 오류:', err);
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

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  return (
    <div className="box-order-container">
      <Header />
      <div className="box-order-top">
        <h2>박스 주문 내역 관리</h2>
        <div className="search-filter">
          <input
            type="text"
            placeholder="유저명 또는 박스명 검색"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <button onClick={handleSearch}>검색</button>
          <button onClick={exportToExcel}>엑셀 다운로드</button>
        </div>
      </div>

      <table className="box-order-table">
        <thead>
          <tr>
            <th>주문번호</th>
            <th>유저</th>
            <th>박스명</th>
            <th>결제수단</th>
            <th>결제금액</th>
            <th>상태</th>
            <th>주문일</th>
            <th>액션</th>
          </tr>
        </thead>
        <tbody>
          {currentOrders.map((order, idx) => (
            <tr key={order._id}>
              <td>{order._id.slice(-6).toUpperCase()}</td>
              <td>{order.user?.nickname || 'Unknown'}</td>
              <td>{order.box?.name}</td>
              <td>{order.paymentType}</td>
              <td>{order.paymentAmount + (order.pointUsed || 0)} 원</td>
              <td>{order.status}</td>
              <td>{formatDate(order.createdAt)}</td>
              <td>
                <div className='box-order-btn-container'>
                <button onClick={() => navigate(`/boxorder/detail/${order._id}`)}>상세</button>
                {order.status === 'paid' && (
                  <button onClick={() => handleRefund(order._id)}>환불</button>
                )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            className={currentPage === i + 1 ? 'active' : ''}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BoxOrder;