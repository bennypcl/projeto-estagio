document.addEventListener('DOMContentLoaded', async () => {
    // 1. AUTENTICAÇÃO E RENDERIZAÇÃO DO CABEÇALHO
    const loggedUser = getLoggedUser();
    if (!loggedUser) {
        window.location.href = 'login.html';
        return;
    }
    renderHeader();

    // 2. BUSCAR DADOS
    const params = new URLSearchParams(window.location.search);
    const turmaId = params.get('id');
    if (!turmaId) {
        alert('ID da turma não encontrado!');
        window.location.href = 'secret-turmas.html';
        return;
    }

    // Chama a nova função da API que já busca e combina todos os dados
    const turma = await getTurmaCompletaById(turmaId);
    
    // 3. RENDERIZAR A PÁGINA
    if (turma) {
        renderDetalhesTurma(turma, loggedUser.role);
    } else {
        document.getElementById('page-content').innerHTML = '<p class="text-center">Turma não encontrada.</p>';
    }
});

/**
 * Constrói e renderiza o conteúdo da página de detalhes da turma.
 * @param {Object} turma - O objeto da turma com dados completos.
 * @param {string} userRole - O perfil do usuário logado.
 */
function renderDetalhesTurma(turma, userRole) {
    const container = document.getElementById('page-content');

    const editarBtn = userRole === 'secretario' 
        ? `<a href="editar_turma.html?id=${turma.id}" class="btn btn-outline-primary"><i class="bi bi-pencil me-2"></i>Editar Turma</a>`
        : '';

    // Prepara a lista de residentes para ser exibida
    let residentesHTML = '<p class="text-center text-muted">Nenhum residente associado a esta turma.</p>';
    if (turma.residentes && turma.residentes.length > 0) {
        residentesHTML = turma.residentes.map(residente => `
            <div class="list-item-wrapper">
                <a href="visualizar_residente.html?id=${residente.id}" class="list-item-link">
                    <div class="list-item-content">
                        <h6 class="mb-1">${residente.nomeCompleto}</h6>
                        <small class="text-muted">Matrícula: ${residente.matricula}</small>
                    </div>
                </a>
            </div>
        `).join('');
    }

    // Monta o HTML da página com os dados combinados
    container.innerHTML = `
        <div class="page-header d-flex justify-content-between align-items-center mb-4">
            <div class="d-flex align-items-center">
                <a href="secret-turmas.html" class="btn btn-light me-3" title="Voltar para a lista"><i class="bi bi-arrow-left fs-4"></i></a>
            </div>
            ${editarBtn}
        </div>

        <div class="bg-white p-4 p-md-5 rounded shadow-sm mb-4">
            <h2 class="mb-1">${turma.codigo}</h2>
            <p class="text-muted">Turma</p>
            <hr class="my-4">
            <h5 class="mt-4 mb-3 fw-light">Informações</h5>
            <div class="row">
                <div class="col-md-12 mb-3">
                    <strong>Programa Vinculado:</strong><br> ${turma.programaNome}
                </div>
            </div>
        </div>

        <div class="bg-white p-4 p-md-5 rounded shadow-sm">
            <h4 class="fw-light mb-3">Residentes na Turma (${turma.residentes.length})</h4>
            <div class="list-container">
                ${residentesHTML}
            </div>
        </div>
    `;
}