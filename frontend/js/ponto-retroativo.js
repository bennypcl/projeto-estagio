document.addEventListener('DOMContentLoaded', async () => {
    // 1. AUTENTICAÇÃO E RENDERIZAÇÃO INICIAL
    const loggedUser = getLoggedUser();
    if (!loggedUser || loggedUser.role !== 'residente') {
        alert('Acesso negado.');
        window.location.href = 'index.html';
        return;
    }
    renderHeader();

    // 2. BUSCAR DADOS DA URL
    const params = new URLSearchParams(window.location.search);
    const notificacaoId = params.get('notifId');
    const jornadaId = params.get('jornadaId');

    if (!jornadaId || !notificacaoId) {
        alert('Informações da correção não encontradas!');
        window.location.href = 'notificacoes-residente.html';
        return;
    }

    // 3. BUSCAR A JORNADA E RENDERIZAR O FORMULÁRIO
    const jornadaParaCorrigir = await getJornadaById(jornadaId);
    
    if (jornadaParaCorrigir) {
        renderFormularioCorrecao(jornadaParaCorrigir);
    } else {
        document.getElementById('page-content').innerHTML = '<p class="text-center">Jornada não encontrada.</p>';
    }
});

/**
 * Constrói e renderiza o formulário de edição para a jornada.
 * @param {Object} jornada - A jornada a ser corrigida.
 */
function renderFormularioCorrecao(jornada) {
    const container = document.getElementById('page-content');
    
    // Constrói os campos de input para cada atividade e ponto
    let camposHTML = '';
    jornada.atividades.forEach((atividade, indexAtividade) => {
        const tipoFormatado = atividade.tipo.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        camposHTML += `<h5 class="mt-4">${tipoFormatado}</h5>`;

        if (atividade.tipo === 'normal' && atividade.pontos) {
            atividade.pontos.forEach((ponto, indexPonto) => {
                const tipoPontoFormatado = ponto.tipo.replace(/\b\w/g, l => l.toUpperCase());
                camposHTML += `
                    <div class="mb-3">
                        <label for="ponto-${indexAtividade}-${indexPonto}" class="form-label">${tipoPontoFormatado}:</label>
                        <input type="time" class="form-control" id="ponto-${indexAtividade}-${indexPonto}" value="${ponto.hora}">
                    </div>
                `;
            });
        }
    });

    container.innerHTML = `
        <div class="page-header d-flex align-items-center mb-4">
            <a href="notificacoes-residente.html" class="btn btn-light me-3" title="Voltar"><i class="bi bi-arrow-left fs-4"></i></a>
            <div>
                <h2 class="mb-0">Corrigir Pontos</h2>
                <p class="text-muted mb-0">Referente ao dia ${jornada.data}</p>
            </div>
        </div>
        <form id="form-correcao" class="bg-white p-4 p-md-5 rounded shadow-sm">
            ${camposHTML}
            <hr class="my-4">
            <div class="d-flex justify-content-end gap-2">
                <a href="notificacoes-residente.html" class="btn btn-secondary">Cancelar</a>
                <button type="submit" class="btn btn-primary fw-bold">Enviar Correção</button>
            </div>
        </form>
    `;

    // Adiciona o listener para salvar o formulário
    const form = document.getElementById('form-correcao');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        // Atualiza o objeto da jornada com os novos horários
        jornada.atividades.forEach((atividade, indexAtividade) => {
            if (atividade.pontos) {
                atividade.pontos.forEach((ponto, indexPonto) => {
                    const input = document.getElementById(`ponto-${indexAtividade}-${indexPonto}`);
                    ponto.hora = input.value; // Atualiza a hora com o valor do input
                });
            }
        });

        // Muda o status da jornada de volta para 'pendente' para que o preceptor possa reavaliar
        jornada.status = 'pendente';
        
        // Salva a jornada atualizada e a notificação
        const params = new URLSearchParams(window.location.search);
        const notificacaoId = params.get('notifId');

        await updateJornada(jornada);
        await updateStatusNotificacao(notificacaoId, 'lida');

        alert('Correção enviada com sucesso para reavaliação do preceptor!');
        window.location.href = 'notificacoes-residente.html';
    });
}