import { useTheme } from '../context/ThemeContext';

// Reads the theme straight from Context: no props come through the Header.
function ThemeToggle() {
  const { dark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className="btn btn-small btn-ghost"
      onClick={toggleTheme}
      aria-pressed={dark}
      title={dark ? 'Switch to the light theme' : 'Switch to the dark theme'}
    >
      {dark ? 'Light mode' : 'Dark mode'}
    </button>
  );
}

export default ThemeToggle;
