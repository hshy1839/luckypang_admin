import React, { useState, useEffect, useMemo } from 'react';
import '../../css/ProductManagement/Product.css';
import Header from '../Header.js';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ProductExcelImport from './ProductExcelImport';

const API_BASE = 'https://luckytang-server.onrender.com';

const Product = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCategory, setSearchCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [selectedIds, setSelectedIds] = useState(new Set()); // 선택된 product._id
  const [deleting, setDeleting] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState({ total: 0, success: 0, fail: 0 });

  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line
  }, []);

  const authHeaders = useMemo(() => {
    const raw = localStorage.getItem('token');
    const token = raw && raw !== 'undefined' && raw !== 'null' ? raw : '';
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const fetchProducts = async () => {
    try {
      if (!authHeaders.Authorization) return;
      const response = await axios.get(`${API_BASE}/api/products/allProduct`, {
        headers: authHeaders,
      });

      if (response.data.success && Array.isArray(response.data.products)) {
        const sorted = response.data.products.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setProducts(sorted);
        // 현재 존재하지 않는 id는 선택목록에서 제거
        setSelectedIds(prev => {
          const next = new Set();
          for (const id of prev) {
            if (sorted.find(p => String(p._id) === String(id))) next.add(id);
          }
          return next;
        });
        // 페이지 범위가 넘어가면 보정
        const totalPagesNext = Math.max(1, Math.ceil(sorted.length / itemsPerPage));
        if (currentPage > totalPagesNext) setCurrentPage(totalPagesNext);
      }
    } catch (error) {
      console.error('상품 정보를 가져오는데 실패했습니다.', error);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm) {
      fetchProducts();
      return;
    }
    try {
      if (!authHeaders.Authorization) return;
      const response = await axios.get(`${API_BASE}/api/products/allProduct`, {
        headers: authHeaders,
      });

      if (response.data.success && Array.isArray(response.data.products)) {
        let filtered = response.data.products;
        filtered = filtered.filter((product) => {
          const name = product.name || '';
          const category = product.category || '';
          const sub = product.category?.sub || '';
          if (searchCategory === 'all') {
            return (
              name.includes(searchTerm) ||
              category.includes(searchTerm) ||
              sub?.includes?.(searchTerm)
            );
          } else if (searchCategory === 'name') {
            return name.includes(searchTerm);
          } else if (searchCategory === 'category') {
            return category.includes(searchTerm) || sub?.includes?.(searchTerm);
          }
          return true;
        });
        setProducts(filtered);
        setSelectedIds(new Set()); // 검색 바뀌면 선택 초기화
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('상품 정보를 가져오는데 실패했습니다.', error);
    }
  };

  const getCategoryDisplay = (category) => category || 'Unknown Category';

  const handleProductClick = (id) => {
    navigate(`/products/productDetail/${id}`);
  };

  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(products.length / itemsPerPage) || 1;

  // 👉 블록형 페이지네이션
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

  const handleWriteClick = () => {
    navigate('/products/productCreate');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'decimal',
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  // --- 선택 로직 ---
  const isRowSelected = (id) => selectedIds.has(String(id));
  const toggleRow = (id) => {
    const key = String(id);
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const allVisibleSelected = currentProducts.length > 0 && currentProducts.every(p => selectedIds.has(String(p._id)));
  const someVisibleSelected = currentProducts.some(p => selectedIds.has(String(p._id))) && !allVisibleSelected;

  const toggleSelectAllVisible = () => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        // 모두 선택되어 있으면 전부 해제
        currentProducts.forEach(p => next.delete(String(p._id)));
      } else {
        // 현재 페이지 모두 선택
        currentProducts.forEach(p => next.add(String(p._id)));
      }
      return next;
    });
  };

  const selectedCount = selectedIds.size;

  // --- 일괄 삭제 ---
  const bulkDelete = async () => {
    if (selectedIds.size === 0) return;
    const ok = window.confirm(`선택된 ${selectedIds.size}개 상품을 삭제하시겠습니까?\n(이미지(S3)도 함께 삭제됩니다)`);
    if (!ok) return;

    if (!authHeaders.Authorization) {
      alert('토큰이 없습니다. 로그인 상태를 확인하세요.');
      return;
    }

    setDeleting(true);
    setDeleteProgress({ total: selectedIds.size, success: 0, fail: 0 });

    // 안전하게 순차 삭제 (원하면 병렬 제한 걸어서 빠르게 가능)
    const ids = Array.from(selectedIds);
    let success = 0;
    let fail = 0;

    for (const id of ids) {
      try {
        const res = await axios.delete(`${API_BASE}/api/products/delete/${id}`, {
          headers: authHeaders,
        });
        if (res?.data?.success) success++;
        else fail++;
      } catch (e) {
        fail++;
      }
      setDeleteProgress({ total: ids.length, success, fail });
    }

    setDeleting(false);

    // 프론트 목록에서 제거
    if (success > 0) {
      setProducts(prev => prev.filter(p => !selectedIds.has(String(p._id))));
      // 페이지 보정
      const after = products.length - success;
      const totalPagesNext = Math.max(1, Math.ceil(after / itemsPerPage));
      if (currentPage > totalPagesNext) setCurrentPage(totalPagesNext);
    }

    // 선택 초기화
    setSelectedIds(new Set());

    // 서버 기준 최신화가 필요하면 주석 해제
    // await fetchProducts();

    // 사용자에게 결과 알림
    alert(`삭제 완료 되었습니다.`);
  };

  return (
    <div className="products-container">
      <Header />
      <div className="products-content">
        <h1>상품 관리</h1>

        <div className="products-search-box">
          <select
            className="search-category"
            value={searchCategory}
            onChange={(e) => setSearchCategory(e.target.value)}
          >
            <option value="all">전체</option>
            <option value="name">상품 이름</option>
            <option value="category">박스종류</option>
          </select>
          <input
            type="text"
            placeholder="검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="search-button" onClick={handleSearch}>
            검색
          </button>

          {/* 선택/삭제 컨트롤 */}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 13, opacity: 0.8 }}>
              선택: {selectedCount}개
            </span>
            <button
              className="danger-button"
              disabled={selectedCount === 0 || deleting}
              onClick={bulkDelete}
              title="선택된 항목을 일괄 삭제"
            >
              {deleting ? `삭제 중… (${deleteProgress.success + deleteProgress.fail}/${deleteProgress.total})` : '선택 삭제'}
            </button>
          </div>
        </div>

        <table className="products-table">
          <thead>
            <tr>
              <th style={{ width: 42 }}>
                {/* 현재 페이지 전체 선택 */}
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  ref={el => {
                    if (el) el.indeterminate = someVisibleSelected;
                  }}
                  onChange={toggleSelectAllVisible}
                />
              </th>
              <th>번호</th>
              <th>상품 이름</th>
              <th>박스종류</th>
              <th>가격</th>
            </tr>
          </thead>
          <tbody>
            {currentProducts.length > 0 ? (
              currentProducts.map((product, index) => {
                const id = String(product._id);
                const rowNumber = index + 1 + (currentPage - 1) * itemsPerPage;
                const selected = isRowSelected(id);
                return (
                  <tr key={id} className={selected ? 'row-selected' : ''}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleRow(id)}
                      />
                    </td>
                    <td>{rowNumber}</td>
                    <td
                      onClick={() => handleProductClick(id)}
                      className='product-title'
                    >
                      {product.name || 'Unknown Product'}
                    </td>
                    <td>{getCategoryDisplay(product.category)}</td>
                    <td>{formatPrice(product.price)} 원</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="no-results">
                  데이터가 없습니다.
                </td>
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
        </div>

        <button className="excel-export-button" style={{ marginTop: 40 }} onClick={handleWriteClick}>
          상품등록
        </button>

        {/* 엑셀 대량 등록 */}
        <ProductExcelImport onDone={fetchProducts} />
      </div>

      {/* 스타일 보완 */}
      <style>{`
        .danger-button {
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid #ef444466;
          background: #b91c1c;
          color: #fff;
          cursor: pointer;
        }
        .danger-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .row-selected {
          background: rgba(59,130,246,0.08);
        }
      `}</style>
    </div>
  );
};

export default Product;
