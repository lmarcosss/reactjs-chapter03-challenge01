import Link from 'next/link';
import styles from './preview-button.module.scss';

interface IProps {
  preview: boolean;
}
export default function PreviewButton({ preview }: IProps): JSX.Element {
  return (
    preview && (
      <aside className={styles.containerPreviewButton}>
        <Link href="/api/exit-preview">
          <a>Sair do modo Preview</a>
        </Link>
      </aside>
    )
  );
}
