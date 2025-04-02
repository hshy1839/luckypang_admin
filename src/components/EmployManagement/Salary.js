import React, { useState } from 'react';
import '../../css/Users.css';
import Header from '../Header.js';

const Salary = () => {
  // 예시 직원 데이터
  const [employees, setEmployees] = useState([
    { id: 1, name: '김철수', contact: '010-1234-5678', email: 'kim@company.com', department: '인사팀', joinDate: '2023-01-15', status: '대기' },
    { id: 2, name: '이영희', contact: '010-2345-6789', email: 'lee@company.com', department: '개발팀', joinDate: '2023-02-01', status: '가입 승인' },
    { id: 3, name: '박민수', contact: '010-3456-7890', email: 'park@company.com', department: '마케팅팀', joinDate: '2023-03-10', status: '대기' },
    { id: 4, name: '최수진', contact: '010-4567-8901', email: 'choi@company.com', department: '디자인팀', joinDate: '2023-04-05', status: '가입 승인' },
    { id: 5, name: '홍정민', contact: '010-3456-7890', email: 'park@company.com', department: '마케팅팀', joinDate: '2023-03-10', status: '대기' },
    
]);

  // 각 기능 핸들러
  const handleApprove = (id) => {
    const updatedEmployees = employees.map((employee) =>
      employee.id === id ? { ...employee, status: '가입 승인' } : employee
    );
    setEmployees(updatedEmployees);
  };

  const handleReject = (id) => {
    const updatedEmployees = employees.map((employee) =>
      employee.id === id ? { ...employee, status: '가입 거절' } : employee
    );
    setEmployees(updatedEmployees);
  };

  const handleDelete = (id) => {
    const updatedEmployees = employees.filter((employee) => employee.id !== id);
    setEmployees(updatedEmployees);
  };



  return (
    <div className="users-management-container">
        <Header/>
        <div className='users-management-container-container'>
            <div className='users-container'>
      <h1>급여 관리</h1>

      {/* 검색 박스 */}
      <div className="users-search-box">
        <input type="text" placeholder="검색..." />
      </div>

      {/* 직원 정보 테이블 */}
      <table className="users-table">
        <thead>
          <tr>
            <th>번호</th>
            <th>사용자타입</th>
            <th>아이디</th>
            <th>이름</th>
            <th>연락처</th>
            <th>E-Mail</th>
            <th>소속</th>
            <th>가입일</th>
            <th>상태</th>
            <th>액션</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id}>
              <td>{employee.id}</td>
              <td>{employee.status === '가입 승인' ? '정직원' : '대기'}</td>
              <td>{employee.id}</td>
              <td>{employee.name}</td>
              <td>{employee.contact}</td>
              <td>{employee.email}</td>
              <td>{employee.department}</td>
              <td>{employee.joinDate}</td>
              <td>{employee.status}</td>
              <td>
                <div className="actions-btns">
                  <button onClick={() => handleApprove(employee.id)} className="approve-btn">승인</button>
                  <button onClick={() => handleReject(employee.id)} className="reject-btn">거절</button>
                  <button onClick={() => handleDelete(employee.id)} className="delete-btn">삭제</button>
                    </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 페이지 네비게이션 */}
      <div className="pagination">
        <button>이전</button>
        <span>1 2 3</span>
        <button>다음</button>
      </div>
    </div>
    </div>
    </div>
  );
};

export default Salary;
