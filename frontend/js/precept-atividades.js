document.addEventListener('DOMContentLoaded', async () => {
    // 1. AUTENTICAÇÃO E PERMISSÃO
    const loggedUser = getLoggedUser();
    if (!loggedUser || loggedUser.role !== 'preceptor') {
        alert('Acesso negado.');
        window.location.href = 'index.html';
        return;
    }
    renderHeader();
    
    // 2. Carrega o conteúdo da página
    await carregarAtividades(loggedUser.id);
});

/**
 * Busca as atividades realizadas dos residentes do preceptor e renderiza a página.
 * @param {string} preceptorId - O ID do preceptor logado.
 */
async function carregarAtividades(preceptorId) {
    const atividades = await getAtividadesRealizadasPorPreceptor(preceptorId); 
    renderAtividadesPage(atividades);
}

/**
 * Constrói e renderiza os cards de atividades realizadas.
 * @param {Array} atividades - A lista de jornadas já validadas.
 */
function renderAtividadesPage(atividades) {
    const container = document.getElementById('page-content');
    
    let atividadesHTML = '';
    if (!atividades || atividades.length === 0) {
        atividadesHTML = '<p class="text-center">Nenhuma atividade realizada encontrada para seus residentes.</p>';
    } else {
        // Ordena por data, da mais recente para a mais antiga
        atividades.sort((a, b) => new Date(b.data.split('/').reverse().join('-')) - new Date(a.data.split('/').reverse().join('-')));
        
        atividades.forEach(jornada => {
            const statusMap = {
                'aprovado': { texto: 'Aprovado', bg: 'bg-success' },
                'justificado': { texto: 'Justificado', bg: 'bg-warning' },
                'reprovado': { texto: 'Reprovado', bg: 'bg-danger' }
            };
            const statusInfo = statusMap[jornada.status] || { texto: jornada.status, bg: 'bg-dark' };

            atividadesHTML += `
                <div class="list-item-wrapper">
                    <div class="list-item-link">
                        <div class="list-item-content">
                            <h6 class="mb-1">${jornada.residenteNome}</h6>
                            <small class="text-muted">Em ${jornada.data}</small>
                        </div>
                    </div>
                    <div class="list-item-actions">
                        <span class="badge ${statusInfo.bg}">${statusInfo.texto}</span>
                    </div>
                </div>
            `;
        });
    }

    container.innerHTML = `
        <div class="page-header d-flex justify-content-between align-items-center mb-4">
            <div class="d-flex align-items-center">
                <a href="index.html" class="btn btn-light me-3" title="Voltar para o Início"><i class="bi bi-house-door fs-4"></i></a>
                <h2 class="mb-0">Atividades Realizadas</h2>
            </div>
        </div>
        <div class="list-container">
            ${atividadesHTML}
        </div>
    `;
}