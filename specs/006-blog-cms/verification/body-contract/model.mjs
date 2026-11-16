// Entry functions require schema-validated input; validation order is part of the contract.
// Executable contract proposal. No application API, migration or asset IDs are created here.
import {createHash} from 'node:crypto';
const compact=o=>Object.fromEntries(Object.entries(o??{}).filter(([,v])=>v!==null&&v!==undefined&&v!==''));
const pick=(o,keys)=>Object.fromEntries(keys.filter(k=>Object.hasOwn(o,k)).map(k=>[k,o[k]]));
const fields={paragraph:['lang','dir','textAlign'],heading:['level','lang','dir','textAlign'],textStyle:['color','backgroundColor','fontFamily','fontSize'],link:['href','title','target'],image:['alt','title','width','height'],externalVideo:['provider','videoId','sourceUrl','title','width','height'],legacyBlock:['lang','dir'],legacyInline:['lang','dir'],orderedList:['start'],tableCell:['colspan','rowspan'],tableHeader:['colspan','rowspan']};
const known={paragraph:['lang','dir','textAlign'],heading:['level','lang','dir','textAlign'],textStyle:['color','backgroundColor','fontFamily','fontSize'],link:['href','title','target','rel','class','data-saferedirecturl','data-lynx-mode','data-lynx-uri'],image:['src','alt','title','width','height','class'],externalVideo:fields.externalVideo,legacyBlock:['id','class','lang','dir','tabindex','aria-live','data-ft','data-tooltip'],legacyInline:['id','class','lang','dir','tabindex','aria-live','data-ft','data-tooltip'],orderedList:['start'],tableCell:['colspan','rowspan'],tableHeader:['colspan','rowspan']};
const basic=new Set(['doc','text','bold','italic','underline','strike','code','hardBreak','wordBreak','horizontalRule','blockquote','bulletList','listItem','codeBlock','table','tableRow']);
export function convert(doc,articleId,sourceHash){
 const archive={};
 function visit(n,path){
  if(!basic.has(n.type)&&!known[n.type])throw Error(`unknown node ${n.type}`);
  const original=compact(n.attrs),allowed=known[n.type]??[];
  for(const key of Object.keys(original))if(!allowed.includes(key))throw Error(`unknown attribute ${n.type}.${key}`);
  const a=pick(original,fields[n.type]??[]);let type=n.type;
  if(n.type==='image'){type='unresolvedImage';a.alt=n.attrs.alt??'';}
  if(n.type==='link'&&/\.pdf(?:[?#]|$)/i.test(original.href)){type='unresolvedAssetLink';delete a.href;}
  if(['legacyBlock','legacyInline'].includes(n.type)){type=n.type==='legacyBlock'?'preservedBlock':'preservedInline';if(original.id)a.anchorId=original.id;}
  const preserve=type.startsWith('unresolved')||type.startsWith('preserved')||Object.keys(original).some(k=>!Object.hasOwn(a,k));
  if(preserve){const ref='legacy_'+createHash('sha256').update(`${articleId}:${sourceHash}:${path}`).digest('hex').slice(0,32);a.sourceRef=ref;archive[ref]={articleId,sourceHash,path,originalType:n.type,originalAttrs:n.attrs??{}};}
  return {type,...(n.text!==undefined?{text:n.text}:{}),...(Object.keys(a).length?{attrs:a}:{}),...(n.marks?{marks:n.marks.map((m,i)=>visit(m,`${path}/marks/${i}`))}:{}),...(n.content?{content:n.content.map((c,i)=>visit(c,`${path}/content/${i}`))}:{})};
 }
 return {body:{schemaVersion:2,doc:visit(doc,'doc')},archive};
}
export function validateReferences(body,archive,articleId){
 function visit(n){
  if(n.attrs?.sourceRef){const r=archive[n.attrs.sourceRef];if(!r||r.articleId!==articleId)throw Error('invalid_source_reference');const types={image:['unresolvedImage','assetImage'],link:['link','unresolvedAssetLink','assetLink'],legacyBlock:['preservedBlock'],legacyInline:['preservedInline']};if(!(types[r.originalType]??[r.originalType]).includes(n.type))throw Error('source_type_mismatch');}
  if(n.attrs?.anchorId&&/\s|[\u0000-\u001f\u007f]/.test(n.attrs.anchorId))throw Error('invalid_anchor');
  if(n.marks&&new Set(n.marks.map(m=>m.type)).size!==n.marks.length)throw Error('duplicate_mark');
  if(n.type==='link'){
   const href=n.attrs.href;
   const mail=/^mailto:[A-Za-z0-9.!$&'*+/=^_`{|}~-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(href);
   if(!mail){const u=new URL(href);if(!['https:','http:'].includes(u.protocol)||u.username||u.password)throw Error('invalid_link');}
  }
  if(n.type==='textStyle')for(const k of ['color','backgroundColor'])if(n.attrs?.[k]&&n.attrs[k].match(/\d+/g).some(v=>Number(v)>255))throw Error('invalid_color');
  if(n.type==='externalVideo'){
   const {provider,videoId,sourceUrl}=n.attrs;const u=new URL(sourceUrl);
   if(u.protocol!=='https:'||u.username||u.password||u.port||u.hash)throw Error('invalid_video');
   if(provider==='youtube'?(u.hostname!=='www.youtube.com'||u.pathname!==`/embed/${videoId}`||!/^[-\w]{11}$/.test(videoId)):(u.hostname!=='player.vimeo.com'||u.pathname!==`/video/${videoId}`||!/^\d+$/.test(videoId)))throw Error('invalid_video');
   const seen=new Set();for(const [key,value]of u.searchParams){if(seen.has(key))throw Error('duplicate_video_parameter');seen.add(key);if(provider==='youtube'&&((key==='start'&&/^\d{1,7}$/.test(value))||(key==='si'&&/^[-\w]{1,128}$/.test(value))))continue;if(provider==='vimeo'&&key==='h'&&/^[a-f\d]{1,64}$/i.test(value))continue;throw Error('invalid_video_parameter');}
  }
  for(const c of [...(n.content??[]),...(n.marks??[])])visit(c);
 }visit(body.doc);
}
export function restore(body,archive,articleId){
 validateReferences(body,archive,articleId);
 function visit(n){if(['assetImage','assetLink'].includes(n.type))throw Error('resolved_asset_requires_resolver');const r=n.attrs?.sourceRef?archive[n.attrs.sourceRef]:null;const a=r?{...r.originalAttrs}:{...n.attrs};if(r){for(const key of fields[r.originalType]??[])if(!(n.type==='unresolvedAssetLink'&&key==='href'))delete a[key];if(['legacyBlock','legacyInline'].includes(r.originalType))delete a.id;}Object.assign(a,n.attrs??{});if(n.attrs?.anchorId)a.id=n.attrs.anchorId;delete a.sourceRef;delete a.anchorId;return {...n,type:r?.originalType??n.type,...(Object.keys(a).length?{attrs:a}:{}),...(n.marks?{marks:n.marks.map(visit)}:{}),...(n.content?{content:n.content.map(visit)}:{})};}
 return visit(body.doc);
}
export function publicationIssues(body,archive,articleId,authorizedAssets=new Map()){
 validateReferences(body,archive,articleId);const issues=[];const anchors=new Set();
 function visit(n){
  if(['assetImage','assetLink'].includes(n.type)&&!(authorizedAssets.get(n.attrs.assetId)?.permitted===true&&authorizedAssets.get(n.attrs.assetId)?.kind===(n.type==='assetImage'?'image':'document')))issues.push({code:'unverified_asset',assetId:n.attrs.assetId});
  if(n.type.startsWith('unresolved'))issues.push({code:'unresolved_asset',sourceRef:n.attrs.sourceRef});
  if(n.attrs?.anchorId){if(anchors.has(n.attrs.anchorId))issues.push({code:'duplicate_anchor',anchorId:n.attrs.anchorId});anchors.add(n.attrs.anchorId);}
  for(const c of [...(n.content??[]),...(n.marks??[])])visit(c);
 }visit(body.doc);return issues;
}
export function publicProjection(body,archive,articleId,authorizedAssets=new Map()){
 const issues=publicationIssues(body,archive,articleId,authorizedAssets);if(issues.length)throw Error('publication_blocked');
 const allowed={...fields,assetImage:['assetId','alt','title','caption','width','height'],assetLink:['assetId','title','target'],preservedBlock:['anchorId','lang','dir'],preservedInline:['anchorId','lang','dir']};
 function visit(n){if(!basic.has(n.type)&&!allowed[n.type])throw Error('unknown_public_node');const attrs=pick(n.attrs??{},allowed[n.type]??[]);return {type:n.type,...(n.text!==undefined?{text:n.text}:{}),...(Object.keys(attrs).length?{attrs}:{}),...(n.content?{content:n.content.map(visit)}:{}),...(n.marks?{marks:n.marks.map(visit)}:{})};}
 return {schemaVersion:2,doc:visit(body.doc)};
}
export function normalized(value){if(Array.isArray(value))return value.map(normalized);if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).filter(([k,v])=>v!==null&&v!==''&&v!==undefined&&!(k==='attrs'&&Object.keys(compact(v)).length===0)).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>[k,normalized(v)]));return value;}
