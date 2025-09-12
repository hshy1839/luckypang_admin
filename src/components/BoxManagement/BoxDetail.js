import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../Header';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import '../../css/BoxManagement/BoxDetail.css';

const BoxDetail = () => {
  const [box, setBox] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBoxDetail = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get(
          `http://13.124.224.246:7778/api/box/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data && response.data.success) {
          setBox(response.data.box);
        }
      } catch (error) {
        console.error('상품 상세 정보를 가져오는데 실패했습니다.', error);
      }
    };

    fetchBoxDetail();
  }, [id]);

  const handleEdit = () => {
    navigate(`/box/boxUpdate/${id}`);
  };

  const handleDelete = async () => {
    if (!window.confirm('이 박스를 삭제하시겠습니까?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `http://13.124.224.246:7778/api/box/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data && response.data.success) {
        alert('상품이 삭제되었습니다.');
        navigate('/box');
      } else {
        alert('상품 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('상품 삭제 중 오류가 발생했습니다.', error);
    }
  };

  const handleExportToExcel = () => {
    if (!box) return;

    const data = [
      {
        박스명: box.name,
        가격: box.price,
        '공개 여부': box.isPublic ? '공개' : '비공개',
        '상태 상세': box.type,
        박스시작: box.availableFrom,
        박스마감: box.availableUntil,
        박스설명: box.description,
        한정수량: box.purchaseLimit,
        등록일: new Date(box.createdAt).toLocaleString(),
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'BoxDetail');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const file = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(file, `상품_${box.name}_상세정보.xlsx`);
  };

  if (!box) return <div>로딩 중...</div>;

  return (
    <div className="box-detail-container">
      <Header />
      <h1 className="box-name">박스 정보</h1>
      <div className="box-detail-content">
        <table className="box-detail-table">
          <tbody>
            <tr><th>박스명</th><td>{box.name}</td></tr>
            <tr><th>가격</th><td>{box.price}</td></tr>
            <tr><th>공개 여부</th><td>{box.isPublic ? '공개' : '비공개'}</td></tr>
            <tr><th>상태 상세</th><td>{box.type}</td></tr>
            <tr><th>박스 설명</th><td>{box.description}</td></tr>
            <tr><th>박스 시작</th><td>{new Date(box.availableFrom).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            })}</td></tr>
            <tr><th>박스 마감</th><td>{new Date(box.availableUntil).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            })}</td></tr>
         
    <tr>
  <th>등록 상품</th>
  <td>
    {(!box.products || box.products.length === 0) ? (
      <div style={{ color: '#888' }}>등록된 상품이 없습니다.</div>
    ) : (
      <div className="box-products-wrap">
        <table className="box-products-table">
          <thead>
            <tr>
              <th style={{ width: 70 }}>번호</th>
              <th>상품명</th>
              <th style={{ width: 220 }}>브랜드</th>
              <th style={{ width: 140, textAlign: 'right' }}>확률(%)</th>
            </tr>
          </thead>
          <tbody>
            {box.products.map((item, idx) => {
              const name = item.product?.name || '-';
              const brand = item.product?.brand || '-';
              const prob = Number(item.probability ?? 0);
              const probText = Number.isFinite(prob) ? prob.toFixed(2) : '0.00';
              return (
                <tr key={item.product?._id || idx}>
                  <td>{idx + 1}</td>
                  <td className="ellipsis">{name}</td>
                  <td className="ellipsis">{brand}</td>
                  <td style={{ textAlign: 'right' }}>{probText}</td>
                </tr>
              );
            })}
          </tbody>

        </table>
      </div>
    )}
  </td>
</tr>

            <tr><th>등록일</th><td>{new Date(box.createdAt).toLocaleString()}</td></tr>
          </tbody>
        </table>

        <div className="button-container">
          <button className="edit-button" onClick={handleEdit}>수정</button>
          <button className="delete-button" onClick={handleDelete}>삭제</button>
          <button className="export-button" onClick={handleExportToExcel}>엑셀로 저장</button>
        </div>
      </div>
    </div>
  );
};

export default BoxDetail;