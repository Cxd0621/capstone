import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import Alert from '../components/Alert';
import { useAuth } from '../context/AuthContext';
import styles from './Auth.module.css';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/admin';

  const [form, setForm] = useState({ email: '', password: '' });
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
      await login(form.email, form.password);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setIsError(error.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <h1>Log in</h1>
        <p className={styles.hint}>Sign in to comment and to manage the portfolio.</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>

          <div className={styles.field}>
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" value={form.password} onChange={handleChange} required />
          </div>

          {isError && <Alert>{isError}</Alert>}

          <button type="submit" className="btn" disabled={isSending}>
            {isSending ? 'Signing in...' : 'Log in'}
          </button>
        </form>

        <p className={styles.switch}>
          No account yet? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
