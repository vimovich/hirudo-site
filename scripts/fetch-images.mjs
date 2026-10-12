// Downloads stock photos into public/img at build time (Vercel build has internet access).
// Sources: Pixabay (Pixabay Content License) and Pexels (Pexels License) — free for commercial use.
import { mkdir, writeFile, access } from 'fs/promises';

const px = (id) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=2000`;

const images = {
  'leech-skin.jpg': 'https://cdn.pixabay.com/photo/2015/11/21/19/32/leech-1055447_1280.jpg',
  'leech-arm.jpg': 'https://cdn.pixabay.com/photo/2015/11/21/19/32/leech-1055446_1280.jpg',
  'leech-hand.jpg': 'https://cdn.pixabay.com/photo/2014/06/13/14/30/leech-368345_1280.jpg',
  'water-drop.jpg': px(371717),
  'water-ripple.jpg': px(9302825),
  'stream.jpg': px(452690),
  'plane-wing.jpg': px(3374249),
  'plane-apron.jpg': px(3140204),
  'lab-microscope.jpg': px(9243372),
  'lab-woman.jpg': px(3735711),
  'surgery.jpg': px(20217786),
  'doctor.jpg': px(32115957),
};

await mkdir('public/img', { recursive: true });
let ok = 0;
for (const [name, url] of Object.entries(images)) {
  const dest = `public/img/${name}`;
  try { await access(dest); ok++; continue; } catch {}
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (site build)' } });
    if (!r.ok) throw new Error(r.status);
    await writeFile(dest, Buffer.from(await r.arrayBuffer()));
    ok++;
  } catch (e) {
    console.warn(`[images] skip ${name}: ${e.message}`);
  }
}
console.log(`[images] ${ok}/${Object.keys(images).length} ready`);
