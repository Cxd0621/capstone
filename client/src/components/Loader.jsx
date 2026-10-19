function Loader({ text = 'Loading...' }) {
  return (
    <div className="loader" role="status" aria-live="polite">
      <span className="loader-dot" />
      <span>{text}</span>
    </div>
  );
}

export default Loader;
