import styles from './Layout.module.css';

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <p>&copy; {new Date().getFullYear()} Chen Xiaoding. All rights reserved.</p>
        <div className={styles.footerLinks}>
          <a href="https://github.com/" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <a href="mailto:chenxiaodi_0621@qq.com">Email</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
