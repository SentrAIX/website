/* ===== js/core/icons.js ===== */
/* ---------- UI icons (simple, 24px, used only in UI chrome) ---------- */
const IC = {
  check:'<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  chev:'<path d="m6 9 6 6 6-6"/>',
  left:'<path d="m15 5-7 7 7 7"/>', right:'<path d="m9 5 7 7-7 7"/>',
  ext:'<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  dash:'<path d="M6 12h12"/>', copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
  search:'<circle cx="10.5" cy="10.5" r="6.2"/><path d="m15.2 15.2 5.3 5.3"/>'
};
const icon = (n) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n]||''}</svg>`;
const tickBox = () => `<span class="tick">${icon('check')}</span>`;
const special = (t) => `<p class="special">${tickBox()}<span>${t}</span></p>`;


/* ===== js/art/sketch-helpers.js ===== */
/* ---------- hand-drawn helpers ---------- */
let _seed = 7;
const rnd = () => { _seed = (_seed * 16807) % 2147483647; return (_seed - 1) / 2147483646; };
const j = (a=1.4) => +((rnd() - .5) * 2 * a).toFixed(1);
let _dly = 0;
const dly = (step=.07) => { const v = _dly; _dly = Math.min(_dly + step, 2.4); return v.toFixed(2); };
const P = (d, cls='ink', anim=true, extra='') => `<path d="${d}" class="${cls}${anim?' draw':''}" pathLength="100" ${anim?`style="--d:${dly()}s"`:''} ${extra}/>`;
/* pencil double stroke: a confident line plus a faint second pass */
const PP = (d, cls='ink') => P(d, cls) + `<path d="${d}" class="ink2" transform="translate(${j(1.2)} ${j(1.2)})"/>`;
const wl = (x1,y1,x2,y2,a=2) => `M${x1} ${y1} Q${((x1+x2)/2+j(a)).toFixed(1)} ${((y1+y2)/2+j(a)).toFixed(1)} ${x2} ${y2}`;
const rr = (x,y,w,h,r=8) => { const o=()=>j(1.2); return `M${x+r} ${y+o()} L${x+w-r+o()} ${y+o()} Q${x+w} ${y} ${x+w+o()} ${y+r} L${x+w+o()} ${y+h-r} Q${x+w} ${y+h} ${x+w-r} ${y+h+o()} L${x+r+o()} ${y+h+o()} Q${x} ${y+h} ${x+o()} ${y+h-r} L${x+o()} ${y+r+2} Q${x+1} ${y-1} ${x+r+4} ${y+1}`; };
const circ = (cx,cy,r,turn=1.08) => { let d='', n=22; for (let i=0;i<=n;i++){ const a=-1.9+(i/n)*Math.PI*2*turn, rr2=r*(1+(rnd()-.5)*.06); const x=(cx+Math.cos(a)*rr2).toFixed(1), y=(cy+Math.sin(a)*rr2).toFixed(1); d+= (i?' L':'M')+x+' '+y; } return d; };
const scrib = (x,y,w,lines=3,gap=12) => { let d=''; for(let i=0;i<lines;i++){ const ww=w*(i==lines-1?.6:.85+rnd()*.15); d+=` M${x} ${y+i*gap} Q${x+ww*.3} ${y+i*gap-2} ${x+ww*.55} ${y+i*gap} T${x+ww} ${y+i*gap}`;} return d; };
const T = (x,y,s,size=22,cls='',rot=0,anchor='start') => `<text x="${x}" y="${y}" font-size="${size}" class="appear ${cls}" style="--d:${dly(.05)}s" text-anchor="${anchor}" ${rot?`transform="rotate(${rot} ${x} ${y})"`:''}>${s}</text>`;
const tick = (x,y,s=1) => `<g transform="translate(${x} ${y}) scale(${s})">${P(circ(0,0,15),'okline')}${P('M-7 0 L-2 6 L8 -6','okline')}</g>`;
const cross = (x,y,s=1) => `<g transform="translate(${x} ${y}) scale(${s})">${P('M-8 -8 L8 8','red')}${P('M8 -8 L-8 8','red')}</g>`;
const arrowTo = (d,cls='ink') => P(d,cls) ;
const head = (x,y,ang=0,cls='ink') => `<path d="M-9 -6 L0 0 L-9 6" class="${cls}" transform="translate(${x} ${y}) rotate(${ang})"/>`;
const sk = (vb, inner, label, extra='') => { return `<svg class="sketch" viewBox="${vb}" ${label?`role="img" aria-label="${label}"`:'aria-hidden="true"'} ${extra}><g filter="url(#rough)">${inner}</g></svg>`; };
const start = (seed) => { _seed = seed; _dly = 0; };

/* browser window frame */
const browser = (x,y,w,h,label='') => `${P(rr(x,y,w,h,10))}<path d="${rr(x,y,w,h,10)}" class="paper" style="opacity:.0"/>${P(wl(x+4,y+24,x+w-4,y+24,1.5),'ink thin')}${['','',''].map((_,i)=>`<circle cx="${x+14+i*11}" cy="${y+12}" r="2.6" class="navyfill appear" style="--d:${dly(.02)}s"/>`).join('')}${label?T(x+w/2,y+h/2+6,label,24,'',0,'middle'):''}`;

/* the TestAIx buddy: a little browser-window character */


/* ===== js/art/characters.js ===== */
function buddy(x,y,s=1,o={}) {
  const legs = o.walk ? `<g class="sway" style="animation-duration:.55s">${'<path d="M-5 -18 L-9 0 M-9 0 L-14 0" class="ink"/>'}</g><g class="sway" style="animation-duration:.55s;animation-delay:-.27s">${'<path d="M5 -18 L9 0 M9 0 L14 0" class="ink"/>'}</g>`
    : `<path d="M-5 -18 L-8 0 M-8 0 L-13 0 M5 -18 L8 0 M8 0 L13 0" class="ink"/>`;
  const arms = o.wave ? `<path d="M-10 -36 L-22 -26" class="ink"/><g class="sway" style="transform-origin:10px -36px;animation-duration:1s"><path d="M10 -36 L22 -54" class="ink"/></g>`
    : o.flag ? `<path d="M-10 -36 L-22 -26 M10 -36 L22 -46" class="ink"/><path d="M22 -46 L22 -80" class="ink"/><path d="M22 -80 L44 -74 L22 -66" class="red" style="fill:var(--pencil-soft)"/>`
    : o.clip ? `<path d="M-10 -36 L-18 -24 M10 -36 L18 -26" class="ink"/><path d="${rr(12,-40,22,28,3)}" class="ink" style="fill:#fff"/><path d="M16 -32 h14 M16 -26 h10 M16 -20 h12" class="ink thin"/>`
    : o.mag ? `<path d="M-10 -36 L-20 -26 M10 -36 L24 -30" class="ink"/><circle cx="32" cy="-36" r="8" class="ink" style="fill:rgba(255,255,255,.6)"/><path d="M27 -30 L22 -25" class="ink thick"/>`
    : `<path d="M-10 -36 L-22 -26 M10 -36 L22 -26" class="ink"/>`;
  return `<g transform="translate(${x} ${y}) scale(${s})"><g class="${o.walk?'bob':''}" style="animation-duration:.55s">
    ${legs}
    <path d="M-10 -42 Q-11 -30 -9 -19 Q0 -16 9 -19 Q11 -30 10 -42 Z" class="ink hatch" style="fill:url(#hatch)"/>
    ${arms}
    <path d="${rr(-24,-80,48,38,8)}" class="ink" style="fill:#fff"/>
    <path d="M-22 -71 L22 -71" class="ink thin"/>
    <circle cx="-17" cy="-75.5" r="1.6" style="fill:#1E293B"/><circle cx="-12" cy="-75.5" r="1.6" style="fill:#1E293B"/><circle cx="-7" cy="-75.5" r="1.6" style="fill:#1E293B"/>
    <ellipse cx="-8" cy="-58" rx="2.3" ry="3.2" class="eye" style="fill:#1E293B"/><ellipse cx="8" cy="-58" rx="2.3" ry="3.2" class="eye" style="fill:#1E293B"/>
    <path d="${o.worried?'M-6 -48 Q0 -52 6 -48':'M-7 -51 Q0 -45 7 -51'}" class="ink"/>
  </g></g>`;
}

/* a person, drawn loosely */
function person(x,y,s=1,o={}) {
  const hair = o.hair==='long' ? '<path d="M-14 -122 Q-16 -138 0 -140 Q16 -138 15 -122 Q16 -110 14 -102" class="ink"/>'
    : o.hair==='bun' ? '<path d="M-13 -124 Q-10 -139 4 -137 Q15 -134 13 -122" class="ink"/><circle cx="2" cy="-142" r="6" class="ink" style="fill:#fff"/>'
    : '<path d="M-13 -122 Q-12 -137 1 -138 Q14 -137 14 -124 Q8 -130 -2 -128 Q-9 -127 -13 -122" class="ink hatch" style="fill:url(#hatch)"/>';
  let arms = '<path d="M-18 -98 Q-26 -78 -22 -60 M18 -98 Q26 -78 22 -60" class="ink"/>';
  let prop = '';
  if (o.mug) { arms = '<path d="M-18 -98 Q-26 -78 -22 -60 M18 -98 Q30 -86 26 -76" class="ink"/>'; prop = `<path d="${rr(24,-86,14,15,3)}" class="ink" style="fill:#fff"/><path d="M38 -82 q6 1 0 7" class="ink thin"/><path d="M29 -92 q-3 -5 1 -9 M34 -92 q-3 -5 1 -9" class="ink thin steam"/>`; }
  if (o.laptop) { arms = '<path d="M-18 -98 Q-24 -82 -16 -74 M18 -98 Q24 -82 16 -74" class="ink"/>'; prop = `<path d="M-30 -74 L26 -74 L34 -96 L-22 -96 Z" class="ink" style="fill:#fff"/><path d="M-36 -74 L32 -74" class="ink thick"/><text x="-8" y="-80" font-size="12" class="ui" style="fill:var(--primary)">&lt;/&gt;</text>`; }
  if (o.mag) { arms = '<path d="M-18 -98 Q-26 -78 -22 -60 M18 -98 Q30 -96 34 -110" class="ink"/>'; prop = `<circle cx="42" cy="-122" r="12" class="ink" style="fill:rgba(255,255,255,.6)"/><path d="M35 -113 L30 -106" class="ink thick"/>`; }
  if (o.point) { arms = '<path d="M-18 -98 Q-26 -78 -22 -60 M18 -98 Q34 -104 46 -112" class="ink"/>'; }
  if (o.headset) prop += '<path d="M-15 -122 Q0 -142 15 -122" class="ink"/><path d="M-16 -120 v8 M16 -120 v8 Q14 -104 4 -104" class="ink"/>';
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <circle cx="0" cy="-120" r="14" class="ink" style="fill:#fff"/>${hair}
    ${o.glasses?'<circle cx="-5" cy="-120" r="3.5" class="ink thin"/><circle cx="6" cy="-120" r="3.5" class="ink thin"/><path d="M-1.5 -120 h4" class="ink thin"/>':'<circle cx="-5" cy="-120" r="1.5" style="fill:#1E293B"/><circle cx="5" cy="-120" r="1.5" style="fill:#1E293B"/>'}
    <path d="M-4 -112 Q0 -110 4 -112" class="ink thin"/>
    <path d="M-18 -100 Q0 -106 18 -100 L21 -54 L-21 -54 Z" class="ink" style="fill:${o.shirt||'#fff'}"/>
    ${arms}
    <path d="M-12 -54 L-14 -4 M12 -54 L14 -4 M-14 -4 L-22 -2 M14 -4 L22 -2" class="ink"/>
    ${prop}
  </g>`;
}
function bug(x,y,s=1,red=true){ const c=red?'red':'ink'; return `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="0" rx="9" ry="12" class="${c}" style="fill:${red?'var(--pencil-soft)':'#fff'}"/><path d="M0 -12 V12 M-9 -4 h-7 M9 -4 h7 M-9 4 h-7 M9 4 h7 M-8 -10 l-5 -6 M8 -10 l5 -6" class="${c}"/></g>`; }


