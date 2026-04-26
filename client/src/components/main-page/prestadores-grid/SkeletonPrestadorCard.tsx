import styles from '@/styles/components/main-page/prestadores-grid/PrestadoresGrid.module.css';

export default function SkeletonPrestadorCard() {
  return (
    <article className={styles.skeletonCard} aria-hidden="true">
      <div className={styles.skeletonImage} />
      <div className={styles.skeletonBody}>
        <div className={styles.skeletonLineLarge} />
        <div className={styles.skeletonLineMedium} />
        <div className={styles.skeletonLineSmall} />
        <div className={styles.skeletonActions}>
          <div className={styles.skeletonButton} />
          <div className={styles.skeletonButton} />
        </div>
      </div>
    </article>
  );
}
