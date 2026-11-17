import {createRequire} from 'node:module';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root=dirname(fileURLToPath(import.meta.url));const require=createRequire(resolve('cms/package.json'));
const {chromium}=require('@playwright/test');const raw=readFileSync('astro/data/wordpress-export.json');const prior=JSON.parse(readFileSync(resolve(root,'all-articles-result.json')));const source=JSON.parse(raw);const posts=source.content.blogs;
assert.equal(posts.length,310);assert.equal(new Set(posts.map(p=>p.id)).size,310);
const browser=await chromium.launch();const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto('http://127.0.0.1:4390');const records=[];
 for(let i=0;i<posts.length;i+=20){records.push(...await page.evaluate(async batch=>(await import('/audit-all.js')).audit(batch),posts.slice(i,i+20)));console.log(`${records.length}/${posts.length}`);}
 assert.deepEqual(errors,[]);assert.equal(records.length,310);
 for(const old of prior.records.filter(r=>r.status==='passed'))assert.equal(records.find(r=>r.id===old.id).status,'passed',`regression ${old.id}`);
 const passed=records.filter(r=>r.status==='passed'),blocked=records.filter(r=>r.status==='blocked');
 const reasons=Object.fromEntries([...new Set(blocked.map(r=>r.reason))].map(reason=>[reason,blocked.filter(r=>r.reason===reason).map(r=>r.id)]));
 const maximum=field=>records.filter(r=>Number.isFinite(r[field])).reduce((a,b)=>a[field]>b[field]?a:b);
 const maxima=Object.fromEntries(['sourceHTMLBytes','candidateBodyBytes','bodyBytes','provisionalRequestBytes'].map(field=>{const r=maximum(field);return [field,{id:r.id,bytes:r[field],headroom:262144-r[field]}];}));
 const totals=group=>Object.fromEntries(['wordBreaks','images','links','pdfs','videos','languages','styles'].map(key=>[key,group.reduce((n,r)=>n+r.source[key],0)]));
 const report={snapshot:source.source,sha256:createHash('sha256').update(raw).digest('hex'),browser:browser.version(),total:310,passed:passed.length,blocked:blocked.length,reasons,sourceTotals:totals(records),passedSourceTotals:totals(passed),maxima,bodyOverLimit:records.filter(r=>r.bodyBytes>262144).map(r=>r.id),requestOverLimit:records.filter(r=>r.provisionalRequestBytes>262144).map(r=>r.id),scope:'Chromium HTML conversion, source signature, two JSON roundtrips, localStorage serialization. Not per-article editor interaction or real API persistence. Candidate sizes of blocked articles are not safe-to-save output. Provisional envelope uses legacy taxonomy values, not resolved CMS IDs; rich-text/v2 and final API size are unverified.',records};
 writeFileSync(resolve(root,'all-articles-result.json'),JSON.stringify(report,null,2)+'\n');
 const md=['# 旧ブログ310件の本文変換検証','',
 '対象 #418 / #334。2026-08-10のWordPressエクスポートを、現行の独立試作と同じ拡張・ガードでChromium検証した。本番移行の承認ではない。','',
 `- SHA-256: ${report.sha256}`,`- Chromium: ${report.browser}`,`- 通過: ${passed.length}件 / 確認待ち: ${blocked.length}件`,
 '- 検証: 原文の比較用署名、2回のJSON→HTML→JSON往復、localStorage書込・読出し。記事ごとの画面入力操作・ページ再読込・API保存は対象外。',
 '- 本文文字列は空白を除いて照合。段落の完全な意味比較、CSS全般、外部URLの到達・動画再生は未検証。通過件数を全内容の完全保証と扱わない。','',
 '## 容量','', '| 対象 | 記事ID | UTF-8 bytes | 256KiBまでの余裕 |','| --- | --- | ---: | ---: |',
 ...Object.entries(maxima).map(([k,v])=>`| ${k} | ${v.id} | ${v.bytes} | ${v.headroom} |`),'',
 'candidateBodyBytesには確認待ち記事の変換候補も含む。欠落の可能性があるため保存可能とは扱わない。bodyBytesは通過記事のみ。provisionalRequestBytesは旧分類値と暫定エンベロープを使った概算で、正式CMS ID・rich-text/v2・最終API要求ではない。原本HTMLは要求に含めない。現行制限はcms/worker/routes/json.tsの262,144 bytes。今回の通過記事では本文・概算要求とも超過0件。旧属性保持で容量は増えており、正式ノードへの変更時は再測定する。','',
 '## 最初に停止した理由（重複なし）','', '| 理由 | 件数 | 記事ID |','| --- | ---: | --- |',
 ...Object.entries(reasons).map(([reason,ids])=>`| ${reason} | ${ids.length} | ${ids.join(', ')} |`),'',
 '同じ記事に複数の未対応要素がある。下の一覧とJSONのlegacyFeaturesは最初の停止理由に隠れた属性も記録する。','',
 '## 確認待ち記事','', '| ID | タイトル | 最初の停止理由 | その他の旧要素・属性 |','| --- | --- | --- | --- |',
 ...blocked.map(r=>`| ${r.id} | ${r.title.replaceAll('|','／')} | ${r.reason} | ${r.legacyFeatures.join(', ').replaceAll('|','／')||'書式・要素の変換差をJSONのdifferencesで確認'} |`),'',
 '## 正式実装へ残る確認','',
 '全310件が試作の照合を通過。原文保持・意味照合・JSON往復・localStorage検証であり、正式移行の承認ではない。',
 '1. 正式rich-text/v2とAPI要求のschema・容量、保存・公開経路を実装して検証する。',
 '2. 旧class/data/tabindex/aria属性は試作ノードで保存する。公開レンダラーで適用する属性と保全専用にする属性を決める。コピー元の外部CSS・スクリプトは読み込まない。',
 '3. 記事10297には同じfbPhotoSnowliftCaption IDが2回ある。試作は元の順序・個数を保ち自動改名しない。正式公開時の重複ID/アンカー方針を決める。',
 '4. OS IME、不可視ノード・入れ子コンテナー付近の編集操作、全記事の見た目、動画実再生・外部リンク到達を確認する。','',
 '確認待ち記事の原文と公開内容は変更していない。全件の詳細・差分・添付件数はall-articles-result.json。再現: 試作サーバー起動中に `node specs/006-blog-cms/verification/editor-prototype/audit-all.mjs`。',''];
 writeFileSync(resolve(root,'all-articles.md'),md.join('\n'));
 console.log(JSON.stringify({passed:report.passed,blocked:report.blocked,reasons,maxima},null,2));
}finally{await browser.close();}
