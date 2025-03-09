import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function CreateRoomPage() {
    const [caregiverId, setCaregiverId] = useState('');
    const [roomInfo, setRoomInfo] = useState(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {

        console.log('[INFO] 로그인한 사용자 정보:', user);
        if (user) {
            console.log('[DEBUG] 로그인한 사용자 ID:', user.id);
        } else {
            console.warn('[WARN] 사용자 정보가 없습니다. 로그인이 필요합니다.');
        }
    }, [user]);

    const handleCreateRoom = async (e) => {
        e.preventDefault();

        if (!user) {
            alert('로그인이 필요합니다.');
            return;
        }

        try {
            console.log('[REQUEST] 방 생성 요청:', {
                requesterUserId: Number(user.id),
                caregiverId: Number(caregiverId),
            });

            const response = await axiosInstance.post('/api/rooms', {
                requesterUserId: Number(user.id),
                caregiverId: Number(caregiverId),
            });

            setRoomInfo(response.data);
            console.log('[SUCCESS] 방 생성 성공:', response.data);
        } catch (error) {
            console.error('[ERROR] 방 생성 중 오류:', error.response?.data || error.message);
            alert('방 생성 중 오류가 발생했습니다.');
        }
    };

    const handleEnterRoom = () => {
        if (roomInfo && roomInfo.roomId) {
            console.log('🚪 [INFO] 채팅방으로 이동:', roomInfo.roomId);
            navigate(`/rooms/${roomInfo.roomId}`);
        }
    };

    return (
        <div style={{ margin: '20px' }}>
            <h2>채팅방 생성</h2>
            <form onSubmit={handleCreateRoom} style={{ marginBottom: '20px' }}>
                <div>
                    <label>요청자(User) ID: </label>
                    <input
                        type="text"
                        value={user?.id || ''}
                        readOnly
                        style={{ backgroundColor: '#f1f1f1', border: '1px solid #ddd', padding: '5px' }}
                    />
                </div>
                <div>
                    <label>수신자(Caregiver) ID: </label>
                    <input
                        type="number"
                        value={caregiverId}
                        onChange={(e) => setCaregiverId(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">방 생성</button>
            </form>

            {roomInfo && (
                <div>
                    <h3>생성된 채팅방 정보</h3>
                    <p>Room ID: {roomInfo.roomId}</p>
                    <p>Requester User ID: {roomInfo.requesterUserId}</p>
                    <p>Caregiver ID: {roomInfo.caregiverId}</p>
                    <p>CreatedAt: {roomInfo.createdAt}</p>
                    <button onClick={handleEnterRoom}>채팅방 입장</button>
                </div>
            )}
        </div>
    );
}

export default CreateRoomPage;
