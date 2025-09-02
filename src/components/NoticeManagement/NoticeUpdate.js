// src/components/NoticeManagement/NoticeUpdate.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import '../../css/NoticeManagement/NoticeUpdate.css';

const API_BASE = 'http://localhost:7778';

// presigned/절대 URL이면 그대로, 아니면 S3 key를 /media/{key}로 변환
function resolveImageSrc(value) {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  return `${API_BASE.replace(/\/$/, '')}/media/${value}`;
}

const NoticeUpdate = () => {
  const [form, setForm] = useState({
    title: '',
    content: '',
  });

  // 서버의 기존 이미지 정보
  const [existingImageKey, setExistingImageKey] = useState('');     // S3 key
  const [existingImagePreview, setExistingImagePreview] = useState(''); // presigned 또는 /media/key

  // 새로 업로드할 이미지
  const [noticeImage, setNoticeImage] = useState(null);
  const [newImagePreview, setNewImagePreview] = useState(null);

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const token = localStorage.getItem('token');
        const resp = await axios.get(`${API_BASE}/api/notice/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (resp.data?.success) {
          const n = resp.data.notice;

          setForm({
            title: n.title || '',
            content: n.content || '',
          });

          // 기존 이미지(단일만 표시): presigned 우선, 없으면 key → /media/key
          const keys = Array.isArray(n.noticeImage) ? n.noticeImage : (n.noticeImage ? [n.noticeImage] : []);
          const urls = Array.isArray(n.noticeImageUrls) ? n.noticeImageUrls : [];

          const firstKey = keys[0] || '';
          const firstUrl = urls[0] || (firstKey ? resolveImageSrc(firstKey) : '');

          setExistingImageKey(firstKey);
          setExistingImagePreview(firstUrl);
        } else {
          alert(resp.data?.message || '공지사항을 불러오지 못했습니다.');
        }
      } catch (err) {
        console.error('공지사항 조회 실패:', err);
        alert('공지사항 조회 중 오류가 발생했습니다.');
      }
    };

    fetchNotice();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setNoticeImage(file);
      setNewImagePreview(URL.createObjectURL(file));
    } else {
      setNoticeImage(null);
      setNewImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }

    const formData = new FormData();
    formData.append('title', form.title.trim());
    formData.append('content', form.content.trim());

    if (noticeImage) {
      // 새 이미지 업로드 → 컨트롤러가 기존 이미지를 교체
      formData.append('noticeImage', noticeImage);
    } else {
      // 새 이미지가 없으면 기존 유지
      formData.append('retainNoticeImage', 'true');
      // (단일 이미지 UI라 initialNoticeImages는 생략)
    }

    try {
      const resp = await axios.put(`${API_BASE}/api/notice/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (resp.data?.success) {
        alert('공지사항이 성공적으로 수정되었습니다.');
        navigate('/notice');
      } else {
        alert(resp.data?.message || '수정에 실패했습니다.');
      }
    } catch (err) {
      console.error('수정 중 오류:', err);
      alert('수정 중 오류 발생');
    }
  };

  return (
    <div className="notice-update-container">
      <h2 className="notice-update-title">공지사항 수정</h2>
      <form className="notice-update-form" onSubmit={handleSubmit}>
        <div className="notice-update-field">
          <label className="notice-update-label">제목</label>
          <input
            className="notice-update-input"
            type="text"
            name="title"
            value={form.title}
            onChange={handleInputChange}
            required
            placeholder="공지 제목을 입력하세요"
          />
        </div>

        <div className="notice-update-field">
          <label className="notice-update-label">내용</label>
          <textarea
            className="notice-update-textarea"
            name="content"
            value={form.content}
            onChange={handleInputChange}
            rows={6}
            required
            placeholder="공지 내용을 입력하세요"
          />
        </div>

        <div className="notice-update-field">
          <label className="notice-update-label">공지 이미지</label>
          <input
            className="notice-update-input"
            type="file"
            onChange={handleImageChange}
            accept="image/*"
          />

          {/* 기존 이미지(프리사인 또는 /media/key) */}
          {existingImagePreview && !newImagePreview && (
            <div className="notice-image-block">
              <div className="notice-image-caption">현재 등록된 이미지</div>
              <img src={existingImagePreview} alt="현재 이미지" className="notice-image-preview" />
            </div>
          )}

          {/* 새로 선택한 이미지 미리보기 (있으면 이것만 보여줌) */}
          {newImagePreview && (
            <div className="notice-image-block">
              <div className="notice-image-caption">새로 선택한 이미지</div>
              <img src={newImagePreview} alt="새 이미지 미리보기" className="notice-image-preview" />
            </div>
          )}
        </div>

        <button type="submit" className="notice-update-button">수정</button>
      </form>
    </div>
  );
};

export default NoticeUpdate;
