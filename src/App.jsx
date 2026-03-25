import { useState, useEffect } from "react";

const C = {
  g9:"#0D3B1E",g8:"#145A2E",g7:"#1B6B3A",g6:"#218C48",g5:"#2EA55D",g4:"#4CC97A",
  g3:"#7EDDA0",g2:"#B5ECCC",g1:"#E0F7EA",g0:"#F0FBF4",w:"#FFF",
  d9:"#1A1A1A",d7:"#4A4A4A",d5:"#7A7A7A",d3:"#C4C4C4",d1:"#F0F0F0",
  acc:"#34C26B",warn:"#F0AD4E",err:"#E74C3C",info:"#3498DB",pur:"#8E44AD",
};

const OBRAS = [
  { id:1, eixo:"Mobilidade", icon:"🚇", nome:"Linha Leste do Metrô de Fortaleza",
    obj:"Conectar Centro ao Papicu em 15 min por metrô 100% subterrâneo (7,3 km), 1ª linha subterrânea do Nordeste.",
    resp:"Seinfra / Metrofor", inv:"R$ 2,6 bi", pct:42.44, st:"Em andamento", prev:"2028",
    imp:"150 mil pass./dia",
    not:"TBM 02 concluiu 1º túnel (1.734m, mai/2025). TBM 01 com desvio de 2,5m sendo corrigido pelo Consórcio FTS sem custo ao Estado. +1.100 trabalhadores. Obra avançou +10 p.p. em 12 meses. Liberação parcial da Av. Santos Dumont (entorno Col. Militar) prevista para jul/2026. TCU fiscalizou e alertou para risco de recursos insuficientes. BNDES visitou canteiro em 2026.",
    src:"Gov. CE (set/2025) · InfraNews (jul/2025) · Diário do Nordeste (fev/2025) · TCU (2024)",
    marcos:[{l:"Est. Chico da Silva",p:93.1},{l:"Est. Colégio Militar",p:62.3},{l:"Est. Nunes Valente",p:54.8},{l:"Est. Papicu",p:28.6}], tag:"mar/2026",
  },
  { id:2, eixo:"Mobilidade", icon:"🚇", nome:"VLT Ramal Aeroporto",
    obj:"Integrar Aeroporto de Fortaleza à rede VLT (Linha Nordeste Parangaba-Mucuripe), beneficiando 5 bairros.",
    resp:"Seinfra", inv:"R$ 300 mi", pct:100, st:"Concluída", prev:"Jan/2026 ✓",
    imp:"5 bairros",
    not:"Entregue e em operação desde jan/2026. Ramal completa 1º mês. 11 estações na Linha Nordeste. Polo esportivo de 18 mil m² inaugurado no entorno.",
    src:"Seinfra-CE (mar/2026) · Gov. CE (dez/2025)", tag:"mar/2026",
  },
  { id:3, eixo:"Mobilidade", icon:"🚇", nome:"VLT Aeroporto–Castelão",
    obj:"Corredor VLT na zona sul de Fortaleza ligando Aeroporto ao estádio Castelão.",
    resp:"Seinfra / Detran", inv:"R$ 4,5 mi", pct:30, st:"Em andamento", prev:"2026",
    imp:"Conexão Sul", not:"Intervenções na Av. Alberto Craveiro. 30% de apronto.",
    src:"Gov. CE (2025)",
  },
  { id:4, eixo:"Mobilidade", icon:"🚇", nome:"4º Anel Viário de Fortaleza",
    obj:"Via perimetral desviando tráfego pesado do centro da RMF, melhorando acesso ao Porto do Pecém.",
    resp:"Gov. Federal / CE", inv:"A confirmar", pct:null, st:"Retomada", prev:"A definir",
    imp:"Logística RMF", not:"Obra retomada. Governador e min. Rui Costa reafirmam aceleração. Novo PAC.",
    src:"Gov. CE (nov/2024)",
  },
  { id:5, eixo:"Ferrovia", icon:"🚂", nome:"Ferrovia Transnordestina (CE/PI/PE)",
    obj:"Corredor ferroviário de 1.206 km do Piauí ao Porto do Pecém para escoamento de grãos, minérios e fertilizantes. R$ 14,9 bi total.",
    resp:"TLSA / MIDR", inv:"R$ 14,9 bi", pct:80, st:"Em andamento", prev:"2027",
    imp:"+5 mil empregos diretos",
    not:"🔴 NOVO (19/mar/2026): Sudene libera R$ 152,4 mi do FDNE. Total FDNE liberado: R$ 6,6 bi de R$ 7,4 bi. 727 km concluídos. +100 km devem ser entregues até abr/2026. 33,9 mil ton. trilhos chineses no Pecém (fev/2026) — material p/ 100% da via. Testes: milho, sorgo, calcário, gipsita. Empresas do Araripe (PE) já testam escoamento. +5 mil trabalhadores.",
    src:"SECOM/Gov. Federal (19/mar/2026) · Gov. CE (fev/2026)",
    marcos:[{l:"Trecho PI–CE concluído",p:100},{l:"Lotes 5-6 (Quixeramobim)",p:85},{l:"Lotes 7-8 (Superestrutura)",p:75},{l:"Lotes 9-10 (Baturité–Caucaia)",p:15},{l:"Lote 11 (Pecém)",p:10}], tag:"mar/2026",
  },
  { id:6, eixo:"Hídrica", icon:"💧", nome:"Cinturão das Águas do Ceará (CAC)",
    obj:"Transpor águas do São Francisco (145,3 km) até o Rio Cariús. Maior obra hídrica estadual do Brasil.",
    resp:"Gov. CE / MIDR", inv:"R$ 2,08 bi", pct:91, st:"Em andamento", prev:"Jun/2026",
    imp:"561 mil diretas",
    not:"91% execução (dez/2025) — superou meta de 85%. Lotes 1, 2 e 5 concluídos e operando. Lote 3: 86%. Lote 4: 70%. 1.500 empregos, ~500 máquinas. Trecho Emergencial já reforça RMF.",
    src:"Gov. CE (dez/2025) · Agência Gov (set/2025)",
    marcos:[{l:"Lotes 1, 2 e 5",p:100},{l:"Lote 3 (Barbalha–Crato)",p:86},{l:"Lote 4 (Crato–Nova Olinda)",p:70}],
  },
  { id:7, eixo:"Hídrica", icon:"💧", nome:"Duplicação do Eixão das Águas",
    obj:"Dobrar capacidade Castanhão→RMF de 11 para 22 m³/s (256 km). Atende 47% da população cearense.",
    resp:"Gov. CE / BNDES", inv:"R$ 1,3 bi", pct:43, st:"Em andamento", prev:"Dez/2026",
    imp:"4 milhões de pessoas",
    not:"R$ 622,6 mi com BNDES (dez/2025) — R$ 250 mi Fundo Clima + R$ 573 mi Invest Impacto. Total aplicado: R$ 499 mi. Canais prontos, faltam sifões. Testes mar/2026. Entrega parcial set/2026.",
    src:"BNDES (dez/2025) · SRH-CE (dez/2025)",
  },
  { id:8, eixo:"Hídrica", icon:"💧", nome:"Ramal do Salgado (PISF)",
    obj:"Encurtar em 150 km o percurso da água do São Francisco até o Castanhão. 35 km, 20 m³/s.",
    resp:"Gov. Federal / MIDR", inv:"R$ 622 mi", pct:10.45, st:"Em andamento", prev:"2027",
    imp:"5 mi / 54 municípios", not:"10,45% de execução (jun/2025). Obras sob MIDR.",
    src:"Diário do Nordeste (jun/2025)",
  },
  { id:9, eixo:"Hídrica", icon:"💧", nome:"Projeto Malha D'Água",
    obj:"Adutores de água tratada para 179 cidades, eliminando dependência de carros-pipa.",
    resp:"Gov. CE / SRH", inv:"A confirmar", pct:null, st:"Planejamento", prev:"A definir",
    imp:"179 cidades", not:"Previsto no PLOA 2026. Foco: Banabuiú–Sertão Central.",
    src:"Gov. CE – PLOA (out/2025)",
  },
  { id:10, eixo:"Rodovias", icon:"🛣️", nome:"Duplicação BR-222 (Caucaia–Pecém)",
    obj:"Duplicar acesso Fortaleza/Pecém e interior oeste. R$ 720 mi no pacote total CE.",
    resp:"Min. Transportes", inv:"R$ 268,9 mi", pct:100, st:"Concluída*", prev:"Mar/2026 ✓",
    imp:"11,6 mil mot./dia",
    not:"Min. Renan Filho entrega 24 km (17/mar/2026). Novos lotes Primavera–Sobral–PI contratados. Crescimento 187% em recursos federais de logística p/ CE.",
    src:"Min. Transportes (mar/2026)", tag:"mar/2026",
  },
  { id:11, eixo:"Rodovias", icon:"🛣️", nome:"Duplicação BR-116 (Fort.–Tab. do Norte)",
    obj:"Duplicar principal eixo norte-sul do Ceará.",
    resp:"Min. Transportes / CE", inv:"R$ 233 mi+", pct:null, st:"Em andamento", prev:"A definir",
    imp:"Logística interior", not:"Obras iniciadas fim 2024. Pacote R$ 720 mi.",
    src:"Min. Transportes (mar/2026)", tag:"mar/2026",
  },
  { id:12, eixo:"Rodovias", icon:"🛣️", nome:"Requalificação BR-020/CE (406 km)",
    obj:"Recuperar 406 km de rodovia federal no sertão cearense.",
    resp:"Min. Transportes", inv:"Parte R$ 720 mi", pct:null, st:"Início", prev:"A definir",
    imp:"Sertão cearense", not:"OS assinada mar/2026.",
    src:"Min. Transportes (mar/2026)", tag:"mar/2026",
  },
  { id:13, eixo:"Energia", icon:"⚡", nome:"Linhas de transmissão – Pecém (H2V)",
    obj:"Ampliar transmissão elétrica no Pecém para viabilizar H2V — gargalo crítico.",
    resp:"Seinfra / CIPP", inv:"A confirmar", pct:null, st:"Planejamento", prev:"Urgente",
    imp:"Hub H2V Pecém", not:"Prioridade nº 1 da Seinfra. Iluminação CE-155: R$ 10,8 mi, 1.316 luminárias inteligentes.",
    src:"Seinfra (jan/2025)",
  },
  { id:14, eixo:"Energia", icon:"⚡", nome:"Hidrogênio Verde – Fortescue (ZPE)",
    obj:"Planta H2V em 121 ha da ZPE (~US$ 5 bi), polo global de transição energética.",
    resp:"Fortescue / Gov. CE", inv:"~US$ 5 bi", pct:null, st:"Aprovado", prev:"Longo prazo",
    imp:"Transição energética", not:"Eólica offshore na Feira da Indústria FIEC (mar/2026). Fase 1 aprovada (out/2024).",
    src:"Seinfra (mar/2026)", tag:"mar/2026",
  },
  { id:15, eixo:"Energia", icon:"⚡", nome:"Data Center na ZPE Ceará",
    obj:"Data center + parque de energia renovável, hub digital intercontinental.",
    resp:"Investidor privado", inv:"A confirmar", pct:null, st:"Implantação", prev:"A definir",
    imp:"Economia digital", not:"Resenha BB: motor do PIB cearense (+3,8%) em 2026.",
    src:"SDE-CE / BB (fev/2026)", tag:"fev/2026",
  },
  { id:16, eixo:"Saneamento", icon:"🚰", nome:"PPP Saneamento Interior (127 cidades)",
    obj:"Maior PPP de saneamento do Brasil: R$ 7 bi, 127 cidades, 1,5 mi pessoas, 5 blocos regionais até 2033.",
    resp:"Cagece / PPP", inv:"R$ 7 bi", pct:null, st:"Licitação", prev:"Edital: abr/2026",
    imp:"127 cidades",
    not:"TCE-CE analisa estudos. Audiência pública nov/2025. Edital previsto abr/2026, leilão na B3. Retorno estimado R$ 27 bi.",
    src:"TrendsCE (fev/2026) · Cagece (2025)", tag:"fev/2026",
  },
  { id:17, eixo:"Saneamento", icon:"🚰", nome:"Esgoto RMF e Cariri (PPP Ambiental)",
    obj:"Esgotamento em 24 municípios via PPP Cagece/Ambiental. Meta: 78% cobertura Fortaleza até 2026.",
    resp:"Cagece / Ambiental CE", inv:"R$ 521 mi", pct:null, st:"Em andamento", prev:"2026–2033",
    imp:"126 mil (1ª fase)", not:"OS p/ 17 municípios (jan/2025). 350 km rede, 2 ETEs, 40 EEEs. +5 mil empregos.",
    src:"Gov. CE (jan/2025)",
  },
  { id:18, eixo:"Saúde", icon:"🏥", nome:"Hospital Regional de Crateús (280 leitos)",
    obj:"Descentralizar saúde média/alta complexidade no sertão. 280 leitos, ~292 mil habitantes.",
    resp:"Gov. CE", inv:"A confirmar", pct:15, st:"Em andamento", prev:"Jun/2026",
    imp:"292 mil hab.", not:"Governador visitou: 15% execução (jun/2025). Inclui tratamento oncológico interiorizado.",
    src:"Gov. CE (jun/2025)",
  },
  { id:19, eixo:"Saúde", icon:"🏥", nome:"Hospitais Regionais Baturité e Iguatu",
    obj:"Interiorização do SUS: hospitais regionais no Maciço de Baturité e Centro-Sul.",
    resp:"Gov. CE", inv:"A confirmar", pct:null, st:"Licitação", prev:"A definir",
    imp:"Interior CE", not:"Em Brasília, governador alinha emendas para início das obras (out/2025).",
    src:"GCMais (out/2025)",
  },
  { id:20, eixo:"Turismo", icon:"🏖️", nome:"Saneamento de Preá (Cruz-CE)",
    obj:"Sistema completo água/esgoto/drenagem para polo de kitesurf internacional. R$ 99,9 mi via CAF.",
    resp:"Setur / Cagece", inv:"R$ 99,9 mi", pct:58.5, st:"Em andamento", prev:"Abr/2027",
    imp:"Turismo Jericoacoara", not:"58,5% execução (jan/2026). Esgoto: 74,67%. Água: 56,36%. Próxima fase: drenagem.",
    src:"Setur-CE (jan/2026)",
  },
  { id:21, eixo:"Hídrica", icon:"💧", nome:"Saneamento Cagece (R$ 1,07 bi)",
    obj:"Água e esgoto para 12 municípios incluindo ETA Cariri (460 mil pessoas) e sistemas em Crateús, Quixadá e outros.",
    resp:"Cagece / Gov. CE", inv:"R$ 1,07 bi", pct:null, st:"Em andamento", prev:"2026–2027",
    imp:"12 municípios", not:"R$ 475 mi água + R$ 531 mi esgoto. ETA Cariri: R$ 244 mi. Tamboril, Mombaça, Piquet Carneiro, Baixio, Acaraú chegam a 100% esgoto.",
    src:"Gov. CE (ago/2024)",
  },
];

