let timeEscolhido = null;
let atletas = [];
let atletaEditando = null;
let atletaRemover = null;
let pontos = 0;

// Função para entrar no time
function entrarNoTime(time) {
    timeEscolhido = time;
    localStorage.setItem('timeEscolhido', timeEscolhido);
    atletas = JSON.parse(localStorage.getItem(timeEscolhido)) || [];
    document.getElementById('choose-team-section').style.display = 'none';
    document.getElementById('admin-section').style.display = 'block';
    document.getElementById('team-info').innerText = `Você está administrando o ${timeEscolhido.charAt(0).toUpperCase() + timeEscolhido.slice(1)}`;
    renderAtletas();
    atualizarPontuacao();
}

// Função para adicionar um atleta
function adicionarAtleta() {
    if (atletas.length >= 5) {
        document.getElementById('limite-atletas-box').style.display = 'block';
        return;
    }
    const numero = document.getElementById('numero').value;
    const nome = document.getElementById('nome').value;
    const classe = parseFloat(document.getElementById('classe').value);
    const foto = document.getElementById('foto').files[0];

    if (!numero || !nome || !classe) return;

    const novoAtleta = {
        numero,
        nome,
        classe,
        foto: foto ? URL.createObjectURL(foto) : 'https://via.placeholder.com/80',
        emQuadra: false
    };

    if (atletaEditando !== null) {
        atletas[atletaEditando] = novoAtleta;  // Atualiza o atleta editado
        atletaEditando = null;
        document.getElementById('finishEditButton').style.display = 'none';
    } else {
        atletas.push(novoAtleta);
    }

    localStorage.setItem(timeEscolhido, JSON.stringify(atletas));
    renderAtletas();
    atualizarPontuacao();
    limparFormulario();
}

// Função para finalizar a edição
function finalizarEdicao() {
    if (atletaEditando !== null) {
        const numero = document.getElementById('numero').value;
        const nome = document.getElementById('nome').value;
        const classe = parseFloat(document.getElementById('classe').value);
        const foto = document.getElementById('foto').files[0];

        // Atualiza o atleta editado
        atletas[atletaEditando] = {
            numero,
            nome,
            classe,
            foto: foto ? URL.createObjectURL(foto) : 'https://via.placeholder.com/80',
            emQuadra: atletas[atletaEditando].emQuadra
        };

        localStorage.setItem(timeEscolhido, JSON.stringify(atletas));
        renderAtletas();
        atualizarPontuacao();
        atletaEditando = null;
        document.getElementById('finishEditButton').style.display = 'none';
        limparFormulario();
    }
}

// Função para atualizar a pontuação total do time
function atualizarPontuacao() {
    pontos = atletas.filter(atleta => atleta.emQuadra).reduce((total, atleta) => total + atleta.classe, 0);
    const scoreElement = document.getElementById('score');
    
    if (pontos > 14) {
        scoreElement.innerText = `Estourou - Pontos: ${pontos}`;
        scoreElement.classList.add('warning');
    } else {
        scoreElement.innerText = `Pontos: ${pontos}`;
        scoreElement.classList.remove('warning');
    }
}

// Função para alternar o atleta entre quadra e banco
function alternarQuadra(index) {
    atletas[index].emQuadra = !atletas[index].emQuadra;
    localStorage.setItem(timeEscolhido, JSON.stringify(atletas));
    renderAtletas();
    atualizarPontuacao();
}

// Função para remover atleta
function removerAtleta(index) {
    atletaRemover = index;
    abrirModal();
}

function abrirModal() {
    document.getElementById('confirm-modal').style.display = 'flex';
}

function fecharModal() {
    document.getElementById('confirm-modal').style.display = 'none';
    atletaRemover = null;
}

function confirmarRemocao() {
    atletas.splice(atletaRemover, 1);
    localStorage.setItem(timeEscolhido, JSON.stringify(atletas));
    renderAtletas();
    atualizarPontuacao();
    fecharModal();
}

// Função para renderizar os atletas
function renderAtletas() {
    const atletasContainer = document.getElementById('atletas-container');
    const quadraContainer = document.getElementById('quadra-container');
    atletasContainer.innerHTML = '';
    quadraContainer.innerHTML = '';

    atletas.forEach((atleta, index) => {
        const atletaCard = document.createElement('div');
        atletaCard.classList.add('atleta-card');
        atletaCard.innerHTML = `
            <img src="${atleta.foto}" alt="Foto do Atleta">
            <div>Nome: ${atleta.nome}</div>
            <div>Classe: ${atleta.classe}</div>
            <div>Número: ${atleta.numero}</div>
        `;
        atletaCard.onclick = () => alternarQuadra(index);

        const actionButtons = `
            <div class="action-buttons">
                <button class="edit" onclick="editarAtleta(${index}, event)">Editar</button>
                <button class="remove" onclick="removerAtleta(${index})">Remover</button>
            </div>
        `;
        atletaCard.innerHTML += actionButtons;

        if (atleta.emQuadra) {
            quadraContainer.appendChild(atletaCard);
        } else {
            atletasContainer.appendChild(atletaCard);
        }
    });
}

// Função para editar um atleta
function editarAtleta(index, event) {
    event.stopPropagation();  // Impede a propagação do evento para o clique no card
    const atleta = atletas[index];
    
    // Preenche os campos com os dados do atleta
    document.getElementById('numero').value = atleta.numero;
    document.getElementById('nome').value = atleta.nome;
    document.getElementById('classe').value = atleta.classe;
    
    // Preenche a foto do atleta (se houver uma foto)
    const fotoInput = document.getElementById('foto');
    if (atleta.foto) {
        // Exibe a foto atual como uma miniatura
        fotoInput.setAttribute('data-prev-foto', atleta.foto);
    }

    atletaEditando = index;
    document.getElementById('finishEditButton').style.display = 'inline-block';
}

// Limpar o formulário de cadastro do atleta
function limparFormulario() {
    document.getElementById('numero').value = '';
    document.getElementById('nome').value = '';
    document.getElementById('classe').value = '1.0';
    document.getElementById('foto').value = '';
    document.getElementById('foto-preview').style.display = 'none';  // Ocultar a pré-visualização da foto
}

// Mostrar foto prévia se existir uma foto
document.getElementById('foto').addEventListener('change', function () {
    const preview = document.getElementById('foto-preview');
    const file = this.files[0];
    if (file) {
        preview.src = URL.createObjectURL(file);
        preview.style.display = 'block'; // Mostrar a imagem
    } else {
        preview.style.display = 'none'; // Se não houver foto, ocultar a pré-visualização
    }
});

// Atualizar a pré-visualização da foto ao editar o atleta
if (atleta.foto) {
    document.getElementById('foto-preview').src = atleta.foto;
    document.getElementById('foto-preview').style.display = 'block'; // Exibe a foto prévia
}

function voltarParaEscolha() {
    document.getElementById('choose-team-section').style.display = 'block';
    document.getElementById('admin-section').style.display = 'none';
}
