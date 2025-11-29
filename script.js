// --- CONFIGURAÇÃO SUPABASE ---
const SUPABASE_URL = 'https://nwotexxfmicpthmdxipy.supabase.co';
const SUPABASE_KEY = 'sb_publishable_8kqq1tTYyBA0J0D21oxZJQ_wMfoMO5O'; 

// Cria o cliente usando 'window.supabase' para evitar erros de referência
const dbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const SENHA_LIDER = "Adrianocsmusic";

// --- DADOS DE SEGURANÇA (MOCK DATA) ---
// Usados se a internet cair ou o banco estiver vazio na primeira vez
const mockDB = {
    reflexao: "O louvor é a chave que abre as portas do impossível.",
    versiculo: "João 4:23",
    
    bancoCantores: ["Pablo", "André", "Cintia", "Sara", "Ana Livia", "Suellen", "Debora", "Adriele"],
    
    bancoMusicos: [
        {nome: "Everson", instrumento: "Baixista"},
        {nome: "Marcos", instrumento: "Guitarrista"},
        {nome: "Ana Livia", instrumento: "Tecladista"},
        {nome: "Adriano", instrumento: "Baterista"},
        {nome: "Pablo", instrumento: "Violão"}
    ],

    bancoMusicas: [
        {nome: "Lugar Secreto", artista: "Gabriela Rocha"},
        {nome: "Bondade de Deus", artista: "Isaias Saad"},
        {nome: "Ousado Amor", artista: "Nívea Soares"}
    ],

    avisos: ["Ensaio Geral Quinta 19h30"],
    
    // Estrutura de Agenda
    agenda: [
        {data: "SEX", evento: "Culto de Ensino", obs: "Todos de Preto"},
        {data: "DOM", evento: "Santa Ceia", obs: "Social"}
    ],

    escalaCantoresAtual: [], 
    repertorioAtual: {}      
};

let dadosApp = JSON.parse(JSON.stringify(mockDB)); 

// --- INICIALIZAÇÃO ---
window.onload = async function() {
    console.log("Iniciando Sistema...");
    await carregarDados(); 
    renderizarTudo();      
    gerarCardsTime(); 
};

// --- 1. BANCO DE DADOS ---
async function carregarDados() {
    try {
        let { data, error } = await dbClient.from('app_louvor').select('dados_json').eq('id', 1).single();

        if (data) {
            console.log("Conectado à Nuvem!");
            const dadosNuvem = data.dados_json;
            // Garante campos novos se não existirem
            if(!dadosNuvem.bancoMusicos) dadosNuvem.bancoMusicos = mockDB.bancoMusicos;
            if(!dadosNuvem.agenda) dadosNuvem.agenda = mockDB.agenda;
            dadosApp = dadosNuvem;
        } else {
            console.warn("Banco vazio. Usando local.");
            inicializarVazios();
        }
    } catch (err) {
        console.error("Erro conexão:", err);
        inicializarVazios();
    }
}

function inicializarVazios() {
    if(dadosApp.escalaCantoresAtual.length === 0) gerarEscalaCantores(false);
    if(!dadosApp.repertorioAtual.sexta) gerarRepertorioSemanal(false);
}

async function salvarNoSupabase() {
    try {
        await dbClient.from('app_louvor').update({ dados_json: dadosApp }).eq('id', 1);
        alert("Salvo com sucesso!");
        renderizarTudo();
        
        // Atualiza painéis admin se abertos
        if(document.getElementById('painel-admin').style.display === 'block') {
            renderizarEditorEscala();
            renderizarListaAdmin();
        }
    } catch (err) {
        alert("Erro ao salvar: " + err.message);
    }
}

