"""Generate a review schema; not installed in the application's schema registry."""
import json
from pathlib import Path
root=Path(__file__).resolve().parents[2]/'contracts'
ref=lambda name:{'$ref':'#/$defs/'+name}
obj=lambda p,req=[]:{'type':'object','properties':p,'required':req,'additionalProperties':False}
string={'type':'string'}
source={'type':'string','pattern':'^legacy_[a-f0-9]{32}$'}
asset={'type':'string','pattern':'^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$','minLength':3,'maxLength':100}
dimension={'type':'integer','minimum':1,'maximum':99999}
base={'sourceRef':source}
lang={'lang':{'enum':['ja','ja-JP']},'dir':{'enum':['auto','ltr','rtl']}}
def attrs(fields):return obj({**base,**fields})
def node(name,fields=None,children=None,marks=False,requiredAttrs=[]):
 p={'type':{'const':name}};required=['type']
 if fields is not None:
  p['attrs']=attrs(fields);p['attrs']['required']=requiredAttrs
  if requiredAttrs:required.append('attrs')
 if children:
  p['content']={'type':'array','items':ref(children)}
 if marks:p['marks']={'type':'array','items':ref('mark')}
 return obj(p,required)
d={}
d['text']=obj({'type':{'const':'text'},'text':{'type':'string','minLength':1},'marks':{'type':'array','items':ref('mark')}},['type','text'])
d['paragraph']=node('paragraph',{**lang,'textAlign':{'enum':['left','right','center','justify']}},'inline')
d['heading']=node('heading',{'level':{'enum':[2,3,4]},'textAlign':{'enum':['left','right','center','justify']},**lang},'inline',requiredAttrs=['level'])
for name in ['hardBreak','wordBreak']:d[name]=node(name,marks=True)
d['horizontalRule']=node('horizontalRule')
d['blockquote']=node('blockquote',{},'block')
d['bulletList']=node('bulletList',{},'listItem')
d['orderedList']=node('orderedList',{'start':{'type':'integer','minimum':1}},'listItem')
d['listItem']=node('listItem',{},'block')
d['plainText']=obj({'type':{'const':'text'},'text':{'type':'string','minLength':1}},['type','text'])
d['codeBlock']=node('codeBlock',{},'plainText')
for name,child in [('table','tableRow'),('tableRow','cell'),('tableCell','block'),('tableHeader','block')]:
 d[name]=node(name,{'colspan':dimension,'rowspan':dimension} if name in ['tableCell','tableHeader'] else {},child)
d['cell']={'oneOf':[ref('tableCell'),ref('tableHeader')]}
image={'alt':string,'title':string,'caption':string,'width':dimension,'height':dimension}
d['assetImage']=node('assetImage',{'assetId':asset,**image},marks=True,requiredAttrs=['assetId','alt'])
d['unresolvedImage']=node('unresolvedImage',image,marks=True,requiredAttrs=['sourceRef','alt'])
d['externalVideo']=node('externalVideo',{'provider':{'enum':['youtube','vimeo']},'videoId':string,'sourceUrl':string,'title':string,'width':dimension,'height':dimension},requiredAttrs=['provider','videoId','sourceUrl'])
for name,child in [('preservedBlock','block'),('preservedInline','inline')]:d[name]=node(name,{'anchorId':{'type':'string','minLength':1,'pattern':r'^[^\s\u0000-\u001f\u007f]+$'},**lang},child,marks=name=='preservedInline',requiredAttrs=['sourceRef'])
for mark in ['bold','italic','underline','strike','code']:d[mark]=obj({'type':{'const':mark}},['type'])
link={'href':string,'title':string,'target':{'enum':['_blank','_self']}}
d['link']=node('link',link,requiredAttrs=['href'])
d['assetLink']=node('assetLink',{'assetKind':{'enum':['image','document']},'assetId':asset,'title':string,'target':{'enum':['_blank','_self']}},requiredAttrs=['assetId','assetKind'])
d['unresolvedAssetLink']=node('unresolvedAssetLink',{'assetKind':{'enum':['image','document']},'title':string,'target':{'enum':['_blank','_self']}},requiredAttrs=['sourceRef','assetKind'])
d['textStyle']=node('textStyle',{'color':{'type':'string','pattern':r'^rgb\([0-9]{1,3}, [0-9]{1,3}, [0-9]{1,3}\)$'},'backgroundColor':{'type':'string','pattern':r'^rgb\([0-9]{1,3}, [0-9]{1,3}, [0-9]{1,3}\)$'},'fontFamily':{'enum':['"Times New Roman", serif','"ＭＳ Ｐ明朝", serif']},'fontSize':{'const':'medium'}})
d['mark']={'oneOf':[ref(n) for n in ['bold','italic','underline','strike','code','link','assetLink','unresolvedAssetLink','textStyle']]}
d['inline']={'oneOf':[ref(n) for n in ['text','hardBreak','wordBreak','assetImage','unresolvedImage','preservedInline']]}
d['block']={'oneOf':[ref(n) for n in ['paragraph','heading','horizontalRule','blockquote','bulletList','orderedList','codeBlock','table','externalVideo','preservedBlock']]}
d['doc']=obj({'type':{'const':'doc'},'content':{'type':'array','items':ref('block')}},['type','content'])
for name in ['bulletList','orderedList','listItem','table','tableRow','tableCell','tableHeader']:
 d[name]['required'].append('content')
 d[name]['properties']['content']['minItems']=1
d['listItem']['properties']['content']['prefixItems']=[ref('paragraph')]
schema={'$schema':'https://json-schema.org/draft/2020-12/schema','$id':'https://www.petiteadventurefilms.com/proposals/rich-text-draft/v2','title':'Rich text v2 review candidate — not registered for production',**obj({'schemaVersion':{'const':2},'doc':ref('doc')},['schemaVersion','doc']),'$defs':d}
(root/'rich-text-v2.candidate.schema.json').write_text(json.dumps(schema,ensure_ascii=False,indent=2)+'\n')
# Published data is a separate allowlist: no unresolved nodes and no archival pointers.
public=json.loads(json.dumps(schema))
public['$id']='https://www.petiteadventurefilms.com/proposals/rich-text-public/v2'
public['title']='Rich text public v2 review candidate — projection only'
for key in ['inline','mark']:
 public['$defs'][key]['oneOf']=[r for r in public['$defs'][key]['oneOf'] if 'unresolved' not in r['$ref']]
for key in ['unresolvedImage','unresolvedAssetLink']:del public['$defs'][key]
for definition in public['$defs'].values():
 a=definition.get('properties',{}).get('attrs')
 if a:
  a['properties'].pop('sourceRef',None)
  a['required']=[x for x in a.get('required',[]) if x!='sourceRef']
  if not a['required']:definition['required']=[x for x in definition['required'] if x!='attrs']
(root/'rich-text-public-v2.candidate.schema.json').write_text(json.dumps(public,ensure_ascii=False,indent=2)+'\n')