/* ===== js/art/illustrations.js ===== */
/* ---------- illustrations ---------- */
const ART = {};

ART.hero = () => { start(11);
  const sx=[60,330,600,870], labels=['Sign up','Pick a plan','Pay $49','Dashboard'];
  return sk('0 0 1160 400', `
    ${sx.map((x,i)=>`<g>${browser(x,40,200,150)}${T(x+18,96,labels[i],26)}${P(scrib(x+18,124,i==3?90:150,i==3?1:3,14),'ink thin')}</g>`).join('')}
    <path d="${rr(888,138,104,30,14)}" class="ink" style="fill:var(--pencil-soft)"/>
    <text x="900" y="159" font-size="16" class="ui" style="fill:var(--primary)">Plan: Free</text>
    <path d="M110 362 C 300 354, 420 370, 560 360 S 820 354, 1010 364" class="ink2" style="stroke-dasharray:4 9;opacity:.8;stroke-width:2"/>
    <g class="stamp" style="animation-name:st1">${tick(250,52)}</g>
    <g class="stamp" style="animation-name:st2">${tick(520,52)}</g>
    <g class="stamp" style="animation-name:st3">${tick(790,52)}</g>
    <g class="walker" style="offset-path:path('M160 360 L 960 360')">${buddy(0,0,1.75,{walk:1,mag:1})}</g>
    <path d="M876 128 C 860 160, 910 184, 960 180 C 1010 178, 1022 146, 992 128 C 960 110, 900 118, 884 134" class="red ring" pathLength="100"/>
    <g class="late">
      <path d="M1000 120 Q 1030 96 1046 80" class="red"/><path d="M1038 82 L1047 79 L1046 89" class="red"/>
      <text x="1010" y="64" font-size="27" class="red-t" transform="rotate(-4 1010 64)">paid, but still Free?</text>
    </g>
    <g class="later">
      ${person(1086,400,1.05,{mug:1,glasses:1})}
      <path d="${rr(970,236,150,54,14)}" class="ink" style="fill:#fff"/><path d="M1060 290 L1068 304 L1074 290" class="ink" style="fill:#fff"/>
      <text x="984" y="270" font-size="23">holding the release</text>
    </g>
  `, 'The TestAIx buddy walks a signup, plan, payment and dashboard journey. It checks the first three steps, then circles a dashboard that still shows the Free plan. An engineer holds the release.');
};

ART.gaps = () => { start(21); return sk('0 0 640 420', `
  ${browser(30,60,230,170)}${T(50,116,'Payment',26)}${P(scrib(50,144,170,3,16),'ink thin')}
  ${browser(380,60,230,170)}${T(400,116,'Your account',26)}${P(scrib(400,144,150,2,16),'ink thin')}
  ${P('M262 150 C 300 130, 340 170, 378 150','ink')}${head(378,150,0)}
  ${tick(150,262,.9)}${tick(500,262,.9)}
  ${T(105,306,'unit tests',22)}${T(455,306,'unit tests',22)}
  <path d="M300 250 L312 290 L298 316 L312 350" class="red draw" pathLength="100" style="--d:1s"/>
  ${bug(322,214,1.3)}
  ${T(240,400,'the bug lives in the handoff',28,'red-t',-2)}
`, 'Two screens, payment and account, each passing their own unit tests, with a bug hiding in the handoff between them'); };

ART.eng = () => { start(31); return sk('0 0 560 400', `
  ${person(150,370,1.35,{laptop:1,glasses:1})}
  ${buddy(390,370,1.5,{clip:1})}
  ${T(330,120,'regression run',24)}${T(330,150,'42 of 42 journeys',24)}
  ${P('M330 160 Q 360 170 380 196','ink thin')}
  ${T(60,60,'merged at 4:55 pm',22,'',-3)}${P('M150 70 Q 160 100 150 130','ink thin')}
`, 'An engineer with a laptop next to the TestAIx buddy holding a clipboard showing a full regression run passing'); };

ART.qa = () => { start(41); return sk('0 0 560 400', `
  ${person(170,370,1.35,{mag:1,hair:'bun'})}
  ${P('M260 120 Q 330 120 360 80','ink')}${P('M260 120 Q 330 130 380 150','ink')}${P('M260 120 Q 320 150 350 220','red')}
  ${T(372,74,'happy path',22)}${T(390,158,'retry',22)}${T(330,248,'card declined?',24,'red-t',-3)}
  ${buddy(470,370,1.2,{clip:1})}${T(420,300,'×200 reruns',22)}
`, 'A QA tester with a magnifying glass exploring an unusual path while the buddy handles two hundred reruns'); };

ART.product = () => { start(51); return sk('0 0 560 400', `
  ${P(rr(240,60,290,190,6))}
  ${[['sign up',80],['first value',130],['upgrade',180]].map(([t,y],i)=>`<path d="${rr(262,y-24,150,34,4)}" class="ink" style="fill:${i==2?'#FFF6D9':'#fff'}"/>${T(274,y,t,22)}${tick(450,y-8,.7)}`).join('')}
  ${T(250,44,'journeys we promised',22)}
  ${person(130,370,1.35,{point:1,hair:'long'})}
`, 'A product manager pointing at the journeys promised to customers, each one checked'); };

