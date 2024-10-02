import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  imageUrl: { type: String },
  introduction: { type: String },
  isPublic: { type: Boolean, default: true },
  password: { type: String },
  likeCount: { type: Number, default: 0 },
  postCount: { type: Number, default: 0 },
  badges: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
});

const Group = mongoose.model('Group', groupSchema);

export default Group;
