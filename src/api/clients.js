import { createApiClient } from './axiosInstance';

// 서비스별 싱글톤 클라이언트
export const platformClient = createApiClient('platform');
export const chatClient = createApiClient('chat');

// 필요하면 다른 서비스 클라이언트도 추가
// export const otherClient = createApiClient('otherService');
