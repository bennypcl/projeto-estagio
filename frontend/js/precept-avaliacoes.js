document.addEventListener('DOMContentLoaded', async () => {
    const loggedUser = getLoggedUser();
    if (!loggedUser || loggedUser.role !== 'preceptor') { /* ... auth check ... */ return; }
    renderHeader();
    await carregarAvaliacoes(loggedUser.id);
});

async function carregarAvaliacoes(preceptorId) {
    const avaliacoes = await getAvaliacoesPorPreceptor(preceptorId);
    renderAvaliacoesPage(avaliacoes);
}

function renderAvaliacoesPage(avaliacoes) {
    const container = document.getElementById('page-content');
    
    let avaliacoesHTML = '';
    if (avaliacoes && avaliacoes.length > 0) {
        // Separa as avaliações a fazer das já concluídas
        const pendentes = avaliacoes.filter(a => a.status !== 'concluida');
        const concluidas = avaliacoes.filter(a => a.status === 'concluida');

        // Renderiza as pendentes primeiro
        pendentes.forEach(avaliacao => {
            avaliacoesHTML += `
                <a href="precept-realizar-avaliacao.html?id=${avaliacao.id}" class="list-item-wrapper avaliacao-card status-nao_iniciada">
                    <div class="list-item-content">
                        <h5 class="mb-1">${avaliacao.residenteNome}</h5>
                        <small class="text-muted">${avaliacao.titulo}</small>
                    </div>
                    <div class="list-item-actions"><i class="bi bi-pencil-square fs-4"></i></div>
                </a>
            `;
        });
        
        // Renderiza as concluídas depois, com estilo diferente
        if (concluidas.length > 0) {
            avaliacoesHTML += `<h4 class="fw-light mt-5 mb-3">Avaliações Concluídas</h4>`;
            concluidas.forEach(avaliacao => {
                avaliacoesHTML += `<div class="list-item-wrapper avaliacao-card status-concluida">...</div>`;
            });
        }

    } else {
        avaliacoesHTML = '<p class="text-center">Nenhuma avaliação encontrada.</p>';
    }

    container.innerHTML = `
        <div class="page-header ..."><h2 class="mb-0">Avaliações</h2></div>
        <div class="list-container">${avaliacoesHTML}</div>
    `;
}