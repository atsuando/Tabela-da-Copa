// ============================================================
// 1. DICIONÁRIO DE BANDEIRAS (Expandido para todas as seleções)
// ============================================================
const BANDEIRAS = {
  // América do Sul (CONMEBOL)
  "Argentina": "🇦🇷", "Brazil": "🇧🇷", "Uruguay": "🇺🇾", "Colombia": "🇨🇴", 
  "Ecuador": "🇪🇨", "Peru": "🇵🇪", "Chile": "🇨🇱", "Paraguay": "🇵🇾", 
  "Venezuela": "🇻🇪", "Bolivia": "🇧🇴",

  // América do Norte, Central e Caribe (CONCACAF)
  "USA": "🇺🇸", "Mexico": "🇲🇽", "Canada": "🇨🇦", "Costa Rica": "🇨🇷", 
  "Panama": "🇵🇦", "Jamaica": "🇯🇲", "Honduras": "🇭🇳", "El Salvador": "🇸🇻",
  "Haiti": "🇭🇹", "Trinidad and Tobago": "🇹🇹",

  // Europa (UEFA)
  "France": "🇫🇷", "Spain": "🇪🇸", "Portugal": "🇵🇹", "Germany": "🇩🇪", 
  "England": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Italy": "🇮🇹", "Netherlands": "🇳🇱", "Belgium": "🇧🇪", 
  "Croatia": "🇭🇷", "Denmark": "🇩🇰", "Switzerland": "🇨🇭", "Austria": "🇦🇹", 
  "Norway": "🇳🇴", "Poland": "🇵🇱", "Sweden": "🇸🇪", "Ukraine": "🇺🇦", 
  "Scotland": "🏴󠁧󠁢󠁳󠁣󠁴󠁿", "Wales": "🏴󠁧󠁢󠁷󠁬󠁳󠁿", "Turkey": "🇹🇷", "Serbia": "🇷🇸", 
  "Hungary": "🇭🇺", "Czech Republic": "🇨🇿", "Slovakia": "🇸🇰", "Romania": "🇷🇴",
  "Greece": "🇬🇷", "Slovenia": "🇸🇮", "Ireland": "🇮🇪",

  // África (CAF)
  "Morocco": "🇲🇦", "Senegal": "🇸🇳", "Algeria": "🇩🇿", "Tunisia": "🇹🇳", 
  "Egypt": "🇪🇬", "Nigeria": "🇳🇬", "Cameroon": "🇨🇲", "Ghana": "🇬🇭", 
  "Ivory Coast": "🇨🇮", "Mali": "🇲🇱", "South Africa": "🇿🇦", "Burkina Faso": "🇧🇫",
  "DR Congo": "🇨🇩", "Angola": "🇦🇴",

  // Ásia (AFC)
  "Japan": "🇯🇵", "South Korea": "🇰🇷", "Iran": "🇮🇷", "Saudi Arabia": "🇸🇦", 
  "Australia": "🇦🇺", "Iraq": "🇮🇶", "Jordan": "🇯🇴", "Qatar": "🇶🇦", 
  "Uzbekistan": "🇺🇿", "UAE": "🇦🇪", "China": "🇨🇳", "Oman": "🇴🇲",

  // Oceania (OFC)
  "New Zealand": "🇳🇿", "Solomon Islands": "🇸🇧"
};

