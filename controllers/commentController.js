import Comment from '../models/commentModel.js';
import Post from '../models/postModel.js';

// 댓글 등록
export const createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { nickname, content, password } = req.body;

    // 게시글 존재 여부 확인
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다' });
    }

    // 새로운 댓글 생성
    const newComment = new Comment({
      post_id: postId,
      nickname,
      content,
      password
    });

    const savedComment = await newComment.save();

    // 응답 반환
    res.status(200).json({
      id: savedComment._id,
      nickname: savedComment.nickname,
      content: savedComment.content,
      createdAt: savedComment.created_at
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: '잘못된 요청입니다' });
  }
};

// 댓글 목록 조회
export const getCommentsByPostId = async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, pageSize = 10 } = req.query;

    // 게시글 존재 여부 확인
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다' });
    }

    // 댓글 필터링 및 페이징 처리
    const totalItemCount = await Comment.countDocuments({ post_id: postId });
    const totalPages = Math.ceil(totalItemCount / pageSize);
    const comments = await Comment.find({ post_id: postId })
      .sort({ created_at: -1 })  // 최신순으로 정렬
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize));

    // 응답 반환
    res.status(200).json({
      currentPage: parseInt(page),
      totalPages,
      totalItemCount,
      data: comments.map(comment => ({
        id: comment._id,
        nickname: comment.nickname,
        content: comment.content,
        createdAt: comment.created_at
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: '잘못된 요청입니다' });
  }
};

// 댓글 수정
export const updateCommentById = async (req, res) => {
    try {
      const { commentId } = req.params;
      const { nickname, content, password } = req.body;
  
      // 댓글 존재 여부 확인
      const comment = await Comment.findById(commentId);
      if (!comment) {
        return res.status(404).json({ message: '존재하지 않습니다' });  // 댓글이 존재하지 않음
      }
  
      // 비밀번호 확인
      if (comment.password !== password) {
        return res.status(403).json({ message: '비밀번호가 틀렸습니다' });  // 비밀번호 불일치
      }
  
      // 댓글 수정
      comment.nickname = nickname || comment.nickname;
      comment.content = content || comment.content;
  
      const updatedComment = await comment.save();  // 변경 사항 저장
  
      // 수정된 댓글 반환
      res.status(200).json({
        id: updatedComment._id,
        nickname: updatedComment.nickname,
        content: updatedComment.content,
        createdAt: updatedComment.created_at
      });
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: '잘못된 요청입니다' });
    }
  };


// 댓글 삭제
export const deleteCommentById = async (req, res) => {
    try {
      const { commentId } = req.params;
      const { password } = req.body;
  
      // 댓글 존재 여부 확인
      const comment = await Comment.findById(commentId);
      if (!comment) {
        return res.status(404).json({ message: '존재하지 않습니다' });  // 댓글이 존재하지 않음
      }
  
      // 비밀번호 확인
      if (comment.password !== password) {
        return res.status(403).json({ message: '비밀번호가 틀렸습니다' });  // 비밀번호 불일치
      }
  
      // 댓글 삭제
      await Comment.findByIdAndDelete(commentId);
  
      // 삭제 성공 메시지 반환
      res.status(200).json({ message: '댓글 삭제 성공' });
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: '잘못된 요청입니다' });
    }
  };