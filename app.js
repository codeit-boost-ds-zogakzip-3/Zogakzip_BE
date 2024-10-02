import express from 'express';
import mongoose from 'mongoose';
import { DATABASE_URL } from './env.js';

import postRoutes from './routes/postRoute.js';  // 게시글 라우트
import groupRoutes from './routes/groupRoute.js';  // 그룹 라우트
import commentRoutes from './routes/commentRoute.js'; // 댓글 라우트
import imageRouter from './routes/imageRoute.js'; // 이미지 라우트

import Group from './models/groupModel.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());  // JSON 파싱 미들웨어

// MongoDB 연결
mongoose.connect(DATABASE_URL)
  .then(async () => {
    console.log('Connected to DB');

    // 모든 그룹 조회 및 출력
    try {
      const groups = await Group.find();  // 모든 그룹 조회
      console.log('Group List:', JSON.stringify(groups, null, 2));  // 그룹 목록을 콘솔에 출력 (JSON 포맷)
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  })
  .catch((err) => {
    console.error('Connection error:', err);
  });

// 라우트 설정
app.use('/api', postRoutes);
app.use('/api', groupRoutes);
app.use('/api', commentRoutes);
app.use('/api', imageRouter);

app.use('/images', express.static('images'));

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});