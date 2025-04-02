import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../css/CouponManagement/CouponCreate.css';

const CouponCreate = () => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !code || !discountType || !discountValue || !validFrom || !validUntil) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    const token = localStorage.getItem('token');

    try {
      const response = await axios.post(
        'http://3.36.74.8:8865/api/coupon',
        {
          name,
          code,
          discountType,
          discountValue: Number(discountValue),
          validFrom,
          validUntil,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        alert('쿠폰이 성공적으로 등록되었습니다.');
        navigate('/coupon');
      } else {
        alert('쿠폰 등록 실패: ' + response.data.message);
      }
    } catch (error) {
      console.error('쿠폰 등록 실패:', error.message);
      alert('쿠폰 등록 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="coupon-create-container">
      <h2 className="coupon-create-title">쿠폰 등록</h2>
      <form className="coupon-create-form" onSubmit={handleSubmit}>
        {/* Coupon Name */}
        <div className="coupon-create-field">
          <label className="coupon-create-label" htmlFor="name">쿠폰 이름</label>
          <input
            className="coupon-create-input"
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="쿠폰 이름을 입력하세요"
            required
          />
        </div>

        {/* Coupon Code */}
        <div className="coupon-create-field">
          <label className="coupon-create-label" htmlFor="code">쿠폰 코드</label>
          <input
            className="coupon-create-input"
            type="text"
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="쿠폰 코드를 입력하세요"
            required
          />
        </div>

        {/* Discount Type */}
        <div className="coupon-create-field">
          <label className="coupon-create-label" htmlFor="discountType">할인 유형</label>
          <select
            className="coupon-create-input"
            id="discountType"
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value)}
            required
          >
            <option value="percentage">퍼센트 (%)</option>
            <option value="fixed">고정 금액</option>
          </select>
        </div>

        {/* Discount Value */}
        <div className="coupon-create-field">
          <label className="coupon-create-label" htmlFor="discountValue">할인 값</label>
          <input
            className="coupon-create-input"
            type="number"
            id="discountValue"
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            placeholder="할인 값을 입력하세요"
            required
          />
        </div>

        {/* Valid From */}
        <div className="coupon-create-field">
          <label className="coupon-create-label" htmlFor="validFrom">시작 날짜</label>
          <input
            className="coupon-create-input"
            type="date"
            id="validFrom"
            value={validFrom}
            onChange={(e) => setValidFrom(e.target.value)}
            required
          />
        </div>

        {/* Valid Until */}
        <div className="coupon-create-field">
          <label className="coupon-create-label" htmlFor="validUntil">만료 날짜</label>
          <input
            className="coupon-create-input"
            type="date"
            id="validUntil"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="coupon-create-button">등록</button>
      </form>
    </div>
  );
};

export default CouponCreate;
