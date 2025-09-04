import { Metadata } from 'next';
import Container from '@/components/Container';
import Portfolio2Page from '@/components/Portfolio2/Portfolio2Page';
import { ARTWORKS } from '@/lib/portfolio2-data';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Portfolio 2 | UConstruction',
  description: 'Kolekcja prac artystycznych w formacie 4:5 z galerią lightbox.',
  keywords: 'portfolio, galeria, obrazy, sztuka, lightbox, 4:5',
};

export default function Portfolio2PageRoute() {
  return (
    <main className={styles.main}>
      <Container>
        <Portfolio2Page artworks={ARTWORKS} />
      </Container>
    </main>
  );
}