// --- 2. RENDERIZAÇÃO INTELIGENTE (NOVO LAYOUT) ---
function renderizarTudo() {
    // Líder
    document.getElementById('msg-reflexao').innerText = `"${dadosApp.reflexao}"`;
    document.getElementById('msg-versiculo').innerText = dadosApp.versiculo;

    const esc = dadosApp.escalaCantoresAtual[0]; 
    const rep = dadosApp.repertorioAtual;
    const container = document.getElementById('escalas-container-dinamico');

    // Verifica se existem escalas para mostrar
    if(esc && rep && rep.sexta) {
        // Função auxiliar para formatar listas com ícones
        const fmtC = (l) => l.map(c => `<span><i class="fas fa-user" style="color:var(--primary-light); margin-right:5px;"></i> ${c}</span>`).join('');
        const fmtM = (l) => l.map(m => `<span><i class="fas fa-music" style="color:var(--primary-light); margin-right:5px;"></i> ${m.nome}</span>`).join('');

        // Monta o HTML com 3 Linhas (Sexta, Manhã, Noite) usando as classes novas
        container.innerHTML = `
            <!-- LINHA SEXTA -->
            <div class="escala-day-row">
                <div style="text-align:center;"><span class="day-badge-large">SEXTA-FEIRA</span></div>
                <div class="cards-grid">
                    <div class="escala-card-premium">
                        <div class="card-header"><i class="fas fa-microphone-alt"></i><h3>Cantores</h3></div>
                        <div class="card-body">${fmtC(esc.sexta)}</div>
                    </div>
                    <div class="escala-card-premium">
                        <div class="card-header"><i class="fas fa-guitar"></i><h3>Louvores</h3></div>
                        <div class="card-body">${fmtM(rep.sexta)}</div>
                    </div>
                </div>
            </div>

            <!-- LINHA DOMINGO MANHÃ -->
            <div class="escala-day-row">
                <div style="text-align:center;"><span class="day-badge-large">DOMINGO MANHÃ</span></div>
                <div class="cards-grid">
                    <div class="escala-card-premium">
                        <div class="card-header"><i class="fas fa-microphone-alt"></i><h3>Cantores</h3></div>
                        <div class="card-body">${fmtC(esc.domManha)}</div>
                    </div>
                    <div class="escala-card-premium">
                        <div class="card-header"><i class="fas fa-guitar"></i><h3>Louvores</h3></div>
                        <div class="card-body">${fmtM(rep.domManha)}</div>
                    </div>
                </div>
            </div>

            <!-- LINHA DOMINGO NOITE -->
            <div class="escala-day-row">
                <div style="text-align:center;"><span class="day-badge-large">DOMINGO NOITE</span></div>
                <div class="cards-grid">
                    <div class="escala-card-premium">
                        <div class="card-header"><i class="fas fa-microphone-alt"></i><h3>Cantores</h3></div>
                        <div class="card-body">${fmtC(esc.domNoite)}</div>
                    </div>
                    <div class="escala-card-premium">
                        <div class="card-header"><i class="fas fa-guitar"></i><h3>Louvores</h3></div>
                        <div class="card-body">${fmtM(rep.domNoite)}</div>
                    </div>
                </div>
            </div>
        `;
    } else {
        container.innerHTML = "<p style='text-align:center; padding:20px;'>Nenhuma escala gerada ainda.</p>";
    }

    // Listas Públicas (Músicas)
    listarMusicasPublicas(dadosApp.bancoMusicas);
    
    // Avisos Gerais
    document.getElementById('lista-avisos').innerHTML = dadosApp.avisos.map(a => `<li><i class="fas fa-info-circle" style="color:#e67e22; margin-right:5px;"></i> ${a}</li>`).join('');
    
    // Agenda (Tabela)
    if(dadosApp.agenda) {
        document.getElementById('tabela-agenda-body').innerHTML = dadosApp.agenda.map(item => `
            <tr>
                <td style="font-weight:bold; color:var(--primary);">${item.data}</td>
                <td>${item.evento}</td>
                <td style="color:#666; font-size:0.85em;">${item.obs}</td>
            </tr>
        `).join('');
    }
}

// --- 3. CARDS DO TIME (CARROSSEL) ---
function gerarCardsTime() {
    const track = document.getElementById('team-track');
    const fallbackImg = "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=300&q=80";
    let html = '';

    // Cantores
    dadosApp.bancoCantores.forEach(nome => {
        const imgSrc = `image/${nome}.jpg`;
        html += `
        <div class="glass-card-wrapper" onclick="this.classList.toggle('flipped')">
            <div class="glass-card-inner">
                <div class="glass-front">
                    <div class="glass-img-box"><img src="${imgSrc}" onerror="this.src='${fallbackImg}'"></div>
                    <div class="glass-info"><h3>${nome}</h3><span>Cantor(a)</span></div>
                </div>
                <div class="glass-back">
                    <div class="icon-box"><i class="fas fa-microphone"></i></div><h3>${nome}</h3><span class="role-badge">Levita</span>
                </div>
            </div>
        </div>`;
    });

    // Músicos
    const musicos = dadosApp.bancoMusicos || mockDB.bancoMusicos;
    musicos.forEach(m => {
        const nome = m.nome || m;
        const instrumento = m.instrumento || "Músico";
        const imgSrc = `image/${nome}.jpg`;
        html += `
        <div class="glass-card-wrapper" onclick="this.classList.toggle('flipped')">
            <div class="glass-card-inner">
                <div class="glass-front">
                    <div class="glass-img-box"><img src="${imgSrc}" onerror="this.src='${fallbackImg}'"></div>
                    <div class="glass-info"><h3>${nome}</h3><span>${instrumento}</span></div>
                </div>
                <div class="glass-back">
                    <div class="icon-box"><i class="fas fa-music"></i></div><h3>${nome}</h3><span class="role-badge">Banda</span>
                </div>
            </div>
        </div>`;
    });
    track.innerHTML = html;
}

