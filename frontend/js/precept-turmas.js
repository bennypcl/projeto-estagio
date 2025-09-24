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
    await carregarTurmasDoPreceptor(loggedUser.id);
});

/**
 * Busca e renderiza apenas as turmas onde o preceptor logado possui residentes.
 * @param {string} preceptorId - O ID do preceptor logado.
 */
async function carregarTurmasDoPreceptor(preceptorId) {
    // Busca todos os dados necessários em paralelo
    const [todosResidentes, todasTurmas, todosProgramas] = await Promise.all([
        _getStore('residentes'),
        _getStore('turmas'),
        _getStore('programas')
    ]);

    if (!todosResidentes || !todasTurmas || !todosProgramas) {
        document.getElementById('page-content').innerHTML = '<p class="text-center">Erro ao carregar os dados.</p>';
        return;
    }

    // 1. Filtra para encontrar apenas os residentes que pertencem a este preceptor
    const meusResidentes = todosResidentes.filter(r => r.preceptorId === preceptorId);

    // 2. Agrupa esses residentes por turma e conta quantos existem em cada
    const turmasDoPreceptor = meusResidentes.reduce((acc, residente) => {
        const idDaTurma = residente.turmaId;
        if (!idDaTurma) return acc; // Ignora residentes que estão sem turma

        // Se a turma ainda não foi adicionada ao acumulador, inicializa
        if (!acc[idDaTurma]) {
            const detalhesDaTurma = todasTurmas.find(t => t.id === idDaTurma);
            const detalhesDoPrograma = todosProgramas.find(p => p.id === detalhesDaTurma.programaId);
            
            acc[idDaTurma] = {
                id: detalhesDaTurma.id,
                codigo: detalhesDaTurma.codigo,
                programaNome: detalhesDoPrograma ? detalhesDoPrograma.nome : 'Programa não encontrado',
                contagemResidentes: 0
            };
        }
        // Incrementa o contador de residentes para esta turma
        acc[idDaTurma].contagemResidentes++;
        return acc;
    }, {});
    
    // Converte o objeto de turmas em um array para poder ser exibido
    const listaDeTurmas = Object.values(turmasDoPreceptor);

    renderTurmasPreceptorPage(listaDeTurmas);
}

/**
 * Constrói e renderiza o conteúdo da página de Turmas do Preceptor.
 * @param {Array} turmas - A lista de turmas já filtrada e processada.
 */
function renderTurmasPreceptorPage(turmas) {
    const container = document.getElementById('page-content');

    let turmasGridHTML = '';
    if (turmas && turmas.length > 0) {
        turmas.forEach(turma => {
            const residentCountFormatted = String(turma.contagemResidentes).padStart(2, '0');
            turmasGridHTML += `
                <div class="col-lg-4 col-md-6 mb-4">
                    <div class="card turma-card h-100">
                        <div class="card-body">
                            <h5 class="card-title fw-bold">${turma.codigo}</h5>
                            <p class="card-text text-muted">${turma.programaNome}</p>
                            <p class="card-text"><strong>${residentCountFormatted}</strong> residentes sob sua supervisão</p>
                            <a href="precept-turma_detalhes.html?id=${turma.id}" class="stretched-link" title="Ver detalhes da turma"></a>
                        </div>
                    </div>
                </div>
            `;
        });
    } else {
        turmasGridHTML = '<div class="col-12"><p class="text-center">Você não possui residentes em nenhuma turma no momento.</p></div>';
    }

    container.innerHTML = `
        <div class="page-header d-flex justify-content-between align-items-center mb-4">
            <div class="d-flex align-items-center">
                <a href="index.html" class="btn btn-light me-3" title="Voltar para o Início"><i class="bi bi-house-door fs-4"></i></a>
                <h2 class="mb-0">Minhas Turmas</h2>
            </div>
        </div>
        <div class="row">
            ${turmasGridHTML}
        </div>
    `;
}