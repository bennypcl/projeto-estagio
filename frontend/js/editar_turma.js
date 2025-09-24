document.addEventListener('DOMContentLoaded', async () => {
    // 1. AUTENTICAÇÃO E PERMISSÃO
    const loggedUser = getLoggedUser();
    if (!loggedUser || loggedUser.role !== 'secretario') {
        alert('Acesso negado.');
        window.location.href = 'index.html';
        return;
    }
    renderHeader();

    // 2. BUSCAR DADOS
    const params = new URLSearchParams(window.location.search);
    const turmaId = params.get('id');
    if (!turmaId) {
        alert('ID da turma não encontrado!');
        window.location.href = 'turmas.html';
        return;
    }

    // Chama a função principal que carrega e renderiza toda a página
    await carregarPaginaEdicao(turmaId);
});

/**
 * Função principal que orquestra o carregamento de todos os dados e a renderização da página.
 * @param {string} turmaId - O ID da turma que está sendo editada.
 */
async function carregarPaginaEdicao(turmaId) {
    // Busca todos os dados necessários em paralelo para mais performance
    const [turma, programas, residentesAtuais, residentesDisponiveis] = await Promise.all([
        getTurmaById(turmaId),
        getProgramas(),
        getResidentesPorTurma(turmaId),
        getResidentesDisponiveis()
    ]);

    if (!turma) {
        document.getElementById('page-content').innerHTML = '<p class="text-center">Turma não encontrada.</p>';
        return;
    }
    
    // Renderiza as diferentes seções da página
    preencherDadosDaTurma(turma, programas);
    renderizarResidentesAtuais(residentesAtuais, turmaId);
    configurarBuscaDeResidentes(residentesDisponiveis, turmaId);

    // Adiciona o listener para o formulário de edição dos dados da turma
    const form = document.getElementById('form-edicao-turma');
    form.addEventListener('submit', (e) => onFormSubmit(e, turmaId));
}

/**
 * Preenche a primeira seção do formulário com os dados da turma.
 * @param {Object} turma - Os dados da turma.
 * @param {Array} programas - A lista de todos os programas para o dropdown.
 */
function preencherDadosDaTurma(turma, programas) {
    const programaSelect = document.getElementById('programa');
    const anoInput = document.getElementById('ano');
    const codigoInput = document.getElementById('codigo');

    const ano = turma.codigo.split('_')[1] || '';
    anoInput.value = ano;
    codigoInput.value = turma.codigo;

    if (programas) {
        programas.forEach(programa => {
            const option = document.createElement('option');
            option.value = programa.id;
            option.textContent = programa.nome;
            option.dataset.codigo = programa.nome.substring(0, 3).toUpperCase();
            if (programa.id === turma.programaId) option.selected = true;
            programaSelect.appendChild(option);
        });
    }

    const atualizarCodigoTurma = () => { /* ... lógica de atualização do código ... */ };
    programaSelect.addEventListener('change', atualizarCodigoTurma);
    anoInput.addEventListener('input', atualizarCodigoTurma);
}

/**
 * Renderiza a lista de residentes que já estão na turma.
 * @param {Array} residentes - Lista de residentes na turma.
 * @param {string} turmaId - ID da turma atual.
 */
function renderizarResidentesAtuais(residentes, turmaId) {
    const container = document.getElementById('residentes-atuais-list');
    const countSpan = document.getElementById('residentes-atuais-count');
    container.innerHTML = '';
    countSpan.textContent = residentes.length;

    if (residentes.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">Nenhum residente nesta turma.</p>';
        return;
    }

    residentes.forEach(residente => {
        const item = document.createElement('div');
        item.className = 'list-item-wrapper';
        item.innerHTML = `
            <div class="list-item-content">
                <h6 class="mb-0">${residente.nomeCompleto}</h6>
            </div>
            <div class="list-item-actions">
                <button class="btn btn-sm btn-outline-danger" title="Remover da turma"><i class="bi bi-x-lg"></i></button>
            </div>
        `;
        // Adiciona o evento de clique para remover o residente
        item.querySelector('button').addEventListener('click', async () => {
            if (confirm(`Tem certeza que deseja remover ${residente.nomeCompleto} desta turma?`)) {
                await desvincularResidenteDeTurma(residente.id);
                await carregarPaginaEdicao(turmaId); // Recarrega toda a página para atualizar as listas
            }
        });
        container.appendChild(item);
    });
}

/**
 * Configura a barra de busca e a lista de residentes disponíveis.
 * @param {Array} residentes - Lista de todos os residentes disponíveis.
 * @param {string} turmaId - ID da turma atual.
 */
function configurarBuscaDeResidentes(residentes, turmaId) {
    const buscaInput = document.getElementById('busca-residente');
    const container = document.getElementById('residentes-disponiveis-list');

    const renderizarDisponiveis = (residentesFiltrados) => {
        container.innerHTML = '';
        if (residentesFiltrados.length === 0) {
            container.innerHTML = '<p class="text-muted text-center">Nenhum residente disponível encontrado.</p>';
            return;
        }

        residentesFiltrados.forEach(residente => {
            const item = document.createElement('div');
            item.className = 'list-item-wrapper';
            item.innerHTML = `
                <div class="list-item-content">
                    <h6 class="mb-0">${residente.nomeCompleto}</h6>
                </div>
                <div class="list-item-actions">
                    <button class="btn btn-sm btn-outline-success" title="Adicionar à turma"><i class="bi bi-plus-lg"></i></button>
                </div>
            `;
            // Adiciona o evento de clique para adicionar o residente
            item.querySelector('button').addEventListener('click', async () => {
                await vincularResidenteATurma(residente.id, turmaId);
                await carregarPaginaEdicao(turmaId); // Recarrega toda a página para atualizar as listas
            });
            container.appendChild(item);
        });
    };
    
    // Listener para a barra de busca
    buscaInput.addEventListener('input', (e) => {
        const termoBusca = e.target.value.toLowerCase();
        if (!termoBusca) {
            container.innerHTML = ''; // Limpa a lista se a busca estiver vazia
            return;
        }
        const residentesFiltrados = residentes.filter(r => r.nomeCompleto.toLowerCase().includes(termoBusca));
        renderizarDisponiveis(residentesFiltrados);
    });

    // Estado inicial (lista vazia até que se digite algo)
    container.innerHTML = '<p class="text-muted text-center">Digite um nome para buscar residentes.</p>';
}

/**
 * Função executada ao submeter o formulário de dados da turma.
 * @param {Event} event - O evento de submit.
 * @param {string} turmaId - O ID da turma.
 */
async function onFormSubmit(event, turmaId) {
    event.preventDefault();
    const turmaAtualizada = {
        id: turmaId,
        codigo: document.getElementById('codigo').value,
        programaId: document.getElementById('programa').value
    };
    await updateTurma(turmaAtualizada);
    alert('Dados da turma atualizados com sucesso!');
}