function scrollCarrossel(direction) {
    const track = document.getElementById('team-track');
    const amount = 300;
    track.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
}

// --- 4. UTILITÁRIOS E BUSCA ---
function listarMusicasPublicas(lista) {
    document.getElementById('lista-musicas-publica').innerHTML = lista.map(m => `<li class="musica-row"><span class="musica-nome">${m.nome}</span><span class="musica-artista">${m.artista}</span></li>`).join('');
}
function filtrarMusicas() {
    const termo = document.getElementById('search-input').value.toLowerCase();
    const filtradas = dadosApp.bancoMusicas.filter(m => m.nome.toLowerCase().includes(termo) || m.artista.toLowerCase().includes(termo));
    listarMusicasPublicas(filtradas);
}

// --- 5. ADMINISTRAÇÃO ---
function abrirAdmin() { document.getElementById('modal-admin').style.display = 'flex'; }
function fecharAdmin() { document.getElementById('modal-admin').style.display = 'none'; }
function verificarSenha() {
    if(document.getElementById('senha-admin').value === SENHA_LIDER) {
        document.getElementById('tela-login').style.display = 'none';
        document.getElementById('painel-admin').style.display = 'block';
        document.getElementById('edit-reflexao').value = dadosApp.reflexao;
        document.getElementById('edit-versiculo').value = dadosApp.versiculo;
        renderizarEditorEscala();
        renderizarListaAdmin();
    } else { alert("Senha incorreta!"); }
}
function logout() { document.getElementById('painel-admin').style.display = 'none'; document.getElementById('tela-login').style.display = 'block'; fecharAdmin(); }
function mudarAba(id) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    event.target.classList.add('active');
}

// --- 6. GESTÃO DE MÚSICAS ---
function importarMusicasEmMassa() {
    const texto = document.getElementById('mass-import-area').value;
    if(!texto) return;
    const linhas = texto.split('\n');
    let count = 0;
    linhas.forEach(linha => {
        if(linha.trim().length > 0) {
            let partes = linha.split('-');
            let nome = partes[0].trim();
            let artista = partes.length > 1 ? partes[1].trim() : "Desconhecido";
            if(nome) { dadosApp.bancoMusicas.push({nome, artista}); count++; }
        }
    });
    document.getElementById('mass-import-area').value = "";
    salvarNoSupabase();
    alert(`${count} músicas importadas!`);
}

function renderizarListaAdmin() {
    const termo = document.getElementById('admin-search-music').value.toLowerCase();
    const container = document.getElementById('lista-admin-musicas');
    container.innerHTML = dadosApp.bancoMusicas.map((m, index) => {
        if(m.nome.toLowerCase().includes(termo) || m.artista.toLowerCase().includes(termo)) {
            return `<div style="display:flex; justify-content:space-between; padding:8px; border-bottom:1px solid #eee;"><span><b>${m.nome}</b> - ${m.artista}</span><button onclick="excluirMusica(${index})" style="background:#e74c3c; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">🗑️</button></div>`;
        } return '';
    }).join('');
}

function excluirMusica(index) {
    if(confirm("Excluir esta música?")) {
        dadosApp.bancoMusicas.splice(index, 1);
        salvarNoSupabase();
    }
}

