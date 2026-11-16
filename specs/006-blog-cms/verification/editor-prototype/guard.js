import { generateHTML, generateJSON } from '@tiptap/core';
import { fromElement } from './video';
import {normalizeStyles} from './legacy';
const parse=html=>new DOMParser().parseFromString(html,'text/html');
const allowed=new Set('p br strong b em i u s strike a img iframe span blockquote hr h1 h2 h3 h4 h5 h6 ul ol li'.split(' '));
const attributes={p:['lang'],a:['href','target','rel','title'],img:['src','alt','title','width','height'],iframe:['src','title','width','height','allow','allowfullscreen','frameborder','loading','referrerpolicy'],ol:['start']};
export function preflight(html){
 const document=parse(html);const body=document.body;
 for(const el of document.querySelectorAll('*')){
  const tag=el.localName;if(['html','head','body'].includes(tag))continue;if(!allowed.has(tag))throw Error(`未対応の要素: ${tag}`);
  for(const a of el.attributes){
   if(a.name==='lang' && (tag!=='p'||a.value!=='ja-JP'))throw Error('未対応の言語属性');
   if(a.name==='class'){
    if(!a.value.split(/\s+/).filter(Boolean).every(c=>/^(?:alignnone|wp-image-[0-9]+|size-(?:full|large|medium|thumbnail))$/.test(c)))throw Error('未対応のクラス');
    continue;
   }
   if(a.name==='style' && ['p','span'].includes(tag)){
    for(const property of el.style){if(!['color','background-color','font-size','font-family','text-align'].includes(property))throw Error(`未対応の装飾: ${property}`);}
    continue;
   }
   if(!(attributes[tag]??[]).includes(a.name))throw Error(`未対応の属性: ${tag}.${a.name}`);
  }
  if(el.hasAttribute('class') && /(?:alignleft|alignright|aligncenter)/.test(el.className))throw Error('画像の配置は変換確認が必要です');
  for(const attr of ['src','href'])if(el.hasAttribute(attr)){
   const u=new URL(el.getAttribute(attr));if(!['https:','http:'].includes(u.protocol)||u.username||u.password)throw Error('未対応のURL');
  }
  if(tag==='iframe')fromElement(el);
 }
 return body;
}
export function signature(html){
 const body=preflight(html);
 // ProseMirror merges adjacent links carrying exactly the same attributes.
 const attrs=e=>JSON.stringify([...e.attributes].map(a=>[a.name,a.value]).sort());
 for(const link of body.querySelectorAll('a')){
  while(link.nextSibling?.nodeName==='A' && attrs(link)===attrs(link.nextSibling)){
   const next=link.nextSibling;link.append(...next.childNodes);next.remove();
  }
 }
 // A sole nested span with disjoint styles has the same scope as a single span.
 for(const span of [...body.querySelectorAll('span')].reverse()){
  const child=span.firstChild;
  if(span.childNodes.length===1 && child?.nodeName==='SPAN' &&
     [...span.attributes,...child.attributes].every(a=>a.name==='style') &&
     [...child.style].every(key=>!span.style.getPropertyValue(key))){
   for(const key of child.style)span.style.setProperty(key,child.style.getPropertyValue(key),child.style.getPropertyPriority(key));
   span.replaceChildren(...child.childNodes);
  }
 }
 const links=[...body.querySelectorAll('a')].map(e=>({href:e.getAttribute('href'),title:e.getAttribute('title'),text:e.textContent.replace(/\s/g,''),images:[...e.querySelectorAll('img')].map(i=>i.getAttribute('src'))}));
 const formatting=[...body.querySelectorAll('[style],[lang]')].map(e=>({style:e.style.cssText,lang:e.getAttribute('lang'),text:e.textContent.replace(/\s/g,''),images:[...e.querySelectorAll('img')].map(i=>i.getAttribute('src'))}));
 return JSON.stringify({formatting,links,text:body.textContent.replace(/\s/g,''),elements:[...body.querySelectorAll('*')].filter(e=>!['p','span'].includes(e.localName)||e.getAttribute('style')||e.hasAttribute('lang')).map(e=>({tag:({b:'strong',i:'em',strike:'s'})[e.localName]??e.localName,attrs:[...e.attributes].filter(a=>!['class','rel','target','allow','allowfullscreen','frameborder','loading','referrerpolicy'].includes(a.name)).filter(a=>a.value!=='').map(a=>[a.name,a.name==='style'?e.style.cssText:a.value]).sort()}))});
}
export function checkedImport(html,extensions){
 preflight(html); const json=normalizeStyles(generateJSON(html,extensions));
 if(signature(html)!==signature(generateHTML(json,extensions)))throw Error('変換前後で要素・装飾が一致しません。原文の確認が必要です');
 return checkedSave(json,extensions);
}
export function checkedSave(json,extensions){
 json=normalizeStyles(json);
 const html=generateHTML(json,extensions);preflight(html);
 const roundtrip=generateJSON(html,extensions);
 if(JSON.stringify(json)!==JSON.stringify(roundtrip))throw Error('再読込で本文が変化するため保存を中止しました');
 return json;
}
