let originalFormState = ''; // Guarda o estado original do formulário para verificar mudanças

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
    const programaId = params.get('id'); 

    if (!programaId) {
        alert('ID do programa não encontrado!');
        window.location.href = 'programas.html';
        return;
    }

    // Busca todos os dados necessários em paralelo
    const [programas, todosUsuarios, dataSetores] = await Promise.all([
        getProgramas(),
        getUsuarios(),
        fetchMockData('setores')
    ]);

    const programaParaEditar = programas.find(p => p.id === programaId);
    
    if (programaParaEditar) {
        const coordenadores = todosUsuarios.filter(u => u.role === 'coordenador_programa');
        const setores = dataSetores.setores;
        renderizarFormulario(programaParaEditar, coordenadores, setores);
    } else {
        document.getElementById('page-content').innerHTML = '<p>Programa não encontrado.</p>';
    }
});

// 3. RENDERIZAR O FORMULÁRIO E PREENCHER OS DADOS
function renderizarFormulario(programa, coordenadores, setores) {
    const form = document.getElementById('form-edicao-programa');
    
    // Constrói as opções para o <select> de coordenadores
    let coordenadoresOptions = coordenadores.map(c => 
        `<option value="${c.id}" ${c.id === programa.coordenadorId ? 'selected' : ''}>${c.nomeCompleto}</option>`
    ).join('');

    // Constrói as opções para o <select> de setores
    let setoresOptions = setores.map(s => 
        `<option value="${s.id}" ${s.id === programa.setorId ? 'selected' : ''}>${s.nome}</option>`
    ).join('');

    // Preenche o formulário com o HTML e os dados do programa
    form.innerHTML = `
        <div class="row">
            <div class="col-md-6 mb-3">
                <label for="codigo" class="form-label fw-bold">Código</label>
                <input type="text" class="form-control" id="codigo" value="${programa.codigo || ''}" required>
            </div>
            <div class="col-md-6 mb-3">
                <label for="nome" class="form-label fw-bold">Nome do Programa</label>
                <input type="text" class="form-control" id="nome" value="${programa.nome || ''}" required>
            </div>
            <div class="col-md-6 mb-3">
                <label for="setor" class="form-label fw-bold">Setor Principal</label>
                <select id="setor" class="form-select" required>${setoresOptions}</select>
            </div>
            <div class="col-md-6 mb-3">
                <label for="duracao" class="form-label fw-bold">Duração</label>
                <select id="duracao" class="form-select" required>
                    <option value="Bimestral" ${programa.duracao === 'Bimestral' ? 'selected' : ''}>Bimestral</option>
                    <option value="Trimestral" ${programa.duracao === 'Trimestral' ? 'selected' : ''}>Trimestral</option>
                    <option value="Semestral" ${programa.duracao === 'Semestral' ? 'selected' : ''}>Semestral</option>
                    <option value="Anual" ${programa.duracao === 'Anual' ? 'selected' : ''}>Anual</option>
                </select>
            </div>
            <div class="col-md-12 mb-4">
                <label for="coordenador" class="form-label fw-bold">Coordenador Responsável</label>
                <select id="coordenador" class="form-select" required>${coordenadoresOptions}</select>
            </div>
        </div>
        <div class="d-flex justify-content-end gap-2 mt-4">
            <button type="button" id="cancel-btn" class="btn btn-secondary">Cancelar</button>
            <button type="submit" id="save-btn" class="btn btn-primary fw-bold" disabled>Salvar Alterações</button>
        </div>
    `;

    // Guarda o estado inicial do formulário para verificar se houve mudanças
    originalFormState = JSON.stringify(getCurrentFormData(programa.id));

    // Adiciona os listeners de eventos aos elementos recém-criados
    form.addEventListener('input', () => checkFormChanges(programa.id));
    form.addEventListener('submit', (e) => onFormSubmit(e, programa.id));
    form.querySelector('#cancel-btn').addEventListener('click', onCancel);
}

// Pega os dados atuais do formulário
function getCurrentFormData(programaId) {
    return {
        id: programaId,
        codigo: document.getElementById('codigo').value,
        nome: document.getElementById('nome').value,
        setorId: document.getElementById('setor').value,
        duracao: document.getElementById('duracao').value,
        coordenadorId: document.getElementById('coordenador').value
    };
}

// Habilita/desabilita o botão de salvar
function checkFormChanges(programaId) {
    const saveBtn = document.getElementById('save-btn');
    const currentFormState = JSON.stringify(getCurrentFormData(programaId));
    saveBtn.disabled = currentFormState === originalFormState;
}

// Função executada ao submeter o formulário
async function onFormSubmit(event, programaId) {
    event.preventDefault();
    const programaAtualizado = getCurrentFormData(programaId);
    await updatePrograma(programaAtualizado);
    alert('Programa atualizado com sucesso!');
    window.location.href = 'secret-programas.html';
}

// Função para o botão de cancelar
function onCancel() {
    if (confirm('Tem certeza que deseja cancelar? Todas as alterações não salvas serão perdidas.')) {
        window.location.href = 'secret-programas.html';
    }
}