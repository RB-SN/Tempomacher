import math,datetime as D,random
def gpx(segs,path,seed=1):
    # segs: list of (seconds, pace sec/km, hr)
    random.seed(seed);t=D.datetime(2026,11,16,15,0,0);lat,lon=47.17,8.50;s=[]
    for sec,p,hr in segs:
        for i in range(int(sec)):
            v=1000/p*(1+random.uniform(-.03,.03));lat+=v/111320;t+=D.timedelta(seconds=1)
            s.append(f'<trkpt lat="{lat:.7f}" lon="{lon:.7f}"><ele>420</ele><time>{t.isoformat()}Z</time><extensions><ns3:TrackPointExtension><ns3:hr>{hr}</ns3:hr></ns3:TrackPointExtension></extensions></trkpt>')
    open(path,'w').write('<?xml version="1.0"?><gpx xmlns="http://www.topografix.com/GPX/1/1" xmlns:ns3="x"><trk><type>running</type><trkseg>'+''.join(s)+'</trkseg></trk></gpx>')
iv=[(600,330,135)]
for k in range(6):iv+= [(220,220,172),(120,370,145)]
iv+=[(600,330,135)]
gpx(iv,'/tmp/gpx/iv6.gpx')
iv5=[(600,330,135)]
for k in range(5):iv5+= [(220,220,172),(120,370,145)]
iv5+=[(600,330,135)]
gpx(iv5,'/tmp/gpx/iv5.gpx')
gpx([(900,330,135),(1500,245,165),(600,330,140)],'/tmp/gpx/mp.gpx')
gpx([(2400,320,138)],'/tmp/gpx/easy.gpx')
