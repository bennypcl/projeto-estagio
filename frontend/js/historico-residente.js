document.addEventListener('DOMContentLoaded', async () => {
    // 1. AUTENTICAÇÃO PADRÃO
    const loggedUser = getLoggedUser();
    if (!loggedUser || loggedUser.role !== 'residente') {
        alert('Acesso negado.');
        window.location.href = 'index.html';
        return;
    }
    renderHeader(); // Chama a função global do ui.js

    // 2. BUSCAR DADOS
    const todasJornadas = await getJornadasDoResidente(loggedUser.id);
    
    // 3. RENDERIZAR A ESTRUTURA DA PÁGINA
    renderHistoricoPage();

    // 4. CONFIGURAR E POPULAR O FILTRO DE MÊS
    const monthFilter = document.getElementById('month-filter');
    if (todasJornadas.length === 0) {
        monthFilter.disabled = true;
        monthFilter.innerHTML = '<option>Nenhum registro</option>';
        renderizarListaJornadas([]); // Mostra a mensagem de lista vazia
        return;
    }

    const meses = [...new Set(todasJornadas.map(j => j.data.substring(3)))].sort().reverse();
    monthFilter.innerHTML = '';
    meses.forEach(mes => {
        const option = document.createElement('option');
        option.value = mes;
        option.textContent = mes;
        monthFilter.appendChild(option);
    });

    // Adiciona o "ouvinte" para filtrar ao mudar a seleção
    monthFilter.addEventListener('change', () => {
        const mesSelecionado = monthFilter.value;
        const jornadasFiltradas = todasJornadas.filter(j => j.data.endsWith(mesSelecionado));
        renderizarListaJornadas(jornadasFiltradas);
    });

    // Dispara o evento 'change' para carregar os dados do primeiro mês
    monthFilter.dispatchEvent(new Event('change'));
});

/**
 * Renderiza a estrutura principal da página (cabeçalho da página e container da lista).
 */
function renderHistoricoPage() {
    const container = document.getElementById('page-content');
    if (!container) return;
    
    container.innerHTML = `
        <div class="page-header d-flex justify-content-between align-items-center mb-4">
            <div class="d-flex align-items-center">
                <a href="index.html" class="btn btn-light me-3" title="Voltar para o Início"><i class="bi bi-house-door fs-4"></i></a>
                <h2 class="mb-0">Meu Histórico</h2>
            </div>
            <div class="d-flex align-items-center">
                <label for="month-filter" class="form-label mb-0 me-2">Mês:</label>
                <select class="form-select" id="month-filter"></select>
            </div>
        </div>
        <div id="history-list" class="d-grid gap-2"> </div>
    `;
}

/**
 * Renderiza a lista de cards de jornada e as seções de detalhes.
 * @param {Array} jornadas - A lista de jornadas para exibir.
 */
function renderizarListaJornadas(jornadas) {
    const historyListContainer = document.getElementById('history-list');
    if (!historyListContainer) return;
    historyListContainer.innerHTML = '';

    if (jornadas.length === 0) {
        historyListContainer.innerHTML = '<p class="text-center">Nenhum registro encontrado para este mês.</p>';
        return;
    }

    // Ordena as jornadas pela data, da mais recente para a mais antiga
    jornadas.sort((a, b) => new Date(b.data.split('/').reverse().join('-')) - new Date(a.data.split('/').reverse().join('-')));

    jornadas.forEach(jornada => {
        const statusMap = {
            'aprovado': { texto: 'Aprovado', bg: 'bg-success' },
            'justificado': { texto: 'Justificado', bg: 'bg-warning' },
            'reprovado': { texto: 'Reprovado', bg: 'bg-danger' },
            'pendente': { texto: 'Pendente', bg: 'bg-secondary' }
        };
        const statusInfo = statusMap[jornada.status] || { texto: jornada.status, bg: 'bg-dark' };

        // Cria o card principal (visível)
        const card = document.createElement('div');
        card.className = `jornada-card status-${jornada.status}`;
        card.innerHTML = `
            <div>
                <h5 class="fw-bold mb-0">${jornada.data}</h5>
                <p class="text-muted mb-0">Clique para ver os detalhes</p>
            </div>
            <div class="d-flex align-items-center">
                <span class="badge ${statusInfo.bg} me-3">${statusInfo.texto}</span>
                <i class="bi bi-chevron-down"></i>
            </div>
        `;
        
        // Cria a seção de detalhes (escondida)
        const details = document.createElement('div');
        details.className = 'jornada-details d-none';
        let detailsHTML = '';
        jornada.atividades.forEach(atividade => {
            const tipoFormatado = atividade.tipo.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            detailsHTML += `<h6 class="mt-2">${tipoFormatado}</h6>`;
            if (atividade.pontos && atividade.pontos.length > 0) {
                detailsHTML += '<ul class="list-unstyled mb-0">';
                atividade.pontos.forEach(ponto => {
                    detailsHTML += `<li>${ponto.tipo.replace(/\b\w/g, l => l.toUpperCase())}: <strong>${ponto.hora}</strong></li>`;
                });
                detailsHTML += '</ul>';
            } else if (atividade.detalhe) {
                 detailsHTML += `<p class="mb-0">${atividade.detalhe}</p>`;
            }
        });
        if (jornada.justificativaGeral) {
            detailsHTML += `<hr><p class="mb-0"><strong class="fw-bold">Justificativa:</strong> ${jornada.justificativaGeral}</p>`
        }
        details.innerHTML = detailsHTML || '<p>Nenhum detalhe de atividade encontrado.</p>';

        // Adiciona o evento de clique para expandir/recolher
        card.addEventListener('click', () => {
            details.classList.toggle('d-none');
            const icon = card.querySelector('i');
            if (icon) {
                icon.style.transform = details.classList.contains('d-none') ? 'rotate(0deg)' : 'rotate(180deg)';
            }
        });
        
        historyListContainer.appendChild(card);
        historyListContainer.appendChild(details);
    });
}