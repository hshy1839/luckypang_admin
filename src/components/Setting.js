import React, { useState } from 'react';
import '../css/Setting.css';
import Header from '../components/Header.js';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Setting = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [bankName, setBankName] = useState('');
    const [bankAccount, setBankAccount] = useState('');
    const [accountHolder, setAccountHolder] = useState('');

    const handlePasswordChange = () => {
        if (newPassword !== confirmPassword) {
            alert('새 비밀번호가 일치하지 않습니다.');
            return;
        }
        // 비밀번호 변경 로직
        axios.post('/api/change-password', {
            currentPassword,
            newPassword
        }).then(response => {
            alert('비밀번호가 성공적으로 변경되었습니다.');
        }).catch(error => {
            alert('비밀번호 변경 중 오류가 발생했습니다.');
        });
    };

    
    const handleBankAccountRegister = async () => {
        if (!bankName || !bankAccount || !accountHolder) {
          alert('모든 필드를 입력해주세요.');
          return;
        }
      
        try {
          const accounts = [
            {
              accountName: accountHolder,
              accountNumber: bankAccount,
              bankName,
            },
          ];
      
          const response = await axios.post('http://3.36.74.8:8865/api/account', { accounts });
      
          if (response.data.success) {
            alert('계좌 정보가 성공적으로 저장되었습니다.');
          } else {
            alert('계좌 저장에 실패했습니다.');
          }
        } catch (error) {
          console.error('계좌 등록 중 오류:', error);
          alert('계좌 등록 중 오류가 발생했습니다.');
        }
      };
      

    return (
        <div className="setting-container">
            <Header />
            <div className="setting-container-container">
                <div className="setting-top-container-container">
                    <h1>설정</h1>
                </div>

                <div className="setting-section">
                    <h2>계좌 정보 등록</h2>
                    <div className="setting-account-container">
                        <input
                            type="text"
                            placeholder="은행명을 입력하세요"
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            className="account-input-field"
                        />
                        <input
                            type="text"
                            placeholder="예금주를 입력하세요"
                            value={accountHolder}
                            onChange={(e) => setAccountHolder(e.target.value)}
                            className="account-input-field"
                        />
                        <input
                            type="text"
                            placeholder="계좌번호를 입력하세요"
                            value={bankAccount}
                            onChange={(e) => setBankAccount(e.target.value)}
                            className="account-input-field"
                        />
                        <button onClick={handleBankAccountRegister} className="submit-account-button">등록</button>
                    </div>
                </div>

                
            </div>
        </div>
    );
};

export default Setting;
