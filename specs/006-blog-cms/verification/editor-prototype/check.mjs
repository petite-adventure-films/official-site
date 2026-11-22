import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const require=createRequire(resolve('cms/package.json'));
const {chromium,expect}=require('@playwright/test');
const browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const results=[];
async function paste(html){await page.getByRole('textbox',{name:'本文',exact:true}).evaluate((el,html)=>{const clipboardData=new DataTransfer();clipboardData.setData('text/html',html);el.dispatchEvent(new ClipboardEvent('paste',{clipboardData,bubbles:true,cancelable:true}));},html);}
try{
 await page.goto('http://127.0.0.1:4390');
 const body=page.getByRole('textbox',{name:'本文',exact:true});const save=page.getByRole('button',{name:'試作を保存',exact:true});
 await expect(body).toBeVisible();await save.click();await expect(page.getByRole('status')).toHaveText('保存済み');
 const baseline=await page.evaluate(()=>JSON.parse(localStorage.getItem('paf-body-prototype:sample')).body);
 await body.click();await page.keyboard.press('ControlOrMeta+Home');await page.keyboard.insertText('日本語の追加入力。');await expect(body).toContainText('日本語の追加入力。');
 await page.getByRole('button',{name:'元に戻す',exact:true}).click();await expect(body).not.toContainText('日本語の追加入力。');
 await page.getByRole('button',{name:'やり直す',exact:true}).click();await expect(body).toContainText('日本語の追加入力。');results.push('日本語文字列の入力・Undo・Redo（OS IME変換は対象外）');
 await paste('<p><strong style="color: #0000ff;">貼り付けた文章</strong></p>');await expect(body.locator('strong').filter({hasText:'貼り付けた文章'})).toBeVisible();await expect(body.locator('strong').filter({hasText:'貼り付けた文章'})).toHaveCSS('color','rgb(0, 0, 255)');
 await save.click();await expect(page.getByRole('status')).toHaveText('保存済み');const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('paf-body-prototype:sample')).body);
 function media(n){return [...(['image','externalVideo','wordBreak'].includes(n.type)?[n]:[]),...(['legacyBlock','legacyInline'].includes(n.type)?[{type:n.type,attrs:n.attrs}]:[]),...(n.marks??[]).filter(m=>m.type==='link'),...(n.content??[]).flatMap(media)];}
 assert.deepEqual(media(stored),media(baseline));await page.reload();await expect(body).toContainText('貼り付けた文章');await save.click();await expect(page.getByRole('status')).toHaveText('保存済み');assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('paf-body-prototype:sample')).body),stored);results.push('書式付き貼り付け・保存・再読込で本文JSONと画像/PDF/Vimeo属性を保持');
 const before=await body.innerText();await body.click();await paste('<p>危険な貼付<img src="https://example.com/a.jpg" onerror="alert(1)"></p>');await expect(page.getByText(/貼り付けを中止しました/)).toBeVisible();assert.equal(await body.innerText(),before);results.push('未対応属性の貼り付けを本文変更前に拒否');
 await page.evaluate(()=>{Storage.prototype.setItem=function(){throw new Error('quota test');};});await body.click();await page.keyboard.insertText('保存失敗時の入力');await save.click();await expect(page.getByText(/保存できませんでした/)).toBeVisible();await expect(page.getByRole('status')).toHaveText('未保存');await expect(body).toContainText('保存失敗時の入力');results.push('保存失敗で未保存と入力内容を保持');
 await page.goto('http://127.0.0.1:4390/?article=unsupported');await expect(page.getByText(/変換確認待ち:/)).toBeVisible();await expect(save).toBeDisabled();assert.equal(await page.evaluate(()=>localStorage.getItem('paf-body-prototype:unsupported')),null);await expect(page.locator('pre')).toContainText('<details>');results.push('未対応HTMLの原文保持と保存禁止');
 await page.goto('http://127.0.0.1:4390/?article=wbr');await expect(body).toBeVisible();await expect(body.locator('wbr')).toHaveCount(1);
 async function breakGeometry(width){return body.evaluate((el,width)=>{
  el.style.width=`${width}px`;el.style.padding='0';el.style.fontFamily='monospace';el.style.fontSize='16px';
  const paragraph=el.querySelector('p'),wordBreak=paragraph.querySelector('wbr');
  const before=wordBreak.previousSibling,after=wordBreak.nextSibling;
  const y=node=>{const r=document.createRange();r.setStart(node,0);r.setEnd(node,1);return r.getBoundingClientRect().top;};
  return {before:y(before),after:y(after)};
 },width);}
 const wide=await breakGeometry(400),narrow=await breakGeometry(120);
 assert.equal(wide.before,wide.after,'wbr must not force a line break with sufficient width');
 assert(narrow.after>narrow.before,'wbr must allow wrapping when width is insufficient');
 await save.click();await expect(page.getByRole('status')).toHaveText('保存済み');await page.reload();await expect(body.locator('wbr')).toHaveCount(1);
 const reopened=await breakGeometry(120);assert(reopened.after>reopened.before);
 await page.screenshot({path:'/tmp/paf-word-break.png'});
 results.push('実エディターのwbrは広い幅で改行せず、狭い幅で折り返し、保存・ページ再読込後も保持');
 const articles=[];
 for(const id of [18050,17696,15682,4318,14975,18053,18043,17709,16892,16186,14812,14382,14354,13787,12609,12146,5853,5742,5456,4670,17147,16192,13033,11154,10631,9848,5566,4664,4270,4264,16849,14569,14197,12409,12362,6748,6218,4772,4299,14366,5793,12629,12217,11538,10968,10297,10285,8502,5416,10326,4720]){
  await page.goto(`http://127.0.0.1:4390/?article=${id}`);await expect(page.getByRole('status')).toHaveText(/未保存|変換確認待ち/);
  const status=await page.getByRole('status').innerText();assert.equal(status,'未保存',`article ${id} must be editable`);if(status==='未保存'){await save.click();await expect(page.getByRole('status')).toHaveText('保存済み');await page.reload();await expect(page.getByRole('status')).toHaveText('保存済み');}
  if([17696,4318,18053,18043,17709,16892,16186,14812,14382,14354,13787,12609,12146,5853,5742,5456,4670,17147,16192,13033,11154,10631,9848,5566,4664,4270,4264,16849,14569,14197,12409,12362,6748,6218,4772,4299,14366,5793,12629,12217,11538,10968,10297,10285,8502,5416,10326,4720].includes(id)){
   const original=await page.evaluate(id=>JSON.parse(localStorage.getItem(`paf-body-prototype:${id}`)).body,id);
   await body.evaluate(el=>{el.focus();const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let node;while(node=walker.nextNode()){if(node.textContent.trim()&&!node.parentElement.closest('.media-placeholder'))break;}if(!node)throw Error('No editable text');const range=document.createRange();range.setStart(node,0);range.collapse(true);const selection=getSelection();selection.removeAllRanges();selection.addRange(range);});await page.keyboard.insertText('旧記事の追記確認。');await save.click();await expect(page.getByRole('status')).toHaveText('保存済み');
   const edited=await page.evaluate(id=>JSON.parse(localStorage.getItem(`paf-body-prototype:${id}`)).body,id);assert.deepEqual(media(edited),media(original));
   await page.reload();await expect(body).toContainText('旧記事の追記確認。');await save.click();await expect(page.getByRole('status')).toHaveText('保存済み');assert.deepEqual(await page.evaluate(id=>JSON.parse(localStorage.getItem(`paf-body-prototype:${id}`)).body,id),edited);
   if(id===4318){await expect(body.locator('p[lang="ja-JP"]')).toHaveCount(31);await page.screenshot({path:'/tmp/paf-body-legacy-4318.png'});}
  }
  if([18053,12146,12217,10297,4772].includes(id))await page.screenshot({path:`/tmp/paf-format-${id}.png`});
  articles.push({id,result:status==='未保存'?'保存・再読込成功':await page.getByText(/変換確認待ち:/).innerText()});
 }
 await page.goto('http://127.0.0.1:4390');await expect(body).toBeVisible();await expect(save).toBeEnabled();await page.screenshot({path:'/tmp/paf-body-prototype.png',fullPage:true});
 assert.deepEqual(errors,[]);
 const legacyChecks=await page.evaluate(async()=>await(await import('/legacy-check.js')).checkLegacy());
 const diagnostics=await page.evaluate(async()=>await(await import('/diagnose.js')).diagnose());
 const report={results,articles,legacyChecks,diagnostics,limitations:['OSの日本語IMEによる変換・確定は未確認','画像表示・動画再生・アップロード・本番API保存は試作の対象外','貼り付けはClipboardEventで検証。OSクリップボード経由は未確認'],screenshot:'/tmp/paf-body-prototype.png'};
 writeFileSync(resolve('specs/006-blog-cms/verification/editor-prototype/result.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
}finally{await browser.close();}
