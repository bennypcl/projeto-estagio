// Este script é o ponto de entrada da página principal (index.html)

document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. Usa a nova função de auth.js para pegar o objeto completo do usuário logado
    const loggedUser = getLoggedUser();

    // 2. Se não houver um objeto de usuário, significa que ninguém está logado.
    // Redireciona de volta para a tela de login.
    if (!loggedUser) {
        window.location.href = 'login.html';
        return; // Para a execução do script
    }

    // 3. Renderiza o cabeçalho principal da aplicação.
    // A função renderHeader() do ui.js já sabe como encontrar os dados do usuário.
    renderHeader();

    // 4. Acessa a propriedade 'role' do objeto de usuário para saber qual perfil carregar
    const userRole = loggedUser.role;

    // 5. Busca os dados do dashboard para aquele perfil específico (ex: 'residente', 'preceptor')
    const dashboardData = await getDashboardData(userRole);

    // 6. Se os dados foram encontrados, renderiza o grid de módulos na tela
    if (dashboardData && dashboardData.modulos) {
        renderDashboardGrid(dashboardData.modulos);
    } else {
        // Caso contrário, mostra uma mensagem de erro indicando que os módulos não foram encontrados
        const dashboardContainer = document.getElementById('app-dashboard');
        dashboardContainer.innerHTML = `<p class="text-center">Não foi possível carregar os módulos para o perfil '${userRole}'.</p>`;
    }
});