// --- 7. EDIÇÃO MANUAL ---
function renderizarEditorEscala() {
    const esc = dadosApp.escalaCantoresAtual[0] || {sexta:[], domManha:[], domNoite:[]};
    const rep = dadosApp.repertorioAtual || {sexta:[], domManha:[], domNoite:[]};
    const musToText = (lista) => lista ? lista.map(m => m.nome).join(', ') : "";
    document.getElementById('editor-escala-container').innerHTML = `
        <div style="background:#f9f9f9; padding:10px; border-radius:5px; margin-bottom:10px;">
            <strong>Sexta:</strong><br>Cantores: <input type="text" id="edit-cant-sex" value="${esc.sexta.join(', ')}" style="width:100%;"><br>Músicas: <input type="text" id="edit-mus-sex" value="${musToText(rep.sexta)}" style="width:100%;">
        </div>
        <div style="background:#f9f9f9; padding:10px; border-radius:5px; margin-bottom:10px;">
            <strong>Dom. Manhã:</strong><br>Cantores: <input type="text" id="edit-cant-dm" value="${esc.domManha.join(', ')}" style="width:100%;"><br>Músicas: <input type="text" id="edit-mus-dm" value="${musToText(rep.domManha)}" style="width:100%;">
        </div>
        <div style="background:#f9f9f9; padding:10px; border-radius:5px;">
            <strong>Dom. Noite:</strong><br>Cantores: <input type="text" id="edit-cant-dn" value="${esc.domNoite.join(', ')}" style="width:100%;"><br>Músicas: <input type="text" id="edit-mus-dn" value="${musToText(rep.domNoite)}" style="width:100%;">
        </div>`;
}

function salvarEdicaoManual() {
    const arr = (id) => document.getElementById(id).value.split(',').map(s => s.trim()).filter(s => s);
    const mus = (id) => document.getElementById(id).value.split(',').map(s => ({ nome: s.trim(), artista: "Manual" })).filter(m => m.nome);
    if(!dadosApp.escalaCantoresAtual[0]) dadosApp.escalaCantoresAtual[0] = {};
    dadosApp.escalaCantoresAtual[0].sexta = arr('edit-cant-sex');
    dadosApp.escalaCantoresAtual[0].domManha = arr('edit-cant-dm');
    dadosApp.escalaCantoresAtual[0].domNoite = arr('edit-cant-dn');
    dadosApp.repertorioAtual.sexta = mus('edit-mus-sex');
    dadosApp.repertorioAtual.domManha = mus('edit-mus-dm');
    dadosApp.repertorioAtual.domNoite = mus('edit-mus-dn');
    salvarNoSupabase();
}

// --- 8. GERADORES E FUNÇÕES NOVAS (AGENDA/AVISOS) ---
function addEventoAgenda() {
    const data = document.getElementById('agenda-data').value;
    const evento = document.getElementById('agenda-evento').value;
    const obs = document.getElementById('agenda-obs').value;

    if (data && evento) {
        if (!dadosApp.agenda) dadosApp.agenda = [];
        dadosApp.agenda.push({ data, evento, obs });
        salvarNoSupabase();
        // Limpar campos
        document.getElementById('agenda-data').value = "";
        document.getElementById('agenda-evento').value = "";
        document.getElementById('agenda-obs').value = "";
        alert("Evento adicionado à agenda!");
    } else {
        alert("Preencha a data e o evento.");
    }
}

function addAviso() {
    const val = document.getElementById('new-aviso').value;
    if(val) { 
        dadosApp.avisos.push(val); 
        document.getElementById('new-aviso').value=""; 
        salvarNoSupabase(); 
        alert("Aviso adicionado!");
    }
}

function embaralhar(array) { return array.sort(() => Math.random() - 0.5); }
function gerarEscalaCantores(salvar = true) {
    let novaEscala = [];
    for (let i = 1; i <= 4; i++) {
        const sorteio = embaralhar([...dadosApp.bancoCantores]);
        novaEscala.push({ semana: i, sexta: sorteio.slice(0, 3), domManha: sorteio.slice(3, 5), domNoite: sorteio.slice(5, 8) });
    }
    dadosApp.escalaCantoresAtual = novaEscala;
    if(salvar) salvarNoSupabase(); else renderizarTudo();
}
function gerarRepertorioSemanal(salvar = true) {
    const sorteio = embaralhar([...dadosApp.bancoMusicas]);
    dadosApp.repertorioAtual = { sexta: sorteio.slice(0, 4), domManha: sorteio.slice(4, 8), domNoite: sorteio.slice(8, 14) };
    if(salvar) salvarNoSupabase(); else renderizarTudo();
}
function salvarLider() { dadosApp.reflexao = document.getElementById('edit-reflexao').value; dadosApp.versiculo = document.getElementById('edit-versiculo').value; salvarNoSupabase(); }
function addMusica() { const nome = document.getElementById('new-music').value; const artista = document.getElementById('new-artist').value; if(nome) { dadosApp.bancoMusicas.push({nome, artista: artista || "Desconhecido"}); salvarNoSupabase(); document.getElementById('new-music').value=""; } }