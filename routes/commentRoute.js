import express from 'express';
import { createComment, getCommentsByPostId, updateCommentById, deleteCommentById } from '../controllers/commentController.js';  // 댓글 등록 컨트롤러 함수 추가

const router = express.Router();

// 댓글 등록 라우트
router.post('/posts/:postId/comments', createComment);

// 댓글 목록 조회 라우트
router.get('/posts/:postId/comments', getCommentsByPostId);

// 댓글 수정 라우트
router.put('/comments/:commentId', updateCommentById); 

// 댓글 삭제 라우트
router.delete('/comments/:commentId', deleteCommentById);

export default router;
