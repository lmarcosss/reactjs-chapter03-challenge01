import Link from 'next/link';
import styles from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <header className={styles.headerContainer}>
      <Link href="/">
        <a>
          <img alt="logo" src="/images/logo.svg" />
        </a>
      </Link>
    </header>
  );
}
