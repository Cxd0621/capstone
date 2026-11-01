import { Link } from 'react-router-dom';
import styles from './Cards.module.css';

function ProjectCard({ project }) {
  const { title, description, repoUrl, liveUrl } = project;

  return (
    <article className={styles.card}>
      <h3 className={styles.cardTitle}>
        <Link to={`/projects/${project._id}`}>{title}</Link>
      </h3>
      <p className={styles.cardText}>{description}</p>

      <div className={styles.cardActions}>
        {liveUrl && (
          <a className={`btn btn-small ${styles.cardLink}`} href={liveUrl} target="_blank" rel="noopener noreferrer">
            Live site
          </a>
        )}
        {repoUrl && (
          <a className={styles.cardGhost} href={repoUrl} target="_blank" rel="noopener noreferrer">
            Source code
          </a>
        )}
      </div>
    </article>
  );
}

export default ProjectCard;
