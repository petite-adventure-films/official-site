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
 'candidateBodyBytesには確認待ち記事の変換候補も含む。欠落の可能性があるため保存可能とは扱わない。bodyBytesは通過記事のみ。provisionalRequestBytesは旧分類値と暫定エンベロープを使った概算で、正式CMS ID・rich-text/v2・最終API要求ではない。原本HTMLは要求に含めない。現行制限はcms/worker/routes/json.tsの262,144 bytes。今回の通過記事では本文・概算要求とも超過0件。','',
 '## 最初に停止した理由（重複なし）','', '| 理由 | 件数 | 記事ID |','| --- | ---: | --- |',
 ...Object.entries(reasons).map(([reason,ids])=>`| ${reason} | ${ids.length} | ${ids.join(', ')} |`),'',
 '同じ記事に複数の未対応要素がある。下の一覧とJSONのlegacyFeaturesは最初の停止理由に隠れた属性も記録する。','',
 '## 確認待ち記事','', '| ID | タイトル | 最初の停止理由 | その他の旧要素・属性 |','| --- | --- | --- | --- |',
 ...blocked.map(r=>`| ${r.id} | ${r.title.replaceAll('|','／')} | ${r.reason} | ${r.legacyFeatures.join(', ').replaceAll('|','／')||'書式・要素の変換差をJSONのdifferencesで確認'} |`),'',
 '## 次の対応順（提案）','',
 '書式構造差15件は文字・画像ごとの有効書式を照合する方式で通過。太字/色の順序、同義の分割・統合、入れ子の上書きを扱い、異なる書式・対象・改行・リンクの欠落は拒否する。',
 'wbrは専用wordBreakノードで保持。新たに10件が通過し、通過記事内の219箇所を保持。元データ全体では17記事279箇所あり、残る記事は別の未対応要素で停止している。',
 '1. divとlang、旧idを含む構造の保全。段落へ無条件置換せず、旧アンカーと文章のまとまりを確認する。',
 '2. コピー元のclass/data属性。メール・SNS由来の付加情報と公開内容の意味を分け、採用する除去規則を明示する。外部リンクのhrefは保持する。4720のmailtoリンクも別途対応を検討し、現在のURL制限を無条件に緩めない。','',
 '確認待ち記事の原文と公開内容は変更していない。全件の詳細・差分・添付件数はall-articles-result.json。再現: 試作サーバー起動中に `node specs/006-blog-cms/verification/editor-prototype/audit-all.mjs`。',''];
 writeFileSync(resolve(root,'all-articles.md'),md.join('\n'));
 console.log(JSON.stringify({passed:report.passed,blocked:report.blocked,reasons,maxima},null,2));
}finally{await browser.close();}
