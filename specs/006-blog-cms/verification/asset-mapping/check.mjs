import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {classify} from './ownership.mjs';
const root=dirname(fileURLToPath(import.meta.url));const report=JSON.parse(readFileSync(resolve(root,'inventory-result.json')));const probe=JSON.parse(readFileSync(resolve(root,'probe-result.json')));
assert.equal(report.sourceHash,createHash('sha256').update(readFileSync('astro/data/wordpress-export.json')).digest('hex'));
assert.equal(report.inventoryHash,createHash('sha256').update(readFileSync('astro/data/wordpress-media-inventory.json')).digest('hex'));
assert.equal(report.roleOccurrences.images,5923);assert.equal(report.roleOccurrences.pdfLinks,5);assert.equal(report.ownedWithoutInventory.length,0);
assert.equal(new Set(report.records.map(r=>r.url)).size,report.totalDistinctURLs);
for(const url of ['https://www.petiteadventurefilms.com/wp/wp-content/uploads/x.jpg','http://petiteadventurefilms.com/wp/wp-content/uploads/x.pdf'])assert.equal(classify(url),'owned-upload');
for(const url of ['https://www.petiteadventurefilms.com.evil.example/wp/wp-content/uploads/x.jpg','https://www.petiteadventurefilms.com@evil.example/wp/wp-content/uploads/x.jpg','https://other.example/wp/wp-content/uploads/x.pdf','https://www.petiteadventurefilms.com:444/wp/wp-content/uploads/x.jpg','https://www.petiteadventurefilms.com/not-uploads/x.pdf'])assert.equal(classify(url),'external');
const samples=probe.samples.filter(s=>s.status==='verified-local-only');assert(samples.length>0);
for(const s of samples){const file=readFileSync(s.localPath);assert.equal(file.length,s.sizeBytes);assert.equal(createHash('sha256').update(file).digest('hex'),s.sha256);assert(s.width>0&&s.height>0);assert.equal(s.proposedStorageKey,`originals/${s.sha256.slice(0,2)}/${s.sha256}.${s.format==='jpeg'?'jpg':s.format}`);}
const result={mappingRecords:report.records.length,ownedInventoryPaths:report.ownedInventoryPaths,unmatchedOwned:report.ownedWithoutInventory.length,verifiedLocalSamples:samples.length,tests:['原本・台帳hash一致','5923画像/5PDFの参照数照合・URLレコード重複なし','ホスト偽装/資格情報/他ホスト/異常ポートを自サイト判定しない','取得済み実ファイルのディスク再読出し・byte数・SHA256・提案保存キーを照合'],notPerformed:['全5895候補ファイルの取得','R2アップロード','asset ID登録','復旧候補への置換','外部PDFの移管']};
writeFileSync(resolve(root,'check-result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
