import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../Header';
import '../../css/ProductManagement/ProductDetail.css'; // 스타일 시트 경로 수정

const UsersDetail = () => {
    const [user, setUser] = useState(null); // 상품 상세 정보 상태
    const { id } = useParams(); // URL에서 상품 ID를 가져옴
    const navigate = useNavigate(); // 페이지 이동을 위한 useNavigate 훅

    useEffect(() => {
        const fetchUserDetail = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.log('로그인 정보가 없습니다.');
                    return;
                }

                const response = await axios.get(
                    `http://localhost:7778/api/users/userinfo/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.data && response.data.success) {
                    setUser(response.data.user);
                } else {
                    console.log('상품 상세 데이터 로드 실패');
                }
            } catch (error) {
                console.error('상품 상세 정보를 가져오는데 실패했습니다.', error);
            }
        };

        fetchUserDetail();
    }, [id]);



    // 삭제 버튼 클릭 핸들러
    const handleDelete = async () => {
        const confirmation = window.confirm('이 상품을 삭제하시겠습니까?');
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
                `http://localhost:7778/api/users/userinfo/${id}`, // URL 수정
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data && response.data.success) {
                alert('상품이 삭제되었습니다.');
                navigate('/users'); // 상품 목록 페이지로 리디렉션
            } else {
                alert('상품 삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('상품 삭제 중 오류가 발생했습니다.', error);
        }
    };

    if (!user) {
        return <div>로딩 중...</div>;
    }

    return (
        <div className="product-detail-container">
            <Header />
            <h1>사용자 정보</h1>
            <div className="product-detail-content">
                <div className="product-info">
                    <h1 className="product-name">사용자 닉네임: {user.nickname}</h1>

                    {/* 카테고리 상위 및 하위 표시 */}
                    <p className="product-category">
                        <strong>사용자 이메일:</strong> {user.email}
                    </p>

                    <p className="product-price">
                        <strong>사용자 번호:</strong> {user.phoneNumber}
                    </p>

                    <p className="product-description">
                        <strong>사용자 코드:</strong> {user.referralCode}
                    </p>

                    <p className="product-description">
                        <strong>이벤트 수신 여부:</strong> {user.eventAgree ? '동의' : '거부'}
                    </p>


                    <div className="button-container">
                        <button className="delete-button" onClick={handleDelete}>삭제</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UsersDetail;