ART.lead = () => { start(61); return sk('0 0 560 400', `
  ${P('M280 110 L280 330','ink thick')}${P('M180 330 L380 330','ink thick')}${P('M150 150 L410 120','ink thick')}
  ${P('M150 150 L120 220 L190 220 Z','ink')}${P('M410 120 L380 190 L450 190 Z','ink')}
  ${T(124,246,'ship',26)}${T(386,214,'wait',26)}
  <path d="${rr(126,182,58,30,3)}" class="ink" style="fill:#fff"/><path d="${rr(132,170,58,30,3)}" class="ink" style="fill:#fff"/>
  ${T(140,192,'evidence',16)}
  ${T(300,380,'decide with the facts on the table',24,'',-1)}
  <circle cx="280" cy="104" r="7" class="navyfill"/>
`, 'A balance scale tipping toward ship because the evidence is on that side'); };

ART.support = () => { start(71); return sk('0 0 560 400', `
  ${person(140,370,1.35,{headset:1,hair:'long'})}
  ${[0,1,2].map(i=>`<path d="${rr(270+i*12,90+i*58,220,46,5)}" class="ink" style="fill:#fff"/>${T(286+i*12,120+i*58,'"I paid but..."',22)}${P(wl(276+i*12,113+i*58,480+i*12,113+i*58,3),'red')}`).join('')}
  ${T(300,300,'caught before customers saw it',23,'ok-t',-2)}
`, 'A support agent with a headset next to three crossed-out tickets that never arrived'); };

ART.sec = () => { start(81); return sk('0 0 560 400', `
  ${P('M60 330 L500 330','ink')}
  ${[80,130,180,230,280,330,380,430,480].map(x=>P(`M${x} 330 L${x} 230`,'ink')).join('')}
  ${P('M70 260 L490 260 M70 300 L490 300','ink thin')}
  ${buddy(280,322,1.2)}
  <path d="${rr(330,140,170,60,6)}" class="ink" style="fill:#fff"/>${T(346,178,'staging only',24)}${P('M400 200 L404 230','ink')}
  ${T(60,120,'test logins only',22,'',-2)}${T(60,152,'no deletes',22,'red-t',-2)}
`, 'The buddy working inside a fence with signs saying staging only, test logins only and no deletes'); };

/* how-it-works slides, drawn for the navy panel */
ART.s1 = () => { start(91); return sk('0 0 520 340', `
  ${browser(30,40,300,170)}${T(50,98,'staging.yourapp.com',22)}
  ${P('M330 130 C 380 130, 380 220, 410 230','ink')}
  ${buddy(440,300,1.3,{wave:1})}
  ${T(40,260,'staging only',22)}${tick(190,252,.6)}
  ${T(40,296,'test cards only',22)}${tick(210,288,.6)}
  ${T(40,330,'delete things',22)}${cross(190,322,.7)}
`, 'A browser pointed at a staging URL, connected to the buddy, with scope rules'); };
ART.s2 = () => { start(101); const N=[[260,50],[120,130],[260,140],[400,130],[70,230],[190,240],[330,240],[450,230]]; const E=[[0,1],[0,2],[0,3],[1,4],[1,5],[2,6],[3,7]];
  return sk('0 0 520 340', `${E.map(([a,b])=>P(wl(N[a][0],N[a][1],N[b][0],N[b][1],6),'ink thin')).join('')}${N.map(([x,y],i)=>P(circ(x,y,i==5?20:16),i==5?'red':'ink')).join('')}${buddy(420,330,1)}${T(60,320,'11 pages, 38 tests drafted',24)}`,'A hand-drawn map of app pages connected together, explored by the buddy'); };
ART.s3 = () => { start(111); return sk('0 0 520 340', `
  ${P('M60 220 C 60 120, 460 120, 460 220 C 460 300, 60 300, 60 220','ink')}
  <g class="walker" style="animation:lap 6s linear infinite;offset-path:path('M60 220 C 60 120, 460 120, 460 220 C 460 300, 60 300, 60 220')">${buddy(0,0,.9,{walk:1})}</g>
  ${T(200,226,'lap 37',30)}${T(40,60,'every journey, every night',24)}
`, 'The buddy running laps around a track, rerunning journeys'); };
ART.s4 = () => { start(121); return sk('0 0 520 340', `
  ${[0,1,2].map(i=>`<path d="${rr(40+i*150,40,130,96,5)}" class="ink" style="fill:#2A3850"/>${P(scrib(56+i*150,74,90,2,18),'ink thin')}`).join('')}
  ${P(circ(405,88,74),'red')}
  ${person(130,330,1,{glasses:1})}${person(250,330,1,{point:1,hair:'long'})}
  ${T(330,210,'that one. why?',28,'red-t',-3)}
`, 'Two teammates reviewing screenshots from a run, one circled in red'); };

ART.price = () => { start(131); return sk('0 0 560 420', `
  ${P('M280 20 L280 70','ink')}
  <path d="M220 70 L340 70 L370 100 L340 160 L220 160 L190 100 Z" class="ink" style="fill:#fff"/>
  <circle cx="210" cy="100" r="5" class="ink"/>
  <text x="232" y="118" font-size="34" class="ui" style="fill:var(--primary)">$299</text><text x="236" y="144" font-size="16" class="ui" style="fill:var(--text-2)">a month</text>
  ${[60,120,180,240,300,360,420,480].map((x,i)=>person(x,400,.78,{hair:['long','bun','short'][i%3],glasses:i%4==1,mug:i==6})).join('')}
  ${T(330,200,'the whole team, same price',26,'red-t',-3)}
`, 'One price tag hanging over a row of eight teammates'); };

ART.saas = () => { start(141); return sk('0 0 420 260', `${P('M80 180 Q40 180 44 140 Q48 106 86 110 Q94 60 150 64 Q196 30 246 70 Q300 60 310 110 Q356 112 352 150 Q348 182 310 180 Z')}${buddy(200,170,.9)}${T(210,232,'we run it for you',24,'',0,'middle')}`,'A cloud with the buddy inside'); };
ART.azure = () => { start(151); return sk('0 0 420 260', `${P(rr(40,40,340,160,10))}${T(56,74,'your Azure',22)}${buddy(150,180,.9)}${P(rr(240,110,110,60,6))}${T(254,148,'your app',22)}${P('M184 150 L238 142','ink thin')}${T(210,236,'it runs next to your app',24,'',0,'middle')}`,'A box labeled your Azure containing the buddy and your app'); };

ART.wave = () => { start(161); return sk('0 0 300 260', `${buddy(120,250,2.6,{flag:1})}${T(150,30,'start with one journey',26,'',-4,'middle')}`,'The buddy holding a flag'); };
ART.pin = () => { start(171); return sk('0 0 560 380', `
  ${P('M40 300 C 140 260, 200 320, 300 280 S 460 240, 520 270','ink thin')}${P('M60 200 C 160 170, 260 220, 360 180 S 480 150, 520 170','ink thin')}
  <path d="M260 230 C 230 196, 222 180, 222 162 A38 38 0 0 1 298 162 C 298 180, 290 196, 260 230 Z" class="ink" style="fill:var(--pencil-soft)"/>${P(circ(260,160,12),'ink')}
  ${T(310,140,'Aurora, Illinois',28)}${T(310,172,'est. 2025',24)}${buddy(420,330,1.1,{wave:1})}
`, 'A map pin on Aurora, Illinois, with the buddy waving'); };
ART.chat = () => { start(181); return sk('0 0 560 380', `
  <path d="${rr(30,40,330,90,18)}" class="ink" style="fill:#fff"/><path d="M80 130 L70 156 L110 130" class="ink" style="fill:#fff"/>${T(52,94,'does this replace our testers?',24)}
  <path d="${rr(170,180,360,90,18)}" class="ink" style="fill:#EDF0F6"/><path d="M470 270 L490 296 L440 270" class="ink" style="fill:#EDF0F6"/>${T(192,234,'no. it gives them their time back.',24)}
  ${buddy(500,370,.9)}
`, 'Two speech bubbles: a question about replacing testers and the answer no'); };
ART.paper = (word='plain words') => { start(191); return sk('0 0 560 380', `
  <path d="${rr(150,30,260,320,6)}" class="ink" style="fill:#fff"/>${P(scrib(180,90,190,8,26),'ink thin')}
  ${P(circ(360,280,46),'red')}${T(360,288,word,22,'red-t',-12,'middle')}
`, 'A page of text with a red stamp'); };
ART.plane = () => { start(201); return sk('0 0 560 380', `
  ${P('M40 320 C 140 300, 120 220, 220 230 S 320 160, 380 120','ink2')}
  <path d="M380 120 L500 70 L440 170 L420 136 Z" class="ink" style="fill:#fff"/>${P('M420 136 L500 70','ink thin')}
  ${T(60,90,'tell us which journey keeps',24,'',-2)}${T(60,122,'you up before a release',24,'',-2)}
`, 'A paper airplane carrying a message'); };
ART.team = () => { start(211); return sk('0 0 560 380', `
  ${person(110,360,1.15,{laptop:1})}${person(230,360,1.15,{mag:1,hair:'bun'})}${person(350,360,1.15,{point:1,hair:'long'})}${person(470,360,1.15,{mug:1,glasses:1})}
  ${T(120,70,'eng',24)}${T(220,70,'QA',24)}${T(336,70,'product',24)}${T(450,70,'leadership',24)}
  ${P('M120 80 Q 280 30 470 80','ink thin')}
`, 'Engineering, QA, product and leadership side by side'); };

