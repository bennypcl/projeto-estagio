document.addEventListener('DOMContentLoaded', async () => {
    // 1. AUTENTICAÇÃO E PERMISSÃO
    const loggedUser = getLoggedUser();
    // A página agora é para preceptores
    if (!loggedUser || loggedUser.role !== 'preceptor') {
        alert('Acesso negado.');
        window.location.href = 'index.html';
        return;
    }
    renderHeader(); // Renderiza o cabeçalho global
    
    // 2. Carrega o conteúdo da página
    await carregarMeusResidentes(loggedUser.id);
});

/**
 * Busca os residentes do preceptor logado e renderiza a página.
 * @param {string} preceptorId - O ID do preceptor logado.
 */
async function carregarMeusResidentes(preceptorId) {
    // Chama a nova função do api.js que já filtra os residentes
    const residentes = await getResidentesPorPreceptor(preceptorId); 
    renderMeusResidentesPage(residentes);
}

/**
 * Constrói e renderiza o conteúdo da página "Meus Residentes".
 * @param {Array} residentes - A lista de residentes do preceptor.
 */
function renderMeusResidentesPage(residentes) {
    const container = document.getElementById('page-content');

    let residentesHTML = '';
    if (residentes && residentes.length > 0) {
        residentes.forEach(residente => {
            // As ações para o preceptor são diferentes das da secretaria
            const actionsHTML = `
                <div class="list-item-actions">
                    <a href="historico-residente.html?id=${residente.id}" class="btn btn-sm" title="Ver Histórico de Pontos"><i class="bi bi-calendar-check-fill fs-5"></i></a>
                    <a href="visualizar_residente.html?id=${residente.id}&from=precept-residentes" class="btn btn-sm" title="Visualizar Perfil"><i class="bi bi-person-fill fs-5"></i></a>
                </div>
            `;

            residentesHTML += `
                <div class="list-item-wrapper">
                    <div class="list-item-link">
                        <div class="list-item-content">
                            <h5 class="mb-1">${residente.nomeCompleto}</h5>
                            <small class="text-muted">Turma: ${residente.turmaCodigo}</small>
                        </div>
                    </div>
                    ${actionsHTML}
                </div>
            `;
        });
    } else {
        residentesHTML = '<p class="text-center">Nenhum residente está sob sua supervisão no momento.</p>';
    }

    container.innerHTML = `
        <div class="page-header d-flex justify-content-between align-items-center mb-4">
            <div class="d-flex align-items-center">
                <a href="index.html" class="btn btn-light me-3" title="Voltar para o Início"><i class="bi bi-house-door fs-4"></i></a>
                <h2 class="mb-0">Meus Residentes</h2>
            </div>
        </div>
        <div class="list-container">${residentesHTML}</div>
    `;
}