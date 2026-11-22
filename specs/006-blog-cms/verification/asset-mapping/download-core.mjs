// Bounded local verification prototype. No asset IDs, R2 writes or content edits.
import {readFile, writeFile, mkdir, rename, statfs} from 'node:fs/promises';
import {createHash, randomUUID} from 'node:crypto';
import {join, resolve} from 'node:path';
import {createRequire} from 'node:module';
const sharp=createRequire(resolve('astro/package.json'))('sharp');
export const sha=data=>createHash('sha256').update(data).digest('hex');
export async function atomic(path,value){const tmp=path+'.'+randomUUID()+'.tmp';await writeFile(tmp,JSON.stringify(value,null,2)+'\n');await rename(tmp,path);}
function allowed(url){const u=new URL(url);if(!['www.petiteadventurefilms.com','petiteadventurefilms.com'].includes(u.hostname)||!['http:','https:'].includes(u.protocol)||u.username||u.password||u.port)throw Error('unapproved_source');}
export async function runBatch({jobs,inputHash,cache,fetcher=fetch,pause=ms=>new Promise(r=>setTimeout(r,ms)),maxBytes=20*1024*1024,budget=100*1024*1024,interval=500,timeout=60000,stopAfter=Infinity}){
 if(jobs.length>20||new Set(jobs.map(j=>j.url)).size!==jobs.length)throw Error('invalid_batch');
 await mkdir(cache,{recursive:true});
 const manifestPath=join(cache,'manifest.json');let manifest;
 try{manifest=JSON.parse(await readFile(manifestPath));}catch(e){if(e.code!=='ENOENT')throw e;}
 const identity=sha(JSON.stringify(jobs));
 if(manifest&&(manifest.inputHash!==inputHash||manifest.jobHash!==identity))throw Error('input_changed');
 manifest??={inputHash,jobHash:identity,jobs:jobs.map(j=>({...j,state:'pending',attempts:[]})),receivedBytes:0};
 await atomic(manifestPath,manifest);
 let processed=0;
 for(const job of manifest.jobs){
  if(processed>=stopAfter)break;
  const cooldown=job.attempts.at(-1)?.resumeAfter;if(cooldown&&Date.parse(cooldown)>Date.now())return manifest;
  if(job.state==='verified-local'){
   try{const data=await readFile(job.file.path);if(data.length===job.file.bytes&&sha(data)===job.file.sha256)continue;}catch{}
   job.state='pending';job.attempts.push({at:new Date().toISOString(),error:'cache_missing_or_corrupt'});
  }
  if(['missing','rejected'].includes(job.state))continue;
  // Each run makes at most three attempts; prior failures remain in the log.
  for(let attempt=0;attempt<3;attempt++){
   if(manifest.receivedBytes>=budget)throw Error('batch_budget_exhausted');
   const fs=await statfs(cache);if(fs.bavail*fs.bsize<5*1024**3)throw Error('insufficient_disk_space');
   job.state='fetching';const log={at:new Date().toISOString(),redirects:[]};job.attempts.push(log);await atomic(manifestPath,manifest);
   let response;let retryMs=1000*2**attempt+Math.floor(Math.random()*250);
   try{
    let url=job.url;allowed(url);const signal=AbortSignal.timeout(timeout);
    for(let redirects=0;redirects<=5;redirects++){
     allowed(url);await pause(interval);
     response=await fetcher(url,{redirect:'manual',signal,headers:{'User-Agent':'PAF-Blog-Migration-Probe/1.1'}});
     if([301,302,303,307,308].includes(response.status)){
      const location=response.headers.get('location');await response.body?.cancel();if(!location||redirects===5)throw Error('invalid_redirect');
      const next=new URL(location,url).href;allowed(next);log.redirects.push({from:url,to:next,status:response.status});url=next;continue;
     }
     break;
    }
    Object.assign(log,{finalURL:url,status:response.status,contentType:response.headers.get('content-type'),contentLength:response.headers.get('content-length'),etag:response.headers.get('etag'),lastModified:response.headers.get('last-modified')});
    if(!response.ok){
     await response.body?.cancel();job.state=[404,410].includes(response.status)?'missing':response.status===408||response.status===429||response.status>=500?'retryable':'rejected';
     if(response.status===429){const h=response.headers.get('retry-after');const n=Number(h);retryMs=h?Math.max(retryMs,Number.isFinite(n)?n*1000:Date.parse(h)-Date.now()||0):retryMs;}
    }else{
     const reader=response.body.getReader();const parts=[];let bytes=0;
     try{while(true){const chunk=await reader.read();if(chunk.done)break;bytes+=chunk.value.byteLength;manifest.receivedBytes+=chunk.value.byteLength;if(bytes>maxBytes||manifest.receivedBytes>budget)throw Error('byte_limit');parts.push(chunk.value);}}finally{await reader.cancel().catch(()=>{});}
     const data=Buffer.concat(parts);const meta=await sharp(data,{limitInputPixels:40000000,failOn:'warning'}).metadata();
     if(!['jpeg','png','gif','webp'].includes(meta.format)||!meta.width||!meta.height)throw Error('invalid_image');
     // Force full pixel decode; metadata alone can accept truncated images.
     await sharp(data,{limitInputPixels:40000000,failOn:'warning'}).stats();
     const hash=sha(data);const ext=meta.format==='jpeg'?'jpg':meta.format;const path=join(cache,`${hash}.${ext}`);
     let existing;try{existing=await readFile(path);}catch(e){if(e.code!=='ENOENT')throw e;}
     if(existing&&sha(existing)!==hash){await rename(path,path+'.corrupt.'+randomUUID());existing=null;}
     if(!existing){const tmp=path+'.'+randomUUID()+'.part';await writeFile(tmp,data);if(sha(await readFile(tmp))!==hash)throw Error('disk_checksum');await rename(tmp,path);}
     job.file={path,sha256:hash,bytes,width:meta.width,height:meta.height,format:meta.format};job.state='verified-local';
    }
   }catch(e){log.error=e.message;job.state=/unapproved_source|invalid_redirect|byte_limit|invalid_image|pixel limit|corrupt|unsupported image|premature end/i.test(e.message)?'rejected':'retryable';}
   await atomic(manifestPath,manifest);
   if(job.state!=='retryable')break;
   // Stop rather than sleeping through a long server-directed cooldown.
   if(retryMs>30000){log.resumeAfter=new Date(Date.now()+retryMs).toISOString();await atomic(manifestPath,manifest);return manifest;}
   if(attempt<2)await pause(retryMs);
  }
  processed++;
  if(job.state==='retryable')break;
 }
 return manifest;
}
