import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  post_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },  // 게시글 ID
  nickname: { type: String, required: true },
  content: { type: String, required: true },
  password: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
