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
    const residenteId = params.get('id');
    if (!residenteId) {
        alert('ID do residente não encontrado!');
        window.location.href = 'secret-residentes.html';
        return;
    }

    // Busca todos os dados necessários em paralelo
    const [residenteParaEditar, turmas, preceptores] = await Promise.all([
        getResidenteCompletoById(residenteId),
        getTurmas(),
        getPreceptoresCompletos()
    ]);
    
    if (residenteParaEditar) {
        renderizarFormulario(residenteParaEditar, turmas, preceptores);
    } else {
        document.getElementById('page-content').innerHTML = '<p class="text-center">Residente não encontrado.</p>';
    }
});

function renderizarFormulario(residente, turmas, preceptores) {
    const form = document.getElementById('form-edicao-residente');
    
    // Constrói as opções para o <select> de turmas
    let turmasOptions = '<option value="">Nenhuma</option>'; // Opção para deixar sem turma
    turmas.forEach(t => {
        turmasOptions += `<option value="${t.id}" ${t.id === residente.turmaId ? 'selected' : ''}>${t.codigo}</option>`;
    });

    // Constrói as opções para o <select> de preceptores
    let preceptoresOptions = '<option value="">Nenhum</option>'; // Opção para deixar sem preceptor
    preceptores.forEach(p => {
        preceptoresOptions += `<option value="${p.id}" ${p.id === residente.preceptorId ? 'selected' : ''}>${p.nomeCompleto}</option>`;
    });

    // Preenche o formulário com o HTML e os dados do residente
    form.innerHTML = `
        <h5 class="fw-light mb-3">Dados Pessoais</h5>
        <div class="row">
            <div class="col-md-8 mb-3"><label for="nome" class="form-label fw-bold">Nome Completo</label><input type="text" class="form-control" id="nome" value="${residente.nomeCompleto}" required></div>
            <div class="col-md-4 mb-3"><label for="cpf" class="form-label fw-bold">CPF</label><input type="text" class="form-control" id="cpf" value="${residente.cpf}" required><div id="cpf-error" class="text-danger small mt-1"></div></div>
        </div>
        <div class="row">
            <div class="col-md-8 mb-3"><label for="email" class="form-label fw-bold">Email</label><input type="email" class="form-control" id="email" value="${residente.email}" required></div>
            <div class="col-md-4 mb-3"><label for="telefone" class="form-label fw-bold">Telefone</label><input type="text" class="form-control" id="telefone" value="${residente.telefone}" required></div>
        </div>
        <hr class="my-4">
        <h5 class="fw-light mb-3">Dados Acadêmicos</h5>
        <div class="row">
            <div class="col-md-4 mb-3"><label for="matricula" class="form-label fw-bold">Matrícula</label><input type="text" class="form-control" id="matricula" value="${residente.matricula}" required></div>
            <div class="col-md-4 mb-3">
                <label for="turma" class="form-label fw-bold">Turma (Opcional)</label>
                <select id="turma" class="form-select">${turmasOptions}</select>
            </div>
            <div class="col-md-4 mb-3">
                <label for="preceptor" class="form-label fw-bold">Preceptor (Opcional)</label>
                <select id="preceptor" class="form-select">${preceptoresOptions}</select>
            </div>
        </div>
        <hr class="my-4">
        <div class="d-flex justify-content-end gap-2">
            <button type="button" id="cancel-btn" class="btn btn-secondary">Cancelar</button>
            <button type="submit" class="btn btn-primary fw-bold">Salvar Alterações</button>
        </div>
    `;

    // Aplica as máscaras do utils.js
    const cpfInput = document.getElementById('cpf');
    const telefoneInput = document.getElementById('telefone');
    cpfInput.value = maskCPF(cpfInput.value);
    telefoneInput.value = maskTelefone(telefoneInput.value);
    cpfInput.addEventListener('input', () => { cpfInput.value = maskCPF(cpfInput.value); });
    telefoneInput.addEventListener('input', () => { telefoneInput.value = maskTelefone(telefoneInput.value); });

    // Adiciona os listeners de eventos aos elementos recém-criados
    form.addEventListener('submit', (e) => onFormSubmit(e, residente.id));
    form.querySelector('#cancel-btn').addEventListener('click', onCancel);
}

async function onFormSubmit(event, residenteId) {
    event.preventDefault();
    
    const residenteAtualizado = {
        id: residenteId,
        nomeCompleto: document.getElementById('nome').value,
        cpf: document.getElementById('cpf').value,
        email: document.getElementById('email').value,
        telefone: document.getElementById('telefone').value,
        matricula: document.getElementById('matricula').value,
        turmaId: document.getElementById('turma').value,
        preceptorId: document.getElementById('preceptor').value
    };

    await updateResidente(residenteAtualizado);
    alert('Residente atualizado com sucesso!');
    window.location.href = 'secret-residentes.html';
}

function onCancel() {
    if (confirm('Deseja cancelar a edição?')) {
        window.location.href = 'secret-residentes.html';
    }
}