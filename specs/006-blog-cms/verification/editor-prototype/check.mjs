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
 await paste('<p><strong>貼り付けた文章</strong></p>');await expect(body.locator('strong').filter({hasText:'貼り付けた文章'})).toBeVisible();
 await save.click();await expect(page.getByRole('status')).toHaveText('保存済み');const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('paf-body-prototype:sample')).body);
 function media(n){return [...(['image','externalVideo'].includes(n.type)?[n]:[]),...(n.marks??[]).filter(m=>m.type==='link'),...(n.content??[]).flatMap(media)];}
 assert.deepEqual(media(stored),media(baseline));await page.reload();await expect(body).toContainText('貼り付けた文章');await save.click();await expect(page.getByRole('status')).toHaveText('保存済み');assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('paf-body-prototype:sample')).body),stored);results.push('書式付き貼り付け・保存・再読込で本文JSONと画像/PDF/Vimeo属性を保持');
 const before=await body.innerText();await body.click();await paste('<p>危険な貼付<img src="https://example.com/a.jpg" onerror="alert(1)"></p>');await expect(page.getByText(/貼り付けを中止しました/)).toBeVisible();assert.equal(await body.innerText(),before);results.push('未対応属性の貼り付けを本文変更前に拒否');
 await page.evaluate(()=>{Storage.prototype.setItem=function(){throw new Error('quota test');};});await body.click();await page.keyboard.insertText('保存失敗時の入力');await save.click();await expect(page.getByText(/保存できませんでした/)).toBeVisible();await expect(page.getByRole('status')).toHaveText('未保存');await expect(body).toContainText('保存失敗時の入力');results.push('保存失敗で未保存と入力内容を保持');
 await page.goto('http://127.0.0.1:4390/?article=unsupported');await expect(page.getByText(/変換確認待ち:/)).toBeVisible();await expect(save).toBeDisabled();assert.equal(await page.evaluate(()=>localStorage.getItem('paf-body-prototype:unsupported')),null);await expect(page.locator('pre')).toContainText('<details>');results.push('未対応HTMLの原文保持と保存禁止');
 const articles=[];
 for(const id of [18050,17696,15682,4318,14975]){
  await page.goto(`http://127.0.0.1:4390/?article=${id}`);await expect(page.getByRole('status')).toHaveText(/未保存|変換確認待ち/);
  const status=await page.getByRole('status').innerText();if(status==='未保存'){await save.click();await expect(page.getByRole('status')).toHaveText('保存済み');await page.reload();await expect(page.getByRole('status')).toHaveText('保存済み');}
  articles.push({id,result:status==='未保存'?'保存・再読込成功':await page.getByText(/変換確認待ち:/).innerText()});
 }
 await page.goto('http://127.0.0.1:4390');await expect(body).toBeVisible();await expect(save).toBeEnabled();await page.screenshot({path:'/tmp/paf-body-prototype.png',fullPage:true});
 assert.deepEqual(errors,[]);
 const diagnostics=await page.evaluate(async()=>await(await import('/diagnose.js')).diagnose());
 const report={results,articles,diagnostics,limitations:['OSの日本語IMEによる変換・確定は未確認','画像表示・動画再生・アップロード・本番API保存は試作の対象外','貼り付けはClipboardEventで検証。OSクリップボード経由は未確認'],screenshot:'/tmp/paf-body-prototype.png'};
 writeFileSync(resolve('specs/006-blog-cms/verification/editor-prototype/result.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
}finally{await browser.close();}
