import { useCallback, useEffect, useRef, useState } from 'react';

import { api } from '../api/client';
import Alert from '../components/Alert';
import BlogPostCard from '../components/BlogPostCard';
import Loader from '../components/Loader';
import styles from './Pages.module.css';

const PAGE_SIZE = 4;

function Blog() {
  const [posts, setPosts] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isError, setIsError] = useState('');
  const cancelled = useRef(false);

  useEffect(() => {
    cancelled.current = false;
    return () => {
      cancelled.current = true;
    };
  }, []);

  const load = useCallback(async (page, append) => {
    if (append) setIsLoadingMore(true);
    else setIsLoading(true);
    setIsError('');

    try {
      const data = await api.getPosts({ page, limit: PAGE_SIZE });
      if (cancelled.current) return;
      setPosts((current) => (append ? [...current, ...data.items] : data.items));
      setMeta({ page: data.page, pages: data.pages, total: data.total });
    } catch (error) {
      if (!cancelled.current) setIsError(error.message);
    } finally {
      if (!cancelled.current) {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    }
  }, []);

  useEffect(() => {
    load(1, false);
  }, [load]);

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
        <>
          <div className={styles.grid}>
            {posts.map((post) => (
              <BlogPostCard key={post._id} post={post} />
            ))}
          </div>

          <div className={styles.listFooter}>
            <span>
              Showing {posts.length} of {meta.total} posts
            </span>
            {meta.page < meta.pages && (
              <button
                type="button"
                className="btn btn-ghost"
                disabled={isLoadingMore}
                onClick={() => load(meta.page + 1, true)}
              >
                {isLoadingMore ? 'Loading...' : 'Load more posts'}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Blog;
