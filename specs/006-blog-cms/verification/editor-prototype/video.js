import { Node } from '@tiptap/core';
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
  addNodeView() { return ({node}) => { const dom=document.createElement('div'); dom.className='media-placeholder'; dom.contentEditable='false'; dom.textContent=`動画（試作では再生しません）: ${node.attrs.sourceUrl}`; return {dom}; }; },
  parseHTML() { return [{ tag: 'iframe[src]', getAttrs: element => { try { return fromElement(element); } catch { return false; } } }]; },
  renderHTML({ node }) {
    const checked = video(node.attrs.sourceUrl);
    if(checked.provider !== node.attrs.provider) throw new Error('invalid_provider');
    if(checked.videoId !== node.attrs.videoId) throw new Error('invalid_id');
    for (const key of ['width','height']) if (node.attrs[key] !== null) size(String(node.attrs[key]));
    return ['iframe', { src: checked.sourceUrl,
      ...(node.attrs.title === null ? {} : {title:node.attrs.title}),
      ...(node.attrs.width === null ? {} : {width:node.attrs.width}),
      ...(node.attrs.height === null ? {} : {height:node.attrs.height}), allowfullscreen: 'true' }];
  },
});

export { ExternalVideo, fromElement };
