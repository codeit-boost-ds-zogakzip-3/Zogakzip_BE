import Post from '../models/postModel.js';
import Group from '../models/groupModel.js';

// 게시글 등록
export const createPost = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { nickname, title, image, content, tags, location, memory_time, is_public, password } = req.body;

    // 그룹이 존재하는지 확인
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // 새로운 게시글 생성
    const newPost = new Post({
      group_id: groupId,
      nickname,
      title,
      image,
      content,
      tags,
      location,
      memory_time,
      is_public,
      password
    });

    const savedPost = await newPost.save();

    // 그룹의 posts_count 증가
    group.posts_count += 1;
    await group.save();

    res.status(201).json(savedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create post' });
  }
};


// 게시글 목록 조회
export const getPostsByGroupId = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { page = 1, pageSize = 10, sortBy = 'latest', keyword, isPublic } = req.query;

    // 필터링: 그룹 ID와 공개 여부로 필터링
    let filter = { group_id: groupId };
    if (isPublic !== undefined) {
      filter.is_public = isPublic === 'true';  // Boolean 값을 처리하기 위해 문자열 비교
    }

    if (keyword) {
      filter.$or = [
        { title: { $regex: keyword, $options: 'i' } },   // 제목에 검색어가 포함된 게시글
        { tags: { $regex: keyword, $options: 'i' } }    // 태그에 검색어가 포함된 게시글
      ];
    }

    // 정렬 기준
    let sortOption;
    if (sortBy === 'mostCommented') {
      sortOption = { comment_count: -1 };
    } else if (sortBy === 'mostLiked') {
      sortOption = { likes: -1 };
    } else {
      sortOption = { created_at: -1 };  // 기본값은 최신순 정렬
    }

    // 페이지네이션 계산
    const totalItemCount = await Post.countDocuments(filter);
    const totalPages = Math.ceil(totalItemCount / pageSize);
    const posts = await Post.find(filter)
      .sort(sortOption)
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize));

    // 결과 반환
    res.status(200).json({
      currentPage: parseInt(page),
      totalPages,
      totalItemCount,
      data: posts.map(post => ({
        id: post._id,
        nickname: post.nickname,
        title: post.title,
        imageUrl: post.image,  // 이미지를 imageUrl로 반환
        tags: post.tags,
        location: post.location,
        moment: post.memory_time,
        isPublic: post.is_public,
        likeCount: post.likes,
        commentCount: post.comment_count,
        createdAt: post.created_at
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: '잘못된 요청입니다' });
  }
};


// 게시글 수정
export const updatePostById = async (req, res) => {
  try {
    const { postId } = req.params;
    const { nickname, title, content, postPassword, imageUrl, tags, location, moment, isPublic } = req.body;

    // 해당 게시글 찾기
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: '존재하지 않습니다' });  // 게시글이 존재하지 않음
    }

    // 비밀번호 확인
    if (post.password !== postPassword) {
      return res.status(403).json({ message: '비밀번호가 틀렸습니다' });  // 비밀번호 불일치
    }

    // 게시글 수정
    post.nickname = nickname || post.nickname;
    post.title = title || post.title;
    post.content = content || post.content;
    post.image = imageUrl || post.image;
    post.tags = tags || post.tags;
    post.location = location || post.location;
    post.memory_time = moment || post.memory_time;
    post.is_public = isPublic !== undefined ? isPublic : post.is_public;

    const updatedPost = await post.save();  // 변경사항 저장

    // 수정된 게시글 반환
    res.status(200).json({
      id: updatedPost._id,
      groupId: updatedPost.group_id,
      nickname: updatedPost.nickname,
      title: updatedPost.title,
      content: updatedPost.content,
      imageUrl: updatedPost.image,
      tags: updatedPost.tags,
      location: updatedPost.location,
      moment: updatedPost.memory_time,
      isPublic: updatedPost.is_public,
      likeCount: updatedPost.likes,
      commentCount: updatedPost.comment_count,
      createdAt: updatedPost.created_at
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: '잘못된 요청입니다' });
  }
};


// 게시글 삭제
export const deletePostById = async (req, res) => {
  try {
    const { postId } = req.params;
    const { postPassword } = req.body;

    // 해당 게시글 찾기
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: '존재하지 않습니다' });  // 게시글이 존재하지 않음
    }

    // 비밀번호 확인
    if (post.password !== postPassword) {
      return res.status(403).json({ message: '비밀번호가 틀렸습니다' });  // 비밀번호 불일치
    }

    // 게시글 삭제
    await Post.findByIdAndDelete(postId);

    // 삭제 성공 메시지 반환
    res.status(200).json({ message: '게시글 삭제 성공' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: '잘못된 요청입니다' });
  }
};


// 게시글 상세 조회
export const getPostById = async (req, res) => {
  try {
    const { postId } = req.params;

    // 게시글 찾기
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: '존재하지 않습니다' });  // 게시글이 존재하지 않음
    }

    // 게시글 상세 정보 반환
    res.status(200).json({
      id: post._id,
      groupId: post.group_id,
      nickname: post.nickname,
      title: post.title,
      content: post.content,
      imageUrl: post.image,  // 이미지 URL 반환
      tags: post.tags,
      location: post.location,
      moment: post.memory_time,
      isPublic: post.is_public,
      likeCount: post.likes,
      commentCount: post.comment_count,
      createdAt: post.created_at
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: '잘못된 요청입니다' });
  }
};


// 게시글 비밀번호 확인
export const verifyPostPassword = async (req, res) => {
  try {
    const { postId } = req.params;
    const { password } = req.body;

    // 해당 게시글 찾기
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다' });  // 게시글이 존재하지 않음
    }

    // 비밀번호 확인
    if (post.password !== password) {
      return res.status(401).json({ message: '비밀번호가 틀렸습니다' });  // 비밀번호 불일치
    }

    // 비밀번호 일치
    res.status(200).json({ message: '비밀번호가 확인되었습니다' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: '잘못된 요청입니다' });
  }
};


// 게시글 공감하기
export const likePostById = async (req, res) => {
  try {
    const { postId } = req.params;

    // 해당 게시글 찾기
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: '존재하지 않습니다' });  // 게시글이 존재하지 않음
    }

    // 공감수 증가
    post.likes += 1;
    await post.save();  // 저장

    // 성공 메시지 반환
    res.status(200).json({ message: '게시글 공감하기 성공' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: '잘못된 요청입니다' });
  }
};


// 게시글 공개 여부 확인
export const getPostPublicStatus = async (req, res) => {
  try {
    const { postId } = req.params;

    // 게시글 찾기
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: '존재하지 않습니다' });  // 게시글이 존재하지 않음
    }

    // 게시글 공개 여부 반환
    res.status(200).json({
      id: post._id,
      isPublic: post.is_public
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: '잘못된 요청입니다' });
  }
};