document.addEventListener('DOMContentLoaded', async () => {
    // 1. NOVO BLOCO DE AUTENTICAÇÃO
    const loggedUser = getLoggedUser();
    if (!loggedUser) {
        window.location.href = 'login.html';
        return;
    }
    renderHeader(); // Renderiza o cabeçalho global
    
    // 2. Carrega o conteúdo da página
    await carregarTurmas();
});

/**
 * Busca os dados completos das turmas e renderiza a página.
 */
async function carregarTurmas() {
    const loggedUser = getLoggedUser();
    // Chama a nova função do api.js que já junta os dados e conta os residentes
    const turmas = await getTurmasCompletas(); 
    renderTurmasPage(turmas, loggedUser.role);
}

/**
 * Pede confirmação e remove uma turma.
 * @param {string} turmaId - O ID da turma a ser removida.
 */
async function removerTurma(turmaId) {
    if (confirm('Tem certeza que deseja remover esta turma?')) {
        await deleteTurma(turmaId);
        await carregarTurmas(); // Recarrega a lista para mostrar a remoção
    }
}

/**
 * Constrói e renderiza o conteúdo da página de Turmas.
 * @param {Array} turmas - A lista de turmas com dados completos.
 * @param {string} userRole - O perfil do usuário logado.
 */
function renderTurmasPage(turmas, userRole) {
    const container = document.getElementById('page-content');
    const isSecretario = userRole === 'secretario';
    const cadastrarButtonHTML = isSecretario ? `<a href="cadastrar_turma.html" class="btn btn-primary fw-bold">Cadastrar</a>` : '';

    let turmasGridHTML = '';
    if (turmas && turmas.length > 0) {
        turmas.forEach(turma => {
            const actionsHTML = isSecretario ? `
                <div class="turma-card-actions">
                    <a href="editar_turma.html?id=${turma.id}" class="btn btn-sm" title="Editar"><i class="bi bi-pencil fs-5"></i></a>
                    <button class="btn btn-sm" onclick="removerTurma('${turma.id}')" title="Remover"><i class="bi bi-trash fs-5 text-danger"></i></button>
                </div>
            ` : '';

            const residentCountFormatted = String(turma.residentesCount).padStart(2, '0');

            turmasGridHTML += `
                <div class="col-lg-4 col-md-6 mb-4">
                    <div class="card turma-card h-100">
                        <div class="card-body">
                            <h5 class="card-title fw-bold">${turma.codigo}</h5>
                            <p class="card-text text-muted">${turma.programaNome}</p>
                            <p class="card-text"><strong>${residentCountFormatted}</strong> residentes</p>
                            <a href="visualizar_turma.html?id=${turma.id}" class="stretched-link"></a>
                        </div>
                        ${actionsHTML}
                    </div>
                </div>
            `;
        });
    } else {
        turmasGridHTML = '<div class="col-12"><p class="text-center">Nenhuma turma cadastrada.</p></div>';
    }

    container.innerHTML = `
        <div class="page-header d-flex justify-content-between align-items-center mb-4">
            <div class="d-flex align-items-center">
                <a href="index.html" class="btn btn-light me-3" title="Voltar"><i class="bi bi-house-door fs-4"></i></a>
                <h2 class="mb-0">Turmas</h2>
            </div>
            ${cadastrarButtonHTML}
        </div>
        <div class="row">
            ${turmasGridHTML}
        </div>
    `;
}