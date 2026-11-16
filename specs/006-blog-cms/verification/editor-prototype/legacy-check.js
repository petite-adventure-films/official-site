import {generateHTML} from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import {TextStyleKit} from '@tiptap/extension-text-style';
import TextAlign from '@tiptap/extension-text-align';
import {ExternalVideo} from './video';
import {LegacyLanguage,WordBreak,normalizeStyles} from './legacy';
import {checkedImport,checkedSave,signature} from './guard';
export async function checkLegacy(){
 const base=[StarterKit,Image.configure({inline:true}),TextStyleKit,TextAlign.configure({types:['heading','paragraph']}),ExternalVideo];
 const extensions=[WordBreak,LegacyLanguage,...base];const results=[];
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
 const same=(a,b)=>assert(signature(a)===signature(b),'equivalent inline formats');
 const different=(a,b)=>assert(signature(a)!==signature(b),'different inline formats');
 same('<p><strong><span style="color:blue">甲</span></strong></p>','<p><span style="color:blue"><strong>甲</strong></span></p>');
 same('<p><strong>甲</strong><strong>乙</strong></p>','<p><strong>甲乙</strong></p>');
 same('<p><span style="color:black">甲<span style="color:red">乙</span>丙</span></p>','<p><span style="color:black">甲</span><span style="color:red">乙</span><span style="color:black">丙</span></p>');
 different('<p><strong>甲</strong>乙</p>','<p>甲<strong>乙</strong></p>');
 different('<p><strong>甲</strong></p>','<p>甲</p>');
 different('<p><em>甲</em></p>','<p><u>甲</u></p>');
 different('<p>甲<br>乙</p>','<p>甲乙</p>');
 different('<p><span style="color:black">甲<span style="color:red">乙</span></span></p>','<p><span style="color:black">甲乙</span></p>');
 different('<p><a href="https://example.com/a"><img src="https://example.com/i.jpg"></a></p>','<p><img src="https://example.com/i.jpg"></p>');
 // A disabled bold parser must not pass the source guard merely because plain text matches.
 rejects(()=>checkedImport('<p><strong>強調</strong></p>',[WordBreak,LegacyLanguage,StarterKit.configure({bold:false})]),'lost bold');
 results.push('太字/色の順序・同義分割・入れ子を許容し、太字/斜体/下線の欠落・対象変更、改行欠落、色上書き・画像リンク欠落を検知');
 const breakSource='<p><strong>ABC<wbr>DEF</strong><a href="https://example.com/">G<wbr>H</a></p>';
 const breaks=checkedImport(breakSource,extensions);
 assert(signature(generateHTML(checkedSave(breaks,extensions),extensions))===signature(breakSource),'wordBreak position');
 different('<p>AB<wbr>CD</p>','<p>ABCD</p>');
 different('<p>AB<wbr>CD</p>','<p>AB<br>CD</p>');
 different('<p>AB<wbr>CD</p>','<p>A<wbr>BCD</p>');
 rejects(()=>checkedImport('<p>AB<wbr>CD</p>',[LegacyLanguage,...base]),'lost wordBreak');
 results.push('wbrの位置・個数・前後の書式/リンクを保持し、欠落・強制改行化・位置変更を検知');
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
