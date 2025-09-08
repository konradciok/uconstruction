import { Metadata } from 'next';
import Container from '@/components/Container';
import Portfolio2Page from '@/components/Portfolio2/Portfolio2Page';
import { ARTWORKS } from '@/lib/portfolio2-data';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Portfolio Gallery | UConstruction',
  description:
    'Explore our diverse collection of artwork including paintings, sculptures, photography, and digital art.',
  keywords:
    'portfolio, gallery, artwork, paintings, sculptures, photography, digital art',
};

export default function PortfolioPage() {
  return (
    <main className={styles.main}>
      <Container>
        <div className={styles.header}>
          <h1 className={styles.title}>Portfolio Gallery</h1>
          <p className={styles.description}>
            Explore our diverse collection of artwork, from traditional
            paintings to contemporary digital pieces. Each piece represents our
            commitment to artistic excellence and creative innovation.
          </p>
        </div>

        <div className={styles.galleryContainer}>
          <Portfolio2Page artworks={ARTWORKS} />
        </div>
      </Container>
    </main>
  );
}
