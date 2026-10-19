import { useEffect, useState } from 'react';

import { api } from '../api/client';
import Alert from '../components/Alert';
import Loader from '../components/Loader';
import ProjectCard from '../components/ProjectCard';
import styles from './Pages.module.css';

function Projects() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState('');

  useEffect(() => {
    let cancelled = false;

    api
      .getProjects()
      .then((data) => {
        if (!cancelled) setProjects(data);
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
        <div className={styles.grid}>
          {projects.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Projects;
