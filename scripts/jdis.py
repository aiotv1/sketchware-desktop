# Minimal JVM class disassembler (no execution of foreign code)
import sys, struct
OPS={}
def op(code,name,ln): OPS[code]=(name,ln)
names="""nop aconst_null iconst_m1 iconst_0 iconst_1 iconst_2 iconst_3 iconst_4 iconst_5 lconst_0 lconst_1 fconst_0 fconst_1 fconst_2 dconst_0 dconst_1""".split()
for i,n in enumerate(names): op(i,n,1)
op(16,'bipush',2);op(17,'sipush',3);op(18,'ldc',2);op(19,'ldc_w',3);op(20,'ldc2_w',3)
for i,n in enumerate('iload lload fload dload aload'.split()): op(21+i,n,2)
for i in range(20): op(26+i,['iload','lload','fload','dload','aload'][i//4]+'_%d'%(i%4),1)
for i,n in enumerate('iaload laload faload daload aaload baload caload saload'.split()): op(46+i,n,1)
for i,n in enumerate('istore lstore fstore dstore astore'.split()): op(54+i,n,2)
for i in range(20): op(59+i,['istore','lstore','fstore','dstore','astore'][i//4]+'_%d'%(i%4),1)
for c in range(79,132): op(c,'op%d'%c,1)
op(132,'iinc',3)
for c in range(133,153): op(c,'op%d'%c,1)
for i,n in enumerate('ifeq ifne iflt ifge ifgt ifle if_icmpeq if_icmpne if_icmplt if_icmpge if_icmpgt if_icmple if_acmpeq if_acmpne goto jsr'.split()): op(153+i,n,3)
op(169,'ret',2)
op(172,'ireturn',1);op(173,'lreturn',1);op(174,'freturn',1);op(175,'dreturn',1);op(176,'areturn',1);op(177,'return',1)
op(178,'getstatic',3);op(179,'putstatic',3);op(180,'getfield',3);op(181,'putfield',3)
op(182,'invokevirtual',3);op(183,'invokespecial',3);op(184,'invokestatic',3);op(185,'invokeinterface',5);op(186,'invokedynamic',5)
op(187,'new',3);op(188,'newarray',2);op(189,'anewarray',3);op(190,'arraylength',1);op(191,'athrow',1)
op(192,'checkcast',3);op(193,'instanceof',3);op(194,'monitorenter',1);op(195,'monitorexit',1)
op(197,'multianewarray',4);op(198,'ifnull',3);op(199,'ifnonnull',3);op(200,'goto_w',5)
class CF:
    def __init__(s,path):
        d=s.d=open(path,'rb').read(); i=8
        n=struct.unpack('>H',d[i:i+2])[0]; i+=2; s.cp=[None]*n; k=1
        while k<n:
            t=d[i]; i+=1
            if t==1:
                l=struct.unpack('>H',d[i:i+2])[0]; s.cp[k]=('utf',d[i+2:i+2+l].decode('utf-8','replace')); i+=2+l
            elif t==3: s.cp[k]=('int',struct.unpack('>i',d[i:i+4])[0]); i+=4
            elif t==4: s.cp[k]=('float',struct.unpack('>f',d[i:i+4])[0]); i+=4
            elif t==5: s.cp[k]=('long',struct.unpack('>q',d[i:i+8])[0]); i+=8; k+=1
            elif t==6: s.cp[k]=('double',struct.unpack('>d',d[i:i+8])[0]); i+=8; k+=1
            elif t in (7,8,16,19,20): s.cp[k]=(t,struct.unpack('>H',d[i:i+2])[0]); i+=2
            elif t in (9,10,11,12,17,18): s.cp[k]=(t,)+struct.unpack('>HH',d[i:i+4]); i+=4
            elif t==15: s.cp[k]=(t,d[i],struct.unpack('>H',d[i+1:i+3])[0]); i+=3
            k+=1
        i+=6; ni=struct.unpack('>H',d[i:i+2])[0]; i+=2+2*ni
        s.i=i; s.fields=s.members(); s.methods=s.members()
    def u(s,k): return s.cp[k][1]
    def members(s):
        d=s.d; i=s.i; n=struct.unpack('>H',d[i:i+2])[0]; i+=2; out=[]
        for _ in range(n):
            acc,ni,di,na=struct.unpack('>HHHH',d[i:i+8]); i+=8; attrs={}
            for _ in range(na):
                an,al=struct.unpack('>HI',d[i:i+6]); attrs[s.u(an)]=d[i+6:i+6+al]; i+=6+al
            out.append((s.u(ni),s.u(di),attrs))
        s.i=i; return out
    def const(s,k):
        e=s.cp[k]
        if e[0]==8: return repr(s.u(e[1]))
        if e[0]==7: return 'class '+s.u(e[1])
        if e[0] in ('int','float','long','double'): return str(e[1])
        if e[0] in (9,10,11):
            c=s.u(s.cp[e[1]][1]); nt=s.cp[e[2]]; return '%s.%s%s'%(c,s.u(nt[1]),s.u(nt[2]))
        if e[0]==18:
            nt=s.cp[e[2]]; return 'indy %s%s'%(s.u(nt[1]),s.u(nt[2]))
        return str(e)
    def dis(s,code):
        ml=struct.unpack('>I',code[4:8])[0]; c=code[8:8+ml]; pc=0; out=[]
        while pc<len(c):
            o=c[pc]
            if o==170:
                p=(pc+4)&~3; df,lo,hi=struct.unpack('>iii',c[p:p+12]); tg=struct.unpack('>%di'%(hi-lo+1),c[p+12:p+12+4*(hi-lo+1)])
                out.append((pc,'tableswitch',{'default':pc+df,'cases':{lo+j:pc+t for j,t in enumerate(tg)}})); pc=p+12+4*(hi-lo+1); continue
            if o==171:
                p=(pc+4)&~3; df,np_=struct.unpack('>ii',c[p:p+8]); pr=struct.unpack('>%di'%(2*np_),c[p+8:p+8+8*np_])
                out.append((pc,'lookupswitch',{'default':pc+df,'cases':{pr[2*j]:pc+pr[2*j+1] for j in range(np_)}})); pc=p+8+8*np_; continue
            if o==196:
                o2=c[pc+1]; ln=6 if o2==132 else 4; out.append((pc,'wide',None)); pc+=ln; continue
            name,ln=OPS[o]; arg=None
            if name in('ldc',): arg=s.const(c[pc+1])
            elif name in('ldc_w','ldc2_w','getstatic','putstatic','getfield','putfield','invokevirtual','invokespecial','invokestatic','invokeinterface','invokedynamic','new','anewarray','checkcast','instanceof'):
                arg=s.const(struct.unpack('>H',c[pc+1:pc+3])[0])
            elif name=='bipush': arg=struct.unpack('>b',c[pc+1:pc+2])[0]
            elif name=='sipush': arg=struct.unpack('>h',c[pc+1:pc+3])[0]
            elif ln==3 and (name.startswith('if') or name=='goto'): arg=pc+struct.unpack('>h',c[pc+1:pc+3])[0]
            elif ln==2: arg=c[pc+1]
            elif name=='iinc': arg=(c[pc+1],struct.unpack('>b',c[pc+2:pc+3])[0])
            out.append((pc,name,arg)); pc+=ln
        return out
if __name__=='__main__':
    cf=CF(sys.argv[1]); want=sys.argv[2] if len(sys.argv)>2 else None
    for n,dsc,a in cf.methods:
        if want and n!=want: continue
        print('### %s%s'%(n,dsc))
        if 'Code' in a:
            for pc,nm,arg in cf.dis(a['Code']): print('%5d %s %s'%(pc,nm,'' if arg is None else arg))