ART.handoff = () => { start(221); return sk('0 0 560 300', `
  ${buddy(110,270,1.6,{clip:1})}
  ${P('M190 170 C 250 120, 330 120, 380 160')}<path d="M370 150 L382 162 L366 168" class="ink"/>
  ${T(240,110,'here is what happened',24)}
  ${person(450,280,1.25,{mug:1,glasses:1})}
  ${T(330,40,'and here is my call',24,'red-t',-3)}
`, 'The buddy hands a clipboard of evidence to a teammate, who makes the call'); };

/* ---------- hero stage: hand-drawn journey driven by the run card ---------- */
ART.heroStage = () => { start(301);
  const X=[30,210,390,570], Y=[86,56,86,56], L=['Sign up','Pick a plan','Pay $49','Dashboard'];
  return sk('0 38 760 374', `
    <path d="M60 396 C 200 386, 300 402, 420 392 S 620 384, 730 396" class="ink2" style="stroke-dasharray:3 9;opacity:.9;stroke-width:2"/>
    ${X.map((x,i)=>`<g>${browser(x,Y[i],160,124)}${T(x+16,Y[i]+60,L[i],25)}${P(scrib(x+16,Y[i]+86,i==3?60:120,i==3?1:2,14),'ink thin')}</g>`).join('')}
    <path d="${rr(588,166,98,28,13)}" class="ink" style="fill:var(--pencil-soft)"/>
    <text x="600" y="185" font-size="14" class="ui" style="fill:#1E293B">Plan: Free</text>
    ${[0,1,2].map(i=>`<g class="hs-stamp" data-stamp="${i}">${tick(X[i]+150,Y[i]+4,.85)}</g>`).join('')}
    <path class="red hs-ring" pathLength="100" d="M576 156 C 560 188, 610 210, 662 206 C 710 202, 716 166, 684 152 C 650 136, 596 142, 582 160"/>
    <g class="hs-note"><path d="M548 238 Q 572 230 584 204" class="red"/><path d="M577 207 L585 201 L588 211" class="red"/><text x="544" y="250" font-size="26" class="red-t" text-anchor="end" transform="rotate(-3 544 250)">paid, still Free?</text></g>
    <g data-walker class="hs-walker">${buddy(110,396,1.7,{walk:1,mag:1})}</g>
  `, 'Illustration: the TestAIx buddy walks a signup, plan, payment and dashboard journey, ticks the first three steps and circles a dashboard that still shows the Free plan.');
};


/* ===== js/art/icon-set.js ===== */
/* ---------- duotone icon set: 32px grid, navy line on a warm tint, one accent ---------- */
const DI = {
  journey:'<path class="t" d="M5 24c4-9 9 1 13-6s8-7 9-12"/><circle class="t" cx="5" cy="24" r="3"/><circle class="t" cx="27" cy="6" r="3"/><path d="M5 24c4-9 9 1 13-6s8-7 9-12"/><circle cx="5" cy="24" r="3"/><circle class="a" cx="27" cy="6" r="3"/>',
  browser:'<rect class="t" x="4" y="6" width="24" height="20" rx="3"/><rect x="4" y="6" width="24" height="20" rx="3"/><path d="M4 11h24"/><circle class="a" cx="8" cy="8.5" r="1"/><path d="M9 17h8M9 21h12"/>',
  adapt:'<circle class="t" cx="16" cy="16" r="10"/><path d="M25 12a10 10 0 0 0-17-3M7 20a10 10 0 0 0 17 3"/><path d="M8 4v5h5M24 28v-5h-5"/><circle class="a" cx="16" cy="16" r="2.5"/>',
  evidence:'<rect class="t" x="4" y="9" width="24" height="17" rx="3"/><rect x="4" y="9" width="24" height="17" rx="3"/><path d="M11 9l2-3h6l2 3"/><circle cx="16" cy="17.5" r="4.5"/><circle class="a" cx="24" cy="13" r="1.3"/>',
  decide:'<path class="t" d="M9 15V8a2 2 0 0 1 4 0v6-9a2 2 0 0 1 4 0v9-7a2 2 0 0 1 4 0v8-4a2 2 0 0 1 4 0v8c0 5-4 9-9 9h-1c-4 0-6-2-8-5l-4-6a2 2 0 0 1 3-2l3 3"/><path d="M9 15V8a2 2 0 0 1 4 0v6-9a2 2 0 0 1 4 0v9-7a2 2 0 0 1 4 0v8-4a2 2 0 0 1 4 0v8c0 5-4 9-9 9h-1c-4 0-6-2-8-5l-4-6a2 2 0 0 1 3-2l3 3"/>',
  map:'<path class="t" d="M4 8l7-3 10 3 7-3v19l-7 3-10-3-7 3z"/><path d="M4 8l7-3 10 3 7-3v19l-7 3-10-3-7 3zM11 5v19M21 8v19"/><circle class="a" cx="16" cy="15" r="2"/>',
  play:'<rect class="t" x="4" y="5" width="24" height="22" rx="4"/><rect x="4" y="5" width="24" height="22" rx="4"/><path class="a" d="M13 11l8 5-8 5z"/>',
  bug:'<rect class="t" x="10" y="10" width="12" height="15" rx="6"/><rect x="10" y="10" width="12" height="15" rx="6"/><path d="M12 10a4 4 0 0 1 8 0M16 14v11M5 17h5M22 17h5M6 11l4 2M26 11l-4 2M6 24l4-2M26 24l-4-2"/><circle class="a" cx="26" cy="6" r="2"/>',
  report:'<path class="t" d="M8 4h12l6 6v18H8z"/><path d="M8 4h12l6 6v18H8zM20 4v6h6"/><path d="M12 22v-4M16 22v-7M20 22v-5"/><circle class="a" cx="12" cy="13" r="1.3"/>',
  shield:'<path class="t" d="M16 4l10 4v7c0 7-4 11-10 13-6-2-10-6-10-13V8z"/><path d="M16 4l10 4v7c0 7-4 11-10 13-6-2-10-6-10-13V8z"/><path class="a2" d="M11.5 16l3 3 6-6"/>',
  lock:'<rect class="t" x="6" y="14" width="20" height="14" rx="3"/><rect x="6" y="14" width="20" height="14" rx="3"/><path d="M10 14v-3a6 6 0 0 1 12 0v3"/><circle class="a" cx="16" cy="21" r="2"/>',
  card:'<rect class="t" x="3" y="8" width="26" height="17" rx="3"/><rect x="3" y="8" width="26" height="17" rx="3"/><path d="M3 13h26M8 20h6"/><circle class="a" cx="24" cy="20" r="1.6"/>',
  cart:'<path class="t" d="M7 9h21l-3 10H10z"/><path d="M3 5h4l3 14h15l3-10H8"/><circle cx="12" cy="25" r="2"/><circle class="a" cx="23" cy="25" r="2"/>',
  health:'<path class="t" d="M16 27S4 20 4 12a6 6 0 0 1 12-2 6 6 0 0 1 12 2c0 8-12 15-12 15z"/><path d="M16 27S4 20 4 12a6 6 0 0 1 12-2 6 6 0 0 1 12 2c0 8-12 15-12 15z"/><path class="a2" d="M8 15h4l2-4 3 7 2-3h5"/>',
  umbrella:'<path class="t" d="M3 15a13 13 0 0 1 26 0z"/><path d="M3 15a13 13 0 0 1 26 0zM16 15v9a3 3 0 0 1-6 0"/><circle class="a" cx="16" cy="4" r="1.3"/>',
  plane:'<path class="t" d="M4 17l8-2 8-10 3 1-4 9 7-1 2 3-9 3-4 9-3-1 1-8-7 0z"/><path d="M4 17l8-2 8-10 3 1-4 9 7-1 2 3-9 3-4 9-3-1 1-8-7 0z"/>',
  saas:'<rect class="t" x="4" y="5" width="24" height="7" rx="2"/><rect x="4" y="5" width="24" height="7" rx="2"/><rect x="4" y="14" width="24" height="7" rx="2"/><path d="M10 26h12"/><circle class="a" cx="8" cy="8.5" r="1.2"/><circle cx="8" cy="17.5" r="1.2"/>',
  bank:'<path class="t" d="M4 12L16 5l12 7z"/><path d="M4 12L16 5l12 7zM6 12v11M12 12v11M20 12v11M26 12v11M3 26h26"/><circle class="a" cx="16" cy="9" r="1.2"/>',
  people:'<circle class="t" cx="12" cy="11" r="5"/><circle cx="12" cy="11" r="5"/><path d="M3 27c1-5 5-8 9-8s8 3 9 8"/><circle cx="23" cy="10" r="3.5"/><path class="a2" d="M22 18c4 0 6 3 7 7"/>',
  code:'<rect class="t" x="3" y="6" width="26" height="20" rx="3"/><rect x="3" y="6" width="26" height="20" rx="3"/><path d="M12 13l-4 3 4 3M20 13l4 3-4 3"/><path class="a2" d="M17 12l-2 8"/>',
  chart:'<rect class="t" x="4" y="4" width="24" height="24" rx="3"/><path d="M4 28h24M8 22l6-6 4 3 8-9"/><circle class="a" cx="26" cy="10" r="2"/>',
  headset:'<path class="t" d="M6 18a10 10 0 0 1 20 0v5h-5v-7h5"/><path d="M6 18a10 10 0 0 1 20 0M6 17h5v8H6zM21 17h5v8h-5zM26 25c0 3-3 4-7 4"/><circle class="a" cx="17" cy="29" r="1.4"/>',
  calendar:'<rect class="t" x="4" y="7" width="24" height="21" rx="3"/><rect x="4" y="7" width="24" height="21" rx="3"/><path d="M4 13h24M10 4v6M22 4v6"/><circle class="a" cx="20" cy="21" r="2.5"/>',
  cloud:'<path class="t" d="M9 25h15a6 6 0 0 0 1-12 8 8 0 0 0-15 2 5 5 0 0 0-1 10z"/><path d="M9 25h15a6 6 0 0 0 1-12 8 8 0 0 0-15 2 5 5 0 0 0-1 10z"/><circle class="a" cx="16" cy="19" r="1.6"/>',
  plug:'<path class="t" d="M10 12h12v5a6 6 0 0 1-12 0z"/><path d="M10 12h12v5a6 6 0 0 1-12 0zM13 12V5M19 12V5M16 23v6"/><circle class="a" cx="16" cy="17" r="1.4"/>',
  branch:'<circle class="t" cx="9" cy="7" r="3"/><circle cx="9" cy="7" r="3"/><circle cx="9" cy="25" r="3"/><circle class="a" cx="23" cy="12" r="3"/><path d="M9 10v12M23 15c0 5-5 6-9 7"/>',
  chat:'<path class="t" d="M4 7h24v15H14l-7 6v-6H4z"/><path d="M4 7h24v15H14l-7 6v-6H4z"/><path d="M9 13h14"/><path class="a2" d="M9 17h8"/>',
  mobile:'<rect class="t" x="9" y="3" width="14" height="26" rx="3"/><rect x="9" y="3" width="14" height="26" rx="3"/><circle class="a" cx="16" cy="24" r="1.4"/>',
  rocket:'<path class="t" d="M16 3c6 4 7 11 4 18h-8c-3-7-2-14 4-18z"/><path d="M16 3c6 4 7 11 4 18h-8c-3-7-2-14 4-18zM12 21l-4 4 1-7M20 21l4 4-1-7M14 26h4"/><circle class="a" cx="16" cy="12" r="2"/>',
  eye:'<path class="t" d="M3 16s5-9 13-9 13 9 13 9-5 9-13 9S3 16 3 16z"/><path d="M3 16s5-9 13-9 13 9 13 9-5 9-13 9S3 16 3 16z"/><circle cx="16" cy="16" r="4"/><circle class="a" cx="16" cy="16" r="1.4"/>',
  coin:'<circle class="t" cx="16" cy="16" r="11"/><circle cx="16" cy="16" r="11"/><path d="M19 12c-1-1-2-1.5-3.5-1.5-2 0-3 1-3 2.3 0 3.4 7 1.7 7 5.2 0 1.4-1.4 2.5-3.5 2.5-1.6 0-3-.6-3.8-1.6M16 8v2.5M16 21.5V24"/>',
  flag:'<path class="t" d="M7 5h16l-3 5 3 5H7z"/><path d="M7 28V5h16l-3 5 3 5H7"/><circle class="a" cx="7" cy="28" r="1.5"/>'
};
const di = (n, cls='') => `<svg class="dico ${cls}" viewBox="0 0 32 32" aria-hidden="true">${(DI[n]||'').replace(/<(path|circle|rect)(?![^>]*class=)/g,'<$1 class="l"')}</svg>`;


