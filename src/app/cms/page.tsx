import { Metadata } from 'next';
import Container from '@/components/Container';
import GalleryCMS from '@/components/CMS/GalleryCMS';

export const metadata: Metadata = {
  title: 'Gallery CMS | UConstruction',
  description: 'Manage gallery images and their metadata (title, size, medium, tags).',
};

export default function CMSPageRoute() {
  return (
    <main>
      <Container>
        <GalleryCMS />
      </Container>
    </main>
  );
}


