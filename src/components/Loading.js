import React from 'react';
import '../css/Loading.css'; // 스타일링을 위한 CSS 파일

const Loading = () => {
    return (
        <div className="loading-container">
            <div className="loader"></div>
        </div>
    );
};

export default Loading;
