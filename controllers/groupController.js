import Group from '../models/groupModel.js';  // Group 모델 임포트

// 그룹 목록 조회
export const getGroups = async (req, res) => {
  try {
    const groups = await Group.find();
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch groups', error });
  }
};

// 그룹 생성
export const createGroup = async (req, res) => {
  const { name, description, is_public, password } = req.body;

  try {
    const newGroup = new Group({
      name,
      description,
      is_public,
      password,
    });
    const savedGroup = await newGroup.save();
    res.status(201).json(savedGroup);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create group', error });
  }
};