const EIXOS = ["Todos","Mobilidade","Ferrovia","Hídrica","Rodovias","Energia","Saneamento","Saúde","Turismo"];
const stC = s => { if(!s) return C.d5; const l=s.toLowerCase(); if(l.includes("concluída")) return "#27AE60"; if(l.includes("andamento")) return C.info; if(l.includes("retomada")||l.includes("início")||l.includes("implantação")) return C.pur; if(l.includes("licitação")) return "#E67E22"; return C.warn; };
const pC = p => { if(p==null) return C.d3; if(p>=75) return "#27AE60"; if(p>=40) return C.warn; return C.err; };

function Ring({pct,sz=56,sw=5}){
  const r=(sz-sw)/2, ci=2*Math.PI*r, v=pct!=null?pct:0, off=ci-(v/100)*ci;
  return (<svg width={sz} height={sz} style={{transform:"rotate(-90deg)"}}>
    <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke={C.g1} strokeWidth={sw}/>
    <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke={pC(pct)} strokeWidth={sw}
      strokeDasharray={ci} strokeDashoffset={off} strokeLinecap="round"
      style={{transition:"stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)"}}/>
  </svg>);
}
function Bar({l,p}){return (<div style={{marginBottom:5}}><div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.d7,marginBottom:2}}><span>{l}</span><span style={{fontWeight:700,color:pC(p)}}>{p}%</span></div><div style={{height:5,borderRadius:3,background:C.g1,overflow:"hidden"}}><div style={{height:"100%",borderRadius:3,background:`linear-gradient(90deg,${C.g5},${pC(p)})`,width:`${p}%`,transition:"width 1s ease"}}/></div></div>);}

