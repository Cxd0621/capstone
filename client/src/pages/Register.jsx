import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import Alert from '../components/Alert';
import { useAuth } from '../context/AuthContext';
import styles from './Auth.module.css';

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [isError, setIsError] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSending(true);
    setIsError('');

    try {
      await register(form.username, form.email, form.password);
      navigate('/admin', { replace: true });
    } catch (error) {
      setIsError(error.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <h1>Create an account</h1>
        <p className={styles.hint}>Anyone can register; the dashboard manages the site content.</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="username">Username</label>
            <input id="username" name="username" value={form.username} onChange={handleChange} required minLength={3} />
          </div>

          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>

          <div className={styles.field}>
            <label htmlFor="password">Password (at least 6 characters)</label>
            <input id="password" name="password" type="password" value={form.password} onChange={handleChange} required minLength={6} />
          </div>

          {isError && <Alert>{isError}</Alert>}

          <button type="submit" className="btn" disabled={isSending}>
            {isSending ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className={styles.switch}>
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
