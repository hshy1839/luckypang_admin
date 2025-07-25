import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../Header';
import '../../css/ProductManagement/ProductDetail.css'; // 스타일 시트 경로 수정

const PromotionDetail = () => {
    const [promotion, setPromotion] = useState(null); // 상품 상세 정보 상태
    const { id } = useParams(); // URL에서 상품 ID를 가져옴
    const navigate = useNavigate(); // 페이지 이동을 위한 useNavigate 훅

    useEffect(() => {
        const fetchPromotionDetail = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.log('로그인 정보가 없습니다.');
                    return;
                }

                const response = await axios.get(
                    `http://localhost:7778/api/promotion/read/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.data && response.data.success) {
                    setPromotion(response.data.promotion);
                } else {
                    console.log('Promotion 상세 데이터 로드 실패');
                }
            } catch (error) {
                console.error('Promotion 상세 정보를 가져오는데 실패했습니다.', error);
            }
        };

        fetchPromotionDetail();
    }, [id]);

    // 수정 버튼 클릭 핸들러
    const handleEdit = () => {
        navigate(`/promotion/promotionDetail/${id}/update`); // 수정 페이지로 이동
    };

    // 삭제 버튼 클릭 핸들러
    const handleDelete = async () => {
        const confirmation = window.confirm('이 프로모션을 삭제하시겠습니까?');
        if (!confirmation) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.log('로그인 정보가 없습니다.');
                return;
            }

            const response = await axios.delete(
                `http://localhost:7778/api/promotion/delete/${id}`, // URL 수정
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data && response.data.success) {
                alert('프로모션이 삭제되었습니다.');
                navigate('/promotion'); // 상품 목록 페이지로 리디렉션
            } else {
                alert('상품 삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('상품 삭제 중 오류가 발생했습니다.', error);
        }
    };

    if (!promotion) {
        return <div>로딩 중...</div>;
    }

    return (
        <div className="product-detail-container">
            <Header />
            <h1>프로모션 정보</h1>
            <div className="product-detail-content">
                <div className="product-info">
                    <h1 className="product-name">프로모션명: {promotion.name}</h1>

                    {/* 카테고리 상위 및 하위 표시 */}
                    <p className="product-category">
                        <strong>링크:</strong> {promotion.link}
                    </p>

                    <div className="button-container">
                        <button className="edit-button" onClick={handleEdit}>수정</button>
                        <button className="delete-button" onClick={handleDelete}>삭제</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PromotionDetail;
