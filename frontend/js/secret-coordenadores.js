document.addEventListener('DOMContentLoaded', async () => {
    // 1. NOVO BLOCO DE AUTENTICAÇÃO
    const loggedUser = getLoggedUser();
    if (!loggedUser) {
        window.location.href = 'login.html';
        return;
    }
    renderHeader(); // Renderiza o cabeçalho global
    
    // 2. Carrega o conteúdo da página
    await carregarCoordenadores();
});

/**
 * Busca os dados completos dos coordenadores e renderiza a página.
 */
async function carregarCoordenadores() {
    const loggedUser = getLoggedUser();
    
    // Chama a nova função do api.js que já junta os dados
    const coordenadores = await getCoordenadoresCompletos(); 
    
    renderCoordenadoresPage(coordenadores, loggedUser);
}

/**
 * Pede confirmação e remove um coordenador de ambas as "tabelas".
 * @param {string} coordenadorId - O ID do coordenador a ser removido.
 */
async function removerCoordenador(coordenadorId) {
    if (confirm('Tem certeza que deseja remover este coordenador?')) {
        await deleteCoordenador(coordenadorId);
        await carregarCoordenadores(); // Recarrega a lista
    }
}

/**
 * Constrói e renderiza o conteúdo da página de Coordenadores.
 * @param {Array} coordenadores - A lista de coordenadores com dados completos.
 * @param {Object} loggedUser - O objeto do usuário logado.
 */
function renderCoordenadoresPage(coordenadores, loggedUser) {
    const container = document.getElementById('page-content');
    const isSecretario = loggedUser.role === 'secretario';
    const cadastrarButtonHTML = isSecretario ? `<a href="cadastrar_coordenador.html" class="btn btn-primary fw-bold">Cadastrar</a>` : '';

    let coordenadoresHTML = '';
    if (coordenadores && coordenadores.length > 0) {
        coordenadores.forEach(coord => {
            const actionsHTML = isSecretario ? `
                <div class="list-item-actions">
                    <a href="editar_coordenador.html?id=${coord.id}" class="btn btn-sm" title="Editar"><i class="bi bi-pencil fs-5"></i></a>
                    <button class="btn btn-sm" onclick="removerCoordenador('${coord.id}')" title="Remover"><i class="bi bi-trash fs-5 text-danger"></i></button>
                </div>
            ` : '';

            coordenadoresHTML += `
                <div class="list-item-wrapper">
                    <a href="visualizar_coordenador.html?id=${coord.id}" class="list-item-link">
                        <div class="list-item-content">
                            <h5 class="mb-1">${coord.nomeCompleto}</h5>
                            <small class="text-muted">${coord.descricao}</small>
                        </div>
                    </a>
                    ${actionsHTML}
                </div>
            `;
        });
    } else {
        coordenadoresHTML = '<p class="text-center">Nenhum coordenador cadastrado.</p>';
    }

    container.innerHTML = `
        <div class="page-header d-flex justify-content-between align-items-center mb-4">
            <div class="d-flex align-items-center">
                <a href="index.html" class="btn btn-light me-3" title="Voltar para o Início"><i class="bi bi-house-door fs-4"></i></a>
                <h2 class="mb-0">Coordenadores</h2>
            </div>
            ${cadastrarButtonHTML}
        </div>
        <div class="list-container">${coordenadoresHTML}</div>
    `;
}