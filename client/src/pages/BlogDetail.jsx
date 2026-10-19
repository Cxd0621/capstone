import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { api } from '../api/client';
import Alert from '../components/Alert';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import styles from './Pages.module.css';

function BlogDetail() {
  const { id } = useParams();
  const { isAuthenticated, token, user } = useAuth();

  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState('');
  const [commentBody, setCommentBody] = useState('');
  const [commentError, setCommentError] = useState('');
  const [commentSuccess, setCommentSuccess] = useState('');
  const [isSending, setIsSending] = useState(false);

  const loadComments = useCallback(async () => {
    const comments = await api.getComments(id);
    setPost((current) => (current ? { ...current, comments } : current));
  }, [id]);

  useEffect(() => {
    let cancelled = false;

    api
      .getPost(id)
      .then((data) => {
        if (!cancelled) setPost(data);
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
  }, [id]);

  const handleComment = async (event) => {
    event.preventDefault();
    setCommentError('');
    setCommentSuccess('');
    setIsSending(true);

    try {
      await api.createComment(id, { body: commentBody }, token);
      setCommentBody('');
      setCommentSuccess('Your comment was posted.');
      await loadComments();
    } catch (error) {
      setCommentError(error.message);
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) return <div className={styles.page}><Loader text="Loading post..." /></div>;

  if (isError) {
    return (
      <div className={styles.page}>
        <Alert>{isError}</Alert>
        <Link to="/blog">&larr; Back to the blog</Link>
      </div>
    );
  }

  if (!post) return null;

  const date = new Date(post.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className={styles.page}>
      <Link to="/blog">&larr; Back to the blog</Link>

      <article className={styles.article} style={{ marginTop: '1rem' }}>
        <h1>{post.title}</h1>
        <p className={styles.articleMeta}>
          {date} &middot; by {post.author?.username ?? 'unknown author'}
        </p>
        <div className={styles.articleBody}>{post.content}</div>
      </article>

      <section className={styles.comments}>
        <h2>Comments ({post.comments?.length ?? 0})</h2>

        {(post.comments?.length ?? 0) === 0 && <p className={styles.loginHint}>No comments yet.</p>}

        <ul className={styles.commentList}>
          {post.comments?.map((comment) => (
            <li key={comment._id} className={styles.comment}>
              <div className={styles.commentHead}>
                <span className={styles.commentAuthor}>{comment.author?.username ?? 'user'}</span>
                <span className={styles.commentDate}>
                  {new Date(comment.createdAt).toLocaleDateString('en-GB')}
                </span>
              </div>
              <p style={{ margin: 0 }}>{comment.body}</p>
            </li>
          ))}
        </ul>

        {isAuthenticated ? (
          <form className={styles.commentForm} onSubmit={handleComment}>
            <label htmlFor="comment">Leave a comment as {user.username}</label>
            <textarea
              id="comment"
              value={commentBody}
              onChange={(event) => setCommentBody(event.target.value)}
              placeholder="Share your thoughts..."
              required
            />
            {commentError && <Alert>{commentError}</Alert>}
            {commentSuccess && <Alert type="success">{commentSuccess}</Alert>}
            <div>
              <button type="submit" className="btn" disabled={isSending}>
                {isSending ? 'Posting...' : 'Post comment'}
              </button>
            </div>
          </form>
        ) : (
          <p className={styles.loginHint}>
            <Link to="/login">Log in</Link> to join the discussion.
          </p>
        )}
      </section>
    </div>
  );
}

export default BlogDetail;
