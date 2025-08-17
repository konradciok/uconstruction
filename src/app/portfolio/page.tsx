import { Metadata } from 'next';
import Container from '@/components/Container';
import Gallery from '@/components/Gallery/Gallery';
import { galleryItems } from '@/lib/gallery-data';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Portfolio Gallery | UConstruction',
  description: 'Explore our diverse collection of artwork including paintings, sculptures, photography, and digital art.',
  keywords: 'portfolio, gallery, artwork, paintings, sculptures, photography, digital art',
};

export default function PortfolioPage() {
  return (
    <main className={styles.main}>
      <Container>
        <div className={styles.header}>
          <h1 className={styles.title}>Portfolio Gallery</h1>
          <p className={styles.description}>
            Explore our diverse collection of artwork, from traditional paintings to contemporary digital pieces. 
            Each piece represents our commitment to artistic excellence and creative innovation.
          </p>
        </div>
        
        <div className={styles.galleryContainer}>
          <Gallery 
            items={galleryItems}
            title="Featured Works"
            description="Discover our latest creations and timeless masterpieces"
          />
        </div>
      </Container>
    </main>
  );
}