/* ===== js/art/ui-mockups.js ===== */
/* ---------- crisp product screen mockups ---------- */
const uiWin = (title, body, right='') => `<div class="ui" aria-hidden="true"><div class="ui-bar"><span class="ui-dots"><i></i><i></i><i></i></span><span class="ui-title">${title}</span><span class="ui-r">${right}</span></div><div class="ui-body">${body}</div></div>`;
const UI = {
  connect: () => uiWin('New application', `
    <div class="ui-f"><label>Application URL</label><div class="ui-in">https://staging.acme.test</div></div>
    <div class="ui-f"><label>Test logins</label><div class="ui-row"><span class="ui-av">A</span>admin@acme.test<span class="ui-tag">Admin</span></div><div class="ui-row"><span class="ui-av">M</span>member@acme.test<span class="ui-tag">Member</span></div></div>
    <div class="ui-f"><label>Scope</label>
      <div class="ui-sw on">Staging environment only</div><div class="ui-sw on">Test card numbers only</div><div class="ui-sw off">Delete workspaces</div></div>
    <div class="ui-btn">Start exploring</div>`, 'Step 1 of 2'),
  explore: () => uiWin('Acme Cloud, explored', `
    <div class="ui-stats"><div><b>11</b><span>pages</span></div><div><b>2</b><span>roles</span></div><div><b>38</b><span>test cases drafted</span></div></div>
    <div class="ui-list">${[['Sign up and create workspace','Onboarding',6],['Upgrade to Pro','Billing',9],['Invite a teammate','Permissions',7],['Cancel and downgrade','Billing',5],['Reset password','Account',4]].map(([t,g,n])=>`<div class="ui-li"><span>${t}<small>${g}</small></span><span class="ui-count">${n} tests</span></div>`).join('')}</div>`, 'Explored 4 min ago'),
  run: () => uiWin('Run #218, upgrade to Pro', `
    <div class="ui-run">${[['Open /signup','0.8s','ok'],['Create workspace as member','2.1s','ok'],['Choose the Pro plan','1.4s','ok'],['Pay with test card 4242','3.2s','ok'],['Expect plan badge "Pro"','30s','bad'],['Open Pro export','skipped','skip']].map(([t,s,c])=>`<div class="ui-step ${c}"><i></i><span>${t}</span><small>${s}</small></div>`).join('')}</div>
    <div class="ui-foot"><span>Chrome 130, member role</span><span class="ui-pill bad">1 failure</span></div>`, '<span class="ui-pill">Staging</span>'),
  investigate: () => uiWin('Step 5, what happened', `
    <div class="ui-cmp"><div><small>Expected</small><div class="ui-shot"><span class="ui-badge good">Plan: Pro</span><i></i><i></i></div></div><div><small>Found after 30s</small><div class="ui-shot bad"><span class="ui-badge badb">Plan: Free</span><i></i><i></i></div></div></div>
    <div class="ui-log"><span>200 POST /billing/charge</span><span>200 GET /account</span><span class="x">entitlement.plan = "free"</span></div>
    <div class="ui-hint">Payment succeeded, the account plan never changed. Check the billing webhook.</div>`, 'Evidence'),
  release: () => uiWin('Release 4.12 review', `
    <div class="ui-rel">${[['Sign up and create workspace','ok'],['Upgrade to Pro','bad'],['Invite a teammate','ok'],['Cancel and downgrade','ok']].map(([t,c])=>`<div class="ui-rl ${c}"><i></i>${t}<span>${c=='ok'?'Passed':'Needs review'}</span></div>`).join('')}</div>
    <div class="ui-decide"><span class="ui-av big">QA</span><div><b>Release owner: QA lead</b><small>3 passed, 1 held for billing</small></div></div>
    <div class="ui-btns"><span class="ui-btn">Hold release</span><span class="ui-btn ghost">Ship anyway</span></div>`, 'Today, 10:40')
};


