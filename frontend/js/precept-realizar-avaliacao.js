document.addEventListener('DOMContentLoaded', async () => {
    // 1. AUTENTICAÇÃO E PERMISSÃO
    const loggedUser = getLoggedUser();
    if (!loggedUser || loggedUser.role !== 'preceptor') {
        alert('Acesso negado.');
        window.location.href = 'index.html';
        return;
    }
    renderHeader();

    // 2. BUSCAR DADOS
    const params = new URLSearchParams(window.location.search);
    const avaliacaoId = params.get('id');
    if (!avaliacaoId) {
        alert('ID da avaliação não encontrado!');
        window.location.href = 'precept-avaliacoes.html';
        return;
    }

    const avaliacao = await getAvaliacaoCompletaById(avaliacaoId);
    
    // 3. RENDERIZAR A PÁGINA
    if (avaliacao) {
        renderFormularioAvaliacao(avaliacao);
    } else {
        document.getElementById('page-content').innerHTML = '<p class="text-center">Avaliação não encontrada.</p>';
    }
});

/**
 * Constrói e renderiza o formulário de avaliação dinâmico.
 * @param {Object} avaliacao - O objeto da avaliação com dados completos, incluindo o gabarito.
 */
function renderFormularioAvaliacao(avaliacao) {
    const container = document.getElementById('page-content');
    const formulario = avaliacao.formulario;

    let secoesHTML = '';
    if (formulario && formulario.secoes) {
        formulario.secoes.forEach((secao, indexSecao) => {
            secoesHTML += `<h4 class="fw-light mt-4 mb-3">${secao.titulo}</h4>`;
            
            secao.criterios.forEach((criterio, indexCriterio) => {
                const criterioId = `${secao.titulo.replace(/\s/g, '')}-${criterio.id}`;
                secoesHTML += `
                    <div class="card p-3 mb-3">
                        <label class="form-label">${indexCriterio + 1}. ${criterio.texto}</label>
                        <div class="d-flex justify-content-around">
                            <div class="form-check"><input class="form-check-input" type="radio" name="${criterioId}" value="10"> <small>10,0-9,0</small></div>
                            <div class="form-check"><input class="form-check-input" type="radio" name="${criterioId}" value="8"> <small>8,9-8,0</small></div>
                            <div class="form-check"><input class="form-check-input" type="radio" name="${criterioId}" value="7"> <small>7,9-7,0</small></div>
                            <div class="form-check"><input class="form-check-input" type="radio" name="${criterioId}" value="6"> <small><=6,9</small></div>
                        </div>
                    </div>
                `;
            });
        });
    }

    container.innerHTML = `
        <div class="page-header d-flex align-items-center mb-4">
            <a href="precept-avaliacoes.html" class="btn btn-light me-3" title="Voltar"><i class="bi bi-arrow-left fs-4"></i></a>
            <div>
                <h2 class="mb-0">${avaliacao.titulo}</h2>
                <p class="text-muted mb-0">Residente: ${avaliacao.residenteNome}</p>
            </div>
        </div>
        <form id="form-avaliacao">
            ${secoesHTML}
            <div class="d-flex justify-content-end mt-4">
                <button type="submit" class="btn btn-primary btn-lg">Finalizar Avaliação</button>
            </div>
        </form>
    `;
    
    // Lógica para salvar o formulário
    const form = document.getElementById('form-avaliacao');
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        alert('Funcionalidade de salvar avaliação a ser implementada!');
        // Aqui viria a lógica para coletar as respostas e chamar uma função da API
        // await saveAvaliacaoRespostas(avaliacao.id, respostas);
        window.location.href = 'precept-avaliacoes.html';
    });
}