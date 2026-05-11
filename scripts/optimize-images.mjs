import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import sharp from 'sharp';

const DEFAULT_TARGET_DIR = 'src/assets/images';
const SUPPORTED_EXTENSIONS = new Set([
  '.avif',
  '.gif',
  '.jpeg',
  '.jpg',
  '.png',
  '.webp',
]);

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const targetArg = args.find((arg) => !arg.startsWith('--'));
const targetDir = path.resolve(process.cwd(), targetArg ?? DEFAULT_TARGET_DIR);

async function collectImages(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectImages(fullPath)));
      continue;
    }

    if (
      entry.isFile() &&
      SUPPORTED_EXTENSIONS.has(path.extname(entry.name).toLowerCase())
    ) {
      files.push(fullPath);
    }
  }

  return files.sort((left, right) => left.localeCompare(right));
}

function configurePipeline(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  const pipeline = sharp(filePath, {
    animated: extension === '.gif',
  }).rotate();

  switch (extension) {
    case '.avif':
      return pipeline.avif({ effort: 6, quality: 60 });
    case '.gif':
      return pipeline.gif({ effort: 7 });
    case '.jpeg':
    case '.jpg':
      return pipeline.jpeg({ mozjpeg: true, quality: 82 });
    case '.png':
      return pipeline.png({
        adaptiveFiltering: true,
        compressionLevel: 9,
        effort: 10,
      });
    case '.webp':
      return pipeline.webp({ effort: 6, quality: 82 });
    default:
      throw new Error(`Unsupported image extension: ${extension}`);
  }
}

function formatBytes(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

async function optimizeImage(filePath) {
  const original = await fs.stat(filePath);
  const optimizedBuffer = await configurePipeline(filePath).toBuffer();
  const savings = original.size - optimizedBuffer.length;
  const relativePath = path.relative(process.cwd(), filePath);

  if (savings <= 0) {
    console.log(`skip ${relativePath} already optimized`);
    return { changed: false, saved: 0 };
  }

  const percent = ((savings / original.size) * 100).toFixed(1);
  console.log(
    `${isDryRun ? 'would optimize' : 'optimized'} ${relativePath} ${formatBytes(
      original.size,
    )} -> ${formatBytes(optimizedBuffer.length)} (-${percent}%)`,
  );

  if (!isDryRun) {
    const temporaryPath = `${filePath}.optimized`;
    await fs.writeFile(temporaryPath, optimizedBuffer);
    await fs.rename(temporaryPath, filePath);
  }

  return { changed: true, saved: savings };
}

try {
  await fs.access(targetDir);

  const imagePaths = await collectImages(targetDir);

  if (imagePaths.length === 0) {
    console.log(`No supported images found in ${path.relative(process.cwd(), targetDir)}`);
    process.exit(0);
  }

  let changed = 0;
  let failed = 0;
  let totalSaved = 0;

  for (const imagePath of imagePaths) {
    try {
      const result = await optimizeImage(imagePath);
      changed += result.changed ? 1 : 0;
      totalSaved += result.saved;
    } catch (error) {
      failed += 1;
      console.error(
        `failed ${path.relative(process.cwd(), imagePath)}: ${error.message}`,
      );
    }
  }

  console.log(
    `${isDryRun ? 'Dry run complete' : 'Optimization complete'}: ${changed}/${
      imagePaths.length
    } images can save ${formatBytes(totalSaved)}`,
  );

  if (failed > 0) {
    process.exitCode = 1;
  }
} catch (error) {
  console.error(`Image optimization failed: ${error.message}`);
  process.exit(1);
}
