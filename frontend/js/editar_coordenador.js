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
    const coordenadorId = params.get('id'); 
    if (!coordenadorId) {
        alert('ID do coordenador não encontrado!');
        window.location.href = 'secret-coordenadores.html';
        return;
    }

    const coordenador = await getCoordenadorCompletoById(coordenadorId);
    
    if (coordenador) {
        renderizarFormulario(coordenador);
    } else {
        document.getElementById('page-content').innerHTML = '<p>Coordenador não encontrado.</p>';
    }
});

async function renderizarFormulario(coordenador) {
    const form = document.getElementById('form-edicao-coordenador');
    let camposEspecificosHTML = '';

    // Renderiza campos específicos baseados no perfil do coordenador
    if (coordenador.role === 'coordenador_programa') {
        const programas = await getProgramas();
        let programasOptions = programas.map(p => 
            `<option value="${p.id}" ${p.id === coordenador.programaId ? 'selected' : ''}>${p.nome}</option>`
        ).join('');
        camposEspecificosHTML = `
            <div class="mb-3">
                <label for="programa" class="form-label fw-bold">Programa que Coordena</label>
                <select id="programa" class="form-select">${programasOptions}</select>
            </div>
        `;
    } else if (coordenador.role === 'coordenador_geral') {
        camposEspecificosHTML = `
            <div class="mb-3">
                <label for="titulo" class="form-label fw-bold">Título / Cargo</label>
                <input type="text" class="form-control" id="titulo" value="${coordenador.titulo || ''}">
            </div>
        `;
    }

    // Preenche o formulário com o HTML e os dados do coordenador
    form.innerHTML = `
        <h5 class="fw-light mb-3">Dados Pessoais</h5>
        <div class="row">
            <div class="col-md-8 mb-3"><label for="nome" class="form-label fw-bold">Nome Completo</label><input type="text" class="form-control" id="nome" value="${coordenador.nomeCompleto}" required></div>
            <div class="col-md-4 mb-3"><label for="cpf" class="form-label fw-bold">CPF</label><input type="text" class="form-control" id="cpf" value="${coordenador.cpf}" required></div>
        </div>
        <div class="row">
            <div class="col-md-8 mb-3"><label for="email" class="form-label fw-bold">Email</label><input type="email" class="form-control" id="email" value="${coordenador.email}" required></div>
            <div class="col-md-4 mb-3"><label for="telefone" class="form-label fw-bold">Telefone</label><input type="text" class="form-control" id="telefone" value="${coordenador.telefone}" required></div>
        </div>
        <hr class="my-4">
        <h5 class="fw-light mb-3">Dados do Cargo</h5>
        ${camposEspecificosHTML}
        <hr class="my-4">
        <div class="d-flex justify-content-end gap-2">
            <button type="button" id="cancel-btn" class="btn btn-secondary">Cancelar</button>
            <button type="submit" class="btn btn-primary fw-bold">Salvar Alterações</button>
        </div>
    `;

    // Aplica as máscaras e adiciona os listeners
    const cpfInput = document.getElementById('cpf');
    const telefoneInput = document.getElementById('telefone');
    cpfInput.value = maskCPF(cpfInput.value);
    telefoneInput.value = maskTelefone(telefoneInput.value);
    cpfInput.addEventListener('input', () => { cpfInput.value = maskCPF(cpfInput.value); });
    telefoneInput.addEventListener('input', () => { telefoneInput.value = maskTelefone(telefoneInput.value); });

    form.addEventListener('submit', (e) => onFormSubmit(e, coordenador));
    form.querySelector('#cancel-btn').addEventListener('click', onCancel);
}

async function onFormSubmit(event, coordenador) {
    event.preventDefault();
    
    // Coleta os dados comuns
    const dadosAtualizados = {
        id: coordenador.id,
        role: coordenador.role,
        nomeCompleto: document.getElementById('nome').value,
        cpf: document.getElementById('cpf').value,
        email: document.getElementById('email').value,
        telefone: document.getElementById('telefone').value,
    };

    // Coleta os dados específicos
    if (coordenador.role === 'coordenador_programa') {
        dadosAtualizados.programaId = document.getElementById('programa').value;
    } else if (coordenador.role === 'coordenador_geral') {
        dadosAtualizados.titulo = document.getElementById('titulo').value;
    }

    await updateCoordenador(dadosAtualizados);
    alert('Coordenador atualizado com sucesso!');
    window.location.href = 'secret-coordenadores.html';
}

function onCancel() {
    if (confirm('Deseja cancelar a edição?')) {
        window.location.href = 'secret-coordenadores.html';
    }
}