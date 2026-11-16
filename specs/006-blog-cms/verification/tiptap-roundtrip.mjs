// Run from repository root. Dependencies are isolated from the application.
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
const dep = process.env.TIPTAP_AUDIT_DEPS;
if (!dep) throw new Error('Set TIPTAP_AUDIT_DEPS to the isolated npm project directory');
const require = createRequire(resolve(dep, 'package.json'));
const { generateJSON, generateHTML } = require('@tiptap/html/server');
const { StarterKit } = require('@tiptap/starter-kit');
const { Image } = require('@tiptap/extension-image');
const { Youtube } = require('@tiptap/extension-youtube');
const { TableKit } = require('@tiptap/extension-table');
const { TextStyleKit } = require('@tiptap/extension-text-style');
const { TextAlign } = require('@tiptap/extension-text-align');
const { JSDOM } = require('jsdom');
const Ajv = require('ajv/dist/2020').default;
const ajv = new Ajv({allErrors: false, strict: false});
ajv.addSchema(JSON.parse(readFileSync('packages/content-schema/schemas/common.schema.json')));
const validate = ajv.compile(JSON.parse(readFileSync('packages/content-schema/schemas/rich-text.schema.json')));
const raw = readFileSync('astro/data/wordpress-export.json');
const posts = JSON.parse(raw).content.blogs;
const dom = new JSDOM('');
const parser = new dom.window.DOMParser();
function parse(html) { return parser.parseFromString(html, 'text/html').body; }
function bag(xs) { const b={};for(const x of xs)b[x]=(b[x]??0)+1;return b; }
function diff(a,b) {return Object.entries(a).filter(([k,v])=>v>(b[k]??0)).map(([value,count])=>({value,count:count-(b[value]??0)}));}
function features(body) {
 const all=[...body.querySelectorAll('*')];
 const attrs={};for(const n of all) for(const a of n.attributes) { const k=n.localName+'@'+a.name;attrs[k]=(attrs[k]??0)+1; }
 return {
 text:body.textContent.replace(/\s+/gu,''),
 links:bag([...body.querySelectorAll('a[href]')].map(n=>n.getAttribute('href'))),
 images:bag([...body.querySelectorAll('img[src]')].map(n=>n.getAttribute('src'))),
 imageAlts:bag([...body.querySelectorAll('img[src]')].map(n=>JSON.stringify([n.getAttribute('src'),n.getAttribute('alt')??'']))),
 frames:bag([...body.querySelectorAll('iframe[src]')].map(n=>n.getAttribute('src'))),
 videos:bag([...body.querySelectorAll('iframe[src]')].map(n=>{try{const u=new URL(n.getAttribute('src'));return u.hostname.replace('www.','')+u.pathname;}catch{return n.getAttribute('src');}})),
 tags:bag(all.map(n=>n.localName)),attrs,
 pdf: [...body.querySelectorAll('a[href]')].filter(n=>/\.pdf(?:[?#]|$)/i.test(n.getAttribute('href'))).length,
 anchors:bag(all.flatMap(n=>[n.id,n.localName==='a'?n.getAttribute('name'):null].filter(Boolean)))
 };
}
const youtubeExtension = process.env.TIPTAP_LEGACY_YOUTUBE === '1' ? Youtube.extend({parseHTML(){return [...(this.parent?.()??[]),{tag:'iframe[src*="youtube.com/embed/"]'}];}}) : Youtube;
const extensions = [StarterKit,Image.configure({inline:true}),youtubeExtension,TableKit,TextStyleKit,TextAlign.configure({types:['heading','paragraph']})];
const aggregate={tags:{},attrs:{},postsWith:{}, failures:0, textChanged:0, linksLost:0,imagesLost:0,imageAltsLost:0,framesChanged:0,videosLost:0,anchorsLost:0,schemaRejected:0,unstable:0,editLostText:0};
const results=[];
for(const p of posts){
 const before=features(parse(p.content));
 for(const key of ['tags','attrs'])for(const [k,v]of Object.entries(before[key]))aggregate[key][k]=(aggregate[key][k]??0)+v;
 for(const tag of Object.keys(before.tags))aggregate.postsWith[tag]=(aggregate.postsWith[tag]??0)+1;
 try{
 const doc=generateJSON(p.content,extensions);
 const output=generateHTML(doc,extensions);
 const after=features(parse(output));
 const again=generateJSON(output,extensions);
 const stable=JSON.stringify(doc)===JSON.stringify(again);
 const schemaOk=validate({schemaVersion:1,doc});
 const edited=structuredClone(doc);
 edited.content.push({type:'paragraph',content:[{type:'text',text:'PAF互換性検証の追記'}]});
 const reopened=generateJSON(generateHTML(edited,extensions),extensions);
 const editText=features(parse(generateHTML(reopened,extensions))).text;
 const row={id:p.id,slug:p.name, textChanged:before.text!==after.text,
 linksLost:diff(before.links,after.links), linkDestinationsLost:diff(before.links,after.links).filter(x=>!after.links[x.value]), imagesLost:diff(before.images,after.images),
 imageAltsLost:diff(before.imageAlts,after.imageAlts),
 framesChanged:diff(before.frames,after.frames),videosLost:diff(before.videos,after.videos),anchorsLost:diff(before.anchors,after.anchors),
 tagsReduced:diff(before.tags,after.tags),attrsReduced:diff(before.attrs,after.attrs),
 pdfLinks:before.pdf,schemaOk,stable,editLostText:editText!==after.text+'PAF互換性検証の追記'};
 for(const key of ['textChanged','editLostText'])if(row[key])aggregate[key]++;
 for(const key of ['linksLost','imagesLost','imageAltsLost','framesChanged','videosLost','anchorsLost'])if(row[key].length)aggregate[key]++;
 if(!schemaOk)aggregate.schemaRejected++;
 if(!stable)aggregate.unstable++;
 results.push(row);
 }catch(e){aggregate.failures++;results.push({id:p.id,error:String(e)});}
}
const versions={};for(const name of ['@tiptap/core','@tiptap/html','@tiptap/starter-kit','@tiptap/extension-image','@tiptap/extension-youtube','@tiptap/extension-table','@tiptap/extension-text-style','@tiptap/extension-text-align','jsdom','ajv'])versions[name]=JSON.parse(readFileSync(resolve(dep,'node_modules',name,'package.json'))).version;
const fixtures = Object.entries({
 table: '<table><tbody><tr><th colspan="2">見出し</th></tr><tr><td rowspan="2">A</td><td>B</td></tr><tr><td>C</td></tr></tbody></table>',
 basic: '<h2>見出し</h2><p><strong>太字</strong><em>斜体</em><u>下線</u><br>改行</p><ul><li><p>箇条書き</p></li></ul><ol start="3"><li><p>番号</p></li></ol><blockquote><p>引用</p></blockquote>',
 links: '<p><a href="/existing-post/">内部リンク</a><a href="https://example.org/document.pdf">PDF</a><a href="https://example.org/full.jpg"><img src="https://example.org/thumb.jpg" alt="画像の説明"></a></p>'
}).map(([name,html])=>{const doc=generateJSON(html,extensions);const output=generateHTML(doc,extensions);const a=features(parse(html)),b=features(parse(output));return {name,doc,output,textEqual:a.text===b.text,linksLost:diff(a.links,b.links),imagesLost:diff(a.images,b.images),schemaOk:validate({schemaVersion:1,doc}),stable:JSON.stringify(doc)===JSON.stringify(generateJSON(output,extensions))};});
const report={node:process.version,versions,sourceSHA256:createHash('sha256').update(raw).digest('hex'),count:posts.length,legacyYoutubeParser:process.env.TIPTAP_LEGACY_YOUTUBE==='1',configuration:'StarterKit + inline Image + Youtube + TableKit + TextStyleKit + TextAlign(heading,paragraph)',aggregate,results,fixtures};
writeFileSync(process.env.TIPTAP_AUDIT_OUTPUT??'/tmp/paf-tiptap-audit-result.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({count:report.count,versions,aggregate},null,2));
dom.window.close();

