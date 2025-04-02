// import React, { useState, useEffect } from 'react';
// import '../css/Order.css';
// import Header from './Header.js';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// const Order = () => {
//     const [orders, setOrders] = useState([]);
//     const [currentPage, setCurrentPage] = useState(1);
//     const itemsPerPage = 10;

//     const navigate = useNavigate();

//     const fetchOrders = async () => {
//         try {
//             const token = localStorage.getItem('token');
//             if (!token) {
//                 return;
//             }

//             const response = await axios.get('http://3.36.74.8:8865/api/orderAll', {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                 },
//             });

//             if (response.status === 200 && Array.isArray(response.data.orders)) {
//                 const sortedOrders = response.data.orders.sort((a, b) => {
//                     return new Date(b.createdAt) - new Date(a.createdAt);
//                 });

//                 setOrders(sortedOrders);
//             } else {
//             }
//         } catch (error) {
//             console.error('주문 정보를 가져오는데 실패했습니다.', error);
//         }
//     };

//     const fetchUserName = async (userId) => {
//         try {
//             const token = localStorage.getItem('token');
//             const response = await axios.get(`http://3.36.74.8:8865/api/users/userinfo/${userId}`, {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                 },
//             });

//             if (response.status === 200 && response.data.user) {
//                 return response.data.user.name; // 'username'에서 'name'으로 변경
//             } else {
//                 return '알 수 없음';
//             }
//         } catch (error) {
//             return '알 수 없음';
//         }
//     };

//     const fetchShippingInfo = async (userId) => {
//         try {
//             const token = localStorage.getItem('token');
//             if (!token) {
//                 alert('로그인 정보가 없습니다.');
//                 return null;
//             }
    
//             if (!userId) {
//                 console.error('UserId가 제공되지 않았습니다.');
//                 return null;
//             }
    
//             const response = await axios.get(`http://3.36.74.8:8865/api/shippinginfo/${userId}`, {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                 },
//             });
    
    
//             // 응답 데이터 구조에 맞게 shippingDetails 반환
//             if (response.status === 200 && response.data.shippingDetails) {
//                 return response.data.shippingDetails; // 문자열 배열 반환
//             } else {
//                 return null;
//             }
//         } catch (error) {
//             console.error('Error fetching shipping info:', error);
//             if (error.response) {
//             }
//             return null;
//         }
//     };
    
    
    



//     const updatePaymentStatus = async (orderId, newStatus) => {
//         try {
//             const token = localStorage.getItem('token');
//             const response = await axios.put(
//                 `http://3.36.74.8:8865/api/editPayment/${orderId}`, // 주문 ID를 URL에 포함
//                 { paymentStatus: newStatus }, // 요청 본문에 paymentStatus만 전달
//                 {
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                     },
//                 }
//             );

//             if (response.status === 200) {
//                 alert('결제 상태가 변경되었습니다.'); // 성공 알림 추가
//                 fetchOrders(); // 업데이트 후 주문 목록 다시 가져오기
//             } else {
//                 alert('결제 상태 업데이트에 실패했습니다.');
//             }
//         } catch (error) {
//             console.error('결제 상태 업데이트 중 오류 발생:', error);
//             alert('결제 상태 업데이트 중 오류가 발생했습니다.');
//         }
//     };

//     const updateOrderStatus = async (orderId, newStatus) => {
//         try {
//             const token = localStorage.getItem('token');
//             const response = await axios.put(
//                 `http://3.36.74.8:8865/api/editOrder/${orderId}`, // 주문 ID를 URL에 포함
//                 { orderStatus: newStatus }, // 요청 본문에 orderStatus만 전달
//                 {
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                     },
//                 }
//             );

//             if (response.status === 200) {
//                 alert('주문 상태가 변경되었습니다.'); // 성공 알림 추가
//                 fetchOrders(); // 업데이트 후 주문 목록 다시 가져오기
//             } else {
//                 alert('주문 상태 업데이트에 실패했습니다.');
//             }
//         } catch (error) {
//             console.error('주문 상태 업데이트 중 오류 발생:', error);
//             alert('주문 상태 업데이트 중 오류가 발생했습니다.');
//         }
//     };


//     const handleStatusChange = (orderId, newStatus, type) => {
//         const message =
//             type === 'orderStatus'
//                 ? `주문 상태를 ${newStatus}로 변경하시겠습니까?`
//                 : `결제 상태를 ${newStatus}로 변경하시겠습니까?`;

//         if (window.confirm(message)) {
//             if (type === 'paymentStatus') {
//                 updatePaymentStatus(orderId, newStatus); // 결제 상태 업데이트
//             } else if (type === 'orderStatus') {
//                 updateOrderStatus(orderId, newStatus); // 주문 상태 업데이트
//             }
//         }
//     };





//     useEffect(() => {
//         fetchOrders();
//     }, []);

//     const indexOfLastOrder = currentPage * itemsPerPage;
//     const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
//     const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
//     const totalPages = Math.ceil(orders.length / itemsPerPage);

//     const handlePreviousPage = () => {
//         if (currentPage > 1) setCurrentPage(currentPage - 1);
//     };

//     const handleNextPage = () => {
//         if (currentPage < totalPages) setCurrentPage(currentPage + 1);
//     };

//     const handlePageChange = (pageNumber) => {
//         setCurrentPage(pageNumber);
//     };

//     return (
//         <div className="order-management-container">
//             <Header />
//             <div className="order-management-container-container">
//                 <h1>주문 관리</h1>

