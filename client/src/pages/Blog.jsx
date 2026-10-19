import { useEffect, useState } from 'react';

import { api } from '../api/client';
import Alert from '../components/Alert';
import BlogPostCard from '../components/BlogPostCard';
import Loader from '../components/Loader';
import styles from './Pages.module.css';

function Blog() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState('');

  useEffect(() => {
    let cancelled = false;

    api
      .getPosts()
      .then((data) => {
        if (!cancelled) setPosts(data);
      })
      .catch((error) => {
        if (!cancelled) setIsError(error.message);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <h1>Blog</h1>
        <p className={styles.lead}>
          Notes on what I am learning: backend structure, authentication and the move from plain
          HTML to React.
        </p>
      </div>

      {isLoading && <Loader text="Loading posts..." />}
      {isError && <Alert>{isError}</Alert>}

      {!isLoading && !isError && posts.length === 0 && (
        <div className={styles.empty}>No posts yet. An admin can write one from the dashboard.</div>
      )}

      {!isLoading && !isError && posts.length > 0 && (
        <div className={styles.grid}>
          {posts.map((post) => (
            <BlogPostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Blog;
