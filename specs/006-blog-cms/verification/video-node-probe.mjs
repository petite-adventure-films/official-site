// Isolated design probe, not an application renderer or migration.
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const require = createRequire(resolve(process.env.TIPTAP_AUDIT_DEPS, 'package.json'));
const { Node } = require('@tiptap/core');
const { StarterKit } = require('@tiptap/starter-kit');
const { generateJSON, generateHTML } = require('@tiptap/html/server');
const { JSDOM } = require('jsdom');
const dom = new JSDOM('');
const parser = new dom.window.DOMParser();
const body = html => parser.parseFromString(html, 'text/html').body;

function video(source) {
  if (typeof source !== 'string' || source !== source.trim()) throw new Error('invalid_url');
  const u = new URL(source);
  if (u.protocol !== 'https:' || u.username || u.password || u.port || u.hash) throw new Error('invalid_url');
  const youtube = u.hostname === 'www.youtube.com' && /^\/embed\/[A-Za-z0-9_-]{11}$/.test(u.pathname);
  const vimeo = u.hostname === 'player.vimeo.com' && /^\/video\/[0-9]+$/.test(u.pathname);
  if (!youtube && !vimeo) throw new Error('unsupported_video');
  const seen = new Set();
  for (const [key, value] of u.searchParams) {
    if (seen.has(key)) throw new Error('duplicate_parameter');
    seen.add(key);
    if (youtube && key === 'start' && /^[0-9]{1,7}$/.test(value)) continue;
    if (youtube && key === 'si' && /^[A-Za-z0-9_-]{1,128}$/.test(value)) continue;
    if (vimeo && key === 'h' && /^[a-fA-F0-9]{1,64}$/.test(value)) continue;
    throw new Error('unsupported_parameter');
  }
  return { provider: youtube ? 'youtube' : 'vimeo', videoId: u.pathname.split('/').at(-1), sourceUrl: u.href };
}
function size(value) {
  if (value === null) return null;
  if (!/^[1-9][0-9]{0,4}$/.test(value)) throw new Error('unsupported_dimension');
  return Number(value);
}
function fromElement(element) {
  return { ...video(element.getAttribute('src')), title: element.getAttribute('title'),
    width: size(element.getAttribute('width')), height: size(element.getAttribute('height')) };
}
const ExternalVideo = Node.create({
  name: 'externalVideo', group: 'block', atom: true,
  addAttributes() {
    return Object.fromEntries(['provider','videoId','sourceUrl','title','width','height'].map(key=>[key,{default:null}]));
  },
  parseHTML() { return [{ tag: 'iframe[src]', getAttrs: element => { try { return fromElement(element); } catch { return false; } } }]; },
  renderHTML({ node }) {
    const checked = video(node.attrs.sourceUrl);
    assert.equal(checked.provider, node.attrs.provider);
    assert.equal(checked.videoId, node.attrs.videoId);
    for (const key of ['width','height']) if (node.attrs[key] !== null) size(String(node.attrs[key]));
    return ['iframe', { src: checked.sourceUrl,
      ...(node.attrs.title === null ? {} : {title:node.attrs.title}),
      ...(node.attrs.width === null ? {} : {width:node.attrs.width}),
      ...(node.attrs.height === null ? {} : {height:node.attrs.height}), allowfullscreen: 'true' }];
  },
});
const extensions = [StarterKit, ExternalVideo];
const posts = JSON.parse(readFileSync('astro/data/wordpress-export.json')).content.blogs;
const videos = [];
for (const post of posts) {
  const original = [...body(post.content).querySelectorAll('iframe')];
  // Mandatory preflight: the parser's unsupported-node dropping must not be mistaken for success.
  const expected = original.map(fromElement);
  if (!expected.length) continue;
  const doc = generateJSON(post.content, extensions);
  const actual = [];
  const visit = node => { if (node.type === 'externalVideo') actual.push({ ...node.attrs }); for (const c of node.content ?? []) visit(c); };
  visit(doc);
  assert.deepEqual(actual, expected, `article ${post.id}: imported video attributes`);
  const output = generateHTML(doc, extensions);
  assert.deepEqual([...body(output).querySelectorAll('iframe')].map(fromElement), expected, `article ${post.id}: rendered video attributes`);
  const reloaded = generateJSON(output, extensions);
  const expectedVideoJSON = actual.map(v=>JSON.stringify(v));
  const found = [];
  const inspect = node => { if(node.type==='externalVideo')found.push(JSON.stringify(node.attrs));for(const c of node.content??[])inspect(c); };
  inspect(reloaded);
  assert.deepEqual(found,expectedVideoJSON,`article ${post.id}: reopened video attributes`);
  videos.push({articleId:post.id,count:expected.length,providers:expected.map(v=>v.provider)});
}
const invalid = [
 'https://www.youtube.com.evil.example/embed/abcdefghijk',
 'https://www.youtube.com@evil.example/embed/abcdefghijk',
 'https://user:pass@www.youtube.com/embed/abcdefghijk',
 'javascript:alert(1)', 'http://www.youtube.com/embed/abcdefghijk',
 'https://www.youtube.com:444/embed/abcdefghijk',
 'https://www.youtube.com/embed/short',
 'https://player.vimeo.com/video/not-a-number',
 'https://player.vimeo.com/video/50026595?h=bad%22value',
 'https://www.youtube.com/embed/abcdefghijk?start=1&start=2',
 'https://www.youtube.com/embed/abcdefghijk?unknown=1',
 'https://www.youtube.com/embed/abcdefghijk#unexpected',
];
for (const source of invalid) assert.throws(()=>video(source),source);
const youtube = videos.flatMap(v=>v.providers).filter(p=>p==='youtube').length;
const vimeo = videos.flatMap(v=>v.providers).filter(p=>p==='vimeo').length;
assert.equal(youtube,149);assert.equal(vimeo,2);
const report = { youtube, vimeo, articles: videos.length, invalidURLsRejected: invalid.length,
  preserved: ['provider','videoId','sourceUrl including si/start/h','title','width','height'],
  scope: 'Video nodes only; other content is deliberately not assessed by this probe.', videos };
writeFileSync(process.env.TIPTAP_VIDEO_OUTPUT ?? '/tmp/paf-tiptap-video-result.json', JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({youtube,vimeo,articles:videos.length,invalidURLsRejected:invalid.length}));
dom.window.close();