//                 <table className="order-table">
//                     <thead>
//                         <tr>
//                             <th>번호</th>
//                             <th>사용자 이름</th>
//                             <th>상품명</th>
//                             <th>사이즈 및 수량</th>
//                             <th>주문 상태</th>
//                             <th>결제 상태</th>
//                             <th>총 금액</th>
//                             <th>주문일시</th>
//                             <th>배송지 정보</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {currentOrders.length > 0 ? (
//                             currentOrders.map((order, index) => {
//                                 const userId =
//                                     typeof order.userId === 'object' && order.userId._id
//                                         ? order.userId._id
//                                         : order.userId;

//                                 return (
//                                     <tr key={order._id}>
//                                         <td>{index + 1 + (currentPage - 1) * itemsPerPage}</td>
//                                         <td>
//                                             <React.Suspense fallback="로딩 중...">
//                                                 <AsyncUserName userId={userId} fetchUserName={fetchUserName} />
//                                             </React.Suspense>
//                                         </td>
//                                         <td>
//                                             {order.items?.map((item, idx) => (
//                                                 <div key={idx}>
//                                                     <div>{item.productName || 'Unknown Product'}</div>
//                                                 </div>
//                                             ))}
//                                         </td>
//                                         <td>
//                                             {order.items?.map((item, idx) => (
//                                                 <div key={idx}>
//                                                     {item.sizes?.map((sizeInfo, sizeIdx) => (
//                                                         <div key={sizeIdx}>
//                                                             {`${sizeInfo.size} : ${sizeInfo.quantity}`}
//                                                         </div>
//                                                     ))}
//                                                 </div>
//                                             ))}
//                                         </td>
//                                         <td>
//                                             <select
//                                                 value={order.orderStatus || '배송 전'}
//                                                 onChange={(e) =>
//                                                     handleStatusChange(order._id, e.target.value, 'orderStatus')
//                                                 }
//                                                 className='order-select'
//                                                 style={{
//                                                     color:
//                                                         order.orderStatus === '배송 전'
//                                                             ? 'blue'
//                                                             : order.orderStatus === '배송 중'
//                                                                 ? 'orange'
//                                                                 : order.orderStatus === '배송 완료'
//                                                                     ? 'green'
//                                                                     : 'black', // 기본 색상
//                                                 }}
//                                             >
//                                                 <option value="배송 전">배송 전</option>
//                                                 <option value="배송 중">배송 중</option>
//                                                 <option value="배송 완료">배송 완료</option>
//                                             </select>
//                                         </td>
//                                         <td>
//                                             <select
//                                                 className='order-select'

//                                                 value={order.paymentStatus || 'Unknown'}
//                                                 onChange={(e) =>
//                                                     handleStatusChange(order._id, e.target.value, 'paymentStatus')
//                                                 }
//                                                 style={{
//                                                     color:
//                                                         order.paymentStatus === '결제 대기'
//                                                             ? 'orange'
//                                                             : order.paymentStatus === '결제 완료'
//                                                                 ? 'green'
//                                                                 : order.paymentStatus === '결제 실패'
//                                                                     ? 'red'
//                                                                     : 'black', // 기본 색상
//                                                 }}
//                                             >
//                                                 <option value="결제 대기">결제 대기</option>
//                                                 <option value="결제 완료">결제 완료</option>
//                                                 <option value="결제 실패">결제 실패</option>
//                                             </select>
//                                         </td>
//                                         <td>{order.totalAmount || 0} 원</td>
//                                         <td>{new Date(order.createdAt).toLocaleString()}</td>
//                                         <td>
//     <button
//         onClick={async () => {
//             if (!userId || userId.length !== 24) {
//                 alert('유효하지 않은 유저 ID입니다.');
//                 return;
//             }

//             try {
//                 const shippingDetails = await fetchShippingInfo(userId);

//                 if (shippingDetails && shippingDetails.length > 0) {
//                     // 배열의 각 항목을 줄바꿈하여 연결
//                     const formattedDetails = shippingDetails.join('\n');
                    
//                     // 하나의 alert에 줄바꿈된 내용 출력
//                     alert(formattedDetails);
//                 } else if (!shippingDetails) {
//                     alert('배송지 정보가 없습니다.');
//                 } else {
//                     alert('배송지 데이터가 올바르지 않습니다.');
//                 }
//             } catch (error) {
//                 alert('배송지 정보를 가져오는 중 오류가 발생했습니다.');
//                 console.error(error);
//             }
//         }}
//         className="delivery-info-btn"
//     >
//         확인
//     </button>
// </td>




//                                     </tr>
//                                 );
//                             })
//                         ) : (
//                             <tr>
//                                 <td colSpan="9" className="no-results">
//                                     데이터가 없습니다.
//                                 </td>
//                             </tr>
//                         )}
//                     </tbody>

//                 </table>

//                 <div className="pagination">
//                     <button className="prev-page-btn" onClick={handlePreviousPage} disabled={currentPage === 1}>
//                         이전
//                     </button>
//                     {[...Array(totalPages)].map((_, i) => (
//                         <button
//                             key={i}
//                             onClick={() => handlePageChange(i + 1)}
//                             className={currentPage === i + 1 ? 'active' : ''}
//                         >
//                             {i + 1}
//                         </button>
//                     ))}
//                     <button className="next-page-btn" onClick={handleNextPage} disabled={currentPage === totalPages}>
//                         다음
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// const AsyncUserName = ({ userId, fetchUserName }) => {
//     const [name, setName] = React.useState('알 수 없음');

//     useEffect(() => {
//         const loadUserName = async () => {
//             const fetchedName = await fetchUserName(userId);
//             setName(fetchedName);
//         };
//         loadUserName();
//     }, [userId, fetchUserName]);

//     return <span>{name}</span>;
// };

// export default Order;
