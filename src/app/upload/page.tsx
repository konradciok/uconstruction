import { Metadata } from 'next';
import Container from '@/components/Container';
import UploadPage from '@/components/Upload/UploadPage';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Upload Images | UConstruction',
  description: 'Upload and process images for the Portfolio 2 gallery with automatic thumbnail generation.',
  keywords: 'upload, images, portfolio, gallery, thumbnails, processing',
};

export default function UploadPageRoute() {
  return (
    <main className={styles.main}>
      <Container>
        <UploadPage />
      </Container>
    </main>
  );
}
