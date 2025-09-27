document.addEventListener('DOMContentLoaded', async () => {
    // 1. NOVO BLOCO DE AUTENTICAÇÃO
    const loggedUser = getLoggedUser();
    if (!loggedUser) {
        window.location.href = 'login.html';
        return;
    }
    renderHeader(); // Renderiza o cabeçalho global
    
    // 2. Carrega o conteúdo da página
    await carregarPreceptores();
});

/**
 * Busca os dados completos dos preceptores e renderiza a página.
 */
async function carregarPreceptores() {
    const loggedUser = getLoggedUser();
    
    // Chama a nova função do api.js que já junta os dados
    const preceptores = await getPreceptoresCompletos(); 
    
    renderPreceptoresPage(preceptores, loggedUser.role);
}

/**
 * Pede confirmação e remove um preceptor de ambas as "tabelas".
 * @param {string} preceptorId - O ID do preceptor a ser removido.
 */
async function removerPreceptor(preceptorId) {
    if (confirm('Tem certeza que deseja remover este preceptor?')) {
        // Chama a nova função do api.js que remove de ambos os lugares
        await deletePreceptor(preceptorId);
        // Recarrega a lista na tela para refletir a remoção
        await carregarPreceptores();
    }
}

/**
 * Constrói e renderiza o conteúdo da página de Preceptores.
 * @param {Array} preceptores - A lista de preceptores com dados completos.
 * @param {string} userRole - O perfil do usuário logado.
 */
function renderPreceptoresPage(preceptores, userRole) {
    const container = document.getElementById('page-content');
    const isSecretario = userRole === 'secretario';
    const cadastrarButtonHTML = isSecretario ? `<a href="cadastrar_preceptor.html" class="btn btn-primary fw-bold">Cadastrar</a>` : '';

    let preceptoresHTML = '';
    if (preceptores && preceptores.length > 0) {
        preceptores.forEach(preceptor => {
            const actionsHTML = isSecretario ? `
                <div class="list-item-actions">
                    <a href="editar_preceptor.html?id=${preceptor.id}" class="btn btn-sm" title="Editar"><i class="bi bi-pencil fs-5"></i></a>
                    <button class="btn btn-sm" onclick="removerPreceptor('${preceptor.id}')" title="Remover"><i class="bi bi-trash fs-5 text-danger"></i></button>
                </div>
            ` : '';

            preceptoresHTML += `
                <div class="list-item-wrapper">
                    <a href="visualizar_preceptor.html?id=${preceptor.id}" class="list-item-link">
                        <div class="list-item-content">
                            <h5 class="mb-1">${preceptor.nomeCompleto}</h5> 
                            <small class="text-muted">${preceptor.especialidade}</small>
                        </div>
                    </a>
                    ${actionsHTML}
                </div>
            `;
        });
    } else {
        preceptoresHTML = '<p class="text-center">Nenhum preceptor cadastrado.</p>';
    }

    container.innerHTML = `
        <div class="page-header d-flex justify-content-between align-items-center mb-4">
            <div class="d-flex align-items-center">
                <a href="index.html" class="btn btn-light me-3" title="Voltar para o Início"><i class="bi bi-house-door fs-4"></i></a>
                <h2 class="mb-0">Preceptores</h2>
            </div>
            ${cadastrarButtonHTML}
        </div>
        <div class="list-container">${preceptoresHTML}</div>
    `;
}