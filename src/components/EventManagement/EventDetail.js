import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../Header';
import '../../css/EventManagement/EventDetail.css';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://13.124.224.246:7778/api/event/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data && response.data.success) {
          setEvent(response.data.event);
        }
      } catch (err) {
        console.error('이벤트 조회 실패:', err);
      }
    };

    fetchEvent();
  }, [id]);

  const handleEdit = () => {
    navigate(`/event/eventUpdate/${id}`);
  };

  const handleDelete = async () => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`http://13.124.224.246:7778/api/event/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        alert('삭제되었습니다.');
        navigate('/event');
      } else {
        alert('삭제에 실패했습니다.');
      }
    } catch (err) {
      console.error('삭제 실패:', err);
      alert('삭제 중 오류 발생');
    }
  };

  if (!event) return <div>로딩 중...</div>;

  return (
    <div className="event-detail-container">
      <Header />
      <h1 className="event-title">이벤트 상세</h1>
      <div className="event-detail-content">
        <table className="event-detail-table">
          <tbody>
            <tr>
              <th>제목</th>
              <td>{event.title}</td>
            </tr>
            <tr>
              <th>내용</th>
              <td>{event.content}</td>
            </tr>
            <tr>
              <th>작성일</th>
              <td>{new Date(event.created_at).toLocaleString()}</td>
            </tr>
            <tr>
              <th>이미지</th>
              <td>
                <div className="event-images">
                  {event.eventImage?.map((img, i) => (
                    <img
                      key={i}
                      src={`http://13.124.224.246:7778${img}`}
                      alt={`공지 이미지 ${i + 1}`}
                      className="event-image"
                    />
                  ))}
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="button-container">
          <button className="edit-button" onClick={handleEdit}>수정</button>
          <button className="delete-button" onClick={handleDelete}>삭제</button>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
