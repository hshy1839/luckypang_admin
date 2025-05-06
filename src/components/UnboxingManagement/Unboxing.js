// UnboxingManagement.js (관리자 언박싱 내역 관리 페이지)
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../css/BoxOrderManagement/BoxOrder.css';
import Header from '../Header';
import * as XLSX from 'xlsx';

const UnboxingManagement = () => {
  const [unboxings, setUnboxings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    fetchUnboxings();
  }, []);

  const fetchUnboxings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:7778/api/orders/unboxed/all', {
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
    if (!searchTerm) return setFiltered(unboxings);
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

  const formatDate = date => new Date(date).toLocaleString('ko-KR');
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const current = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return (
    <div className="box-order-container">
      <Header />
      <div className="box-order-top">
        <h2>언박싱 내역 관리</h2>
        <div className="search-filter">
          <input
            type="text"
            placeholder="유저명, 박스명, 상품명 검색"
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
          {current.map(order => (
            <tr key={order._id}>
              <td>{order._id.slice(-6).toUpperCase()}</td>
              <td>{order.user?.nickname || 'Unknown'}</td>
              <td>{order.box?.name || '-'}</td>
              <td>{order.unboxedProduct?.product?.name || '-'}</td>
              <td>{order.paymentType}</td>
              <td>{order.paymentAmount + (order.pointUsed || 0)} 원</td>
              <td>{formatDate(order.unboxedProduct?.decidedAt)}</td>
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

export default UnboxingManagement;