import sys, json
sys.path.insert(0, __import__('os').path.dirname(__file__))
from jdis import CF
def push_val(nm,arg):
    if nm.startswith('iconst_'): return -1 if nm=='iconst_m1' else int(nm[7:])
    if nm in('bipush','sipush'): return arg
    return None
def extract(path):
    cf=CF(path); res={}
    for n,dsc,a in cf.methods:
        if 'Code' not in a: continue
        ins=cf.dis(a['Code']); idx={pc:i for i,(pc,_,_) in enumerate(ins)}
        m={}
        for i in range(len(ins)-4):
            if ins[i][1] in('ldc','ldc_w') and 'String.equals' in str(ins[i+1][2]) and ins[i+2][1]=='ifeq':
                v=push_val(ins[i+3][1],ins[i+3][2])
                if v is not None: m[eval(ins[i][2])]=v
        ts=[x for x in ins if x[1]=='tableswitch']
        if not m or not ts: continue
        t=ts[-1][2]; out={}
        for s,v in m.items():
            tgt=t['cases'].get(v,t['default']); j=idx[tgt]; seq=[]
            while j<len(ins):
                pc,nm,arg=ins[j]
                if nm in('goto','areturn','return','athrow','tableswitch','lookupswitch'):
                    if nm=='goto': seq.append(('goto',arg))
                    break
                if nm in('ldc','ldc_w'): seq.append(eval(arg) if arg.startswith("'") or arg.startswith('"') else arg)
                j+=1
            out[s]=seq
        res[n+dsc]=out
    return res
if __name__=="__main__": print(json.dumps(extract(sys.argv[1]),indent=0,ensure_ascii=False))
