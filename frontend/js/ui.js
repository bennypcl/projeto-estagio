/**
 * Renderiza o cabeçalho principal da aplicação (#app-header).
 * Esta função agora busca os dados do usuário logado por conta própria.
 */
function renderHeader() {
    const headerContainer = document.getElementById('app-header');
    if (!headerContainer) return;

    // 1. Usa a nova função de auth.js para pegar o objeto do usuário logado
    const loggedUser = getLoggedUser();

    if (loggedUser) {
        // 2. Acessa o nome completo do usuário a partir do objeto
        const nomeUsuario = loggedUser.nomeCompleto;

        // 3. Monta o HTML do cabeçalho com o nome completo
        headerContainer.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <h1 class="fw-light">Bem-vindo</h1>
                <div class="user-info d-flex align-items-center p-2">
                    <div class="icon rounded-circle d-flex justify-content-center align-items-center me-2">
                        <i class="bi bi-person-fill text-white"></i>
                    </div>
                    <span class="fw-bold">${nomeUsuario}</span>
                    <button class="btn btn-sm btn-light text-primary fw-bold ms-3 logout-btn" onclick="logout()" title="Sair">
                        <i class="bi bi-box-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
    }
}

/**
 * Renderiza o grid de módulos do dashboard.
 * (Esta função não precisa de alterações)
 * @param {Array<Object>} modules - A lista de módulos vinda da API.
 */
function renderDashboardGrid(modules) {
    const dashboardContainer = document.getElementById('app-dashboard');
    if (!dashboardContainer) return;

    dashboardContainer.innerHTML = '';

    if (!modules || modules.length === 0) {
        dashboardContainer.innerHTML = '<p class="text-center">Nenhum módulo disponível para este perfil.</p>';
        return;
    }

    modules.forEach(module => {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4'; 

        const card = `
            <a href="${module.link || '#'}" class="module-card d-flex align-items-center justify-content-center p-3 text-decoration-none">
                <h2 class="text-center">${module.titulo}</h2>
            </a>
        `;
        col.innerHTML = card;
        dashboardContainer.appendChild(col);
    });
}