let produtos = JSON.parse(localStorage.getItem('armazem_produtos')) || [];

document.addEventListener('DOMContentLoaded', () => {
  renderizarTabela();
});

// --- OPERAÇÕES DE PRODUTO ---

function salvarItem(event) {
  event.preventDefault();

  const index = parseInt(document.getElementById('edit_index').value);

  const novoProduto = {
    nome: document.getElementById('cad_nome').value.trim(),
    qtd: parseInt(document.getElementById('cad_qtd').value) || 0,
    local: document.getElementById('cad_local').value.trim(),
    custo: parseFloat(document.getElementById('cad_custo').value) || 0,
    venda: parseFloat(document.getElementById('cad_venda').value) || 0,
    distribuidor: document.getElementById('cad_distribuidor').value.trim(),
    cnpj: document.getElementById('cad_cnpj').value.trim(),
    contato: document.getElementById('cad_contato').value.trim(),
    endereco: document.getElementById('cad_endereco').value.trim()
  };

  if (index === -1) {
    produtos.push(novoProduto);
  } else {
    produtos[index] = novoProduto;
  }

  salvarEAtualizar();
  limparFormulario();
}

function salvarEAtualizar() {
  localStorage.setItem('armazem_produtos', JSON.stringify(produtos));
  renderizarTabela();
}

function renderizarTabela(lista = produtos) {
  const tbody = document.getElementById('tabela_estoque_body');
  tbody.innerHTML = '';

  document.getElementById('stat_total').innerText = lista.length;

  if (lista.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #888;">Nenhum produto cadastrado.</td></tr>`;
    atualizarSelectCalculadora();
    return;
  }

  lista.forEach((item) => {
    // Busca o índice real do elemento na array principal 'produtos' para evitar erros durante buscas
    const indexReal = produtos.indexOf(item);

    const tr = document.createElement('tr');
    if (item.qtd <= 5) {
      tr.classList.add('alerta-estoque');
    }

    const custoFmt = item.custo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const vendaFmt = item.venda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    tr.innerHTML = `
      <td>
        <strong>${item.nome}</strong><br>
        <small style="color: #666;">Setor: ${item.local}</small>
      </td>
      <td>
        ${item.qtd}
        ${item.qtd <= 5 ? '<br><span class="badge-alerta">BAIXO</span>' : ''}
      </td>
      <td>
        Custo: ${custoFmt}<br>
        Venda: <strong>${vendaFmt}</strong>
      </td>
      <td>
        <strong>${item.distribuidor}</strong><br>
        <small>${item.endereco}</small>
      </td>
      <td>
        CNPJ: ${item.cnpj || 'Não informado'}<br>
        <strong>${item.contato}</strong>
      </td>
      <td class="actions-cell">
        <button class="btn btn-edit" onclick="prepararEdicao(${indexReal})">Editar</button>
        <button class="btn btn-delete" onclick="excluirItem(${indexReal})">Excluir</button>
      </td>
    `;

    tbody.appendChild(tr);
  });

  atualizarSelectCalculadora();
}

function prepararEdicao(index) {
  const item = produtos[index];
  if (!item) return;

  document.getElementById('edit_index').value = index;
  document.getElementById('cad_nome').value = item.nome;
  document.getElementById('cad_qtd').value = item.qtd;
  document.getElementById('cad_local').value = item.local;
  document.getElementById('cad_custo').value = item.custo;
  document.getElementById('cad_venda').value = item.venda;
  document.getElementById('cad_distribuidor').value = item.distribuidor;
  document.getElementById('cad_cnpj').value = item.cnpj || '';
  document.getElementById('cad_contato').value = item.contato;
  document.getElementById('cad_endereco').value = item.endereco;

  document.getElementById('form_title').innerText = "EDITAR ITEM";
  document.getElementById('btn_salvar').innerText = "Salvar Alterações";
  document.getElementById('btn_cancelar').style.display = "inline-block";

  sugerirPrecoVendaFormulario();
}

function limparFormulario() {
  document.getElementById('form_item').reset();
  document.getElementById('edit_index').value = "-1";
  document.getElementById('form_title').innerText = "CADASTRO DE ITEM";
  document.getElementById('btn_salvar').innerText = "Adicionar ao Estoque";
  document.getElementById('btn_cancelar').style.display = "none";
  document.getElementById('dica_preco').innerText = 'Insira o custo para ver a sugestão';
}

function excluirItem(index) {
  if (confirm(`Tem certeza que deseja excluir "${produtos[index].nome}"?`)) {
    produtos.splice(index, 1);
    salvarEAtualizar();
  }
}

function filtrarProdutos() {
  const termo = document.getElementById('input_busca').value.toLowerCase();
  
  // Tratamento para evitar erro caso 'cnpj' ou 'endereco' sejam undefined/vazios
  const filtrados = produtos.filter(p => 
    (p.nome && p.nome.toLowerCase().includes(termo)) ||
    (p.distribuidor && p.distribuidor.toLowerCase().includes(termo)) ||
    (p.cnpj && p.cnpj.toLowerCase().includes(termo)) ||
    (p.endereco && p.endereco.toLowerCase().includes(termo))
  );

  renderizarTabela(filtrados);
}

function sugerirPrecoVendaFormulario() {
  const custo = parseFloat(document.getElementById('cad_custo').value) || 0;
  const dica = document.getElementById('dica_preco');

  if (custo > 0) {
    const sugestao = custo * 1.35;
    dica.innerHTML = `💡 Sugestão de Venda Ideal: <strong>R$ ${sugestao.toFixed(2)}</strong> (+35%)`;
  } else {
    dica.innerText = 'Insira o custo para ver a sugestão';
  }
}

// --- CALCULADORA ---

