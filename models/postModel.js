import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  group_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  nickname: { type: String, required: true },
  title: { type: String, required: true },
  image: String,
  content: { type: String, required: true },
  tags: [String],
  location: String,
  memory_time: { type: Date, default: Date.now },
  is_public: { type: Boolean, default: true },
  password: { type: String, required: true },
  likes: { type: Number, default: 0 },
  comments_count: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
});

const Post = mongoose.model('Post', postSchema);
export default Post;
