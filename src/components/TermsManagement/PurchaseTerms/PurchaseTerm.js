import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../../css/ProductManagement/ProductDetail.css';

const PurchaseTerm = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTerm = async () => {
      try {
        const response = await axios.get('https://luckytang-server.onrender.com/api/terms/purchaseTerm');
        if (response.data?.success && response.data.term?.content) {
          setContent(response.data.term.content);
        } else {
          setContent('');
        }
      } catch (error) {
        console.error('📛 약관 조회 실패:', error);
        setContent('');
      } finally {
        setLoading(false);
      }
    };

    fetchTerm();
  }, []);

  const handleEdit = () => {
    navigate('/terms/purchaseTerm/edit');
  };

  return (
    <div className="product-detail-container">
      <h1 className="product-name">구매동의</h1>
      <div className="product-detail-content">
        <table className="product-detail-table">
          <tbody>
            <tr>
              <th>내용</th>
            </tr>
            <tr>
              <td>
                {loading ? (
                  <p>로딩 중...</p>
                ) : content ? (
                  <p style={{ whiteSpace: 'pre-line', color: '#000', textAlign: 'left' }}>
  {content}
</p>
                ) : (
                  <p>약관 내용이 없습니다.</p>
                )}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="button-container">
          <button className="edit-button" onClick={handleEdit}>
            약관 수정
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseTerm;
