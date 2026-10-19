import { useCallback, useEffect, useState } from 'react';

import { api } from '../api/client';
import Alert from '../components/Alert';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import styles from './Admin.module.css';

const EMPTY_PROJECT = { title: '', description: '', repoUrl: '', liveUrl: '', imageUrl: '' };
const EMPTY_POST = { title: '', content: '' };

function Admin() {
  const { token, user } = useAuth();

  const [tab, setTab] = useState('projects');
  const [projects, setProjects] = useState([]);
  const [posts, setPosts] = useState([]);
  const [messages, setMessages] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [projectForm, setProjectForm] = useState(EMPTY_PROJECT);
  const [editingProject, setEditingProject] = useState(null);
  const [postForm, setPostForm] = useState(EMPTY_POST);
  const [editingPost, setEditingPost] = useState(null);

  const loadEverything = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      // Runs the three "read" calls in parallel, each one on the public or protected endpoint
      const [projectList, postList, messageList] = await Promise.all([
        api.getProjects(),
        api.getPosts(),
        api.getMessages(token),
      ]);
      setProjects(projectList);
      setPosts(postList);
      setMessages(messageList);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadEverything();
  }, [loadEverything]);

  const flash = (message) => {
    setNotice(message);
    setError('');
  };

  // ------------------------------------------------------------- projects
  const handleProjectChange = (event) => {
    const { name, value } = event.target;
    setProjectForm((current) => ({ ...current, [name]: value }));
  };

  const submitProject = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      if (editingProject) {
        const updated = await api.updateProject(editingProject, projectForm, token);
        setProjects((list) => list.map((item) => (item._id === updated._id ? updated : item)));
        flash('Project updated.');
      } else {
        const created = await api.createProject(projectForm, token);
        setProjects((list) => [created, ...list]);
        flash('Project created.');
      }
      setProjectForm(EMPTY_PROJECT);
      setEditingProject(null);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSaving(false);
    }
  };

  const startEditProject = (project) => {
    setEditingProject(project._id);
    setProjectForm({
      title: project.title,
      description: project.description,
      repoUrl: project.repoUrl || '',
      liveUrl: project.liveUrl || '',
      imageUrl: project.imageUrl || '',
    });
  };

  const removeProject = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await api.deleteProject(id, token);
      setProjects((list) => list.filter((item) => item._id !== id));
      flash('Project deleted.');
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  // ----------------------------------------------------------------- blog
  const handlePostChange = (event) => {
    const { name, value } = event.target;
    setPostForm((current) => ({ ...current, [name]: value }));
  };

  const submitPost = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      if (editingPost) {
        const updated = await api.updatePost(editingPost, postForm, token);
        setPosts((list) => list.map((item) => (item._id === updated._id ? updated : item)));
        flash('Post updated.');
      } else {
        const created = await api.createPost(postForm, token);
        setPosts((list) => [created, ...list]);
        flash('Post published.');
      }
      setPostForm(EMPTY_POST);
      setEditingPost(null);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSaving(false);
    }
  };

  const startEditPost = (post) => {
    setEditingPost(post._id);
    setPostForm({ title: post.title, content: post.content });
  };

  const removePost = async (id) => {
    if (!window.confirm('Delete this post and its comments?')) return;
    try {
      await api.deletePost(id, token);
      setPosts((list) => list.filter((item) => item._id !== id));
      flash('Post deleted.');
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  // ------------------------------------------------------------- messages
  const removeMessage = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await api.deleteMessage(id, token);
      setMessages((list) => list.filter((item) => item._id !== id));
      flash('Message deleted.');
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  // ---------------------------------------------------------------- render
  const tabClass = (name) => (tab === name ? `${styles.tab} ${styles.tabActive}` : styles.tab);

  return (
    <div className={styles.page}>
      <h1>Admin dashboard</h1>
      <p className={styles.itemMeta}>Signed in as {user?.username}</p>

      <div className={styles.tabs} role="tablist">
        <button type="button" role="tab" className={tabClass('projects')} onClick={() => setTab('projects')}>
          Projects ({projects.length})
        </button>
        <button type="button" role="tab" className={tabClass('blog')} onClick={() => setTab('blog')}>
          Blog posts ({posts.length})
        </button>
        <button type="button" role="tab" className={tabClass('messages')} onClick={() => setTab('messages')}>
          Messages ({messages.length})
        </button>
      </div>

      {error && <Alert>{error}</Alert>}
      {notice && <Alert type="success">{notice}</Alert>}

      {isLoading ? (
        <Loader text="Loading the dashboard..." />
      ) : (
        <>
          {tab === 'projects' && (
            <div className={styles.panel}>
              <div className={styles.list}>
                {projects.length === 0 && <div className={styles.empty}>No projects yet.</div>}
                {projects.map((project) => (
                  <div key={project._id} className={styles.item}>
                    <div className={styles.itemBody}>
                      <div className={styles.itemTitle}>{project.title}</div>
                      <div className={styles.itemMeta}>by {project.user?.username ?? 'unknown'}</div>
                      <p className={styles.itemText}>{project.description}</p>
                    </div>
                    <div className={styles.itemActions}>
                      <button type="button" className="btn btn-small btn-ghost" onClick={() => startEditProject(project)}>
                        Edit
                      </button>
                      <button type="button" className="btn btn-small btn-danger" onClick={() => removeProject(project._id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <form className={styles.formCard} onSubmit={submitProject}>
                <h3>{editingProject ? 'Edit project' : 'New project'}</h3>

                <div className={styles.form}>
                  <div>
                    <label htmlFor="title">Title</label>
                    <input id="title" name="title" value={projectForm.title} onChange={handleProjectChange} required />
                  </div>
                  <div>
                    <label htmlFor="description">Description</label>
                    <textarea id="description" name="description" value={projectForm.description} onChange={handleProjectChange} required />
                  </div>
                  <div>
                    <label htmlFor="repoUrl">Repository URL</label>
                    <input id="repoUrl" name="repoUrl" value={projectForm.repoUrl} onChange={handleProjectChange} />
                  </div>
                  <div>
                    <label htmlFor="liveUrl">Live URL</label>
                    <input id="liveUrl" name="liveUrl" value={projectForm.liveUrl} onChange={handleProjectChange} />
                  </div>
                  <div className={styles.formActions}>
                    <button type="submit" className="btn" disabled={isSaving}>
                      {isSaving ? 'Saving...' : editingProject ? 'Save changes' : 'Create project'}
                    </button>
                    {editingProject && (
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => {
                          setEditingProject(null);
                          setProjectForm(EMPTY_PROJECT);
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          )}

          {tab === 'blog' && (
            <div className={styles.panel}>
              <div className={styles.list}>
                {posts.length === 0 && <div className={styles.empty}>No posts yet.</div>}
                {posts.map((post) => (
                  <div key={post._id} className={styles.item}>
                    <div className={styles.itemBody}>
                      <div className={styles.itemTitle}>{post.title}</div>
                      <div className={styles.itemMeta}>
                        by {post.author?.username ?? 'unknown'} &middot;{' '}
                        {new Date(post.createdAt).toLocaleDateString('en-GB')}
                      </div>
                      <p className={styles.itemText}>{post.content.slice(0, 140)}...</p>
                    </div>
                    <div className={styles.itemActions}>
                      <button type="button" className="btn btn-small btn-ghost" onClick={() => startEditPost(post)}>
                        Edit
                      </button>
                      <button type="button" className="btn btn-small btn-danger" onClick={() => removePost(post._id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <form className={styles.formCard} onSubmit={submitPost}>
                <h3>{editingPost ? 'Edit post' : 'New post'}</h3>

                <div className={styles.form}>
                  <div>
                    <label htmlFor="postTitle">Title</label>
                    <input id="postTitle" name="title" value={postForm.title} onChange={handlePostChange} required />
                  </div>
                  <div>
                    <label htmlFor="postContent">Content</label>
                    <textarea id="postContent" name="content" value={postForm.content} onChange={handlePostChange} required />
                  </div>
                  <div className={styles.formActions}>
                    <button type="submit" className="btn" disabled={isSaving}>
                      {isSaving ? 'Saving...' : editingPost ? 'Save changes' : 'Publish post'}
                    </button>
                    {editingPost && (
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => {
                          setEditingPost(null);
                          setPostForm(EMPTY_POST);
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          )}

          {tab === 'messages' && (
            <div className={`${styles.panel} ${styles.panelSingle}`}>
              <div className={styles.list}>
                {messages.length === 0 && <div className={styles.empty}>No messages yet.</div>}
                {messages.map((message) => (
                  <div key={message._id} className={styles.item}>
                    <div className={styles.itemBody}>
                      <div className={styles.itemTitle}>{message.name}</div>
                      <div className={styles.itemMeta}>
                        <a href={`mailto:${message.email}`}>{message.email}</a> &middot;{' '}
                        {new Date(message.createdAt).toLocaleString('en-GB')}
                      </div>
                      <p className={styles.itemText}>{message.message}</p>
                    </div>
                    <div className={styles.itemActions}>
                      <button type="button" className="btn btn-small btn-danger" onClick={() => removeMessage(message._id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Admin;
