import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extract metadata
    const imageId = formData.get('imageId') as string;
    const originalName = formData.get('originalName') as string;
    const title = formData.get('title') as string;
    const dimensions = formData.get('dimensions') as string;
    const medium = formData.get('medium') as string;
    const tagsRaw = formData.get('tags') as string | null;
    const alt = formData.get('alt') as string;

    // Extract dimensions
    const thumbnailWidth = parseInt(formData.get('thumbnailWidth') as string);
    const thumbnailHeight = parseInt(formData.get('thumbnailHeight') as string);
    const fullWidth = parseInt(formData.get('fullWidth') as string);
    const fullHeight = parseInt(formData.get('fullHeight') as string);

    // Extract files
    const thumbnailJpg = formData.get('thumbnailJpg') as File;
    const thumbnailWebp = formData.get('thumbnailWebp') as File;
    const thumbnailAvif = formData.get('thumbnailAvif') as File;
    const fullJpg = formData.get('fullJpg') as File;
    const fullWebp = formData.get('fullWebp') as File;
    const fullAvif = formData.get('fullAvif') as File;

    // Create directories if they don't exist
    const publicDir = join(process.cwd(), 'public');
    const thumbsDir = join(publicDir, 'img', 'portfolio2', 'thumbs');
    const fullDir = join(publicDir, 'img', 'portfolio2', 'full');

    await mkdir(thumbsDir, { recursive: true });
    await mkdir(fullDir, { recursive: true });

    // Save thumbnail files
    if (thumbnailJpg) {
      const thumbnailJpgBuffer = Buffer.from(await thumbnailJpg.arrayBuffer());
      await writeFile(join(thumbsDir, `${imageId}.jpg`), thumbnailJpgBuffer);
    }

    if (thumbnailWebp) {
      const thumbnailWebpBuffer = Buffer.from(
        await thumbnailWebp.arrayBuffer()
      );
      await writeFile(join(thumbsDir, `${imageId}.webp`), thumbnailWebpBuffer);
    }

    if (thumbnailAvif) {
      const thumbnailAvifBuffer = Buffer.from(
        await thumbnailAvif.arrayBuffer()
      );
      await writeFile(join(thumbsDir, `${imageId}.avif`), thumbnailAvifBuffer);
    }

    // Save full size files
    if (fullJpg) {
      const fullJpgBuffer = Buffer.from(await fullJpg.arrayBuffer());
      await writeFile(join(fullDir, `${imageId}.jpg`), fullJpgBuffer);
    }

    if (fullWebp) {
      const fullWebpBuffer = Buffer.from(await fullWebp.arrayBuffer());
      await writeFile(join(fullDir, `${imageId}.webp`), fullWebpBuffer);
    }

    if (fullAvif) {
      const fullAvifBuffer = Buffer.from(await fullAvif.arrayBuffer());
      await writeFile(join(fullDir, `${imageId}.avif`), fullAvifBuffer);
    }

    // Return the processed image data
    const processedImage = {
      id: imageId,
      originalName,
      title,
      dimensions,
      alt: alt || undefined,
      medium: medium || undefined,
      tags: tagsRaw ? JSON.parse(tagsRaw) : undefined,
      thumbnail: {
        jpg: `/img/portfolio2/thumbs/${imageId}.jpg`,
        webp: thumbnailWebp
          ? `/img/portfolio2/thumbs/${imageId}.webp`
          : undefined,
        avif: thumbnailAvif
          ? `/img/portfolio2/thumbs/${imageId}.avif`
          : undefined,
        width: thumbnailWidth,
        height: thumbnailHeight,
      },
      full: {
        jpg: `/img/portfolio2/full/${imageId}.jpg`,
        webp: fullWebp ? `/img/portfolio2/full/${imageId}.webp` : undefined,
        avif: fullAvif ? `/img/portfolio2/full/${imageId}.avif` : undefined,
        width: fullWidth,
        height: fullHeight,
      },
    };

    return NextResponse.json(processedImage);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process upload' },
      { status: 500 }
    );
  }
}