function Card({o,onClick}){
  const [h,setH]=useState(false);
  const fresh = o.tag && o.tag.includes("mar/2026");
  return (<div onClick={()=>onClick(o)} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
    style={{background:C.w,borderRadius:14,padding:"20px 22px",cursor:"pointer",
      border:`1.5px solid ${h?C.g4:C.g1}`,boxShadow:h?`0 8px 32px ${C.g2}`:`0 2px 8px rgba(0,0,0,.04)`,
      transition:"all .25s ease",transform:h?"translateY(-3px)":"none",
      display:"flex",flexDirection:"column",gap:10,position:"relative",overflow:"hidden"}}>
    <div style={{position:"absolute",top:0,left:0,right:0,height:4,background:`linear-gradient(90deg,${C.g7},${C.g4})`}}/>
    {fresh&&<div style={{position:"absolute",top:10,right:10,background:"#E74C3C",color:"#fff",fontSize:9,fontWeight:800,padding:"2px 8px",borderRadius:10,letterSpacing:.5}}>ATUALIZADO</div>}
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,marginTop:4}}>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:10,color:C.g6,fontWeight:600,letterSpacing:".5px",textTransform:"uppercase",marginBottom:3}}>{o.icon} {o.eixo}</div>
        <div style={{fontSize:14,fontWeight:700,color:C.g9,lineHeight:1.3}}>{o.nome}</div>
      </div>
      <div style={{position:"relative",flexShrink:0}}><Ring pct={o.pct}/><div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:o.pct!=null?13:10,fontWeight:800,color:pC(o.pct)}}>{o.pct!=null?`${o.pct}%`:"N/D"}</div></div>
    </div>
    <div style={{fontSize:11,color:C.d7,lineHeight:1.4}}>{o.obj}</div>
    <div style={{display:"flex",flexWrap:"wrap",gap:5,alignItems:"center"}}>
      <span style={{padding:"3px 9px",borderRadius:20,fontSize:9,fontWeight:700,color:"#fff",background:stC(o.st)}}>{o.st}</span>
      <span style={{fontSize:10,color:C.d5}}>📅 {o.prev}</span>
      <span style={{fontSize:10,color:C.d5}}>💰 {o.inv}</span>
    </div>
    {o.marcos&&<div style={{borderTop:`1px solid ${C.g1}`,paddingTop:8}}>{o.marcos.map((m,i)=><Bar key={i} l={m.l} p={m.p}/>)}</div>}
  </div>);
}

