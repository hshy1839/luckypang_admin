import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faGauge, faUsers, faCalendarAlt, faBullhorn, faCog, faSignOutAlt, faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import '../css/HeaderPhone.css';

const HeaderPhone = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1); // 현재 페이지에서 하나 뒤로 갑니다.
  };
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const handleLogout = () => {
    // 스토리지에서 토큰 및 로그인 상태 제거
    localStorage.removeItem('token'); // 토큰 삭제
    localStorage.setItem('isLoggedIn', 'false'); // 로그인 상태를 false로 설정
    // 로그인 페이지로 리다이렉트
    navigate('/login');
  };

  return (
    <headerphone className='headerphone-container'>
      <div className='headerphone-container-container'>
        {/* 로고 및 인사 메시지 */}
        <div className='headerphone-section1'>
          <div className='headerphone-section1-logo'>
            System
          </div>
          <div className='headerphone-section1-greeting'>
            안녕하세요 관리자님
          </div>
        </div>

        {/* 메뉴 아이템들 */}
        <div className='headerphone-section2'>
          <Link to="/" onClick={handleLinkClick}>
            <div className='headerphone-section2-item'>
              <FontAwesomeIcon icon={faGauge} className='headerphone-section2-item-icon' />
              <div className='headerphone-section2-item-text'>Overview</div>
            </div>
          </Link>
          <div className='headerphone-section2-item-employee-container'>
            <Link to="#" onClick={toggleMenu}>
              <div className='headerphone-section2-item-employee'>
                <FontAwesomeIcon icon={faCalendarAlt} className='headerphone-section2-item-employee-icon' />
                <div className='headerphone-section2-item-text'>상품 관리</div>
              </div>
            </Link>
            <div className={`submenu-employee ${isOpen ? 'open' : ''}`}>
              <Link to="/products" className='submenu-item-employee'>상품 목록</Link>
              {/* <Link to="/order" className='submenu-item-employee'>주문 목록</Link> */}
              {/* <Link to="/QnA/qna" className='submenu-item-employee'>1:1 문의</Link> */}
              <Link to="/coupon" className='submenu-item-employee'>쿠폰 관리</Link>
              <Link to="/promotion" className='submenu-item-employee'>광고 설정</Link>
            </div>
          </div>

          <Link to="/employeeManagement/users" onClick={handleLinkClick}>
            <div className='headerphone-section2-item'>
              <FontAwesomeIcon icon={faUsers} className='headerphone-section2-item-icon' />
              <div className='headerphone-section2-item-text'>고객 관리</div>
            </div>
          </Link>
          <Link to="/notice" onClick={handleLinkClick}>
            <div className='headerphone-section2-item'>
              <FontAwesomeIcon icon={faBullhorn} className='headerphone-section2-item-icon' />
              <div className='headerphone-section2-item-text'>공지사항</div>
            </div>
          </Link>
          
        </div>

        {/* 설정 및 로그아웃 */}
        <div className='headerphone-section3'>
          <Link to="/setting" onClick={handleLinkClick}>
            <div className='headerphone-section3-item'>
              <FontAwesomeIcon icon={faCog} className='headerphone-section2-item-icon' />
              <div className='headerphone-section2-item-text'>설정</div>
            </div>
          </Link>
          <div className='headerphone-section3-item' onClick={handleLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} className='headerphone-section2-item-icon' />
            <div className='headerphone-section2-item-text'>로그아웃</div>
          </div>
        </div>
      </div>
      <div className="close-menu" onClick={goBack} >
        <FontAwesomeIcon icon={faTimes} className="close-icon" />
        
      </div>
    </headerphone>
  );
};

export default HeaderPhone;
