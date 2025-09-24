document.addEventListener('DOMContentLoaded', async () => {
    // 1. AUTENTICAÇÃO
    const loggedUser = getLoggedUser();
    if (!loggedUser || loggedUser.role !== 'residente') {
        alert('Acesso negado.');
        window.location.href = 'index.html';
        return;
    }
    renderHeader();

    // 2. BUSCAR E RENDERIZAR
    const notificacoes = await getNotificacoesDoResidente(loggedUser.id);
    renderNotificacoesPage(notificacoes);
});

function renderNotificacoesPage(notificacoes) {
    const container = document.getElementById('page-content');
    
    let notificacoesHTML = '';
    if (!notificacoes || notificacoes.length === 0) {
        notificacoesHTML = '<p class="text-center">Nenhuma notificação encontrada.</p>';
    } else {
        notificacoes.sort((a, b) => b.id.localeCompare(a.id)); // Mais recentes primeiro
        notificacoes.forEach(notif => {
            let actionHTML = '';
            // Se for uma notificação de correção e não estiver lida, mostra o botão
            if (notif.tipo === 'correcao_ponto' && notif.status === 'nao_lida') {
                actionHTML = `<a href="ponto-retroativo.html?notifId=${notif.id}&jornadaId=${notif.jornadaId}" class="btn btn-warning btn-sm">Corrigir Ponto</a>`;
            } else {
                 actionHTML = `<span class="badge bg-secondary">Concluído</span>`;
            }

            notificacoesHTML += `
                <div class="list-item-wrapper">
                    <div class="list-item-link">
                        <div class="list-item-content">
                            <p class="mb-0">${notif.mensagem}</p>
                        </div>
                    </div>
                    <div class="list-item-actions">${actionHTML}</div>
                </div>
            `;
        });
    }

    container.innerHTML = `
        <div class="page-header d-flex align-items-center mb-4">
            <a href="index.html" class="btn btn-light me-3" title="Voltar"><i class="bi bi-house-door fs-4"></i></a>
            <h2 class="mb-0">Notificações</h2>
        </div>
        <div class="list-container">${notificacoesHTML}</div>
    `;
}