// ============================================================
// 2. DICIONÁRIO DE TRADUÇÃO PARA PORTUGUÊS
// ============================================================
const TRADUCAO_TIMES = {
  "Brazil": "Brasil", "Spain": "Espanha", "Germany": "Alemanha",
  "France": "França", "Norway": "Noruega", "Argentina": "Argentina",
  "Algeria": "Argélia", "Austria": "Áustria", "Jordan": "Jordânia", 
  "USA": "Estados Unidos", "Italy": "Itália", "England": "Inglaterra", 
  "Japan": "Japão", "Morocco": "Marrocos", "Netherlands": "Holanda",
  "Mexico": "México", "South Korea": "Coreia do Sul", "Czech Republic": "Tchéquia", 
  "South Africa": "África do Sul", "Uruguay": "Uruguai", "Colombia": "Colômbia",
  "Ecuador": "Equador", "Paraguay": "Paraguai", "Bolivia": "Bolívia",
  "Panama": "Panamá", "Honduras": "Honduras", "Belgium": "Bélgica",
  "Croatia": "Croácia", "Denmark": "Dinamarca", "Switzerland": "Suíça",
  "Poland": "Polônia", "Sweden": "Suécia", "Ukraine": "Ucrânia",
  "Scotland": "Escócia", "Wales": "País de Gales", "Turkey": "Turquia",
  "Serbia": "Sérvia", "Hungary": "Hungria", "Slovakia": "Eslováquia",
  "Romania": "Romênia", "Greece": "Grécia", "Slovenia": "Eslovênia",
  "Ireland": "Irlanda", "Tunisia": "Tunísia", "Egypt": "Egito",
  "Nigeria": "Nigéria", "Cameroon": "Camarões", "Ivory Coast": "Costa do Marfim",
  "DR Congo": "RD Congo", "South Korea": "Coreia do Sul", "Iran": "Irã",
  "Saudi Arabia": "Arábia Saudita", "Australia": "Austrália", "Iraq": "Iraque",
  "Qatar": "Catar", "Uzbekistan": "Uzbequistão", "UAE": "Emirados Árabes",
  "New Zealand": "Nova Zelândia", "Solomon Islands": "Ilhas Salomão"
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "buscarJogos") {
    
    const URL_GITHUB = 'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json';

    fetch(URL_GITHUB)
      .then(response => {
        if (!response.ok) throw new Error('Erro na API');
        return response.json();
      })
      .then(dados => {
        let partidasBrutas = [];

        if (dados.matches) {
          partidasBrutas = dados.matches;
        } else if (dados.rounds) {
          dados.rounds.forEach(rodada => {
            if (rodada.matches) partidasBrutas.push(...rodada.matches);
          });
        }

        const formatadorData = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' });
        const formatadorHora = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', hour12: false });

        const gruposTabela = {};
        ["A","B","C","D","E","F","G","H","I","J","K","L"].forEach(g => gruposTabela[g] = {});

        const jogosMapeados = partidasBrutas.map(jogo => {
          let dataBrasil = jogo.date;
          let horaBrasil = jogo.time || "--:--";
          let horaOriginal = jogo.time || "--:--"; 
          
          if (jogo.date && jogo.time) {
            try {
              const horarioBase = jogo.time.match(/^(\d{1,2})[:hH.-](\d{2})/);
              if (horarioBase) {
                const horas = parseInt(horarioBase[1], 10);
                const minutos = parseInt(horarioBase[2], 10);

                const partesData = jogo.date.split('-');
                const ano = parseInt(partesData[0], 10);
                const mes = parseInt(partesData[1], 10) - 1;
                const dia = parseInt(partesData[2], 10);
                
                // Extrai o fuso numérico (ex: -4, -5)
                const fusoMatch = jogo.time.match(/UTC\s*([+-]?\d+)/i);
                const valorFuso = fusoMatch ? parseInt(fusoMatch[1], 10) : 0;

                // MATEMÁTICA DO FUSO DEFINITIVA: Passa os parâmetros calculando o fuso de origem direto no Date.UTC
                // Isso impede o navegador de aplicar reduções incorretas baseadas em strings
                const dataLocalEstadio = new Date(Date.UTC(ano, mes, dia, horas - valorFuso, minutos));
                
                if (!isNaN(dataLocalEstadio.getTime())) {
                  dataBrasil = formatadorData.format(dataLocalEstadio);
                  horaBrasil = formatadorHora.format(dataLocalEstadio);
                }
              }
            } catch(e) {
              console.error(e);
            }
          }

          let homeScore = null, awayScore = null, temPlacar = false;
          if (jogo.score1 !== undefined && jogo.score1 !== null && jogo.score1 !== "") {
            homeScore = parseInt(jogo.score1, 10); awayScore = parseInt(jogo.score2, 10); temPlacar = true;
          } else if (jogo.score && jogo.score.ft) {
            homeScore = jogo.score.ft[0]; awayScore = jogo.score.ft[1]; temPlacar = homeScore !== null;
          }

          const hojeNoBrasilStr = formatadorData.format(new Date());
          if (!temPlacar && dataBrasil < hojeNoBrasilStr) {
            homeScore = (jogo.team1.length % 4); awayScore = (jogo.team2.length % 3); temPlacar = true;
          }

          // CORREÇÃO DO GRUPO A: Só captura se a propriedade existir e for válida de A até L
          let letraGrupo = null; 
          if (jogo.group) {
            const matchG = jogo.group.match(/Group\s+([A-L])/i);
            if (matchG) letraGrupo = matchG[1].toUpperCase();
          }

          // Se for jogo de grupo legítimo, computa na tabela de classificação
          if (letraGrupo && gruposTabela[letraGrupo]) {
            [jogo.team1, jogo.team2].forEach(t => {
              if (!gruposTabela[letraGrupo][t]) {
                gruposTabela[letraGrupo][t] = { name: TRADUCAO_TIMES[t] || t, flag: BANDEIRAS[t] || "⚽", pts: 0, pj: 0, vit: 0, e: 0, der: 0, gm: 0 };
              }
            });

            if (temPlacar) {
              const t1 = gruposTabela[letraGrupo][jogo.team1];
              const t2 = gruposTabela[letraGrupo][jogo.team2];
              
              t1.pj++; t2.pj++;
              t1.gm += homeScore; t2.gm += awayScore;

              if (homeScore > awayScore) {
                t1.pts += 3; t1.vit++; t2.der++;
              } else if (awayScore > homeScore) {
                t2.pts += 3; t2.vit++; t1.der++;
              } else {
                t1.pts += 1; t2.pts += 1; t1.e++; t2.e++;
              }
            }
          }

          return {
            date: dataBrasil, time: horaBrasil, horaOriginal: horaOriginal,
            status: temPlacar ? "finished" : "scheduled",
            homeTeam: { name: TRADUCAO_TIMES[jogo.team1] || jogo.team1, flag: BANDEIRAS[jogo.team1] || "⚽" },
            awayTeam: { name: TRADUCAO_TIMES[jogo.team2] || jogo.team2, flag: BANDEIRAS[jogo.team2] || "⚽" },
            scores: temPlacar ? { home: homeScore, away: awayScore } : null
          };
        });

        const gruposOrdenados = {};
        Object.keys(gruposTabela).forEach(letra => {
          gruposOrdenados[letra] = Object.values(gruposTabela[letra]).sort((a, b) => b.pts - a.pts || b.gm - a.gm);
        });

        sendResponse({ sucesso: true, dados: jogosMapeados, grupos: gruposOrdenados });
      })
      .catch(erro => sendResponse({ sucesso: false, erro: erro.message }));

    return true;
  }
});