function atualizarSelectCalculadora() {
  const select = document.getElementById('sim_select');
  if (!select) return;

  select.innerHTML = '<option value="">-- Selecione --</option>';

  produtos.forEach((item, idx) => {
    const option = document.createElement('option');
    option.value = idx;
    option.textContent = item.nome;
    select.appendChild(option);
  });
}

function carregarPrecoSimulacao() {
  const idx = document.getElementById('sim_select').value;
  if (idx !== "") {
    document.getElementById('sim_preco').value = produtos[idx].custo;
  }
}

function calcularCustoEComercializacao() {
  const custoUn = parseFloat(document.getElementById('sim_preco').value) || 0;
  const qtd = parseInt(document.getElementById('sim_qtd').value) || 0;

  if (custoUn <= 0 || qtd <= 0) {
    alert('Informe um valor de custo e quantidade válidos.');
    return;
  }

  const totalLote = custoUn * qtd;
  const vendaSugeridaUn = custoUn * 1.35;
  const lucroUn = vendaSugeridaUn - custoUn;

  document.getElementById('total_lote').innerText = totalLote.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  document.getElementById('sugestao_venda').innerText = vendaSugeridaUn.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  document.getElementById('lucro_estimado').innerText = lucroUn.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  document.getElementById('resultado_simulacao').style.display = 'block';
}

// --- MÁSCARAS ---

function mascaraTelefone(input) {
  let v = input.value.replace(/\D/g, "");
  if (v.length > 11) v = v.substring(0, 11);

  if (v.length > 10) {
    input.value = `(${v.substring(0, 2)}) ${v.substring(2, 7)}-${v.substring(7)}`;
  } else if (v.length > 6) {
    input.value = `(${v.substring(0, 2)}) ${v.substring(2, 6)}-${v.substring(6)}`;
  } else if (v.length > 2) {
    input.value = `(${v.substring(0, 2)}) ${v.substring(2)}`;
  } else {
    input.value = v;
  }
}

function mascaraCNPJ(input) {
  let v = input.value.replace(/\D/g, "");
  if (v.length > 14) v = v.substring(0, 14);

  if (v.length > 12) {
    input.value = `${v.substring(0, 2)}.${v.substring(2, 5)}.${v.substring(5, 8)}/${v.substring(8, 12)}-${v.substring(12)}`;
  } else if (v.length > 8) {
    input.value = `${v.substring(0, 2)}.${v.substring(2, 5)}.${v.substring(5, 8)}/${v.substring(8)}`;
  } else if (v.length > 5) {
    input.value = `${v.substring(0, 2)}.${v.substring(2, 5)}.${v.substring(5)}`;
  } else if (v.length > 2) {
    input.value = `${v.substring(0, 2)}.${v.substring(2)}`;
  } else {
    input.value = v;
  }
}
// --- SISTEMA DE PLAYLISTS DA JUKEBOX ---

const estacoes = {
  rock: [
    "Musicas/rock2/Gorillaz.mp3.mp3",
    "Musicas/rock2/kiss.m4a",
    "Musicas/rock2/nirvana.mp3.mp3",
    "Musicas/rock2/radiohead.mp3.mp3",
    "Musicas/rock2/skillet-hero.mp3.mp3",
    "Musicas/rock2/skillet-notgonnadie.mp3.mp3"
  ],
bossa: [
    "Musicas/bossa/Adoniran Barbosa - Trem Das Onze.m4a",
    "Musicas/bossa/Cálice.m4a",
    "Musicas/bossa/Cartola - O Mundo É Um Moinho (Áudio....m4a",
    "Musicas/bossa/Cartola - Preciso Me Encontrar (Áudio Of....m4a",
    "Musicas/bossa/Chico Buarque - João e Maria.m4a",
    "Musicas/bossa/Construção.m4a",
    "Musicas/bossa/Mina do Condomínio.m4a",
    "Musicas/bossa/O Mundo É Um Moinho - Cartola Cover.mp3",
    "Musicas/bossa/o velho e a flor – toquinho e vinícius de ....m4a"
  ]
};

let playlistAtual = [];
let indiceMusicaAtual = 0;

function trocarEstacao() {
  const select = document.getElementById('radio_select');
  const player = document.getElementById('audio_player');
  const info = document.getElementById('info_tocando');

  if (!select) return;
  const chaveEstacao = select.value;

  if (chaveEstacao && estacoes[chaveEstacao]) {
    playlistAtual = estacoes[chaveEstacao];
    indiceMusicaAtual = 0;
    tocarMusicaAtual();
  } else {
    player.pause();
    player.src = "";
    if (info) info.innerHTML = "Tocando: <em>Nenhuma estação selecionada</em>";
  }
}

function tocarMusicaAtual() {
  const player = document.getElementById('audio_player');
  const info = document.getElementById('info_tocando');

  if (playlistAtual.length === 0) return;

  const caminhoOriginal = playlistAtual[indiceMusicaAtual];
  
  // encodeURI trata espaços sem quebrar os caminhos das pastas
  player.src = encodeURI(caminhoOriginal);

  if (info) {
    const nomeArquivo = caminhoOriginal.split('/').pop();
    info.innerHTML = `Tocando: <strong>${nomeArquivo}</strong> (${indiceMusicaAtual + 1}/${playlistAtual.length})`;
  }

  player.load();
  player.play().catch(err => {
    console.log("Aguardando clique no play do usuário:", err);
  });
}

// Passar de música automaticamente
document.addEventListener('DOMContentLoaded', () => {
  const player = document.getElementById('audio_player');

  if (player) {
    player.addEventListener('ended', () => {
      indiceMusicaAtual++;
      if (indiceMusicaAtual >= playlistAtual.length) {
        indiceMusicaAtual = 0;
      }
      tocarMusicaAtual();
    });
  }
});