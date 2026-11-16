import {observedClasses,retainedClass} from './legacy-containers';
import { generateHTML, generateJSON } from '@tiptap/core';
import { fromElement } from './video';
import {normalizeStyles} from './legacy';
const parse=html=>new DOMParser().parseFromString(html,'text/html');
const allowed=new Set('div p br wbr strong b em i u s strike a img iframe span blockquote hr h1 h2 h3 h4 h5 h6 ul ol li'.split(' '));
const containers=['id','lang','dir','tabindex','aria-live','data-ft','data-tooltip'];
const attributes={div:containers,span:containers,p:['lang'],a:['href','target','rel','title','data-saferedirecturl','data-lynx-mode','data-lynx-uri'],img:['src','alt','title','width','height'],iframe:['src','title','width','height','allow','allowfullscreen','frameborder','loading','referrerpolicy'],ol:['start']};
export function preflight(html){
 const document=parse(html);const body=document.body;
 for(const el of document.querySelectorAll('*')){
  const tag=el.localName;if(['html','head','body'].includes(tag))continue;if(!allowed.has(tag))throw Error(`未対応の要素: ${tag}`);
  for(const a of el.attributes){
   if(a.name==='lang' && !((tag==='p'&&a.value==='ja-JP')||(tag==='div'&&a.value==='ja')))throw Error('未対応の言語属性');
   if(a.name==='id'&&(!a.value||/\s/.test(a.value)))throw Error('不正な旧アンカー');
   if(a.name==='dir'&&a.value!=='auto')throw Error('未対応の文字方向');
   if(a.name==='tabindex'&&a.value!=='0')throw Error('未対応の旧フォーカス属性');
   if(a.name==='aria-live'&&a.value!=='polite')throw Error('未対応の旧通知属性');
   if(a.name==='class'){
    if(!a.value.split(/\s+/).filter(Boolean).every(c=>/^(?:alignnone|wp-image-[0-9]+|size-(?:full|large|medium|thumbnail))$/.test(c)||observedClasses.has(c)))throw Error('未対応のクラス');
    continue;
   }
   if(a.name==='style' && ['p','span','strong'].includes(tag)){
    for(const property of el.style){if(!['color','background-color','font-size','font-family','text-align'].includes(property))throw Error(`未対応の装飾: ${property}`);}
    continue;
   }
   if(!(attributes[tag]??[]).includes(a.name))throw Error(`未対応の属性: ${tag}.${a.name}`);
  }
  if(el.hasAttribute('class') && /(?:alignleft|alignright|aligncenter)/.test(el.className))throw Error('画像の配置は変換確認が必要です');
  for(const attr of ['src','href'])if(el.hasAttribute(attr)){
   const value=el.getAttribute(attr);
   if(tag==='a'&&attr==='href'&&/^mailto:[A-Za-z0-9.!$&'*+/=^_`{|}~-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value))continue;
   const u=new URL(value);if(!['https:','http:'].includes(u.protocol)||u.username||u.password)throw Error('未対応のURL');
  }
  if(tag==='iframe')fromElement(el);
 }
 return body;
}
// Compare inline meaning at its target, not the order of equivalent wrappers.
// Whitespace and plain paragraph boundaries retain the existing probe's limited scope.
export function signature(html){
 const body=preflight(html);const tokens=[];
 const marks={strong:'bold',b:'bold',em:'italic',i:'italic',u:'underline',s:'strike',strike:'strike'};
 const attrs=el=>Object.fromEntries([...el.attributes].filter(a=>!['rel','target','allow','allowfullscreen','frameborder','loading','referrerpolicy','style','lang'].includes(a.name)).filter(a=>a.value!=='').map(a=>[a.name,a.name==='class'?retainedClass(a.value):a.value]).filter(([,v])=>v!=='').sort());
 const canonical=value=>Object.fromEntries(Object.entries(value).sort(([a],[b])=>a.localeCompare(b)));
 function emit(token){
  const last=tokens.at(-1);
  if(token.kind==='text'&&last?.kind==='text'&&JSON.stringify(last.format)===JSON.stringify(token.format))last.text+=token.text;
  else tokens.push(token);
 }
 function walk(node,inherited={}){
  if(node.nodeType===3){const text=node.textContent.replace(/\s/g,'');if(text)emit({kind:'text',text,format:canonical(inherited)});return;}
  if(node.nodeType!==1)return;
  const tag=node.localName;const format={...inherited};
  if(marks[tag])format[marks[tag]]=true;
  for(const key of node.style)format[key]=node.style.getPropertyValue(key);
  if(node.hasAttribute('lang'))format.lang=node.getAttribute('lang');
  if(node.hasAttribute('dir'))format.dir=node.getAttribute('dir');
  if(tag==='a')format.link=attrs(node);
  // Breaks have no glyph to color/bolden; their count/order is still significant.
  if(tag==='br'||tag==='wbr'){emit({kind:tag});return;}
  if(['img','iframe','hr'].includes(tag)){emit({kind:tag,attrs:attrs(node),format:canonical(format)});return;}
  const block=!['p','span','a',...Object.keys(marks)].includes(tag)||(tag==='span'&&Object.keys(attrs(node)).length>0);
  if(block)emit({kind:'open',tag,attrs:attrs(node),format:canonical(format)});
  if(tag==='p'&&node.hasAttribute('lang'))emit({kind:'language',value:node.lang});
  for(const child of node.childNodes)walk(child,format);
  if(tag==='a'&&!node.textContent.trim()&&!node.querySelector('img,br'))emit({kind:'empty-link',attrs:attrs(node)});
  if(block)emit({kind:'close',tag});
 }
 for(const node of body.childNodes)walk(node);
 return JSON.stringify({tokens});
}
export function prepareInlineStyles(html){
 const body=preflight(html);
 // The stock textStyle parser reads span styles. Keep bold and style as separate marks.
 for(const strong of body.querySelectorAll('strong[style]')){
  const span=strong.ownerDocument.createElement('span');span.setAttribute('style',strong.getAttribute('style'));
  strong.removeAttribute('style');span.append(...strong.childNodes);strong.append(span);
 }
 return body.innerHTML;
}
export function checkedImport(html,extensions){
 preflight(html); const json=normalizeStyles(generateJSON(prepareInlineStyles(html),extensions));
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