/* ===== js/components/shared.js ===== */
const LINKS = {
  app:'https://app101.smarttestaix.sentraix.com',
  saas:'https://marketplace.microsoft.com/en-us/product/sentraixllc-aurora.smarttestaixsaas3?tab=Overview',
  managed:'https://marketplace.microsoft.com/en-us/product/sentraixllc-aurora.smarttestaixmanapp2?tab=Overview',
  tour:'https://www.youtube.com/embed/BpFJGGc6UbI?rel=0',
  contact:'https://sentraix.com/contact', security:'https://sentraix.com/security',
  privacy:'https://sentraix.com/privacy', terms:'https://sentraix.com/terms', disclaimer:'https://sentraix.com/disclaimer', team:'https://sentraix.com/company'
};
const ext = (href, text, cls='tcta') => `<a class="${cls}" href="${href}" target="_blank" rel="noopener">${text}</a>`;
const ms = (href=LINKS.saas) => `<a class="ms" href="${href}" target="_blank" rel="noopener"><span class="g" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span><b>Microsoft</b><small>Available on Azure Marketplace</small></span></a>`;
const cta2 = (a='Start testing free', b='Book a demo') => `<a class="btn" href="/disclaimer">${a}</a><a class="btn outline" href="/contact">${b}</a>`;

function pageHero({crumb, title, lead, art, actions, lockup}) {
  return `<section class="page-hero"><div class="wrap grid2">
    <div class="rv">
      ${crumb?`<div class="crumb"><a href="/">Home</a> / ${crumb}</div>`:''}
      ${lockup?`<div class="lockup"><img src="/assets/images/testaix-logo.svg" alt="TestAIx"/></div>`:''}
      <h1>${title}</h1>
      <p class="sec-a">${lead}</p>
      <div class="actions">${actions ?? cta2()}</div>
    </div>
    <div class="rv">${art||''}</div>
  </div></section>`;
}
function ctaBand(title='Pick the journey that worries you most. Start there.', text='Free is free forever. Two applications, AI-generated and automated test cases, and 50 test case executions to run them.', actions) {
  return `<section class="section"><div class="wrap cta-band">
    <div class="rv"><h2 class="h1">${title}</h2><p class="sec-a" style="margin-top:20px">${text}</p><div class="actions">${actions ?? cta2()}</div></div>
    <div class="rv" style="max-width:360px;justify-self:center">${ART.wave()}</div>
  </div></section>`;
}
const NI = {'It finds the real workflows':'map','It writes the test cases':'code','It runs them in a real browser':'play','It shows its work':'evidence','Adaptive maintenance':'adapt','Scheduled and on-demand runs':'calendar','Governance boundaries':'shield','SaaS or your Azure':'cloud','Scope comes before execution':'lock','Evidence comes before confidence':'evidence','People come before permission':'decide','Access':'lock','Data':'report','Operations':'adapt','Cost':'coin','Map the journeys that carry revenue':'journey','Spend less time repairing brittle tests':'adapt','Put untested paths on the table':'eye','Explore beyond the happy path':'map','Investigate rather than count':'bug','Explain findings in customer terms':'chat','Activation that completes':'people','Billing that grants the right access':'card','Permissions that hold':'lock','Access and credentials':'lock','Infrastructure':'cloud','Incidents':'bug','Paperwork':'report','Curious by design':'eye','Honest about evidence':'evidence','People own the decision':'decide','Fit':'browser','Priorities':'journey','Deployment':'cloud','Microsoft Azure Marketplace':'cloud','AI-Coder':'code','Delivery partners':'people'};
const notes = (items) => `<ol class="notes">${items.map(([h,p],i)=>`<li class="rv">${NI[h]?`<span class="num ico">${di(NI[h])}</span>`:`<span class="num">${String(i+1).padStart(2,'0')}</span>`}<div><h3>${h}</h3><p class="sec">${p}</p></div></li>`).join('')}</ol>`;
const bullets = (items) => `<ul>${items.map(t=>`<li>${icon('dash')}<span>${t}</span></li>`).join('')}</ul>`;


/* ===== js/data/home.js ===== */
/* ---------- departments ---------- */
const DEPTS = [
  {id:'eng', ic:'code', tab:'Engineering', art:'eng', head:'Merge at 4:55 pm and still sleep well.',
   body:'TestAIx reruns your critical journeys on demand or on a schedule, so a broken checkout shows up in a test run instead of a support queue.',
   list:['Tests adapt when a button moves, instead of failing on a stale selector','Every failure comes with screenshots, steps and diagnostics','AI test case generation is unlimited on every plan'],
   ok:'Today runs start from TestAIx or on a schedule. CI/CD hooks are on the roadmap.'},
  {id:'qa', ic:'eye', tab:'QA and test', art:'qa', head:'Less clicking. More testing.',
   body:'Hand TestAIx the regression grind. Spend the hours on exploratory work and the odd questions only someone who knows the product would think to ask.',
   list:['Reruns, selector fixes and evidence capture are handled','You review what changed before anything is accepted'],
   ok:'No per-seat pricing, so every tester on the team gets access.'},
  {id:'product', ic:'journey', tab:'Product', art:'product', head:'Know the journeys you promised still work.',
   body:'Signup, first value, upgrade, invite. Read the result of every critical journey in plain language before a release goes out, without asking engineering for a status update.',
   list:['Results described by journey, not by test file','Open the evidence yourself, no screen share needed'],
   ok:'Product managers can join the release review at no extra cost.'},
  {id:'lead', ic:'chart', tab:'Leadership', art:'lead', head:'Ship with the facts on the table.',
   body:'Release decisions come with evidence instead of "it should be fine". And because pricing follows usage, a growing QA team never turns into a budget debate.',
   list:['A clear record of what ran, what failed and what was skipped','Hosted SaaS or your own Azure subscription'],
   ok:'Plans from free to $999 a month, published on the pricing page.'},
  {id:'support', ic:'headset', tab:'Support', art:'support', head:'Fewer "I paid but..." tickets.',
   body:'The bugs that reach support tend to live in the handoffs between screens. TestAIx walks those handoffs before customers do.',
   list:['Payment to access, invite to permissions, signup to workspace','Recurring complaints can become journeys that get tested every release'],
   ok:'Your team hears about a broken upgrade before a customer does.'},
  {id:'security', ic:'shield', tab:'Security', art:'sec', head:'Boundaries first, automation second.',
   body:'Environments, test logins, data and blocked actions are agreed before anything runs. When TestAIx reaches the edge of that scope, it stops and asks a person.',
   list:['TLS 1.2 or higher in transit and logical tenant isolation','SOC 2 Type 2 preparation in progress, CSA STAR Level 1 self-assessment published'],
   ok:'Customer data is not used to train AI models.'}
];

/* ---------- how it works ---------- */
const STEPS = [
  ['Point it at your app','Share a staging URL, a couple of test logins and the ground rules. You decide what it may touch and what it must never do.','s1'],
  ['It maps the territory','TestAIx explores pages, roles and flows like a new user would, then drafts test cases from what it found.','s2'],
  ['It walks the journeys, again and again','Real browser runs through signup, billing, invites and permissions, including declined cards and expired sessions.','s3'],
  ['Your team reads the evidence','Each run comes back with screenshots, steps and diagnostics. Your people decide what a failure means and whether to ship.','s4']
];
function carousel() {
  return `<div class="car rv on-navy" data-car>
    <div class="car-view">${STEPS.map(([h,p,a],i)=>`<div class="slide" data-slide="${i}" ${i?'hidden':''} role="group" aria-roledescription="slide" aria-label="Step ${i+1} of 4">
      <div><span class="step-n">Step ${i+1} of 4</span><h3>${h}</h3><p>${p}</p></div><div class="sk">${ART[a]()}</div></div>`).join('')}</div>
    <div class="car-ctrl"><div class="dots" role="tablist" aria-label="Choose a step">${STEPS.map((_,i)=>`<button type="button" data-go="${i}" aria-label="Step ${i+1}" ${i?'':'aria-current="true"'}></button>`).join('')}</div>
      <div class="arrows"><button class="arrow" type="button" data-prev aria-label="Previous step">${icon('left')}</button><button class="arrow" type="button" data-next aria-label="Next step">${icon('right')}</button></div></div>
  </div>`;
}

