import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { api } from '../api/client';
import Alert from '../components/Alert';
import BlogPostCard from '../components/BlogPostCard';
import Loader from '../components/Loader';
import ProjectCard from '../components/ProjectCard';
import cards from '../components/Cards.module.css';
import styles from './Home.module.css';
import pages from './Pages.module.css';

function Home() {
  const [projects, setProjects] = useState([]);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState('');

  useEffect(() => {
    let cancelled = false;

    Promise.all([api.getProjects(), api.getPosts()])
      .then(([projectList, postList]) => {
        if (cancelled) return;
        setProjects(projectList);
        setPosts(postList);
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
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <span className={styles.eyebrow}>Capstone - Full-stack portfolio</span>
          <h1>Hi, I&apos;m Chen Xiaoding.</h1>
          <p>
            I study artificial intelligence at SYNU and I build web applications. This site is my
            capstone project: a React single-page app talking to a REST API I wrote with Express,
            Mongoose and MongoDB Atlas, with JWT authentication and an admin dashboard.
          </p>

          <div className={styles.heroActions}>
            <Link className="btn" to="/projects">
              See my projects
            </Link>
            <Link className="btn btn-ghost" to="/blog">
              Read the blog
            </Link>
          </div>

          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statValue}>{isLoading ? '-' : projects.length}</span>
              <span className={styles.statLabel}>projects</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{isLoading ? '-' : posts.length}</span>
              <span className={styles.statLabel}>blog posts</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>100%</span>
              <span className={styles.statLabel}>built from scratch</span>
            </div>
          </div>
        </div>

        <img src="/profile.jpg" alt="Portrait of Chen Xiaoding" className={styles.portrait} />
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2>Latest projects</h2>
          <Link to="/projects">All projects &rarr;</Link>
        </div>

        {isLoading && <Loader text="Loading projects..." />}
        {isError && <Alert>{isError}</Alert>}

        {!isLoading && !isError && (
          <div className={pages.grid}>
            {projects.slice(0, 3).map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2>From the blog</h2>
          <Link to="/blog">All posts &rarr;</Link>
        </div>

        {isLoading && <Loader text="Loading posts..." />}
        {isError && <Alert>{isError}</Alert>}

        {!isLoading && !isError && (
          <div className={pages.grid}>
            {posts.slice(0, 2).map((post) => (
              <BlogPostCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;