function Modal({o,onClose}){
  if(!o)return null;
  return (<div onClick={onClose} style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(13,59,30,.55)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,animation:"fadeIn .2s ease"}}>
    <div onClick={e=>e.stopPropagation()} style={{background:C.w,borderRadius:18,maxWidth:680,width:"100%",maxHeight:"85vh",overflowY:"auto",boxShadow:"0 24px 80px rgba(0,0,0,.25)",position:"relative"}}>
      <div style={{background:`linear-gradient(135deg,${C.g8},${C.g5})`,padding:"28px 28px 22px",borderRadius:"18px 18px 0 0"}}>
        <div style={{fontSize:11,color:C.g2,fontWeight:600,letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>{o.icon} {o.eixo}</div>
        <div style={{fontSize:20,fontWeight:800,color:"#fff",lineHeight:1.25}}>{o.nome}</div>
        <div style={{display:"flex",gap:8,marginTop:14,flexWrap:"wrap"}}>
          {[o.st,`📅 ${o.prev}`,`💰 ${o.inv}`,`🎯 ${o.imp}`].map((t,i)=><span key={i} style={{background:"rgba(255,255,255,.18)",padding:"4px 11px",borderRadius:20,fontSize:11,color:"#fff",fontWeight:i===0?600:400}}>{t}</span>)}
        </div>
      </div>
      <div style={{padding:"22px 28px"}}>
        <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:20}}>
          <div style={{position:"relative"}}><Ring pct={o.pct} sz={76} sw={6}/><div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,fontWeight:800,color:pC(o.pct)}}>{o.pct!=null?`${o.pct}%`:"N/D"}</div></div>
          <div><div style={{fontSize:11,color:C.d5,fontWeight:600,textTransform:"uppercase",letterSpacing:.5}}>Execução Física</div><div style={{fontSize:13,color:C.d7,marginTop:2}}>Responsável: <strong>{o.resp}</strong></div></div>
        </div>
        <Sec t="Objetivo"><p style={{fontSize:13,color:C.d7,lineHeight:1.6,margin:0}}>{o.obj}</p></Sec>
        {o.marcos&&<Sec t="Marcos / Subitens">{o.marcos.map((m,i)=><Bar key={i} l={m.l} p={m.p}/>)}</Sec>}
        <Sec t="Última Notícia">
          <p style={{fontSize:12,color:C.d7,lineHeight:1.6,margin:0,background:C.g0,padding:"12px 14px",borderRadius:10,borderLeft:`4px solid ${C.g5}`}}>{o.not}</p>
          <div style={{fontSize:10,color:C.g6,marginTop:6}}>📰 {o.src}</div>
        </Sec>
      </div>
      <button onClick={onClose} style={{position:"absolute",top:14,right:14,background:"rgba(255,255,255,.2)",border:"none",borderRadius:"50%",width:34,height:34,cursor:"pointer",color:"#fff",fontSize:16,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
    </div>
  </div>);
}
function Sec({t,children}){return (<div style={{marginBottom:16}}><div style={{fontSize:10,fontWeight:700,color:C.g7,textTransform:"uppercase",letterSpacing:1,marginBottom:7,paddingBottom:3,borderBottom:`2px solid ${C.g1}`}}>{t}</div>{children}</div>);}
function KPI({label,value,sub}){return (<div style={{background:C.w,borderRadius:12,padding:"14px 18px",border:`1px solid ${C.g1}`,flex:"1 1 130px",minWidth:130}}><div style={{fontSize:22,fontWeight:800,color:C.g7,lineHeight:1}}>{value}</div><div style={{fontSize:11,color:C.d7,marginTop:3,fontWeight:600}}>{label}</div>{sub&&<div style={{fontSize:10,color:C.d5,marginTop:1}}>{sub}</div>}</div>);}

