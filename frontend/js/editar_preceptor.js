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
    const preceptorId = params.get('id'); 
    if (!preceptorId) {
        alert('ID do preceptor não encontrado!');
        window.location.href = 'secret-preceptores.html';
        return;
    }

    const preceptor = await getPreceptorCompletoById(preceptorId);
    
    if (preceptor) {
        renderizarFormulario(preceptor);
    } else {
        document.getElementById('page-content').innerHTML = '<p>Preceptor não encontrado.</p>';
    }
});

function renderizarFormulario(preceptor) {
    const form = document.getElementById('form-edicao-preceptor');
    
    // Preenche o formulário com o HTML e os dados do preceptor
    form.innerHTML = `
        <h5 class="fw-light mb-3">Dados Pessoais</h5>
        <div class="row">
            <div class="col-md-8 mb-3">
                <label for="nome" class="form-label fw-bold">Nome Completo</label>
                <input type="text" class="form-control" id="nome" value="${preceptor.nomeCompleto}" required>
            </div>
            <div class="col-md-4 mb-3">
                <label for="cpf" class="form-label fw-bold">CPF</label>
                <input type="text" class="form-control" id="cpf" value="${preceptor.cpf}" required>
            </div>
        </div>
        <div class="row">
            <div class="col-md-8 mb-3">
                <label for="email" class="form-label fw-bold">Email</label>
                <input type="email" class="form-control" id="email" value="${preceptor.email}" required>
            </div>
            <div class="col-md-4 mb-3">
                <label for="telefone" class="form-label fw-bold">Telefone</label>
                <input type="text" class="form-control" id="telefone" value="${preceptor.telefone}" required>
            </div>
        </div>
        <hr class="my-4">
        <h5 class="fw-light mb-3">Dados Profissionais</h5>
         <div class="row">
            <div class="col-md-4 mb-3">
                <label for="crm" class="form-label fw-bold">CRM</label>
                <input type="text" class="form-control" id="crm" value="${preceptor.crm || ''}" required>
            </div>
            <div class="col-md-8 mb-3">
                <label for="especialidade" class="form-label fw-bold">Especialidade</label>
                <input type="text" class="form-control" id="especialidade" value="${preceptor.especialidade || ''}" required>
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
    form.addEventListener('submit', (e) => onFormSubmit(e, preceptor.id));
    form.querySelector('#cancel-btn').addEventListener('click', onCancel);
}

// Função executada ao submeter o formulário
async function onFormSubmit(event, preceptorId) {
    event.preventDefault();
    
    // Coleta os dados atualizados do formulário
    const preceptorAtualizado = {
        id: preceptorId,
        nomeCompleto: document.getElementById('nome').value,
        cpf: document.getElementById('cpf').value,
        email: document.getElementById('email').value,
        telefone: document.getElementById('telefone').value,
        crm: document.getElementById('crm').value,
        especialidade: document.getElementById('especialidade').value
    };

    await updatePreceptor(preceptorAtualizado);
    alert('Preceptor atualizado com sucesso!');
    window.location.href = 'secret-preceptores.html';
}

// Função para o botão de cancelar
function onCancel() {
    if (confirm('Tem certeza que deseja cancelar? Todas as alterações não salvas serão descartadas.')) {
        window.location.href = 'secret-preceptores.html';
    }
}