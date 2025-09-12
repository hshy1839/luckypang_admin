import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../../css/ProductManagement/ProductDetail.css';

const WithdrawalEdit = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTerm = async () => {
      try {
        const response = await axios.get('https://luckytang-server.onrender.com/api/terms/withdrawal');
        if (response.data?.success && response.data.term?.content) {
          setContent(response.data.term.content);
        }
      } catch (error) {
        console.error('📛 약관 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTerm();
  }, []);

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'https://luckytang-server.onrender.com/api/terms/withdrawal', // ✅ 이 경로가 백엔드 라우터와 일치
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      if (response.data.success) {
        alert('약관이 성공적으로 등록(수정)되었습니다.');
        navigate('/terms/withdrawal');
      } else {
        alert('약관 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('📛 약관 등록 실패:', error);
      alert('서버 오류가 발생했습니다.');
    }
  };
  

  return (
    <div className="product-detail-container">
      <h1 className="product-name">회원탈퇴 약관 수정</h1>
      <div className="product-detail-content">
        <table className="product-detail-table">
          <tbody>
            <tr>
              <th>탈퇴 전 확인사항</th>
            </tr>
            <tr>
              <td>
                {loading ? (
                  <p>로딩 중...</p>
                ) : (
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={15}
                    style={{ width: '100%', padding: '10px', fontSize: '1rem' }}
                  />
                )}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="button-container">
          <button className="edit-button" onClick={handleSubmit}>
            수정 완료
          </button>
        </div>
      </div>
    </div>
  );
};

export default WithdrawalEdit;
