import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },  // 그룹 이름
  image: { type: String },  // 그룹 이미지 (선택 사항)
  description: { type: String },  // 그룹 설명
  is_public: { type: Boolean, default: true },  // 공개 여부
  password: { type: String },  // 비밀번호 (선택 사항)
  created_at: { type: Date, default: Date.now },  // 생성 시간
  likes: { type: Number, default: 0 },  // 그룹 공감수
  badges_count: { type: Number, default: 0 },  // 배지 수
  posts_count: { type: Number, default: 0 },  // 게시글 수
});

const Group = mongoose.model('Group', groupSchema);

export default Group;
