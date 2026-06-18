var cacheJogos = null; 
var cacheGrupos = null; 
var dataSelecionada = new Date(); 

// Variáveis de controle para o Arrastar e Soltar (Drag & Drop)
var isClick = true;
var dragStartX = 0, dragStartY = 0;
var btnInitialLeft = 0, btnInitialTop = 0;

if (!document.getElementById('copa-floating-btn')) {
  const floatingButton = document.createElement('div');
  floatingButton.id = 'copa-floating-btn';
  floatingButton.innerHTML = '🏆';
  document.body.appendChild(floatingButton);

  // ============================================================
  // LÓGICA DE DRAG & DROP (Mover o botão pela tela)
  // ============================================================
  floatingButton.addEventListener('mousedown', (e) => {
    // Só ativa se for com o botão esquerdo do mouse
    if (e.button !== 0) return;
    
    isClick = true; // Começa assumindo que o usuário quer clicar
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    
    // Pega a posição atual do botão na tela
    const rect = floatingButton.getBoundingClientRect();
    btnInitialLeft = rect.left;
    btnInitialTop = rect.top;

    function onMouseMove(moveEvent) {
      const dx = moveEvent.clientX - dragStartX;
      const dy = moveEvent.clientY - dragStartY;

      // Se o mouse moveu mais de 5 pixels, consideramos que é um arrasto
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        isClick = false; // Cancela a intenção de clique
        
        // Desativa a transição do CSS temporariamente para o botão seguir o mouse sem lag
        floatingButton.style.transition = 'none'; 
        
        // Remove as âncoras originais (bottom e right) para usar top e left livres
        floatingButton.style.bottom = 'auto'; 
        floatingButton.style.right = 'auto';
        
        // Calcula a nova posição
        let newLeft = btnInitialLeft + dx;
        let newTop = btnInitialTop + dy;
        
        // Lógica de colisão: impede o botão de sair da tela (46 é a largura/altura do botão)
        newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - 46));
        newTop = Math.max(0, Math.min(newTop, window.innerHeight - 46));
        
        floatingButton.style.left = `${newLeft}px`;
        floatingButton.style.top = `${newTop}px`;
      }
    }

    function onMouseUp() {
      // Quando o usuário soltar o botão, limpa os rastreadores do mouse
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      
      // Devolve a transição suave de hover para o CSS
      floatingButton.style.transition = 'transform 0.2s ease'; 
    }

    // Inicia o rastreamento do mouse solto pela tela
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });

  // ============================================================
  // LÓGICA DO CLIQUE (Abrir a janela)
  // ============================================================
  floatingButton.addEventListener('click', (e) => {
    // Se o usuário estava arrastando, aborta a abertura da janela
    if (!isClick) {
      e.preventDefault();
      return;
    }

    const modal = document.getElementById('copa-modal');
    if (modal) {
      modal.style.display = 'flex';
      dataSelecionada = new Date(); 
      inicializarDados();
    }
  });
}

