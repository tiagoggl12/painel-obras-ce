// ── Paleta de Cores ──────────────────────────────────────────
export const C = {
  g9:"#0D3B1E", g8:"#145A2E", g7:"#1B6B3A", g6:"#218C48", g5:"#2EA55D", g4:"#4CC97A",
  g3:"#7EDDA0", g2:"#B5ECCC", g1:"#E0F7EA", g0:"#F0FBF4", w:"#FFF",
  d9:"#1A1A1A", d7:"#4A4A4A", d5:"#7A7A7A", d3:"#C4C4C4", d1:"#F0F0F0",
  acc:"#34C26B", warn:"#F0AD4E", err:"#E74C3C", info:"#3498DB", pur:"#8E44AD",
};

// ── Dark mode overrides ─────────────────────────────────────
export const CD = {
  bg: "#0F1A14",
  surface: "#162018",
  surfaceHover: "#1D2B22",
  border: "#2A3D30",
  borderHover: "#3A5540",
  text: "#E8F5EC",
  textMuted: "#9AB8A5",
  textFaint: "#6A8A76",
  headerBg: "#0A1510",
  kpiBg: "#162018",
  filterBg: "#1D2B22",
  filterActive: "#2EA55D",
  inputBg: "#1D2B22",
  inputBorder: "#2A3D30",
  cardBg: "#162018",
  modalBg: "#162018",
  modalOverlay: "rgba(0,0,0,.7)",
  newsBox: "#1D2B22",
};

// ── Helpers de cor ──────────────────────────────────────────
export const statusColor = (s) => {
  if (!s) return C.d5;
  const l = s.toLowerCase();
  if (l.includes("concluída")) return "#27AE60";
  if (l.includes("andamento")) return C.info;
  if (l.includes("retomada") || l.includes("início") || l.includes("implantação")) return C.pur;
  if (l.includes("licitação")) return "#E67E22";
  return C.warn;
};

export const progressColor = (p) => {
  if (p == null) return C.d3;
  if (p >= 75) return "#27AE60";
  if (p >= 40) return C.warn;
  return C.err;
};

// ── Eixos ───────────────────────────────────────────────────
export const EIXOS = [
  "Todos","Mobilidade","Ferrovia","Hídrica","Rodovias",
  "Energia","Saneamento","Saúde","Turismo",
];

// ── Dados das Obras ─────────────────────────────────────────
export const OBRAS = [
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

// ── Opções de Ordenação ─────────────────────────────────────
export const SORT_OPTIONS = [
  { key: "default",  label: "Padrão" },
  { key: "pct_desc", label: "Execução ↓" },
  { key: "pct_asc",  label: "Execução ↑" },
  { key: "name",     label: "Nome A–Z" },
  { key: "status",   label: "Status" },
];

export function sortObras(list, key) {
  const sorted = [...list];
  switch (key) {
    case "pct_desc":
      return sorted.sort((a, b) => (b.pct ?? -1) - (a.pct ?? -1));
    case "pct_asc":
      return sorted.sort((a, b) => (a.pct ?? 999) - (b.pct ?? 999));
    case "name":
      return sorted.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    case "status": {
      const order = { "Concluída": 0, "Concluída*": 0, "Em andamento": 1, "Retomada": 2, "Implantação": 2, "Início": 3, "Licitação": 4, "Aprovado": 5, "Planejamento": 6 };
      return sorted.sort((a, b) => (order[a.st] ?? 9) - (order[b.st] ?? 9));
    }
    default:
      return sorted;
  }
}
