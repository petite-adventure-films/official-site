import {Extension} from '@tiptap/core';
export const LegacyLanguage=Extension.create({
 name:'legacyLanguage',
 addGlobalAttributes(){return [{types:['paragraph'],attributes:{lang:{default:null,parseHTML:el=>el.getAttribute('lang'),renderHTML:attrs=>attrs.lang===null?{}:{lang:attrs.lang}}}}];},
});
// Only known textStyle values are canonicalized. Unknown fields remain visible to the strict roundtrip check.
export function normalizeStyles(json){
 const copy=structuredClone(json);
 function visit(node){
  if(node.type==='textStyle'&&node.attrs){
   for(const key of ['color','backgroundColor','fontFamily','fontSize']){
    const value=node.attrs[key];if(value==null||value==='')continue;
    if(typeof value!=='string'||!value.trim())throw Error(`不正な旧書式: ${key}`);
    const style=document.createElement('span').style;style[key]=value;
    if(!style[key])throw Error(`未対応の旧書式: ${key}`);
    node.attrs[key]=style[key];
   }
  }
  for(const mark of node.marks??[])visit(mark);
  for(const child of node.content??[])visit(child);
 }
 visit(copy);return copy;
}
