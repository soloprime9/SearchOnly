'use client';

import PostIdData from './PostIdData';

export default function ClientWrapper({ postId }) {
  return <PostIdData postId={postId} />;
}
