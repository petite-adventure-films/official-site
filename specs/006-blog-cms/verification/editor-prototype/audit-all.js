import {legacyContainers} from './legacy-containers';
import {generateHTML,generateJSON} from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import {TextStyleKit} from '@tiptap/extension-text-style';
import TextAlign from '@tiptap/extension-text-align';
import {ExternalVideo} from './video';
import {LegacyLanguage,WordBreak,normalizeStyles} from './legacy';
import {checkedImport,checkedSave,signature} from './guard';
export const extensions=[...legacyContainers,WordBreak,LegacyLanguage,StarterKit.configure({link:{openOnClick:false}}),Image.configure({inline:true}),TextStyleKit,TextAlign.configure({types:['heading','paragraph']}),ExternalVideo];
const bytes=value=>new TextEncoder().encode(typeof value==='string'?value:JSON.stringify(value)).length;
const parse=html=>new DOMParser().parseFromString(html,'text/html').body;
function inventory(body){return {wordBreaks:body.querySelectorAll('wbr').length,images:body.querySelectorAll('img').length,links:body.querySelectorAll('a[href]').length,pdfs:[...body.querySelectorAll('a[href]')].filter(a=>/\.pdf(?:[?#]|$)/i.test(a.getAttribute('href'))).length,videos:body.querySelectorAll('iframe').length,languages:body.querySelectorAll('[lang]').length,styles:body.querySelectorAll('[style]').length};}
function legacyFeatures(body){
 const features=new Set();
 for(const el of body.querySelectorAll('*')){
  if(el.id&&[...body.querySelectorAll('[id]')].filter(other=>other.id===el.id).length>1)features.add(`duplicate-id:${el.id}`);
  if(['div','wbr'].includes(el.localName))features.add(`element:${el.localName}`);
  for(const a of el.attributes){
   if(['id','name','lang'].includes(a.name))features.add(`${el.localName}.${a.name}=${a.value}`);
   if(a.name.startsWith('data-'))features.add(`${el.localName}.${a.name}`);
   if(a.name==='class')for(const c of a.value.split(/\s+/))if(c&&!/^(?:alignnone|wp-image-[0-9]+|size-(?:full|large|medium|thumbnail))$/.test(c))features.add(`class:${c}`);
  }
 }
 return [...features];
}
function differences(source,rendered){
 try{
  const a=JSON.parse(signature(source)),b=JSON.parse(signature(rendered));
  return Object.keys(a).filter(k=>JSON.stringify(a[k])!==JSON.stringify(b[k])).map(key=>{
   if(!Array.isArray(a[key]))return {field:key};
   const index=a[key].findIndex((v,i)=>JSON.stringify(v)!==JSON.stringify(b[key][i]));
   return {field:key,sourceCount:a[key].length,renderedCount:b[key].length,firstIndex:index,source:a[key][index]??null,rendered:b[key][index]??null};
  });
 }catch{return [];}
}
export function audit(posts){return posts.map(post=>{
 const original=parse(post.content);const result={id:post.id,title:post.title,slug:post.name,sourceHTMLBytes:bytes(post.content),source:inventory(original),legacyFeatures:legacyFeatures(original)};
 let candidate;
 try{candidate=normalizeStyles(generateJSON(post.content,extensions));result.candidateBodyBytes=bytes(candidate);}catch(e){result.candidateError=e.message;}
 try{
  const first=checkedImport(post.content,extensions);const second=checkedSave(first,extensions);const third=checkedSave(second,extensions);
  if(JSON.stringify(first)!==JSON.stringify(third))throw Error('2回の往復でJSONが変化');
  const rendered=generateHTML(third,extensions);
  if(signature(post.content)!==signature(rendered))throw Error('2回の往復後に原文と不一致');
  const storageKey='paf-body-audit:temporary';
  try{localStorage.setItem(storageKey,JSON.stringify(third));if(JSON.stringify(JSON.parse(localStorage.getItem(storageKey)))!==JSON.stringify(third))throw Error('ブラウザ保存の再読込不一致');}finally{localStorage.removeItem(storageKey);}
  result.status='passed';result.bodyBytes=bytes(third);result.rendered=inventory(parse(rendered));
  // Size estimate only. Legacy taxonomy values are not resolved CMS IDs; this is not a valid API payload.
  const payload={title:post.title,slug:post.name,body:third,categoryId:post.categories?.[0]??null,filmTagIds:post.film_tags??[],eventTagIds:post.event_tags??[],isRecommended:!!post.recommended,isWorkshopReport:false};
  result.provisionalRequestBytes=bytes({operationId:'00000000-0000-0000-0000-000000000000',expectedVersion:1,type:'blog',payload});
 }catch(e){result.status='blocked';result.reason=e.message;if(candidate)result.differences=differences(post.content,generateHTML(candidate,extensions));}
 return result;
});}
