import {Node,Extension} from '@tiptap/core';
const definitions=keys=>Object.fromEntries(keys.map(key=>[key,{default:null}]));
const containerAttributes=['id','class','lang','dir','tabindex','aria-live','data-ft','data-tooltip'];
// Retain the source wrappers and their observed attributes; do not activate external scripts/styles.
export const LegacyBlock=Node.create({
 name:'legacyBlock',group:'block',content:'block*',defining:true,
 addAttributes(){return definitions(containerAttributes);},
 parseHTML(){return [{tag:'div'}];},
 renderHTML({HTMLAttributes}){return ['div',HTMLAttributes,0];},
});
export const LegacyInline=Node.create({
 name:'legacyInline',group:'inline',inline:true,content:'inline*',defining:true,
 addAttributes(){return definitions(containerAttributes);},
 parseHTML(){return [{tag:'span',getAttrs:el=>containerAttributes.some(key=>el.hasAttribute(key))?null:false}];},
 renderHTML({HTMLAttributes}){return ['span',HTMLAttributes,0];},
});
export const LegacyReferences=Extension.create({
 name:'legacyReferences',
 addGlobalAttributes(){return [
  {types:['link'],attributes:definitions(['data-saferedirecturl','data-lynx-mode','data-lynx-uri'])},
  {types:['image'],attributes:definitions(['class'])},
 ];},
});
export const legacyContainers=[LegacyBlock,LegacyInline,LegacyReferences];
export const observedClasses=new Set('yt-core-attributed-string--link-inherit-color css-901oao css-16my406 r-1tl8opc r-bcqeeo r-qvutc0 st list_post_contents r-gwet1z r-ad9z0x text_exposed_show fbPhotosPhotoCaption hasCaption mcafee_OK UFICommentActorAndBody UFICommentBody _1n4g smrArt im yj6qo ajU ajR ajT HOEnZb adL'.split(' '));
export function retainedClass(value){return (value??'').split(/\s+/).filter(c=>c&&!/^(?:alignnone|wp-image-[0-9]+|size-(?:full|large|medium|thumbnail))$/.test(c)).join(' ');}
