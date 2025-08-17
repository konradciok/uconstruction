import React from 'react';
import Container from './Container';
import styles from './ArtMatters.module.css';

export default function ArtMatters() {
  return (
    <section className={styles.artMatters}>
      <Container>
        <div className={styles.content}>
          <h2 className={`${styles.title} animate-fadeInUp`}>
            Art Matters
          </h2>
          <div className={styles.textContent}>
            <p className={`${styles.description} animate-fadeInUp`}>
              Each piece I create is filled with creativity and emotion, offering a unique and timeless addition to your home decor or art collection. Whether you&apos;re exploring my abstract paintings or my works inspired by the beauty of Tenerife, I hope you find something that resonates with you.
            </p>
            <p className={`${styles.description} animate-fadeInUp`}>
              If you&apos;re looking for something truly special, I&apos;d love to work with you on a custom commission. Feel free to connect with me on social media or reach out with any questions or inquiries. Thank you for supporting my art!
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
