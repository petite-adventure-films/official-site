import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {readFileSync,writeFileSync} from 'node:fs';
const require=createRequire(resolve('cms/package.json'));
const {chromium}=require('@playwright/test');
const source=readFileSync('astro/data/wordpress-export.json');const sourceHash=createHash('sha256').update(source).digest('hex');const posts=JSON.parse(source).content.blogs;
const browser=await chromium.launch();
try{const page=await browser.newPage();await page.goto('http://127.0.0.1:4390');const output=[];
 for(let i=0;i<posts.length;i+=20){output.push(...await page.evaluate(async batch=>{const {extensions}=await import('/audit-all.js');const {checkedImport}=await import('/guard.js');return batch.map(p=>({id:p.id,title:p.title,slug:p.name,doc:checkedImport(p.content,extensions)}));},posts.slice(i,i+20)));}
 writeFileSync('/tmp/paf-body-contract-documents.json',JSON.stringify({sourceHash,documents:output}));console.log(`exported ${output.length} validated documents`);
}finally{await browser.close();}
