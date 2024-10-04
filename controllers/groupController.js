import Group from '../models/groupModel.js';
import Post from '../models/postModel.js';

// 그룹 배지 체크
const checkBadges = async (groupId) => {
  const group = await Group.findById(groupId);
  if (!group) return;

  let updated = false;
  const today = new Date();
  const createdAt = new Date(group.createdAt);
  const daysPassed = Math.floor((today - createdAt) / (1000 * 60 * 60 * 24));

  // 7일 연속 추억 등록
  const last7Days = new Date(today.setDate(today.getDate() - 7));
  const consecutivePosts = await Post.find({
    group_id: groupId,
    created_at: { $gte: last7Days }
  });

  if (consecutivePosts.length >= 7 && !group.badges.includes('7일 연속 추억 등록')) {
    group.badges.push('7일 연속 추억 등록');
    updated = true;
  }

  // 추억 수 20개 이상 등록
  const totalPostCount = await Post.countDocuments({ group_id: groupId });
  if (totalPostCount >= 20 && !group.badges.includes('추억 수 20개 이상 등록')) {
    group.badges.push('추억 수 20개 이상 등록');
    updated = true;
  }

  // 그룹 생성 후 1년 달성
  if (daysPassed >= 365 && !group.badges.includes('그룹 생성 후 1년 달성')) {
    group.badges.push('그룹 생성 후 1년 달성');
    updated = true;
  }

  // 그룹 공감 1만 개 이상 받기
  if (group.likeCount >= 10000 && !group.badges.includes('그룹 공감 1만 개 이상 받기')) {
    group.badges.push('그룹 공감 1만 개 이상 받기');
    updated = true;
  }

  // 추억 공감 1만 개 이상 받기
  const memoryWith10kLikes = await Post.findOne({
    group_id: groupId,
    likes: { $gte: 10000 }
  });

  if (memoryWith10kLikes && !group.badges.includes('추억 공감 1만 개 이상 받기')) {
    group.badges.push('추억 공감 1만 개 이상 받기');
    updated = true;
  }

  if (updated) {
    await group.save();
  }
};

// 그룹 생성
export const createGroup = async (req, res) => {
  const { name, password, imageUrl, isPublic, introduction } = req.body;

  if (!name || !password || !imageUrl || typeof isPublic !== 'boolean' || !introduction) {
    return res.status(400).json({ message: '잘못된 요청입니다' });
  }

  try {
    const newGroup = new Group({
      name,
      password,
      imageUrl,
      isPublic,
      introduction
    });
    const savedGroup = await newGroup.save();

    res.status(201).json(savedGroup);
  } catch (error) {
    res.status(400).json({ message: '잘못된 요청입니다' });
  }
};

//그룹 목록 조회
export const getGroups = async (req, res) => {
  const { page = 1, pageSize = 10, sortBy = 'latest', keyword = '', isPublic } = req.query;

  try {
    const query = {
      // 검색어가 있을 경우 이름에 해당 검색어가 포함된 그룹만 조회
      name: { $regex: keyword, $options: 'i' },
      // 공개 여부에 따라 조회
      ...(isPublic !== undefined && { isPublic }),
    };

    let sortOption;
    switch (sortBy) {
      case 'mostPosted':
        sortOption = { postCount: -1 };
        break;
      case 'mostLiked':
        sortOption = { likeCount: -1 };
        break;
      case 'mostBadge':
        sortOption = { badgeCount: -1 };
        break;
      case 'latest':
      default:
        sortOption = { createdAt: -1 };
        break;
    }

    const skip = (page - 1) * pageSize;
    const totalItemCount = await Group.countDocuments(query);
    const groups = await Group.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(pageSize));

    for (const group of groups) {
      await checkBadges(group._id);
    }

    const data = groups.map(group => ({
      id: group._id,
      name: group.name,
      imageUrl: group.imageUrl,
      isPublic: group.isPublic,
      likeCount: group.likeCount,
      badgeCount: group.badges.length,
      postCount: group.postCount,
      createdAt: group.createdAt,
      introduction: group.introduction,
      badges: group.badges,
    }));

    res.status(200).json({
      currentPage: page,
      totalPages: Math.ceil(totalItemCount / pageSize),
      totalItemCount,
      data,
    });
  } catch (error) {
    res.status(400).json({ message: '잘못된 요청입니다' });
  }
};

