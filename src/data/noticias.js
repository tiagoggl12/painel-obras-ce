// ── Feed de Notícias das Obras ──────────────────────────────
// Últimas notícias sobre as obras monitoradas (CE e Brasil),
// compiladas de fontes públicas oficiais. data em ISO para ordenação;
// quando só o mês é conhecido, usa-se o dia 01.

export const NOTICIAS = [
  { data:"2026-07-01", regiao:"BR", icon:"🌉", obra:"Ponte Salvador–Itaparica",
    titulo:"Governo Federal dá início oficial às obras da Ponte Salvador–Itaparica",
    resumo:"Com recursos do Novo PAC (R$ 11,6 bi no total), começa a construção da maior ponte sobre o mar da América Latina: 12,4 km sobre a Baía de Todos-os-Santos, com entrega prevista para 2031.",
    fonte:"Casa Civil", obraId:"br9" },

  { data:"2026-06-25", regiao:"BR", icon:"🚇", obra:"Linha 6-Laranja (Metrô SP)",
    titulo:"Linha 6-Laranja chega a 88% e mantém inauguração para outubro",
    resumo:"Cinco estações superam 90% das obras civis — Água Branca lidera com 97%. Primeiro trecho (Brasilândia–Perdizes) segue previsto para outubro de 2026.",
    fonte:"Mobilidade360 · Diário do Transporte", obraId:"br1" },

  { data:"2026-06-15", regiao:"BR", icon:"⚛️", obra:"Angra 3",
    titulo:"Decisão sobre Angra 3 se aproxima; obra parada custa R$ 1 bi por ano",
    resumo:"Com 67% de conclusão, a usina aguarda decisão do governo entre retomar (R$ 23-24 bi) ou desistir (R$ 22-26 bi). TCU analisa os documentos da retomada.",
    fonte:"Câmara dos Deputados · TCU", obraId:"br5" },

  { data:"2026-05-31", regiao:"BR", icon:"🚂", obra:"FIOL",
    titulo:"FIOL: trecho 2 atinge 71% e governo cobra entrega até dezembro",
    resumo:"Os 485 km entre Caetité e Barreiras (BA) avançam a 71% de execução. Novo edital busca destravar os 127 km restantes do lote 1F; trecho 3 ainda aguarda licença.",
    fonte:"Click Petróleo e Gás", obraId:"br2" },

  { data:"2026-05-14", regiao:"BR", icon:"🚇", obra:"Túnel Santos–Guarujá",
    titulo:"SP abre crédito de R$ 2,6 bi e garante cronograma do Túnel Santos–Guarujá",
    resumo:"Após a assinatura do contrato da PPP com a Mota-Engil, os projetos executivos avançam. Mobilização dos canteiros em 2027 e operação prevista para 2031.",
    fonte:"Agência SP · Casa Civil", obraId:"br8" },

  { data:"2026-05-10", regiao:"BR", icon:"🇧🇷", obra:"Novo PAC",
    titulo:"Novo PAC já executou 89,5% dos recursos previstos até 2026",
    resumo:"Segundo a Casa Civil, a União investiu R$ 280 bi em infraestrutura em três anos (42% mais que no ciclo anterior). Nordeste tem R$ 408,7 bi previstos no programa.",
    fonte:"Agência Gov · Casa Civil", obraId:null },

  { data:"2026-04-15", regiao:"BR", icon:"🚆", obra:"TIC SP–Campinas",
    titulo:"Máquinas em campo marcam o início do Trem Intercidades SP–Campinas",
    resumo:"Obra de R$ 14,2 bi promete ligar as duas cidades em 64 min a 140 km/h. BNDES financia R$ 10,65 bi do pacote de mobilidade paulista que inclui o TIC.",
    fonte:"O Empreiteiro · BNDES", obraId:"br7" },

  { data:"2026-03-30", regiao:"BR", icon:"🛣️", obra:"BR-381 (MG)",
    titulo:"União promete duplicação da BR-381 em BH até 2028; obras no 2º semestre",
    resumo:"DNIT investirá R$ 903 mi no trecho BH–Caeté. Na concessão, a Nova 381 antecipa 6 km de duplicação em Antônio Dias, com obras em 12 encostas até fev/2028.",
    fonte:"O Tempo · Min. Transportes", obraId:"br10" },

  { data:"2026-03-19", regiao:"CE", icon:"🚂", obra:"Transnordestina",
    titulo:"Sudene libera R$ 152,4 mi para a Transnordestina",
    resumo:"Total liberado do FDNE chega a R$ 6,6 bi de R$ 7,4 bi. 727 km concluídos e mais 100 km previstos até abril. Trilhos chineses no Pecém garantem material para 100% da via.",
    fonte:"SECOM / Gov. Federal", obraId:5 },

  { data:"2026-03-17", regiao:"CE", icon:"🛣️", obra:"BR-222",
    titulo:"Ministro entrega 24 km duplicados da BR-222 entre Caucaia e Pecém",
    resumo:"Acesso Fortaleza–Pecém duplicado beneficia 11,6 mil motoristas/dia. Novos lotes Primavera–Sobral–PI contratados; recursos federais de logística para o CE crescem 187%.",
    fonte:"Min. Transportes", obraId:10 },

  { data:"2026-03-10", regiao:"BR", icon:"🌉", obra:"Ponte Bioceânica",
    titulo:"Ponte Bioceânica passa de 84% e Paraguai projeta conclusão em 2026",
    resumo:"A ponte de 1.294 m entre Porto Murtinho (MS) e Carmelo Peralta abre a rota rodoviária aos portos do Pacífico. Passarela central já uniu os dois lados.",
    fonte:"Campo Grande News · ABTI", obraId:"br6" },

  { data:"2026-03-05", regiao:"CE", icon:"🚇", obra:"Metrô Linha Leste",
    titulo:"Linha Leste avança e prevê liberação parcial da Av. Santos Dumont em julho",
    resumo:"Obra atinge 42,4% com +1.100 trabalhadores. TBM 02 concluiu o 1º túnel (1.734 m); desvio da TBM 01 é corrigido pelo consórcio sem custo ao Estado. BNDES visitou o canteiro.",
    fonte:"Gov. CE · InfraNews", obraId:1 },

  { data:"2026-03-01", regiao:"CE", icon:"⚡", obra:"H2V Pecém",
    titulo:"Eólica offshore e H2V ganham palco na Feira da Indústria da FIEC",
    resumo:"Projeto da Fortescue na ZPE (~US$ 5 bi, fase 1 aprovada) segue no radar como âncora do hub de hidrogênio verde do Pecém.",
    fonte:"Seinfra-CE", obraId:14 },

  { data:"2026-02-15", regiao:"CE", icon:"🚰", obra:"PPP Saneamento 127 cidades",
    titulo:"Maior PPP de saneamento do Brasil tem edital previsto para abril",
    resumo:"R$ 7 bi para universalizar água e esgoto em 127 cidades cearenses (1,5 mi de pessoas). TCE-CE analisa os estudos; leilão será na B3, com retorno estimado de R$ 27 bi.",
    fonte:"TrendsCE · Cagece", obraId:16 },

  { data:"2026-02-01", regiao:"CE", icon:"⚡", obra:"Data Center ZPE",
    titulo:"Data center na ZPE desponta como motor do PIB cearense em 2026",
    resumo:"Resenha do Banco do Brasil projeta crescimento de +3,8% do PIB do Ceará impulsionado pelo hub digital e o parque de energia renovável associado.",
    fonte:"SDE-CE / Banco do Brasil", obraId:15 },

  { data:"2026-01-20", regiao:"CE", icon:"🏖️", obra:"Saneamento do Preá",
    titulo:"Saneamento do Preá chega a 58,5% e entra na fase de drenagem",
    resumo:"Sistema de água (56,4%) e esgoto (74,7%) avança no polo internacional de kitesurf vizinho a Jericoacoara. Investimento de R$ 99,9 mi via CAF, entrega em abr/2027.",
    fonte:"Setur-CE", obraId:20 },

  { data:"2026-01-15", regiao:"CE", icon:"🚇", obra:"VLT Ramal Aeroporto",
    titulo:"VLT Ramal Aeroporto completa primeiro mês de operação",
    resumo:"Entregue em janeiro, o ramal integra o Aeroporto de Fortaleza à Linha Nordeste (11 estações) e beneficia 5 bairros. Polo esportivo de 18 mil m² inaugurado no entorno.",
    fonte:"Seinfra-CE", obraId:2 },

  { data:"2025-12-20", regiao:"CE", icon:"💧", obra:"Cinturão das Águas",
    titulo:"CAC atinge 91% e supera a meta do ano",
    resumo:"Lotes 1, 2 e 5 concluídos e operando; lote 3 em 86% e lote 4 em 70%. Maior obra hídrica estadual do Brasil emprega 1.500 pessoas, com entrega prevista para jun/2026.",
    fonte:"Gov. CE", obraId:6 },

  { data:"2025-12-10", regiao:"CE", icon:"💧", obra:"Eixão das Águas",
    titulo:"BNDES assina R$ 622,6 mi para a duplicação do Eixão das Águas",
    resumo:"Financiamento combina Fundo Clima e Invest Impacto. Canais prontos; testes dos sifões em mar/2026 e entrega parcial em set/2026 — água para 4 milhões de pessoas.",
    fonte:"BNDES · SRH-CE", obraId:7 },
];
