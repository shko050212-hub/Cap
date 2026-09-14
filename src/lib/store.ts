// 서버 메모리에 이메일 인증 코드를 임시 저장하기 위한 저장소
// (EC2 서버가 꺼지지 않는 이상 유지됨)
export const verificationStore = new Map<string, { code: string, expires: number }>();
