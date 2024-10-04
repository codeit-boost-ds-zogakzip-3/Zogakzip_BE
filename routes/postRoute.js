import express from 'express';
import { createPost, getPostsByGroupId, updatePostById, deletePostById, getPostById, verifyPostPassword, likePostById , getPostPublicStatus} from '../controllers/postController.js';  // 컨트롤러에서 함수 임포트

const router = express.Router();

// 게시글 등록 라우트
router.post('/groups/:groupId/posts', createPost);  // createPost 함수 사용

// 게시글 목록 조회 라우트
router.get('/groups/:groupId/posts', getPostsByGroupId);  // 게시글 목록 조회

// 게시글 수정 라우트
router.put('/posts/:postId', updatePostById);  // 게시글 수정 라우트 추가

// 게시글 삭제 라우트
router.delete('/posts/:postId', deletePostById);  // 게시글 삭제 라우트 추가

// 게시글 상세 조회 라우트
router.get('/posts/:postId', getPostById);  // 게시글 상세 조회

// 게시글 비밀번호 확인 라우트
router.post('/posts/:postId/verify-password', verifyPostPassword);

// 게시글 공감하기 라우트
router.post('/posts/:postId/like', likePostById);  // 공감하기 라우트 추가

// 게시글 공개 여부 확인 라우트
router.get('/posts/:postId/is-public', getPostPublicStatus);  // 공개 여부 확인 라우트 추가

export default router;
