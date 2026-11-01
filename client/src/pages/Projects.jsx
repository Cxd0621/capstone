import { useCallback, useEffect, useRef, useState } from 'react';

import { api } from '../api/client';
import Alert from '../components/Alert';
import Loader from '../components/Loader';
import ProjectCard from '../components/ProjectCard';
import styles from './Pages.module.css';

const PAGE_SIZE = 6;

function Projects() {
  const [projects, setProjects] = useState([]);
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
      const data = await api.getProjects({ page, limit: PAGE_SIZE });
      if (cancelled.current) return;
      setProjects((current) => (append ? [...current, ...data.items] : data.items));
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
        <h1>Projects</h1>
        <p className={styles.lead}>
          Everything here was built during this module and the two before it - straight from a
          MongoDB Atlas database.
        </p>
      </div>

      {isLoading && <Loader text="Loading projects from the API..." />}
      {isError && <Alert>{isError}</Alert>}

      {!isLoading && !isError && projects.length === 0 && (
        <div className={styles.empty}>No projects yet. An admin can add one from the dashboard.</div>
      )}

      {!isLoading && !isError && projects.length > 0 && (
        <>
          <div className={styles.grid}>
            {projects.map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>

          <div className={styles.listFooter}>
            <span>
              Showing {projects.length} of {meta.total} projects
            </span>
            {meta.page < meta.pages && (
              <button
                type="button"
                className="btn btn-ghost"
                disabled={isLoadingMore}
                onClick={() => load(meta.page + 1, true)}
              >
                {isLoadingMore ? 'Loading...' : 'Load more projects'}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Projects;
