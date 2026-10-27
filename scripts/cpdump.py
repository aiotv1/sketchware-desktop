import sys, struct
def dump(path):
    d=open(path,'rb').read(); i=8
    n=struct.unpack('>H',d[i:i+2])[0]; i+=2; k=1; out=[]
    while k<n:
        t=d[i]; i+=1
        if t==1:
            l=struct.unpack('>H',d[i:i+2])[0]; out.append(d[i+2:i+2+l].decode('utf-8','replace')); i+=2+l
        elif t in (3,4): i+=4
        elif t in (5,6): i+=8; k+=1
        elif t in (7,8,16,19,20): i+=2
        elif t in (9,10,11,12,17,18): i+=4
        elif t==15: i+=3
        else: raise Exception('tag %d'%t)
        k+=1
    return out
for s in dump(sys.argv[1]): print(s)
