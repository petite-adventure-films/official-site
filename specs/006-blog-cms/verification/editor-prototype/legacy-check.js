import {generateHTML} from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import {TextStyleKit} from '@tiptap/extension-text-style';
import TextAlign from '@tiptap/extension-text-align';
import {ExternalVideo} from './video';
import {LegacyLanguage,normalizeStyles} from './legacy';
import {checkedImport,checkedSave,signature} from './guard';
export async function checkLegacy(){
 const base=[StarterKit,Image.configure({inline:true}),TextStyleKit,TextAlign.configure({types:['heading','paragraph']}),ExternalVideo];
 const extensions=[LegacyLanguage,...base];const results=[];
 const assert=(condition,message)=>{if(!condition)throw Error(message);};
 const rejects=(fn,message)=>{let rejected=false;try{fn();}catch{rejected=true;}assert(rejected,message);};
 const sample=value=>({type:'textStyle',attrs:value});
 assert(JSON.stringify(normalizeStyles(sample({color:'#0000ff'})))===JSON.stringify(normalizeStyles(sample({color:'rgb(0, 0, 255)'}))),'equivalent color');
 assert(JSON.stringify(normalizeStyles(sample({fontFamily:'Times New Roman,serif'})))===JSON.stringify(normalizeStyles(sample({fontFamily:'"Times New Roman", serif'}))),'equivalent font');
 assert(JSON.stringify(normalizeStyles(sample({color:'red'})))!==JSON.stringify(normalizeStyles(sample({color:'blue'}))),'distinct colors');
 assert(JSON.stringify(normalizeStyles(sample({fontFamily:'serif'})))!==JSON.stringify(normalizeStyles(sample({fontFamily:'sans-serif'}))),'distinct fonts');
 rejects(()=>normalizeStyles(sample({color:'invalid-color'})),'invalid CSS must fail');
 results.push('同じ色・書体表記のみ正規化し、異なる色・書体と不正CSSを区別');
 rejects(()=>checkedImport('<p lang="ja-JP">日本語</p>',base),'missing lang extension');
 rejects(()=>checkedImport('<p lang="bad value">本文</p>',extensions),'unsupported lang');
 rejects(()=>checkedImport('<span lang="ja-JP">本文</span>',extensions),'unsupported lang scope');
 const a='<p><a href="https://example.com/a">甲</a><a href="https://example.com/b">乙</a></p>';
 const b='<p><a href="https://example.com/a">乙</a><a href="https://example.com/b">甲</a></p>';
 assert(signature(a)!==signature(b),'link binding must differ');
 assert(signature('<p><span style="color:red">甲</span>乙</p>')!==signature('<p><span style="color:blue">甲</span>乙</p>'),'style change must differ');
 assert(signature('<p><span style="color:red">甲</span>乙</p>')!==signature('<p>甲<span style="color:red">乙</span></p>'),'style scope must differ');
 results.push('lang欠落・未対応langとリンクの対象変更・色変更を検知');
 const posts=await(await fetch('/fixtures.json')).json();
 for(const id of [17696,4318]){
  const post=posts.find(p=>p.id===id);const json=checkedImport(post.content,extensions);
  const first=checkedSave(json,extensions),second=checkedSave(first,extensions);
  assert(JSON.stringify(first)===JSON.stringify(second),`stable article ${id}`);
  assert(signature(post.content)===signature(generateHTML(second,extensions)),`source equivalence ${id}`);
  if(id===4318){const html=new DOMParser().parseFromString(generateHTML(second,extensions),'text/html');assert(html.querySelectorAll('p[lang="ja-JP"]').length===31,'31 language attrs');}
 }
 results.push('旧記事2件の原文照合と2回の往復安定、4318のlang31箇所を保持');
 return results;
}
