import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../Header';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import '../../css/ProductManagement/ProductDetail.css';

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
          `http://localhost:7778/api/box/${id}`,
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
    navigate(`/box/boxDetail/${id}/update`);
  };

  const handleDelete = async () => {
    if (!window.confirm('이 박스를 삭제하시겠습니까?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `http://localhost:7778/api/box/${id}`,
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
    <div className="product-detail-container">
      <Header />
      <h1 className="product-name">박스 정보</h1>
      <div className="product-detail-content">
        <table className="product-detail-table">
          <tbody>
            <tr><th>박스명</th><td>{box.name}</td></tr>
            <tr><th>가격</th><td>{box.price}</td></tr>
            <tr><th>공개 여부</th><td>{box.isPublic ? '공개' : '비공개'}</td></tr>
            <tr><th>상태 상세</th><td>{box.type}</td></tr>
            <tr><th>박스 시작</th><td>{box.availableFrom}</td></tr>
            <tr><th>박스 마감</th><td>{box.availableUntil}</td></tr>
            <tr>
              <th>대표 이미지</th>
              <td>{box.mainImage && <img src={`http://localhost:7778${box.mainImage}`} alt="대표 이미지" style={{ width: '200px' }} />}</td>
            </tr>
            <tr>
              <th>상세 이미지</th>
              <td>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {box.additionalImages?.map((url, idx) => (
                    <img key={idx} src={`http://localhost:7778${url}`} alt={`상세 ${idx}`} style={{ width: '150px' }} />
                  ))}
                </div>
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