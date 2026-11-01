import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { api } from '../api/client';
import Alert from '../components/Alert';
import Loader from '../components/Loader';
import styles from './Pages.module.css';

function ProjectDetail() {
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setIsError('');

    api
      .getProject(id)
      .then((data) => {
        if (!cancelled) setProject(data);
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

  if (isLoading) return <div className={styles.page}><Loader text="Loading project..." /></div>;

  if (isError) {
    return (
      <div className={styles.page}>
        <Alert>{isError}</Alert>
        <Link to="/projects">&larr; Back to projects</Link>
      </div>
    );
  }

  if (!project) return null;

  const date = new Date(project.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className={styles.page}>
      <Link to="/projects">&larr; Back to projects</Link>

      <article className={styles.article} style={{ marginTop: '1rem' }}>
        <h1>{project.title}</h1>
        <p className={styles.articleMeta}>
          {date} &middot; by {project.user?.username ?? 'unknown author'}
        </p>
        <div className={styles.articleBody}>{project.description}</div>

        {(project.liveUrl || project.repoUrl) && (
          <div className={styles.projectLinks}>
            {project.liveUrl && (
              <a className="btn" href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                Live site
              </a>
            )}
            {project.repoUrl && (
              <a
                className="btn btn-ghost"
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Source code
              </a>
            )}
          </div>
        )}
      </article>
    </div>
  );
}

export default ProjectDetail;
