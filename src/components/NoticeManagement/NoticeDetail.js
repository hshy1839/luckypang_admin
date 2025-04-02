import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../Header';
import '../../css/NoticeManagement/NoticeDetail.css';

const NoticeDetail = () => {
    const [notice, setNotice] = useState(null); // 공지 상세 정보 상태
    const [isEditing, setIsEditing] = useState(false); // 수정 모드 상태
    const [updatedNotice, setUpdatedNotice] = useState({ title: '', content: '' }); // 수정된 공지 데이터
    const { id } = useParams(); // URL에서 공지 ID를 가져옴
    const navigate = useNavigate(); // 페이지 이동을 위한 useNavigate 훅
    const [allEmployees, setAllEmployees] = useState([]);  // 전체 직원 데이터 (원본 데이터)
    const [employees, setEmployees] = useState([]);  // 검색 후 표시할 직원 리스트
    const [loggedInUserId, setLoggedInUserId] = useState(null); // 로그인한 사용자 ID


    
        useEffect(() => {
            const fetchNoticeDetail = async () => {
                try {
                    const token = localStorage.getItem('token');
                    if (!token) {
                        console.log('로그인 정보가 없습니다.');
                        return;
                    }
        
                    const response = await axios.get(
                        `http://3.36.74.8:8865/api/users/noticeList/find-user/${id}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );
        
        
                    if (response.data && response.data.success) {
                        setNotice(response.data.notice);
                        setUpdatedNotice({
                            title: response.data.notice.title,
                            content: response.data.notice.content,
                        });
                    } else {
                        console.log('공지 상세 데이터 로드 실패');
                    }
                } catch (error) {
                    console.error('공지 상세 정보를 가져오는데 실패했습니다.', error);
                }
            };
        
            fetchNoticeDetail();
        }, [id]);
        

  // 수정 버튼 클릭 핸들러
const handleEdit = () => {
    setUpdatedNotice({
        title: notice.title,
        content: notice.content,
    });
    setIsEditing(true); // 수정 모드로 전환
};

// 삭제 버튼 클릭 핸들러
const handleDelete = async () => {
    const confirmation = window.confirm('공지사항을 삭제하시겠습니까?');
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
            `http://3.36.74.8:8865/api/users/noticeList/delete/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (response.data && response.data.success) {
            alert('공지사항이 삭제되었습니다.');
            navigate('/notice'); // 공지 목록 페이지로 리디렉션
        } else {
            alert('공지 삭제에 실패했습니다.');
        }
    } catch (error) {
        console.error('공지 삭제 중 오류가 발생했습니다.', error);
    }
};

    // 수정 내용 변경 핸들러
    const handleChange = (e) => {
        const { name, value } = e.target;
        setUpdatedNotice(prev => ({ ...prev, [name]: value }));
    };

    // 완료 버튼 클릭 핸들러
    const handleSave = async () => {
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
                `http://3.36.74.8:8865/api/users/noticeList/update/${id}`,
                updatedNotice,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data && response.data.success) {
                setNotice(prev => ({ ...prev, ...updatedNotice }));
                setIsEditing(false); // 수정 완료 후 수정 모드 종료
                alert('공지사항이 수정되었습니다.');
                navigate('/notice'); // 수정 후 공지 목록 페이지로 리디렉션
            } else {
                alert('공지 수정에 실패했습니다.');
            }
        } catch (error) {
            console.error('공지 수정 중 오류가 발생했습니다.', error);
            alert('서버와의 연결에 문제가 발생했습니다. 다시 시도해주세요.');
        }
    };

 


    if (!notice) {
        return <div>로딩 중...</div>;
    }

    return (
        <div className="notice-detail-container">
            <Header />
            <div className='notice-detail-container-container'>
                {isEditing ? (
                    <>
                    <h1>공지사항 수정</h1>
                    <p>제목</p>
                        <input
                            type="text"
                            name="title"
                            value={updatedNotice.title}
                            onChange={handleChange}
                            className="edit-input"
                        />
                    <p>내용</p>

                        <textarea
                            name="content"
                            value={updatedNotice.content}
                            onChange={handleChange}
                            className="edit-textarea"
                        />
                        <button className="save-button" onClick={handleSave}>완료</button>
                    </>
                ) : (
                    <>
                        <h1>{notice.title}</h1>
                        <p><strong>작성자:</strong> {notice.authorName}</p>
                        <p><strong>작성 날짜:</strong> {new Date(notice.created_at).toLocaleDateString()}</p>
                        <div className="notice-content">
                            <p>{notice.content}</p>
                        </div>

                        {/* 수정 및 삭제 버튼 */}
                        <div className="button-container">
                            <button className="edit-button" onClick={handleEdit}>수정</button>
                            <button className="delete-button" onClick={handleDelete}>삭제</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default NoticeDetail;
