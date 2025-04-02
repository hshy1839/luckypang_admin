import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../Header';
import '../../css/CouponManagement/Coupon.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faBan, faTrash } from '@fortawesome/free-solid-svg-icons';

const Coupon = () => {
    const [coupons, setCoupons] = useState([]);
    const [filteredCoupons, setFilteredCoupons] = useState([]); // 검색된 쿠폰 저장
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const navigate = useNavigate();

    const fetchCoupons = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await axios.get('http://3.36.74.8:8865/api/coupons', {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.success && Array.isArray(response.data.coupons)) {
                const sortedCoupons = response.data.coupons.sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                );
                setCoupons(sortedCoupons);
                setFilteredCoupons(sortedCoupons); // 처음에는 모든 쿠폰을 표시
            }
        } catch (error) {
            console.error('쿠폰 정보를 가져오는데 실패했습니다.', error);
        }
    };

    
    useEffect(() => {
        fetchCoupons();
    }, []);

    const handleSearch = () => {
        if (!searchTerm) {
            setFilteredCoupons(coupons); // 검색어가 없으면 전체 쿠폰 표시
            return;
        }

        const results = coupons.filter(coupon =>
            coupon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            coupon.code.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredCoupons(results);
    };

    const handleCreateCouponClick = () => {
        navigate('/coupon/create');
    };

    const handleToggleActive = async (id, isActive) => {
        const confirmMessage = isActive
            ? '쿠폰을 활성화하시겠습니까?'
            : '쿠폰을 비활성화하시겠습니까?';

        if (!window.confirm(confirmMessage)) return;

        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await axios.put(
                `http://3.36.74.8:8865/api/coupon/${id}`,
                { isActive },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                alert(`쿠폰이 ${isActive ? '활성화' : '비활성화'}되었습니다.`);
                fetchCoupons();
            }
        } catch (error) {
            console.error(`쿠폰 ${isActive ? '활성화' : '비활성화'} 실패:`, error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('쿠폰을 삭제하시겠습니까?')) return;

        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await axios.delete(`http://3.36.74.8:8865/api/coupon/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.success) {
                alert('쿠폰이 삭제되었습니다.');
                fetchCoupons();
            }
        } catch (error) {
            console.error('쿠폰 삭제 실패:', error);
        }
    };

    const indexOfLastCoupon = currentPage * itemsPerPage;
    const indexOfFirstCoupon = indexOfLastCoupon - itemsPerPage;
    const currentCoupons = filteredCoupons.slice(indexOfFirstCoupon, indexOfLastCoupon);
    const totalPages = Math.ceil(filteredCoupons.length / itemsPerPage);

    const handlePreviousPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };
    
    return (
        <div className="coupon-management-container">
            <Header />
            <div className="coupon-management-container-container">
                <div className="coupon-top-container-container">
                    <h1>쿠폰 관리</h1>
                    <div className="coupon-search-box">
                        <input
                            type="text"
                            placeholder="쿠폰 이름 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="search-button" onClick={handleSearch}>
                            검색
                        </button>
                    </div>

                    <table className="coupon-table">
                        <thead>
                            <tr>
                                <th>번호</th>
                                <th>쿠폰 이름</th>
                                <th>코드</th>
                                <th>할인율</th>
                                <th>유효 기간</th>
                                <th>활성 카테고리</th>
                                <th>상태</th>
                                <th>액션</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentCoupons.map((coupon, index) => (
                                <tr key={coupon._id}>
                                    <td>{index + 1 + (currentPage - 1) * itemsPerPage}</td>
                                    <td>{coupon.name || 'Unknown Coupon'}</td>
                                    <td>{coupon.code || 'Unknown Code'}</td>
                                    <td>
                                        {coupon.discountType === 'percentage'
                                            ? `${coupon.discountValue}%`
                                            : `${coupon.discountValue.toLocaleString()}원`}
                                    </td>
                                    <td>
                                        {coupon.validUntil
                                            ? new Date(coupon.validUntil).toLocaleDateString()
                                            : '무제한'}
                                    </td>
                                    <td>
                                        {coupon.applicableCategories && coupon.applicableCategories.length > 0
                                            ? coupon.applicableCategories.join(', ')
                                            : '모든 카테고리'}
                                    </td>
                                    <td>{coupon.isActive ? '활성화' : '비활성화'}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <FontAwesomeIcon
                                                icon={faCheck}
                                                onClick={() => handleToggleActive(coupon._id, true)}
                                                className="approve-btn"
                                                title="활성화"
                                            />
                                            <FontAwesomeIcon
                                                icon={faBan}
                                                onClick={() => handleToggleActive(coupon._id, false)}
                                                className="reject-btn"
                                                title="비활성화"
                                            />
                                            <FontAwesomeIcon
                                                icon={faTrash}
                                                onClick={() => handleDelete(coupon._id)}
                                                className="delete-btn"
                                                title="삭제"
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="pagination">
                        <button className="prev-page-btn" onClick={handlePreviousPage} disabled={currentPage === 1}>
                            이전
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => handlePageChange(i + 1)}
                                className={currentPage === i + 1 ? 'active' : ''}
                                id='page-number-btn'
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button className='next-page-btn' onClick={handleNextPage} disabled={currentPage === totalPages}>
                            다음
                        </button>
                    </div>
                <div className="write-btn-container">
                    <button className="write-btn" onClick={handleCreateCouponClick}>
                        쿠폰 등록
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Coupon;
