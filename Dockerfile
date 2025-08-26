# 베이스 이미지 설정
FROM node:18-alpine

# 작업 디렉토리 설정
WORKDIR /app

# 종속성 설치
COPY package*.json ./
RUN npm install

# 애플리케이션 소스 복사
COPY . .

# 포트 노출
EXPOSE 3000

# docker-compose.yml에서 실행할 명령어를 기다립니다.
# 이 CMD는 docker-compose에서 command를 지정하지 않을 경우에만 실행됩니다.
CMD ["npm", "run", "dev"]
