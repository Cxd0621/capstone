import { useState } from 'react';

import { api } from '../api/client';
import Alert from '../components/Alert';
import styles from './Pages.module.css';

const EMPTY_FORM = { name: '', email: '', message: '' };

function Contact() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSending, setIsSending] = useState(false);
  const [isError, setIsError] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSending(true);
    setIsError('');
    setIsSent(false);

    try {
      await api.sendMessage(form);
      setForm(EMPTY_FORM);
      setIsSent(true);
    } catch (error) {
      setIsError(error.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <h1>Contact</h1>
        <p className={styles.lead}>
          Want to work together, or just say hello? Send a message - it is stored in the database
          and shows up in my admin dashboard.
        </p>
      </div>

      <div className={styles.contactGrid}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name">Your name</label>
            <input id="name" name="name" value={form.name} onChange={handleChange} required />
          </div>

          <div>
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>

          <div>
            <label htmlFor="message">Message</label>
            <textarea id="message" name="message" value={form.message} onChange={handleChange} required />
          </div>

          {isError && <Alert>{isError}</Alert>}
          {isSent && <Alert type="success">Thanks! Your message has been received.</Alert>}

          <div>
            <button type="submit" className="btn" disabled={isSending}>
              {isSending ? 'Sending...' : 'Send message'}
            </button>
          </div>
        </form>

        <aside className={styles.sideCard}>
          <h3>Other ways to reach me</h3>
          <p>
            Email: <a href="mailto:chenxiaodi_0621@qq.com">chenxiaodi_0621@qq.com</a>
          </p>
          <p>
            GitHub: <a href="https://github.com/" target="_blank" rel="noopener noreferrer">github.com</a>
          </p>
          <p style={{ marginBottom: 0 }}>
            I usually reply within a day.
          </p>
        </aside>
      </div>
    </div>
  );
}

export default Contact;