if (!document.getElementById('copa-modal')) {
  const modal = document.createElement('div');
  modal.id = 'copa-modal';
  modal.innerHTML = `
    <div class="copa-modal-content">
      <span class="copa-close-btn">&times;</span>
      
      <div class="copa-navegacao-header">
        <span class="copa-seta" id="copa-btn-ant">◀</span>
        <h2 id="copa-txt-data">Carregando...</h2>
        <span class="copa-seta" id="copa-btn-prox">▶</span>
      </div>
      <div class="copa-game-list" id="copa-lista-dinamica"></div>

      <div class="copa-secao-grupos">
        <h3>Classificação por Grupos</h3>
        <div class="copa-grid-letras" id="copa-letras-container"></div>
        <div id="copa-tabela-container"></div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('copa-btn-ant').addEventListener('click', () => { dataSelecionada.setDate(dataSelecionada.getDate() - 1); renderizarJanela(); });
  document.getElementById('copa-btn-prox').addEventListener('click', () => { dataSelecionada.setDate(dataSelecionada.getDate() + 1); renderizarJanela(); });
  modal.querySelector('.copa-close-btn').addEventListener('click', () => { modal.style.display = 'none'; deslogarCache(); });
  modal.addEventListener('click', (e) => { if (e.target === modal) { modal.style.display = 'none'; deslogarCache(); } });
}

function deslogarCache() { 
  cacheJogos = null; 
  cacheGrupos = null; 
  document.getElementById('copa-tabela-container').innerHTML = '';
  document.getElementById('copa-letras-container').innerHTML = '';
}

function renderizarJanela() {
  const listaContainer = document.getElementById('copa-lista-dinamica');
  const tituloData = document.getElementById('copa-txt-data');
  if (!listaContainer || !tituloData || !cacheJogos) return;

  tituloData.innerText = dataSelecionada.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
  listaContainer.innerHTML = '';

  const ano = dataSelecionada.getFullYear();
  const mes = String(dataSelecionada.getMonth() + 1).padStart(2, '0');
  const dia = String(dataSelecionada.getDate()).padStart(2, '0');
  const dataAlvoStr = `${ano}-${mes}-${dia}`;

  const jogosDoDia = cacheJogos
    .filter(jogo => jogo.date === dataAlvoStr)
    .sort((a, b) => {
      const horaA = a.time || "24:00"; 
      const horaB = b.time || "24:00";
      return horaA.localeCompare(horaB);
    });

  if (jogosDoDia.length === 0) {
    listaContainer.innerHTML = `<p style="text-align:center; color:#666; padding:10px 0;">Nenhum jogo nesta data.</p>`;
  } else {
    jogosDoDia.forEach(jogo => {
      const card = document.createElement('div');
      card.className = 'copa-game-card';
      const placarCasa = jogo.scores ? jogo.scores.home : '';
      const placarFora = jogo.scores ? jogo.scores.away : '';
      
      let infoMeio = jogo.status === 'scheduled' 
        ? `<span><b>${jogo.time}</b><br><small style="font-size:9px; color:#999;">(${jogo.horaOriginal} loc)</small></span>` 
        : `<span style="font-size:16px; font-weight:bold;">${placarCasa} - ${placarFora}<br><small style="font-size:9px; color:#666;">Fim</small></span>`;

      card.innerHTML = `<span class="copa-team">${jogo.homeTeam.name} ${jogo.homeTeam.flag}</span><span class="copa-info">${infoMeio}</span><span class="copa-team right">${jogo.awayTeam.flag} ${jogo.awayTeam.name}</span>`;
      listaContainer.appendChild(card);
    });
  }
  
  const letrasContainer = document.getElementById('copa-letras-container');
  if (letrasContainer && letrasContainer.children.length === 0) {
    ["A","B","C","D","E","F","G","H","I","J","K","L"].forEach((letra) => {
      const btn = document.createElement('button');
      btn.className = 'copa-btn-letra'; 
      btn.innerText = letra;
      
      btn.addEventListener('click', () => {
        const jaEstavaAtivo = btn.classList.contains('ativo');
        
        document.querySelectorAll('.copa-btn-letra').forEach(b => b.classList.remove('ativo'));
        
        if (jaEstavaAtivo) {
          document.getElementById('copa-tabela-container').innerHTML = '';
        } else {
          btn.classList.add('ativo');
          renderizarTabelaGrupo(letra);
        }
      });
      letrasContainer.appendChild(btn);
    });
  }
}

function renderizarTabelaGrupo(letra) {
  const container = document.getElementById('copa-tabela-container');
  if (!container || !cacheGrupos || !cacheGrupos[letra]) return;

  const times = cacheGrupos[letra];
  if (times.length === 0) {
    container.innerHTML = `<p style="text-align:center; color:#999; margin-top:10px;">Nenhum time computado para este grupo ainda.</p>`;
    return;
  }

  let htmlTabela = `
    <div class="copa-wrapper-tabela">
      <h4>Grupo ${letra}</h4>
      <table class="copa-tabela-classificacao">
        <thead>
          <tr>
            <th style="text-align:center; width:30px;">#</th>
            <th>Equipe</th>
            <th style="text-align:center;">Pts</th>
            <th style="text-align:center;">PJ</th>
            <th style="text-align:center;">VIT</th>
            <th style="text-align:center;">E</th>
            <th style="text-align:center;">DER</th>
            <th style="text-align:center;">GM</th>
          </tr>
        </thead>
        <tbody>
  `;

  times.forEach((time, index) => {
    const posicao = index + 1;
    const classeZona = posicao <= 2 ? 'copa-linha-zona' : '';

    htmlTabela += `
      <tr class="${classeZona}">
        <td style="text-align:center; color:#888; font-size:12px;">${posicao}</td>
        <td><span style="margin-right:5px;">${time.flag}</span> ${time.name}</td>
        <td style="text-align:center; font-weight:bold; color:#000;">${time.pts}</td>
        <td style="text-align:center;">${time.pj}</td>
        <td style="text-align:center;">${time.vit}</td>
        <td style="text-align:center;">${time.e}</td>
        <td style="text-align:center;">${time.der}</td>
        <td style="text-align:center; color:#666;">${time.gm}</td>
      </tr>
    `;
  });

  htmlTabela += `</tbody></table></div>`;
  container.innerHTML = htmlTabela;
}

function inicializarDados() {
  if (!chrome.runtime || !chrome.runtime.id) return;
  chrome.runtime.sendMessage({ action: "buscarJogos" }, (resposta) => {
    if (resposta && resposta.sucesso) {
      cacheJogos = resposta.dados;
      cacheGrupos = resposta.grupos;
      renderizarJanela();
    }
  });
}