import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import config from "../config/config";
import styles from './Cert.module.css';

function Cert() {
  const [certUsers, setCertUsers] = useState([]);
  const [error, setError] = useState("");
  const [filterOption, setFilterOption] = useState("all");

  const fetchCertUsers = async () => {
    try {
      const response = await axiosInstance.post(`${config.apiUrl}/api/user/admin/cert`);
      if (Array.isArray(response.data)) {
        setCertUsers(response.data);
      } else {
        throw new Error("서버에서 유효한 사용자 목록을 받지 못했습니다.");
      }
    } catch (error) {
      setError("자격증 정보를 불러오는 데 실패했습니다.");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCertUsers();
  }, []);

  const handleApprove = async (username) => {
    if (window.confirm(`${username} 사용자를 승인하시겠습니까?`)) {
      try {
        const response = await axiosInstance.post(`${config.apiUrl}/api/user/admin/cert/approve`, { username });
        if (response.status === 200) {
          fetchCertUsers();
        }
      } catch (error) {
        console.error("승인 실패:", error);
      }
    }
  };

  const handleRevoke = async (username) => {
    if (window.confirm(`${username} 사용자의 승인을 취소하시겠습니까?`)) {
      try {
        const response = await axiosInstance.post(`${config.apiUrl}/api/user/admin/cert/revoke`, { username });
        if (response.status === 200) {
          fetchCertUsers();
        }
      } catch (error) {
        console.error("승인 취소 실패:", error);
      }
    }
  };

  const filteredUsers = Array.isArray(certUsers) ? certUsers.filter(user => {
    if (filterOption === "pending") return user.pending;
    if (filterOption === "approved") return !user.pending;
    return true;
  }) : [];

  return (
    <div className={styles.certContainer}>
      <h2>자격증 사용자 목록</h2>
      {error && <p className={styles.error}>{error}</p>}

      <div style={{ textAlign: 'right', marginBottom: '10px' }}>
        <label>항목 필터링 선택: </label>
        <select value={filterOption} onChange={(e) => setFilterOption(e.target.value)}>
          <option value="all">모두 보기</option>
          <option value="approved">승인 완료된 항목만 보기</option>
          <option value="pending">승인 대기 중인 항목만 보기</option>
        </select>
      </div>

      <table className={styles.certTable}>
        <thead>
          <tr>
            <th>사용자명</th>
            <th>닉네임</th>
            <th>자격증 번호</th>
            <th>승인 상태</th>
            <th style={{ width: '110px', textAlign: 'center' }}>작업</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user, index) => (
            <tr key={index}>
              <td>{user.username}</td>
              <td>{user.nickname}</td>
              <td>{user.certno}</td>
              <td>{user.pending ? "대기 중" : "승인됨"}</td>
              <td style={{ textAlign: 'center' }}>
                {user.pending ? (
                  <button className="btn-primary" onClick={() => handleApprove(user.username)}>승인</button>
                ) : (
                  <button className="btn-primary" onClick={() => handleRevoke(user.username)}>승인 취소</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Cert;
