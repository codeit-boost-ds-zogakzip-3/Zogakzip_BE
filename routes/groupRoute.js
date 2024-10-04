import express from 'express';
import {
    createGroup,
    getGroups,
    updateGroup,
    deleteGroup,
    getGroupDetail,
    verifyGroupPassword,
    likeGroup,
    checkGroupPublic,
} from '../controllers/groupController.js';

const router = express.Router();

// 그룹 등록
router.post('/groups', createGroup);

// 그룹 목록 조회
router.get('/groups', getGroups);

// 그룹 수정
router.put('/groups/:groupId', updateGroup);

// 그룹 삭제
router.delete('/groups/:groupId', deleteGroup);

// 그룹 상세 정보 조회
router.get('/groups/:groupId', getGroupDetail);

// 그룹 조회 권한 확인
router.post('/groups/:groupId/verify-password', verifyGroupPassword);

// 그룹 공감하기
router.post('/groups/:groupId/like', likeGroup);

// 그룹 공개 여부 확인
router.get('/groups/:groupId/is-public', checkGroupPublic);

export default router;
