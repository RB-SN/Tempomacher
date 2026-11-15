# joins src/ into the single-file app (tempomacher.html); order of the JS parts = file name order
import os
R='/home/claude/src/';J=R+'js/'
js=''.join(open(J+f).read() for f in sorted(os.listdir(J)) if f.endswith('.js'))
out=open(R+'shell-top.html').read()+open(R+'style.css').read()+open(R+'shell-mid.html').read()+js+open(R+'shell-end.html').read()
open('/home/claude/tempomacher.html','w').write(out)
