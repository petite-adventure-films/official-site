// Read-only diagnosis of rejected source articles using the browser's HTML parser.
import {generateHTML,generateJSON} from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import {TextStyleKit} from '@tiptap/extension-text-style';
import TextAlign from '@tiptap/extension-text-align';
import {ExternalVideo} from './video';
import {LegacyLanguage,normalizeStyles} from './legacy';
import {signature} from './guard';
const extensions=[StarterKit.configure({link:{openOnClick:false}}),Image.configure({inline:true}),TextStyleKit,TextAlign.configure({types:['heading','paragraph']}),ExternalVideo];
export async function diagnose(){
 const posts=await(await fetch('/fixtures.json')).json();
 return posts.filter(p=>[17696,4318].includes(p.id)).map(post=>{
  const first=generateJSON(post.content,extensions),second=generateJSON(generateHTML(first,extensions),extensions);const differences=[];
  function walk(a,b,path=''){
   if(JSON.stringify(a)===JSON.stringify(b))return;
   if(a&&b&&typeof a==='object'&&typeof b==='object')for(const k of new Set([...Object.keys(a),...Object.keys(b)]))walk(a[k],b[k],`${path}/${k}`);
   else differences.push({path,before:a??null,after:b??null});
  }
  walk(first,second);
  const source=new DOMParser().parseFromString(post.content,'text/html');
  const fixed=generateHTML(normalizeStyles(generateJSON(post.content,[LegacyLanguage,...extensions])),[LegacyLanguage,...extensions]);
  const a=JSON.parse(signature(post.content)),b=JSON.parse(signature(fixed));
  const index=a.tokens.findIndex((x,i)=>JSON.stringify(x)!==JSON.stringify(b.tokens[i]));
  return {id:post.id,signatureDifference:{index,before:a.tokens.slice(Math.max(0,index-1),index+4),after:b.tokens.slice(Math.max(0,index-1),index+4)},differences,languageAttributes:[...source.querySelectorAll('[lang]')].map(e=>({tag:e.localName,lang:e.lang})),styles:[...new Set([...source.querySelectorAll('[style]')].map(e=>e.getAttribute('style')))]};
 });
}