// 그룹 수정
export const updateGroup = async (req, res) => {
  const { groupId } = req.params;
  const { password, name, imageUrl, isPublic, introduction } = req.body;

  try {
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: '존재하지 않습니다' });
    }

    if (group.password !== password) {
      return res.status(403).json({ message: '비밀번호가 틀렸습니다' });
    }

    group.name = name || group.name;
    group.imageUrl = imageUrl || group.imageUrl;
    group.isPublic = isPublic !== undefined ? isPublic : group.isPublic;
    group.introduction = introduction || group.introduction;

    const updatedGroup = await group.save();

    await checkBadges(group._id);

    res.status(200).json(updatedGroup);
  } catch (error) {
    res.status(400).json({ message: '잘못된 요청입니다' });
  }
};

// 그룹 삭제
export const deleteGroup = async (req, res) => {
  const { groupId } = req.params;
  const { password } = req.body;

  try {
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: '존재하지 않습니다' });
    }

    if (group.password !== password) {
      return res.status(403).json({ message: '비밀번호가 틀렸습니다' });
    }

    await Group.findByIdAndDelete(groupId);

    res.status(200).json({ message: '그룹 삭제 성공' });
  } catch (error) {
    res.status(400).json({ message: '잘못된 요청입니다' });
  }
};

// 그룹 상세 정보 조회
export const getGroupDetail = async (req, res) => {
  const { groupId } = req.params;
  const { password } = req.body;

  try {
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: '존재하지 않습니다' });
    }

    if (!group.isPublic && group.password !== password) {
      return res.status(403).json({ message: '비밀번호가 틀렸습니다' });
    }

    await checkBadges(group._id);

    res.status(200).json({
      id: group._id,
      name: group.name,
      imageUrl: group.imageUrl,
      isPublic: group.isPublic,
      likeCount: group.likeCount,
      postCount: group.postCount,
      createdAt: group.createdAt,
      introduction: group.introduction,
      badges: group.badges,
    });
  } catch (error) {
    res.status(400).json({ message: '잘못된 요청입니다' });
  }
};

// 그룹 조회 권한 확인
export const verifyGroupPassword = async (req, res) => {
  const { groupId } = req.params;
  const { password } = req.body;

  try {
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: '존재하지 않습니다' });
    }

    if (!group.isPublic) {
      if (group.password === password) {
        return res.status(200).json({ message: '비밀번호가 확인되었습니다' });
      } else {
        return res.status(401).json({ message: '비밀번호가 틀렸습니다' });
      }
    }

    return res.status(200).json({ message: '공개된 그룹입니다' });
  } catch (error) {
    res.status(400).json({ message: '잘못된 요청입니다' });
  }
};

// 그룹 공감하기
export const likeGroup = async (req, res) => {
  const { groupId } = req.params;

  try {
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: '존재하지 않습니다' });
    }

    group.likeCount += 1;
    await group.save();

    res.status(200).json({ message: '공감이 추가되었습니다', likeCount: group.likeCount });
  } catch (error) {
    res.status(400).json({ message: '잘못된 요청입니다' });
  }
};

// 그룹 공개 여부 확인
export const checkGroupPublic = async (req, res) => {
  const { groupId } = req.params;

  try {
    const group = await Group.findById(groupId).select('_id isPublic');

    if (!group) {
      return res.status(404).json({ message: '존재하지 않습니다' });
    }

    res.status(200).json({
      id: group._id,
      isPublic: group.isPublic,
    });
  } catch (error) {
    res.status(400).json({ message: '잘못된 요청입니다' });
  }
};