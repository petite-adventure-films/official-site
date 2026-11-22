import { execFileSync } from 'node:child_process';
import { renameSync, statSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const out = fileURLToPath(new URL('.wrangler/deploy/staging-site/', root));
const video = fileURLToPath(new URL('.wrangler/deploy/staging-site/assets/video/home.mp4', root));
const temporary = video + '.staging.mp4';
const limit = 25 * 1024 * 1024;

execFileSync(process.execPath, ['node_modules/astro/bin/astro.mjs', 'build', '--outDir', out], {
  cwd: root,
  stdio: 'inherit',
});
if (statSync(video).size > limit) {
  try {
    execFileSync('ffmpeg', [
      '-hide_banner', '-loglevel', 'error', '-y', '-i', video,
      '-c:v', 'libx264', '-preset', 'fast', '-b:v', '2200k', '-maxrate', '2350k', '-bufsize', '4700k',
      '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', temporary,
    ], { stdio: 'inherit' });
    if (statSync(temporary).size > limit) throw new Error('Staging home video exceeds the Workers asset limit');
    renameSync(temporary, video);
  } finally {
    rmSync(temporary, { force: true });
  }
}
console.log(`Staging home video: ${statSync(video).size} bytes`);
