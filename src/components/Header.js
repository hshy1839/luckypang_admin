import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faGauge, faUsers, faCalendarAlt, faBullhorn, faCog, faSignOutAlt, faBars } from '@fortawesome/free-solid-svg-icons';
import '../css/Header.css';

const Header = () => {
    const [isProductOpen, setIsProductOpen] = useState(false);
    const [isBoxOpen, setisBoxOpen] = useState(false);
    const [isTermOpen, setisTermOpen] = useState(false);
    const [isPointOpen, setisPointOpen] = useState(false);
  const navigate = useNavigate();

  const toggleProductMenu = () => {
    setIsProductOpen(!isProductOpen);
  };
  const toggleBoxMenu = () => {
    setisBoxOpen(!isBoxOpen);
  };
  const togglePointMenu = () => {
    setisPointOpen(!isPointOpen);
  };
  const toggleTermMenu = () => {
    setisTermOpen(!isTermOpen);
  };
  const handleLinkClick = () => {
    setIsProductOpen(false);
    setisBoxOpen(false);

  };

  const handleLogout = () => {
    // 스토리지에서 토큰 및 로그인 상태 제거
    localStorage.removeItem('token'); // 토큰 삭제
    localStorage.setItem('isLoggedIn', 'false'); // 로그인 상태를 false로 설정
    // 로그인 페이지로 리다이렉트
    navigate('/login');
  };

  return (
    <header className='header-container'>
      <div className='header-container-container'>
        {/* 로고 및 인사 메시지 */}
        <div className='header-section1'>
          <div className='header-section1-logo'>
            System
          </div>
          <div className='header-section1-greeting'>
            안녕하세요 관리자님
          </div>
        </div>

        {/* 메뉴 아이템들 */}
        <div className='header-section2'>
          <Link to="/" onClick={handleLinkClick}>
            <div className='header-section2-item'>
              <FontAwesomeIcon icon={faGauge} className='header-section2-item-icon' />
              <div className='header-section2-item-text'>Overview</div>
            </div>
          </Link>
           <div className='headerphone-section2-item-employee-container'>
                      <Link to="#" onClick={toggleProductMenu}>
                        <div className='headerphone-section2-item-employee'>
                          <FontAwesomeIcon icon={faCalendarAlt} className='headerphone-section2-item-employee-icon' />
                          <div className='headerphone-section2-item-text'>상품 관리</div>
                        </div>
                      </Link>
                      <div className={`submenu-employee ${isProductOpen ? 'open' : ''}`}>
                        <Link to="/products" className='submenu-item-employee'>상품 목록</Link>
                        {/* <Link to="/order" className='submenu-item-employee'>주문 목록</Link> */}
                        <Link to="/QnA/qna" className='submenu-item-employee'>1:1 문의</Link>
                        <Link to="/coupon" className='submenu-item-employee'>쿠폰 관리</Link>
                        <Link to="/promotion" className='submenu-item-employee'>광고 설정</Link>
                        <Link to="/unboxing" className='submenu-item-employee'>언박싱 내역</Link>
                      </div>
                    </div>
             <div className='header-section2-item-employee-container'>
                      <Link to="#" onClick={toggleBoxMenu}>
                        <div className='header-section2-item-employee'>
                          <FontAwesomeIcon icon={faCalendarAlt} className='header-section2-item-employee-icon' />
                          <div className='header-section2-item-text'>박스 관리</div>
                        </div>
                      </Link>
                      <div className={`submenu-employee ${isBoxOpen ? 'open' : ''}`}>
                        <Link to="/box" className='submenu-item-employee'>박스 목록</Link>
                          <Link to="/boxorder" className='submenu-item-employee'>주문 내역</Link>
                      </div>
                    </div>
          <Link to="/users" onClick={handleLinkClick}>
            <div className='header-section2-item'>
              <FontAwesomeIcon icon={faUsers} className='header-section2-item-icon' />
              <div className='header-section2-item-text'>고객 관리</div>
            </div>
          </Link>
          <div className='header-section2-item-employee-container'>
                      <Link to="#" onClick={togglePointMenu}>
                        <div className='header-section2-item-employee'>
                          <FontAwesomeIcon icon={faCalendarAlt} className='header-section2-item-employee-icon' />
                          <div className='header-section2-item-text'>포인트 관리</div>
                        </div>
                      </Link>
                      <div className={`submenu-employee ${isPointOpen ? 'open' : ''}`}>
                        <Link to="/points" className='submenu-item-employee'>포인트 관리</Link>
                          <Link to="/coupon" className='submenu-item-employee'>포인트 추가</Link>
                        <Link to="/promotion" className='submenu-item-employee'>포인트 내역</Link>
                      </div>
                    </div>
          <Link to="/notice" onClick={handleLinkClick}>
            <div className='header-section2-item'>
              <FontAwesomeIcon icon={faBullhorn} className='header-section2-item-icon' />
              <div className='header-section2-item-text'>공지사항</div>
            </div>
          </Link>
          <Link to="/event" onClick={handleLinkClick}>
            <div className='header-section2-item'>
              <FontAwesomeIcon icon={faBullhorn} className='header-section2-item-icon' />
              <div className='header-section2-item-text'>이벤트</div>
            </div>
          </Link>
          <div className='headerphone-section2-item-employee-container'>
                      <Link to="#" onClick={toggleTermMenu}>
                        <div className='headerphone-section2-item-employee'>
                          <FontAwesomeIcon icon={faCalendarAlt} className='headerphone-section2-item-employee-icon' />
                          <div className='headerphone-section2-item-text'>약관 관리</div>
                        </div>
                      </Link>
                      <div className={`submenu-employee ${isTermOpen ? 'open' : ''}`}>
                        <Link to="/terms/withdrawal" className='submenu-item-employee'>탈퇴 약관</Link>
                        <Link to="/terms/serviceTerm" className='submenu-item-employee'>서비스 이용약관</Link>
                        <Link to="/terms/privacyTerm" className='submenu-item-employee'>개인정보 처리방침</Link>
                      </div>
                    </div>
          
          
        </div>

        {/* 설정 및 로그아웃 */}
        <div className='header-section3'>
          <Link to="/setting" onClick={handleLinkClick}>
            <div className='header-section3-item'>
              <FontAwesomeIcon icon={faCog} className='header-section2-item-icon' />
              <div className='header-section2-item-text'>설정</div>
            </div>
          </Link>
          <div className='header-section3-item' onClick={handleLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} className='header-section2-item-icon' />
            <div className='header-section2-item-text'>로그아웃</div>
          </div>
        </div>
      </div>

      {/* 반응형 버거 메뉴 아이콘 */}
      <Link to="/headerphone" onClick={handleLinkClick}>
      <div className="burger-menu" >
        <FontAwesomeIcon icon={faBars} className="burger-icon" />
      </div>
      </Link>
    </header>
  );
};

export default Header;
