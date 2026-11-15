/* ---- personal bests ---- */
const PBD=[[5,'5 km'],[10,'10 km'],[21.0975,'Halbmarathon'],[42.195,'Marathon']];
const dkey=d=>Math.round(d*10)/10;
function distLabel(d){const k=dkey(d);return k===21.1?'Halbmarathon':k===42.2?'Marathon':fk(k)+' km'}
