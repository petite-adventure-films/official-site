import {createRequire} from 'node:module';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const require=createRequire(resolve(process.env.TIPTAP_AUDIT_DEPS??'/tmp/paf-tiptap-audit','package.json'));const {JSDOM}=require('jsdom');
const root=dirname(fileURLToPath(import.meta.url));const raw=readFileSync('astro/data/wordpress-export.json');const source=JSON.parse(raw);const inventoryRaw=readFileSync('astro/data/wordpress-media-inventory.json');const inventory=JSON.parse(inventoryRaw);
const hosts=new Set(['www.petiteadventurefilms.com','petiteadventurefilms.com']);
import {classify} from './ownership.mjs';
const paths=new Map(inventory.entries.filter(e=>hosts.has(e.host)).map(e=>[e.pathname,e]));const records=new Map();
for(const p of source.content.blogs){const dom=new JSDOM(p.content);for(const el of dom.window.document.querySelectorAll('img[src],a[href]')){
 const url=el.getAttribute(el.localName==='img'?'src':'href');const u=new URL(url);const role=el.localName==='img'?'image-src':/\.pdf$/i.test(u.pathname)?'pdf-link':/\.(?:jpe?g|png|gif|webp)$/i.test(u.pathname)?'image-link':null;if(!role)continue;
 if(!records.has(url)){const ownership=classify(url);const entry=ownership==='owned-upload'?paths.get(u.pathname):null;records.set(url,{url,ownership,roleCounts:{},articleIds:[],inventory:entry?{relativePath:entry.relativePath,legacyStorageKey:entry.storageKey,exactURLRecorded:entry.sourceUrls.includes(url),historicalCheck:entry.remoteCheck?{ok:entry.remoteCheck.ok,httpStatus:entry.remoteCheck.httpStatus,checkedAt:entry.remoteCheck.checkedAt}:null,originalCandidate:entry.recoveryCandidate?{sourceUrl:entry.recoveryCandidate.sourceUrl}:null}:null});}
 const r=records.get(url);r.roleCounts[role]=(r.roleCounts[role]??0)+1;if(!r.articleIds.includes(p.id))r.articleIds.push(p.id);
 }dom.window.close();}
const rows=[...records.values()];const counts=role=>rows.reduce((n,r)=>n+(r.roleCounts[role]??0),0);const external=rows.filter(r=>r.ownership==='external');const owned=rows.filter(r=>r.ownership==='owned-upload');
const result={sourceHash:createHash('sha256').update(raw).digest('hex'),inventoryHash:createHash('sha256').update(inventoryRaw).digest('hex'),inventoryGeneratedAt:inventory.generatedAt,totalDistinctURLs:rows.length,roleOccurrences:{images:counts('image-src'),imageLinks:counts('image-link'),pdfLinks:counts('pdf-link')},ownedDistinctURLs:owned.length,ownedInventoryPaths:new Set(owned.map(r=>r.inventory?.relativePath).filter(Boolean)).size,ownedWithoutInventory:owned.filter(r=>!r.inventory),externalReferences:external,historicalMissing:owned.filter(r=>r.inventory?.historicalCheck?.ok===false),scope:'URL/path candidates only. HEAD status is historical, not byte verification or asset registration. Query/fragment and scheme variants remain separate records. No asset IDs are issued.',records:rows};
writeFileSync(resolve(root,'inventory-result.json'),JSON.stringify({...result,records:undefined},null,2).slice(0,-2)+',\n  "records": [\n'+rows.map(row=>'    '+JSON.stringify(row)).join(',\n')+'\n  ]\n}\n');console.log(JSON.stringify({...result,records:undefined,historicalMissing:result.historicalMissing.map(r=>({url:r.url,articles:r.articleIds}))},null,2));
