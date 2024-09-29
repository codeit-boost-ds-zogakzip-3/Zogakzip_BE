import express from 'express';
import { getGroups, createGroup } from '../controllers/groupController.js';  // 컨트롤러에서 가져올 것

const router = express.Router();

// 그룹 목록 조회
router.get('/groups', getGroups);

// 그룹 생성
router.post('/groups', createGroup);

export default router;
