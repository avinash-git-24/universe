/**
 * Generates 4-frame walk-cycle sprite strips for each student character.
 *
 * Walk cycle frames (left→right across the strip):
 *   Frame 0: Contact  – weight on left foot  (body level, lean slight fwd)
 *   Frame 1: Mid-swing – body at peak height (feet mid-air)
 *   Frame 2: Contact  – weight on right foot (body level, lean slight fwd)
 *   Frame 3: Mid-swing – body at peak height (opposite)
 *
 * Since we only have a single static source image, we simulate each frame
 * by applying distinct affine transforms to the whole image:
 *
 *  Frame 0: translateY(+6px)  → body slightly down (foot-plant)
 *  Frame 1: translateY(-5px)  → body slightly up   (mid-stride)
 *  Frame 2: translateY(+6px)  → body slightly down (opposite foot-plant)
 *  Frame 3: translateY(-5px)  → body slightly up   (opposite mid-stride)
 *
 * We also apply a subtle X-shear to simulate torso sway:
 *  Frames 0 & 2 (contact): shearX = ±2%
 *  Frames 1 & 3 (float):   shearX = 0
 *
 * Each frame is rendered at OUTPUT_SIZE × OUTPUT_SIZE.
 * The final sprite strip is 4 × OUTPUT_SIZE wide.
 */

import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CHARS_DIR = path.join(__dirname, '..', 'public', 'characters');

// Output frame size (square) — characters will be letterboxed inside
const OUTPUT_SIZE = 300;

// Characters: [name, source file]
const CHARS = [
  ['runner', 'student-runner.webp'],
  ['coffee', 'student-coffee.webp'],
  ['tech',   'student-tech.webp'],
];

/**
 * Frame definitions:
 * Each frame is described by:
 *   dy    – vertical offset in px (positive = down)
 *   shear – horizontal shear factor (small float, simulates lean)
 */
const FRAMES = [
  { dy: +6, shear: +0.04 },   // frame 0: foot-plant left  → lean right
  { dy: -5, shear:  0.00 },   // frame 1: mid-air          → straight
  { dy: +6, shear: -0.04 },   // frame 2: foot-plant right → lean left
  { dy: -5, shear:  0.00 },   // frame 3: mid-air          → straight
];

async function genStrip(name, srcFile) {
  const srcPath = path.join(CHARS_DIR, srcFile);
  const meta = await sharp(srcPath).metadata();

  // Fit the character image inside OUTPUT_SIZE keeping aspect ratio
  const scale = Math.min(OUTPUT_SIZE / meta.width, OUTPUT_SIZE / meta.height);
  const fitW  = Math.round(meta.width  * scale);
  const fitH  = Math.round(meta.height * scale);
  const padL  = Math.floor((OUTPUT_SIZE - fitW) / 2);
  const padT  = Math.floor((OUTPUT_SIZE - fitH) / 2);

  const baseResized = await sharp(srcPath)
    .resize(fitW, fitH, { fit: 'fill' })
    .toBuffer();

  const frameBuffers = [];

  for (const { dy, shear } of FRAMES) {
    // Compose on a transparent OUTPUT_SIZE canvas with dy offset
    const topOffset = Math.max(0, padT + dy);

    // Build the composited frame
    const frameBuffer = await sharp({
      create: {
        width:      OUTPUT_SIZE,
        height:     OUTPUT_SIZE,
        channels:   4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([{
        input: baseResized,
        left: padL,
        top:  topOffset,
      }])
      // Apply affine shear to simulate torso lean
      .affine(
        [1, shear, 0, 1],          // 2×2 matrix [a,b,c,d]
        { background: { r: 0, g: 0, b: 0, alpha: 0 }, odim: [OUTPUT_SIZE, OUTPUT_SIZE] }
      )
      .webp({ quality: 85 })
      .toBuffer();

    frameBuffers.push(frameBuffer);
  }

  // Stitch 4 frames horizontally into one strip
  const stripWidth = OUTPUT_SIZE * FRAMES.length;
  const strip = sharp({
    create: {
      width:      stripWidth,
      height:     OUTPUT_SIZE,
      channels:   4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  }).composite(
    frameBuffers.map((buf, i) => ({
      input: buf,
      left:  i * OUTPUT_SIZE,
      top:   0,
    }))
  );

  const outPath = path.join(CHARS_DIR, `student-${name}-walk.webp`);
  await strip.webp({ quality: 90 }).toFile(outPath);
  console.log(`✓ Wrote ${outPath}`);
}

for (const [name, src] of CHARS) {
  await genStrip(name, src);
}

console.log('\nAll walk sprite strips generated successfully.');
