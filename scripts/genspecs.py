import sys, json, re, os
sys.path.insert(0, os.path.dirname(__file__))
from jdis import CF
import importlib; sx = importlib.import_module('switchx')
REF='D:/sketchware-desktop/ref'
xb=CF(REF+'/jars/a.a.a-notimportant-classes/a/a/a/xB.class')
order=[]
for n,d,a in xb.methods:
    if n=='a' and d=='(Landroid/content/Context;)V':
        ins=xb.dis(a['Code']); last=None
        for pc,nm,arg in ins:
            if nm in('ldc','ldc_w') and arg.startswith("'"): last=eval(arg)
            if nm=='invokevirtual' and 'a/a/a/xB.b(Landroid/content/Context;Ljava/lang/String;)V' in arg: order.append(('block',last))
            if nm=='invokevirtual' and 'a/a/a/xB.c(Landroid/content/Context;Ljava/lang/String;)V' in arg: order.append(('event',last))
lq=sx.extract(REF+'/jars/a.a.a-important-classes/a/a/a/lq.class')
def strip(v): return [x for x in (v or []) if isinstance(x,str)]
A=lq['a(Ljava/lang/String;)Ljava/util/ArrayList;']; B=lq['b(Ljava/lang/String;)Ljava/util/ArrayList;']
C=lq['c(Ljava/lang/String;)Ljava/lang/String;']; D=lq['d(Ljava/lang/String;)Ljava/lang/String;']
xml=open(REF+'/Sketchware-Pro/app/src/main/res/values/block_strings.xml',encoding='utf8').read()
S={}
for m in re.finditer(r'<string name="([^"]+)"[^>]*>(.*?)</string>',xml,re.S):
    v=m.group(2).replace("\'","'").replace('\\"','"').replace('&lt;','<').replace('&gt;','>').replace('&amp;','&')
    S[m.group(1)]=v
def build(key,params):
    n=len(params); cnt=n-1 if n>1 else 0
    s=S.get(key+'_head','')
    out=s
    if n>0:
        if out: out+=' '
        out+=params[0]
    for i in range(1,cnt+1):
        body=S.get(key+'_body_%d'%i,'')
        if body: out+=' '+body
        if out: out+=' '
        out+=params[i]
    tail=S.get(key+'_tail','')
    if out and tail: out+=' '
    out+=tail
    return out
blocks={}; events={}
for kind,name in order:
    if kind=='block':
        p=strip(A.get(name)); d=strip(D.get(name)); key='block_'+(d[0] if d else '')
        blocks[name]=build(key,p)
        if not blocks[name] and 'block_'+name+'_head' in S: blocks[name]=build('block_'+name,p)
    else:
        p=strip(B.get(name)); c=strip(C.get(name)); key='root_spec_'+(c[0] if c else '')
        events[name]=build(key,p)
json.dump({'blocks':blocks,'events':events},open(sys.argv[1],'w',encoding='utf8'),indent=1,ensure_ascii=False)
print(len(blocks),len(events))
for k in ['setText','if','ifElse','repeat','+','random','doToast','intentPutExtra','mapPut','addListMap','stringSub','timerAfter','viewOnClick']: print(k,'=>',blocks.get(k))
for k in list(events)[:8]+['onClick','onItemClicked','onBindCustomView']: print('EV',k,'=>',events.get(k))
