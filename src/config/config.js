// 기본 URL (API 게이트웨이를 가리켜야 함. 서비스 IP를 직접 가리키지 않음)
const apiUrl = process.env.REACT_APP_API_URL;

// 전역 API 설정
const apiVersion = process.env.REACT_APP_API_VERSION || "v2";

// 서비스별 설정: 각 서비스에 대한 prefix와 version
// 예: platform: { prefix: 'platform', version: 'v2' }
const serviceConfig = {
	platform: {
		prefix: process.env.REACT_APP_PLATFORM_PREFIX || 'platform',
		version: process.env.REACT_APP_PLATFORM_VERSION || process.env.REACT_APP_API_VERSION || 'v2',
	},
	chat: {
		prefix: process.env.REACT_APP_CHAT_PREFIX || 'chat',
		version: process.env.REACT_APP_CHAT_VERSION || process.env.REACT_APP_API_VERSION || 'v2',
	},
};

// 특정 서비스와 선택적 경로에 대한 전체 베이스 URL을 생성하는 헬퍼
const buildServiceUrl = (serviceKey = 'platform', path = '') => {
	const svc = serviceConfig[serviceKey] || { prefix: serviceKey, version: apiVersion };
	const prefix = svc.prefix || serviceKey;
	const version = svc.version || apiVersion;

	// 결합 시 '/'가 중복되지 않도록 정규화
	const normalizedBase = apiUrl?.replace(/\/$/, '') || '';
	const normalizedPrefix = prefix.replace(/^\//, '').replace(/\/$/, '');
	const normalizedVersion = version.replace(/^\//, '').replace(/\/$/, '');
	const normalizedPath = path ? ('/' + path.replace(/^\//, '')) : '';

	return `${normalizedBase}/${normalizedPrefix}/api/${normalizedVersion}${normalizedPath}`;
};

const config = { apiUrl, apiVersion, serviceConfig, buildServiceUrl };
export default config;
