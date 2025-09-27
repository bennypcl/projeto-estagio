document.addEventListener('DOMContentLoaded', async () => {
    // 1. AUTENTICAÇÃO E PERMISSÃO
    const loggedUser = getLoggedUser();
    if (!loggedUser || loggedUser.role !== 'preceptor') {
        alert('Acesso negado.');
        window.location.href = 'index.html';
        return;
    }
    renderHeader(); // Renderiza o cabeçalho global
    
    // 2. Carrega o conteúdo da página
    await carregarPendencias(loggedUser.id);
});

/**
 * Busca as pendências do preceptor e renderiza a página.
 * @param {string} preceptorId - O ID do preceptor logado.
 */
async function carregarPendencias(preceptorId) {
    const pendencias = await getPendenciasPorPreceptor(preceptorId); 
    renderPendenciasPage(pendencias, preceptorId);
}

/**
 * Constrói e renderiza os cards de pendências na tela.
 * @param {Array} pendencias - A lista de jornadas pendentes.
 * @param {string} preceptorId - O ID do preceptor logado (para registrar quem validou).
 */
function renderPendenciasPage(pendencias, preceptorId) {
    const container = document.getElementById('pendencias-list');
    container.innerHTML = ''; // Limpa a lista antes de renderizar

    if (!pendencias || pendencias.length === 0) {
        container.innerHTML = '<p class="text-center">Nenhuma pendência encontrada para seus residentes.</p>';
        return;
    }

    pendencias.forEach(jornada => {
        const card = document.createElement('div');
        card.className = 'card pendencia-card';

        // Formata as atividades para exibição
        let atividadesHTML = '<p>Nenhuma atividade registrada.</p>';
        if (jornada.atividades && jornada.atividades.length > 0) {
            atividadesHTML = '<ul class="mb-0">';
            jornada.atividades.forEach(atividade => {
                const tipoFormatado = atividade.tipo.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                let detalhe = '';
                if (atividade.tipo === 'normal' && atividade.pontos.length > 0) {
                    const entrada = atividade.pontos.find(p => p.tipo === 'entrada')?.hora || '--:--';
                    const saida = atividade.pontos.find(p => p.tipo === 'saida')?.hora || '--:--';
                    detalhe = `Entrada: ${entrada} | Saída: ${saida}`;
                } else if (atividade.detalhe) {
                    detalhe = atividade.detalhe;
                }
                atividadesHTML += `<li><strong>${tipoFormatado}:</strong> ${detalhe}</li>`;
            });
            atividadesHTML += '</ul>';
        }

        // Monta a caixa de justificativa, se existir
        const justificativaHTML = jornada.justificativaGeral
            ? `
                <div class="justificativa-box">
                    <strong>Justificativa do Residente:</strong>
                    <p class="mb-0 fst-italic">"${jornada.justificativaGeral}"</p>
                </div>
            `
            : '';

        // Monta o card completo
        card.innerHTML = `
            <div class="card-header d-flex justify-content-between align-items-center">
                <div>
                    <h5 class="mb-0">${jornada.residenteNome}</h5>
                    <small class="text-muted">Em ${jornada.data}</small>
                </div>
                <span class="badge bg-secondary">Pendente</span>
            </div>
            <div class="card-body">
                ${atividadesHTML}
                ${justificativaHTML}
            </div>
            <div class="card-footer text-end">
                <button class="btn btn-sm btn-danger btn-reprovar">Reprovar</button>
                <button class="btn btn-sm btn-warning btn-justificar">Solicitar Correção</button>
                <button class="btn btn-sm btn-success btn-aprovar">Aprovar</button>
            </div>
        `;

        // Adiciona os eventos aos botões de ação
        card.querySelector('.btn-aprovar').addEventListener('click', async () => {
            await atualizarStatusJornada(jornada.id, 'aprovado', preceptorId);
            await carregarPendencias(preceptorId); // Recarrega a lista
        });
        card.querySelector('.btn-reprovar').addEventListener('click', async () => {
            const observacao = prompt("Por favor, insira o motivo da reprovação:");
            if (observacao !== null) { // Continua apenas se o usuário não clicar em "cancelar"
                await atualizarStatusJornada(jornada.id, 'reprovado', preceptorId, observacao);
                await carregarPendencias(preceptorId);
            }
        });
        card.querySelector('.btn-justificar').addEventListener('click', async () => {
            const observacao = prompt("Por favor, insira uma instrução para a correção do residente:");
            if (observacao !== null) {
                // Chama a nova função que cria a notificação
                await solicitarCorrecaoPonto(jornada.id, preceptorId, observacao);
                alert('Solicitação de correção enviada ao residente.');
                await carregarPendencias(preceptorId); // Recarrega a lista
            }
        });

        container.appendChild(card);
    });
}