export default function App(){
  const [f,setF]=useState("Todos");const [s,setS]=useState("");const [sel,setSel]=useState(null);const [now,setNow]=useState(new Date());
  useEffect(()=>{const t=setInterval(()=>setNow(new Date()),60000);return()=>clearInterval(t);},[]);
  const fil=OBRAS.filter(o=>(f==="Todos"||o.eixo===f)&&(!s||o.nome.toLowerCase().includes(s.toLowerCase())||o.obj.toLowerCase().includes(s.toLowerCase())));

  return (<div style={{minHeight:"100vh",fontFamily:"'DM Sans','Segoe UI',sans-serif",background:`linear-gradient(180deg,${C.g0} 0%,${C.w} 40%)`}}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,500;9..40,700;9..40,800&display=swap');@keyframes fadeIn{from{opacity:0}to{opacity:1}}*{box-sizing:border-box}::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:${C.g3};border-radius:3px}`}</style>

    <header style={{background:`linear-gradient(135deg,${C.g9} 0%,${C.g7} 100%)`,position:"sticky",top:0,zIndex:100,boxShadow:`0 4px 24px rgba(13,59,30,.3)`}}>
      <div style={{maxWidth:1320,margin:"0 auto",padding:"16px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:38,height:38,borderRadius:10,background:"rgba(255,255,255,.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:800,color:C.g3}}>AJE</div>
          <div>
            <div style={{fontSize:15,fontWeight:800,color:"#fff",letterSpacing:".5px"}}>PAINEL DE OBRAS ESTRUTURANTES DO CEARÁ</div>
            <div style={{fontSize:10,color:C.g3}}>AJE Fortaleza — {OBRAS.length} obras · {EIXOS.length-1} eixos estratégicos</div>
          </div>
        </div>
        <div style={{fontSize:10,color:C.g2,textAlign:"right"}}>
          <div>📡 {now.toLocaleDateString("pt-BR")} {now.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}</div>
          <div style={{opacity:.7}}>Fontes: Seinfra, Gov. CE, MIDR, Min. Transportes, BNDES, Sudene, Cagece</div>
        </div>
      </div>
    </header>

    <main style={{maxWidth:1320,margin:"0 auto",padding:"20px 24px 60px"}}>
      <div style={{display:"flex",flexWrap:"wrap",gap:10,marginBottom:20}}>
        <KPI label="Obras" value={OBRAS.length} sub={`${EIXOS.length-1} eixos`}/>
        <KPI label="Concluídas" value={OBRAS.filter(o=>o.pct===100).length}/>
        <KPI label="Em Andamento" value={OBRAS.filter(o=>o.st==="Em andamento").length}/>
        <KPI label="Investimento" value="R$ 30+ bi" sub="Fed. + Est. + Priv."/>
        <KPI label="Orçamento CE 2026" value="R$ 48,1 bi" sub="R$ 5,26 bi invest."/>
        <KPI label="Desemprego CE" value="5,0%" sub="Menor da história"/>
      </div>

      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:18,alignItems:"center"}}>
        <div style={{display:"flex",gap:0,background:C.g1,borderRadius:10,padding:3,flexWrap:"wrap"}}>
          {EIXOS.map(e=><button key={e} onClick={()=>setF(e)} style={{padding:"7px 13px",border:"none",borderRadius:8,fontSize:11,fontWeight:600,cursor:"pointer",background:f===e?C.g7:"transparent",color:f===e?"#fff":C.g7,transition:"all .2s ease"}}>{e}</button>)}
        </div>
        <input type="text" placeholder="🔍 Buscar..." value={s} onChange={e=>setS(e.target.value)} style={{padding:"8px 14px",borderRadius:10,border:`1.5px solid ${C.g2}`,fontSize:12,outline:"none",width:200,background:C.w,color:C.d9}}/>
        <span style={{fontSize:11,color:C.d5}}>{fil.length} obra{fil.length!==1?"s":""}</span>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(330px,1fr))",gap:16}}>
        {fil.map(o=><Card key={o.id} o={o} onClick={setSel}/>)}
      </div>
      {fil.length===0&&<div style={{textAlign:"center",padding:60,color:C.d5}}>Nenhuma obra encontrada.</div>}

      <footer style={{marginTop:44,paddingTop:18,borderTop:`2px solid ${C.g1}`,textAlign:"center"}}>
        <div style={{fontSize:12,fontWeight:700,color:C.g7}}>AJE FORTALEZA</div>
        <div style={{fontSize:10,color:C.d5,marginTop:3}}>Associação de Jovens Empresários de Fortaleza · Presidência 2025</div>
        <div style={{fontSize:9,color:C.d3,marginTop:6,fontStyle:"italic"}}>Documento de acompanhamento institucional · Dados de fontes públicas oficiais · Pesquisa ativa: 25/mar/2026</div>
      </footer>
    </main>
    <Modal o={sel} onClose={()=>setSel(null)}/>
  </div>);
}
