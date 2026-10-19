import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '4rem 1.25rem', textAlign: 'center' }}>
      <h1>404</h1>
      <p>That page does not exist.</p>
      <Link className="btn" to="/">
        Back to the home page
      </Link>
    </div>
  );
}

export default NotFound;