/* ---------- workspace preview ---------- */
const WS = [
  {t:'Sign up and create a workspace', s:'Onboarding, roles', ok:1, bad:-1, steps:['open /signup','create workspace "Acme QA"','expect owner = test user','found owner = test user'], note:'Workspace created with the right owner and default roles. Nothing to review.'},
  {t:'Pay and upgrade to Pro', s:'Billing, entitlement', ok:0, bad:3, steps:['choose Pro plan','pay with test card','expect plan = "Pro"','found plan = "Free" after 30s'], note:'Payment went through, the upgrade didn\'t. Billing needs to check the entitlement step before this ships.', by:'QA lead, 10:14 am'},
  {t:'Invite a teammate', s:'Invitations, permissions', ok:1, bad:-1, steps:['invite member@acme.test','accept as member','open /admin/billing','expect 403, found 403'], note:'The new member can\'t reach admin billing. The boundary held.'},
  {t:'Cancel and downgrade', s:'Subscription change', ok:1, bad:-1, steps:['cancel Pro','advance to period end','expect plan = "Free"','found plan = "Free"'], note:'Pro features were removed at the end of the period, as expected.'}
];
function evidenceHTML(w){ return `<div class="h2" style="font-size:22px">${w.t}</div>
  <div class="shots">${[0,1,2,3].map(i=>`<div class="shot ${i===w.bad?'bad':''}"><i></i></div>`).join('')}</div>
  <div class="log">${w.steps.map((s,i)=>`<span class="${i===w.bad?'x':''}">${i+1}. ${s}</span>`).join('')}</div>
  <div class="ev-note">${w.note}${w.by?`<span class="by">${w.by}</span>`:''}</div>`; }


const LIFE = [
  {tab:'Connect', icon:'plug', ui:'connect', head:'Point it at staging and set the rules', body:'Share a URL, a couple of test logins and what is off limits. It takes about as long as onboarding a new contractor, minus the laptop.', who:'Your team, about 10 minutes'},
  {tab:'Explore', icon:'map', ui:'explore', head:'It learns your app the way a new user would', body:'TestAIx walks pages, roles and flows, then drafts test cases from what it found. You keep the ones that matter and drop the rest.', who:'TestAIx, with your review'},
  {tab:'Run', icon:'play', ui:'run', head:'Real journeys, in a real browser, every time', body:'Signup, billing, invites and permissions run end to end, including declined cards and expired sessions. On demand or on a schedule.', who:'TestAIx'},
  {tab:'Investigate', icon:'bug', ui:'investigate', head:'When something breaks, you see exactly where', body:'Expected and actual screens side by side, the steps that led there and the network clues. A failure arrives as a lead, not a puzzle.', who:'TestAIx, then your engineers'},
  {tab:'Release', icon:'flag', ui:'release', head:'A person makes the call, with the facts in front of them', body:'Every journey in one review: what passed, what failed and what was skipped. Hold or ship, and everyone can see why.', who:'Your release owner'}
];
const MQ = [
  ['browser','"Buy now" became "Upgrade"','Checkout test updated',0],['adapt','Settings moved into a side menu','Navigation steps re-mapped',0],['card','New field: billing country','Payment test now fills it',0],
  ['map','New page found: /reports','3 test cases drafted',0],['people','Invite modal redesigned','Invite test updated',0],
  ['bug','Promo code field removed','Flagged: was this intentional?',1],['chart','Dashboard loads 2s slower','Noted in the run report',0]
];
const IND = [
  ['bank','Fintech and payments',['Add payee','Transfer','Confirmation'],'A transfer that shows "sent" but never settles is a trust problem, not a UI bug.'],
  ['saas','B2B SaaS',['Sign up','Pay','Unlock plan'],'Payment, subscription state and access have to agree, every release.'],
  ['cart','E-commerce',['Search','Cart','Checkout'],'Promo codes, tax and shipping rules change weekly. Checkout has to survive all of it.'],
  ['health','Healthcare',['Book','Intake form','Patient portal'],'Patients notice when a booking disappears. Test with authorized, synthetic data only.'],
  ['umbrella','Insurance',['Quote','Underwrite','Policy issued'],'Long, branching forms are where edge cases hide. Let TestAIx walk every branch.'],
  ['plane','Travel and booking',['Search','Hold seat','Pay and confirm'],'Inventory holds and payment timeouts are hard to test by hand and easy to break.']
];
const STORY = [
  ['10:02','branch','A billing change gets merged','An engineer ships a small refactor to the payment webhook. Unit tests pass. Code review looks fine.','Engineering'],
  ['10:20','play','TestAIx walks the upgrade journey','The scheduled staging run signs up a new member, picks Pro and pays with a test card.','TestAIx'],
  ['10:31','evidence','It catches the gap','Payment succeeds, but the account still says Free after 30 seconds. Screenshots and network clues go to the release review.','TestAIx'],
  ['10:40','decide','The QA lead holds the release','One look at the evidence is enough. No meeting, no argument about whether it is real.','QA lead'],
  ['11:15','code','The fix is a one-line change','The engineer sees the webhook never updated the plan. Fixed, reviewed, merged.','Engineering'],
  ['14:05','rocket','The rerun passes. It ships.','All four journeys pass. The release goes out the same afternoon, and support never hears about it.','Whole team']
];


/* ===== js/data/deployment.js ===== */
const MODEL = {
  saas:{t:'We run TestAIx for you. Connect your staging app and start testing the same day.', l:ext(LINKS.saas,'Get TestAIx SaaS on Marketplace'), a:'saas'},
  azure:{t:'TestAIx runs as a managed application in your own Azure subscription, next to the systems it tests. Plan for access, infrastructure and who operates it.', l:ext(LINKS.managed,'Deploy in your Azure'), a:'azure'}
};


/* ===== js/site.js ===== */
(() => {
const $ = (s, r=document) => r.querySelector(s), $$ = (s, r=document) => [...r.querySelectorAll(s)];
const main = $('#main'), reduce = matchMedia('(prefers-reduced-motion: reduce)');
let paused = false, cleanup = [];

/* nav */
const items = $('#nav-items'), mb = $('#menu-btn');
const closeMenus = (ex) => $$('.nav-trigger').forEach(b => { if (b !== ex) { b.setAttribute('aria-expanded','false'); $('#'+b.getAttribute('aria-controls')).hidden = true; } });
$$('.nav-trigger').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); const o = b.getAttribute('aria-expanded') === 'true'; closeMenus(b); b.setAttribute('aria-expanded', String(!o)); $('#'+b.getAttribute('aria-controls')).hidden = o; }));
document.addEventListener('click', e => { if (!e.target.closest('.nav-group')) closeMenus(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeMenus(); items.classList.remove('open'); mb.setAttribute('aria-expanded','false'); } });
mb.addEventListener('click', () => { const o = items.classList.toggle('open'); mb.setAttribute('aria-expanded', String(o)); mb.textContent = o ? 'Close' : 'Menu'; });

/* reveal + sketch drawing */
function reveal() {
  const els = $$('.rv, svg.sketch', main).filter(e => !e.closest('[hidden]'));
  if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('seen')); return; }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('seen'); io.unobserve(e.target); } }), { threshold: .15 });
  els.forEach(e => io.observe(e)); cleanup.push(() => io.disconnect());
}
const redraw = (root) => $$('svg.sketch', root).forEach(s => { s.classList.remove('seen'); requestAnimationFrame(() => requestAnimationFrame(() => s.classList.add('seen'))); });

/* hand-drawn "boil" on the hero sketch */
function boil() {
  const host = $('[data-boil]', main); if (!host) return;
  const g = $('svg.sketch > g', host); g.setAttribute('filter', 'url(#boil)');
  const turb = $('#boil feTurbulence'); const seeds = [2, 5, 9]; let i = 0;
  const id = setInterval(() => { if (paused || reduce.matches || document.hidden) return; i = (i + 1) % 3; turb.setAttribute('seed', seeds[i]); }, 170);
  cleanup.push(() => clearInterval(id));
}


