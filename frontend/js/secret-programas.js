document.addEventListener('DOMContentLoaded', async () => {
    // Bloco de Autenticação
    const loggedUser = getLoggedUser();
    if (!loggedUser) {
        window.location.href = 'login.html';
        return;
    }
    renderHeader();
    
    // Carrega o conteúdo da página
    await carregarProgramas();
});

/* Busca os programas e renderiza a página */
async function carregarProgramas() {
    const loggedUser = getLoggedUser();
    
    // MUDANÇA AQUI: Agora chama getProgramas(), que lê do localStorage!
    const programas = await getProgramas(); 

    renderProgramasPage(programas, loggedUser.role);
}

/**
 * Pede confirmação e remove um programa.
 * @param {string} programaId - O ID do programa a ser removido.
 */
async function removerPrograma(programaId) {
    if (confirm('Tem certeza que deseja remover este programa?')) {
        // MUDANÇA AQUI: Agora chama a função real do api.js
        await deletePrograma(programaId);
        // Recarrega a lista da tela para mostrar que o item sumiu
        await carregarProgramas();
    }
}


/**
 * Constrói e renderiza o conteúdo da página de Programas.
 */
function renderProgramasPage(programas, userRole) {
    const container = document.getElementById('page-content');
    if (!container) return;

    const isSecretario = userRole === 'secretario';
    const cadastrarButtonHTML = isSecretario 
        ? `<a href="cadastrar_programa.html" class="btn btn-primary fw-bold">Cadastrar</a>` 
        : '';

    let programasHTML = '';
    if (programas && programas.length > 0) {
        programas.forEach(programa => {
            const actionsHTML = isSecretario 
                ? `
                    <div class="program-actions">
                        <a href="editar_programa.html?id=${programa.id}" class="btn btn-sm" title="Editar"><i class="bi bi-pencil fs-5"></i></a>
                        <button class="btn btn-sm" onclick="removerPrograma('${programa.id}')" title="Remover"><i class="bi bi-trash fs-5 text-danger"></i></button>
                    </div>
                  `
                : '';
            
            programasHTML += `
                <div class="program-item-wrapper">
                    <a href="visualizar_programa.html?id=${programa.id}" class="program-item-link">
                        <div class="program-item-content">
                            <span class="fw-bold">${programa.nome} (${programa.codigo})</span>
                        </div>
                    </a>
                    ${actionsHTML}
                </div>
            `;
        });
    } else {
        programasHTML = '<p class="text-center">Nenhum programa cadastrado.</p>';
    }

    container.innerHTML = `
        <div class="page-header d-flex justify-content-between align-items-center mb-4">
            <div class="d-flex align-items-center">
                <a href="index.html" class="btn btn-light me-2" title="Voltar para o Início"><i class="bi bi-house-door fs-4"></i></a>
                <h2 class="mb-0">Programas</h2>
            </div>
            ${cadastrarButtonHTML}
        </div>
        <div class="program-list">
            ${programasHTML}
        </div>
    `;
}