/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',  // Static HTML 내보내기
    images: {
      unoptimized: true,
    },
    assetPrefix: '/naver_eval',  // 레포지토리 이름으로 변경
    basePath: '/naver_eval',     // 레포지토리 이름으로 변경
  };
  
  module.exports = nextConfig;