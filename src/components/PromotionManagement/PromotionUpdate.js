import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../Header';
import '../../css/ProductManagement/ProductUpdate.css';

const PromotionUpdate = () => {
    const [promotion, setPromotion] = useState(null);
    const [updatedPromotion, setUpdatedPromotion] = useState({
        name: '',
        link: '',
    });
    const { id } = useParams();
    const navigate = useNavigate();


    useEffect(() => {
        const fetchPromotionDetail = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.log('로그인 정보가 없습니다.');
                    return;
                }

                const response = await axios.get(
                    `http://13.124.224.246:7778/api/promotion/read/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.data && response.data.success) {
                    setPromotion(response.data.promotion);
                    setUpdatedPromotion({
                        name: response.data.promotion.name,
                        link: response.data.promotion.link,
                    });
                } else {
                    console.log('promotion 상세 데이터 로드 실패');
                }
            } catch (error) {
                console.error('promotion 상세 정보를 가져오는데 실패했습니다.', error);
            }
        };

        fetchPromotionDetail();
    }, [id]);


    const handleSave = async (e) => {
        e.preventDefault();
        const confirmation = window.confirm('수정사항을 저장하시겠습니까?');
        if (!confirmation) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('로그인 정보가 없습니다.');
                return;
            }

            const response = await axios.put(
                `http://13.124.224.246:7778/api/promotion/${id}`,
                updatedPromotion,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data && response.data.success) {
                alert('상품이 수정되었습니다.');
                navigate(`/promotion`);
            } else {
                alert('상품 수정에 실패했습니다.');
            }
        } catch (error) {
            console.error('상품 수정 중 오류가 발생했습니다.', error);
            alert('서버와의 연결에 문제가 발생했습니다. 다시 시도해주세요.');
        }
    };

    if (!promotion) {
        return <div>로딩 중...</div>;
    }
    const handleChange = (e) => {
        const { name, value } = e.target;
        setUpdatedPromotion((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <div className="product-update-container">
            <h2 className="product-update-title">프로모션 수정</h2>
            <form className="product-update-form" onSubmit={handleSave}>
                {/* Product Name */}
                <div className="product-update-field">
                    <label className="product-update-label" htmlFor="name">프로모션 이름</label>
                    <input
                        className="product-update-input"
                        type="text"
                        id="name"
                        name="name"
                        value={updatedPromotion.name}
                        onChange={handleChange}
                        placeholder="프로모션 이름을 입력하세요"
                        required
                    />
                </div>

                <div className="product-update-field">
                    <label className="product-update-label" htmlFor="link">링크</label>
                    <input
                        className="product-update-input"
                        type="text"
                        id="link"
                        name="link"
                        value={updatedPromotion.link}
                        onChange={handleChange}
                        placeholder="링크를 입력하세요"
                        required
                    />
                </div>

                <button type="submit" className="product-update-button">수정 저장</button>
            </form>
        </div>
    );
};

export default PromotionUpdate;
