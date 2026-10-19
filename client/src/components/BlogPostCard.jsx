import { Link } from 'react-router-dom';
import styles from './Cards.module.css';

function BlogPostCard({ post }) {
  const date = new Date(post.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <article className={styles.card}>
      <h3 className={styles.cardTitle}>
        <Link to={`/blog/${post._id}`}>{post.title}</Link>
      </h3>

      <p className={styles.cardText}>
        {post.content.length > 180 ? `${post.content.slice(0, 180)}...` : post.content}
      </p>

      <div className={styles.cardMeta}>
        <span>{date}</span>
        {post.author?.username && <span>by {post.author.username}</span>}
      </div>
    </article>
  );
}

export default BlogPostCard;
