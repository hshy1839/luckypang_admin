import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGauge,
  faUsers,
  faBoxOpen,
  faCubes,
  faTicketAlt,
  faBullhorn,
  faComments,
  faNewspaper,
  faGift,
  faSignOutAlt,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import '../css/HeaderPhone.css';

const HeaderPhone = () => {
  const [isProductOpen, setIsProductOpen] = useState(false);
  const [isBoxOpen, setisBoxOpen] = useState(false);
  const navigate = useNavigate();

  const goBack = () => navigate(-1);
  const toggleProductMenu = () => setIsProductOpen(!isProductOpen);
  const toggleBoxMenu = () => setisBoxOpen(!isBoxOpen);
  const handleLinkClick = () => {
    setIsProductOpen(false);
    setisBoxOpen(false);
  };
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.setItem('isLoggedIn', 'false');
    navigate('/login');
  };

  return (
    <headerphone className='headerphone-container'>
      <div className='headerphone-container-container'>
        {/* 로고 및 인사 메시지 */}
        <div className='headerphone-section1'>
          <div className='headerphone-section1-logo'>System</div>
          <div className='headerphone-section1-greeting'>안녕하세요 관리자님</div>
        </div>

        {/* 메뉴 */}
        <div className='headerphone-section2'>
          <Link to="/" onClick={handleLinkClick}>
            <div className='headerphone-section2-item'>
              <FontAwesomeIcon icon={faGauge} className='headerphone-section2-item-icon' />
              <div className='headerphone-section2-item-text'>Overview</div>
            </div>
          </Link>

          {/* 상품 관리 */}
          <div className='headerphone-section2-item-employee-container'>
            <Link to="#" onClick={toggleProductMenu}>
              <div className='headerphone-section2-item-employee'>
                <FontAwesomeIcon icon={faBoxOpen} className='headerphone-section2-item-employee-icon' />
                <div className='headerphone-section2-item-text'>상품 관리</div>
              </div>
            </Link>
            <div className={`submenu-employee ${isProductOpen ? 'open' : ''}`}>
              <Link to="/products" className='submenu-item-employee'>상품 목록</Link>
            </div>
          </div>

          {/* 박스 관리 */}
          <div className='header-section2-item-employee-container'>
            <Link to="#" onClick={toggleBoxMenu}>
              <div className='header-section2-item-employee'>
                <FontAwesomeIcon icon={faCubes} className='header-section2-item-employee-icon' />
                <div className='header-section2-item-text'>박스 관리</div>
              </div>
            </Link>
            <div className={`submenu-employee ${isBoxOpen ? 'open' : ''}`}>
              <Link to="/box" className='submenu-item-employee'>박스 목록</Link>
              <Link to="/boxorder" className='submenu-item-employee'>주문 내역</Link>
              <Link to="/unboxing" className='submenu-item-employee'>언박싱 내역</Link>
            </div>
          </div>

          <Link to="/users" onClick={handleLinkClick}>
            <div className='headerphone-section2-item'>
              <FontAwesomeIcon icon={faUsers} className='headerphone-section2-item-icon' />
              <div className='headerphone-section2-item-text'>고객 관리</div>
            </div>
          </Link>

          <Link to="/coupon" onClick={handleLinkClick}>
            <div className='headerphone-section2-item'>
              <FontAwesomeIcon icon={faTicketAlt} className='headerphone-section2-item-icon' />
              <div className='headerphone-section2-item-text'>쿠폰 관리</div>
            </div>
          </Link>

          <Link to="/promotion" onClick={handleLinkClick}>
            <div className='headerphone-section2-item'>
              <FontAwesomeIcon icon={faBullhorn} className='headerphone-section2-item-icon' />
              <div className='headerphone-section2-item-text'>광고 설정</div>
            </div>
          </Link>

          <Link to="/QnA/qna" onClick={handleLinkClick}>
            <div className='headerphone-section2-item'>
              <FontAwesomeIcon icon={faComments} className='headerphone-section2-item-icon' />
              <div className='headerphone-section2-item-text'>1:1 문의</div>
            </div>
          </Link>

          <Link to="/notice" onClick={handleLinkClick}>
            <div className='headerphone-section2-item'>
              <FontAwesomeIcon icon={faNewspaper} className='headerphone-section2-item-icon' />
              <div className='headerphone-section2-item-text'>공지사항</div>
            </div>
          </Link>

          <Link to="/event" onClick={handleLinkClick}>
            <div className='headerphone-section2-item'>
              <FontAwesomeIcon icon={faGift} className='headerphone-section2-item-icon' />
              <div className='headerphone-section2-item-text'>이벤트 관리</div>
            </div>
          </Link>
        </div>

        {/* 로그아웃 */}
        <div className='headerphone-section3'>
          <div className='headerphone-section3-item' onClick={handleLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} className='headerphone-section2-item-icon' />
            <div className='headerphone-section2-item-text'>로그아웃</div>
          </div>
        </div>
      </div>

      {/* 닫기 버튼 */}
      <div className="close-menu" onClick={goBack}>
        <FontAwesomeIcon icon={faTimes} className="close-icon" />
      </div>
    </headerphone>
  );
};

export default HeaderPhone;
