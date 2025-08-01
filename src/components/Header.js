import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGauge,
  faUsers,
  faBoxOpen,
  faCubes,
  faCoins,
  faTicketAlt,
  faBullhorn,
  faComments,
  faNewspaper,
  faGift,
  faFileContract,
  faQuestionCircle,
  faSignOutAlt,
  faBars
} from '@fortawesome/free-solid-svg-icons';
import '../css/Header.css';

const Header = () => {
  const [isProductOpen, setIsProductOpen] = useState(false);
  const [isBoxOpen, setisBoxOpen] = useState(false);
  const [isTermOpen, setisTermOpen] = useState(false);
  const [isPointOpen, setisPointOpen] = useState(false);
  const navigate = useNavigate();

  const toggleProductMenu = () => setIsProductOpen(!isProductOpen);
  const toggleBoxMenu = () => setisBoxOpen(!isBoxOpen);
  const togglePointMenu = () => setisPointOpen(!isPointOpen);
  const toggleTermMenu = () => setisTermOpen(!isTermOpen);
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
    <header className='header-container'>
      <div className='header-container-container'>
        <div className='header-section1'>
          <div className='header-section1-logo'>System</div>
          <div className='header-section1-greeting'>안녕하세요 관리자님</div>
        </div>

        <div className='header-section2'>
          <Link to="/" onClick={handleLinkClick}>
            <div className='header-section2-item'>
              <FontAwesomeIcon icon={faGauge} className='header-section2-item-icon' />
              <div className='header-section2-item-text'>Overview</div>
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
            <div className='header-section2-item'>
              <FontAwesomeIcon icon={faUsers} className='header-section2-item-icon' />
              <div className='header-section2-item-text'>고객 관리</div>
            </div>
          </Link>

          {/* 포인트 관리 */}
          <div className='header-section2-item-employee-container'>
            <Link to="#" onClick={togglePointMenu}>
              <div className='header-section2-item-employee'>
                <FontAwesomeIcon icon={faCoins} className='header-section2-item-employee-icon' />
                <div className='header-section2-item-text'>포인트 관리</div>
              </div>
            </Link>
            <div className={`submenu-employee ${isPointOpen ? 'open' : ''}`}>
              <Link to="/points" className='submenu-item-employee'>포인트 내역</Link>
              <Link to="/points/pointManager/:id" className='submenu-item-employee'>포인트 관리</Link>
            </div>
          </div>

          <Link to="/coupon" onClick={handleLinkClick}>
            <div className='header-section2-item'>
              <FontAwesomeIcon icon={faTicketAlt} className='header-section2-item-icon' />
              <div className='header-section2-item-text'>쿠폰 관리</div>
            </div>
          </Link>


          <Link to="/QnA/qna" onClick={handleLinkClick}>
            <div className='header-section2-item'>
              <FontAwesomeIcon icon={faComments} className='header-section2-item-icon' />
              <div className='header-section2-item-text'>1:1 문의</div>
            </div>
          </Link>

          <Link to="/notice" onClick={handleLinkClick}>
            <div className='header-section2-item'>
              <FontAwesomeIcon icon={faNewspaper} className='header-section2-item-icon' />
              <div className='header-section2-item-text'>공지사항</div>
            </div>
          </Link>

          <Link to="/event" onClick={handleLinkClick}>
            <div className='header-section2-item'>
              <FontAwesomeIcon icon={faGift} className='header-section2-item-icon' />
              <div className='header-section2-item-text'>이벤트 관리</div>
            </div>
          </Link>

          {/* 약관 관리 */}
          <div className='headerphone-section2-item-employee-container'>
            <Link to="#" onClick={toggleTermMenu}>
              <div className='headerphone-section2-item-employee'>
                <FontAwesomeIcon icon={faFileContract} className='headerphone-section2-item-employee-icon' />
                <div className='headerphone-section2-item-text'>약관 관리</div>
              </div>
            </Link>
            <div className={`submenu-employee ${isTermOpen ? 'open' : ''}`}>
              <Link to="/terms/withdrawal" className='submenu-item-employee'>탈퇴 약관</Link>
              <Link to="/terms/serviceTerm" className='submenu-item-employee'>서비스 이용약관</Link>
              <Link to="/terms/privacyTerm" className='submenu-item-employee'>개인정보 처리방침</Link>
              <Link to="/terms/purchaseTerm" className='submenu-item-employee'>구매확인</Link>
              <Link to="/terms/refundTerm" className='submenu-item-employee'>교환환불 정책</Link>
            </div>
          </div>

          <Link to="/faq" onClick={handleLinkClick}>
            <div className='header-section2-item'>
              <FontAwesomeIcon icon={faQuestionCircle} className='header-section2-item-icon' />
              <div className='header-section2-item-text'>FAQ</div>
            </div>
          </Link>
        </div>

        {/* 로그아웃 */}
        <div className='header-section3'>
          <div className='header-section3-item' onClick={handleLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} className='header-section2-item-icon' />
            <div className='header-section2-item-text'>로그아웃</div>
          </div>
        </div>
      </div>

      {/* 버거 메뉴 */}
      <Link to="/headerphone" onClick={handleLinkClick}>
        <div className="burger-menu">
          <FontAwesomeIcon icon={faBars} className="burger-icon" />
        </div>
      </Link>
    </header>
  );
};

export default Header;
