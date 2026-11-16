// Figma BodyEditor proposal: https://www.figma.com/design/hk5yiH5HW5Es7RMSzzJIIa?node-id=153-166
// Isolated operation probe. Production schema, uploads and persistence are not implemented here.
import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ThemeProvider,createTheme,StyledEngineProvider,CssBaseline,GlobalStyles,Button,Alert,Typography,TextField,MenuItem} from '@mui/material';
import {EditorContent,useEditor} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import {TextStyleKit} from '@tiptap/extension-text-style';
import TextAlign from '@tiptap/extension-text-align';
import {ExternalVideo} from './video';
import {LegacyLanguage} from './legacy';
import {checkedImport,checkedSave} from './guard';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '../../../../cms/src/styles/tokens.css';
import './style.css';
const SafeImage=Image.extend({addNodeView(){return ({node})=>{const dom=document.createElement('span');dom.className='media-placeholder';dom.contentEditable='false';dom.textContent=`画像: ${node.attrs.alt||'代替テキストなし'} — ${node.attrs.src}`;return {dom};};}}).configure({inline:true});
const extensions=[LegacyLanguage,StarterKit.configure({link:{openOnClick:false}}),SafeImage,TextStyleKit,TextAlign.configure({types:['heading','paragraph']}),ExternalVideo];
const theme=createTheme({palette:{primary:{main:'#1976d2'}},typography:{fontFamily:'Roboto, sans-serif'},components:{MuiButton:{styleOverrides:{root:{textTransform:'none'}}}}});
const fixtures=await (await fetch('/fixtures.json')).json();
const key=id=>`paf-body-prototype:${id}`;
function Body({post}){
 const [status,setStatus]=useState('読込中');const [warning,setWarning]=useState('');const [blocked,setBlocked]=useState('');const [more,setMore]=useState(false);
 const editor=useEditor({extensions,content:'',editorProps:{attributes:{'aria-label':'本文',role:'textbox','aria-multiline':'true'},handlePaste(view,event){
  const html=event.clipboardData?.getData('text/html');if(!html)return false;
  try{checkedImport(html,extensions);return false;}catch(e){setWarning(`貼り付けを中止しました: ${e.message}。プレーンテキストで貼り付け直せます`);return true;}
 }},onCreate({editor}){
  try{const original=checkedImport(post.content,extensions);const stored=localStorage.getItem(key(post.id));
   let body=original;if(stored){const record=JSON.parse(stored);if(record.source!==post.content||record.version!==1)throw Error('保存データの原文・形式が一致しません');body=checkedSave(record.body,extensions);}
   editor.commands.setContent(body,{emitUpdate:false});setStatus(stored?'保存済み':'未保存');
  }catch(e){editor.setEditable(false);setBlocked(e.message);setStatus('変換確認待ち');}
 },onUpdate(){setStatus('未保存');}});
 const save=()=>{try{const body=checkedSave(editor.getJSON(),extensions);localStorage.setItem(key(post.id),JSON.stringify({version:1,source:post.content,body}));setStatus('保存済み');setWarning('');}catch(e){setStatus('未保存');setWarning(`保存できませんでした: ${e.message}。入力内容は残っています`);}};
 const action=(label,run,active=false)=> <Button key={label} size="small" disabled={!editor||!!blocked} aria-pressed={active} onClick={()=>run(editor.chain().focus()).run()}>{label}</Button>;
 return <section className="flex flex-col gap-cms-content">
  <div className="flex justify-end items-center gap-cms-actions"><Typography role="status">{status}</Typography><Button variant="contained" disabled={!editor||!!blocked||status==='読込中'} onClick={save}>試作を保存</Button><Button variant="outlined" onClick={()=>{if(status!=='未保存'||confirm('未保存の変更を破棄して再読込しますか？'))location.reload();}}>再読込</Button></div>
  <Typography component="h1" variant="body1" fontWeight={500}>{post.title}</Typography>
  {warning&&<Alert severity="warning">{warning}</Alert>}
  {blocked?<><Alert severity="warning">変換確認待ち: {blocked}。本文の編集・保存を止めています。</Alert><Typography>原文（変更していません）</Typography><pre className="whitespace-pre-wrap break-all">{post.content}</pre></>:<div className="border border-cms-divider rounded">
   <div className="flex flex-wrap gap-cms-actions p-cms-heading border-b border-cms-divider" role="toolbar" aria-label="本文の書式">
    {action('段落',c=>c.setParagraph())}{action('見出し',c=>c.toggleHeading({level:2}))}{action('太字',c=>c.toggleBold(),editor?.isActive('bold'))}{action('箇条書き',c=>c.toggleBulletList())}{action('番号付き',c=>c.toggleOrderedList())}{action('引用',c=>c.toggleBlockquote())}
    <Button size="small" disabled>リンク（選択中の編集は未実装）</Button>
   </div>
   <div className="flex flex-wrap gap-cms-actions p-cms-heading border-b border-cms-divider" role="toolbar" aria-label="本文の操作">
    {['画像','PDF','動画'].map(x=><Button key={x} size="small" disabled>{x}を追加（未実装）</Button>)}<Button size="small" onClick={()=>setMore(!more)} aria-expanded={more}>その他</Button>{action('元に戻す',c=>c.undo())}{action('やり直す',c=>c.redo())}
   </div>
   {more&&<div className="flex flex-wrap gap-cms-actions p-cms-heading">{action('斜体',c=>c.toggleItalic())}{action('下線',c=>c.toggleUnderline())}{action('取消線',c=>c.toggleStrike())}{action('区切り線',c=>c.setHorizontalRule())}{action('書式を解除',c=>c.unsetAllMarks().clearNodes())}</div>}
   <EditorContent editor={editor}/>
  </div>}
 </section>;
}
function App(){const [id,setId]=useState(new URLSearchParams(location.search).get('article')??'sample');const post=fixtures.find(p=>String(p.id)===id)??fixtures[0];return <main className="px-cms-page-x pt-cms-page-top pb-cms-page-bottom flex flex-col gap-cms-section">
 <Alert severity="info">ブログ本文の操作試作 — このブラウザにだけ保存します。公開・アップロードは行いません。画像と動画は参照先を表示しています。</Alert>
 <TextField select label="確認する記事" value={String(post.id)} onChange={e=>{if(confirm('記事を切り替えます。未保存の変更は破棄されます。続けますか？')){history.replaceState(null,'',`?article=${e.target.value}`);setId(e.target.value);}}}>{fixtures.map(p=><MenuItem key={p.id} value={String(p.id)}>{p.id} · {p.title}</MenuItem>)}</TextField>
 <Body key={post.id} post={post}/>
 </main>}
createRoot(document.getElementById('root')).render(<StyledEngineProvider enableCssLayer><GlobalStyles styles="@layer theme, base, mui, components, utilities;"/><ThemeProvider theme={theme}><CssBaseline/><App/></ThemeProvider></StyledEngineProvider>);