/* hero run: the hand-drawn buddy and the run card share one timeline */
function heroRun() {
  const st = $('[data-stage]', main); if (!st) return;
  const walker = $('[data-walker]', st), stamps = $$('[data-stamp]', st), ring = $('.hs-ring', st), note = $('.hs-note', st);
  const steps = $$('.rc-steps li', st), chip = $('[data-chip]', st), ev = $('[data-rcev]', st), call = $('[data-call]', st), hold = $('[data-hold]', st), rnote = $('.rc-note', st), prog = $('[data-prog]', st), tm = $('[data-time]', st);
  let gen = 0, vis = true; const io = new IntersectionObserver(e => { vis = e[0].isIntersecting; }, { threshold: .25 }); io.observe(st);
  const alive = g => g === gen;
  const wait = async (ms, g) => { const end = Date.now() + ms; while (Date.now() < end) { if (!alive(g)) throw 0; await new Promise(r => setTimeout(r, 80)); while ((paused || !vis || document.hidden) && alive(g)) await new Promise(r => setTimeout(r, 200)); } };
  const walkTo = x => { walker.style.transform = `translate(${x}px,0px)`; };
  const setStep = (i, s) => { steps[i].className = s; };
  const progress = n => { prog.style.width = (n * 25) + '%'; tm.textContent = `${n} of 4`; };
  const reset = () => { walker.style.transition = 'none'; walkTo(0); void walker.getBoundingClientRect(); walker.style.transition = ''; stamps.forEach(s => s.classList.remove('on')); ring.classList.remove('on'); note.classList.remove('on'); steps.forEach(s => s.className = ''); chip.className = 'rc-chip'; chip.textContent = 'Running'; ev.classList.remove('on'); call.classList.remove('on'); hold.classList.remove('press'); rnote.classList.remove('on'); progress(0); st.classList.remove('walking'); };
  const final = () => { walkTo(540); stamps.forEach(s => s.classList.add('on')); ring.classList.add('on'); note.classList.add('on'); [0,1,2].forEach(i => setStep(i,'ok')); setStep(3,'bad'); chip.className = 'rc-chip held'; chip.textContent = 'Held by QA lead'; ev.classList.add('on'); call.classList.add('on'); rnote.classList.add('on'); progress(4); };
  async function loop(g) { for (;;) {
    reset(); await wait(700, g);
    setStep(0,'run'); await wait(1100, g); setStep(0,'ok'); stamps[0].classList.add('on'); progress(1); await wait(500, g);
    for (const [i, x] of [[1,180],[2,360]]) { setStep(i,'run'); st.classList.add('walking'); walkTo(x); await wait(1450, g); st.classList.remove('walking'); await wait(450, g); setStep(i,'ok'); stamps[i].classList.add('on'); progress(i + 1); await wait(450, g); }
    setStep(3,'run'); st.classList.add('walking'); walkTo(540); await wait(1450, g); st.classList.remove('walking'); await wait(900, g);
    setStep(3,'bad'); ring.classList.add('on'); progress(4); chip.className = 'rc-chip warn'; chip.textContent = 'Needs your call'; await wait(700, g);
    note.classList.add('on'); ev.classList.add('on'); await wait(1100, g); call.classList.add('on'); await wait(1700, g);
    hold.classList.add('press'); chip.className = 'rc-chip held'; chip.textContent = 'Held by QA lead'; await wait(250, g); hold.classList.remove('press'); rnote.classList.add('on');
    await wait(5000, g);
  } }
  const startRun = () => { gen++; if (reduce.matches) { final(); return; } loop(gen).catch(() => {}); };
  startRun(); cleanup.push(() => { gen++; io.disconnect(); });
}

/* tabs 2 (departments) */
function tabs2() {
  $$('[data-tabs2]', main).forEach(list => {
  const tabs = $$('[role="tab"]', list);
  const select = (t, focus) => { tabs.forEach(x => { const on = x === t; x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1; const p = $('#' + x.getAttribute('aria-controls')); p.hidden = !on; if (on) redraw(p); }); if (focus) t.focus(); };
  tabs.forEach((t, i) => { t.addEventListener('click', () => select(t)); t.addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); select(tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length], true); } }); });
  });
}

/* carousel */
function carousel() {
  $$('[data-car]', main).forEach(c => {
    const slides = $$('[data-slide]', c), dots = $$('[data-go]', c); let n = 0;
    const go = (k) => { n = (k + slides.length) % slides.length; slides.forEach((s, i) => { s.hidden = i !== n; if (i === n) redraw(s); }); dots.forEach((d, i) => i === n ? d.setAttribute('aria-current', 'true') : d.removeAttribute('aria-current')); };
    $('[data-prev]', c).addEventListener('click', () => go(n - 1)); $('[data-next]', c).addEventListener('click', () => go(n + 1));
    dots.forEach((d, i) => d.addEventListener('click', () => go(i)));
    c.addEventListener('keydown', e => { if (e.key === 'ArrowRight') go(n + 1); if (e.key === 'ArrowLeft') go(n - 1); });
  });
}

/* workspace */
function workspace() {
  const ws = $('[data-ws]', main); if (!ws) return; const ev = $('[data-ev]', ws);
  const pick = i => { $$('.jrow', ws).forEach((b, j) => b.setAttribute('aria-pressed', String(i === j))); ev.innerHTML = evidenceHTML(WS[i]); };
  $$('.jrow', ws).forEach((b, i) => b.addEventListener('click', () => pick(i))); if (!ev.firstChild) pick(1); /* already pre-rendered with journey 1 */
}

/* deployment toggle */
function toggle() {
  const t = $('[data-toggle]', main); if (!t) return;
  const set = m => { $$('button', t).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.m === m))); $('[data-mtext]', main).textContent = MODEL[m].t; $('[data-mlink]', main).innerHTML = MODEL[m].l; const a = $('[data-mart]', main); a.innerHTML = ART[MODEL[m].a](); redraw(a); };
  $$('button', t).forEach(b => b.addEventListener('click', () => set(b.dataset.m))); if (!$('[data-mtext]', main).firstChild) set('saas'); /* already pre-rendered as hosted SaaS */
}

/* pricing */
function calc() {
  const r = $('#credits', main); if (!r) return; const f = n => '$' + n.toLocaleString('en-US');
  const u = () => { const c = +r.value, team = 299 + Math.max(0, Math.ceil((c - 1000) / 1000)) * 25, scale = 999 + Math.max(0, Math.ceil((c - 5000) / 1000)) * 15;
    $('#credits-out', main).textContent = c.toLocaleString('en-US'); $('[data-cost="team"]', main).textContent = f(team); $('[data-cost="scale"]', main).textContent = f(scale);
    $('[data-est="team"]', main).classList.toggle('win', team < scale); $('[data-est="scale"]', main).classList.toggle('win', scale < team); };
  r.addEventListener('input', u); u();
}

/* faq */
function faq() {
  const list = $('[data-faq]', main); if (!list) return; const q = $('#faq-q', main), empty = $('#faq-empty', main); let cat = 'All';
  const apply = () => { const t = q.value.trim().toLowerCase(); let n = 0; $$('details', list).forEach(d => { const ok = (cat === 'All' || d.dataset.cat === cat) && (!t || d.textContent.toLowerCase().includes(t)); d.hidden = !ok; if (ok) n++; }); empty.hidden = n > 0; };
  q.addEventListener('input', apply);
  $$('.tab[data-cat]', main).forEach(b => b.addEventListener('click', () => { cat = b.dataset.cat; $$('.tab[data-cat]', main).forEach(x => x.setAttribute('aria-pressed', String(x === b))); apply(); }));
}

/* contact */
function form(params) {
  const f = $('#brief-form', main); if (!f) return;
  const interest = params.get('interest'), plan = params.get('plan');
  if (interest) [...f.interest.options].forEach(o => { if (o.text === interest) f.interest.value = o.text; });
  if (plan) f.message.value = `We're interested in the ${plan} plan. `;
  /* Netlify Forms: the form is registered at deploy time (data-netlify) and a urlencoded POST to "/" with form-name delivers it. */
  f.addEventListener('submit', async e => { e.preventDefault();
    const err = $('[data-err]', f), fail = $('[data-fail]', f), btn = $('button[type=submit]', f); fail.hidden = true;
    if (!f.checkValidity()) { err.hidden = false; f.reportValidity(); return; } err.hidden = true;
    btn.disabled = true; btn.textContent = 'Sending...';
    try {
      const r = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(new FormData(f)).toString() });
      if (!r.ok) throw new Error(String(r.status));
      f.hidden = true; const t = $('#thanks', main); t.hidden = false; t.focus();
    } catch { fail.hidden = false; btn.disabled = false; btn.textContent = 'Contact us'; }
  });
}
function consent() {
  const c = $('#auth-ok', main), a = $('#app-link', main); if (!c) return;
  const s = () => a.setAttribute('aria-disabled', String(!c.checked)); c.addEventListener('change', s); s();
  a.addEventListener('click', e => { if (!c.checked) e.preventDefault(); });
}

/* page init
   Every page is a real, pre-rendered HTML file (see website-build/build.js), so there is no client-side
   router any more: the page content is already in <main>, and this just wires up its behaviour.
   Section links are plain #anchors and the query string only carries the contact-form prefill. */
function init() {
  const params = new URLSearchParams(location.search);
  reveal(); boil(); heroRun(); tabs2(); carousel(); workspace(); toggle(); calc(); faq(); form(params); consent();
}
const header = $('.site-header');
addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 6), { passive: true });
$('#year').textContent = new Date().getFullYear();
init();
})();
