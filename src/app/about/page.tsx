import React from 'react';
import Image from 'next/image';
import Container from '../../components/Container';
import styles from './page.module.css';

export default function AboutPage() {
  return (
    <div className={styles.aboutPage}>
      <Container>
        <div className={styles.content}>
          <header className={styles.header}>
            <h1 className={`${styles.title} animate-fadeInUp`}>
              Anna Ciok - Watercolor Painter
            </h1>
          </header>
          
          <div className={styles.heroImage}>
            <Image
              src="/assets/pics/about.webp"
              alt="Anna Ciok - Watercolor artist in her studio"
              width={800}
              height={600}
              className={styles.image}
              priority
            />
          </div>
          
          <div className={styles.story}>
            <p className={`${styles.intro} animate-fadeInUp`}>
              My journey to becoming a painter was long and winding, reminding me that it&apos;s never too late for change and that embracing it can lead to extraordinary transformations.
            </p>
            
            <div className={`${styles.section} animate-fadeInUp`}>
              <p>
                As a child, painting was my greatest passion—I painted obsessively. However, when I entered high school, my focus shifted to other pursuits, and for over 20 years, I set aside creating. I earned a degree in sociology and built a career in business, working closely with people. Yet, creativity never left me. Along the way, I also studied interior design, and my love for travel and discovering beauty in the world never faded. I have a natural ability to see wonder in small things—in nature, unusual shapes, textures, soft light, and intriguing color combinations. This is one of my greatest talents and what drives my work.
              </p>
            </div>
            
            <div className={`${styles.section} animate-fadeInUp`}>
              <p>
                An unexpected job loss and a move to Tenerife brought me back to painting after a two-decade hiatus. Inspiration is abundant here. The island&apos;s stunning landscapes, the ocean, the gentle climate, and the locals who know how to savor life provide endless fuel for my creativity. I feel deeply grateful to live and create in such a magical place, often called &quot;the happy island,&quot; and I&apos;m especially thankful for the warm reception my art has received.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
