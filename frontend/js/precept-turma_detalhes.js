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
    const turmaId = params.get('id');
    if (!turmaId) {
        alert('ID da turma não encontrado!');
        window.location.href = 'precept-turmas.html';
        return;
    }

    // Busca os dados completos da turma e os residentes do preceptor
    const [turma, residentesDoPreceptor] = await Promise.all([
        getTurmaCompletaById(turmaId),
        getResidentesPorPreceptor(loggedUser.id)
    ]);
    
    // 3. RENDERIZAR A PÁGINA
    if (turma) {
        // Filtra para mostrar apenas os residentes do preceptor que estão NESTA turma
        const residentesNestaTurma = residentesDoPreceptor.filter(r => r.turmaId === turmaId);
        renderDetalhesTurmaPage(turma, residentesNestaTurma);
    } else {
        document.getElementById('page-content').innerHTML = '<p class="text-center">Turma não encontrada.</p>';
    }
});

/**
 * Constrói e renderiza o conteúdo da página de detalhes da turma.
 * @param {Object} turma - O objeto da turma com dados completos.
 * @param {Array} residentes - A lista de residentes do preceptor nesta turma.
 */
function renderDetalhesTurmaPage(turma, residentes) {
    const container = document.getElementById('page-content');

    let residentesHTML = '';
    if (residentes && residentes.length > 0) {
        residentes.forEach(residente => {
            residentesHTML += `
                <div class="list-item-wrapper">
                    <div class="list-item-link">
                        <div class="list-item-content">
                            <h5 class="mb-1">${residente.nomeCompleto}</h5>
                            <small class="text-muted">Matrícula: ${residente.matricula}</small>
                        </div>
                    </div>
                    <div class="list-item-actions">
                         <a href="visualizar_residente.html?id=${residente.id}" class="btn btn-sm" title="Visualizar Perfil"><i class="bi bi-person-fill fs-5"></i></a>
                    </div>
                </div>
            `;
        });
    } else {
        residentesHTML = '<p class="text-center text-muted">Você não possui residentes nesta turma.</p>';
    }

    container.innerHTML = `
        <div class="page-header d-flex justify-content-between align-items-center mb-4">
            <div class="d-flex align-items-center">
                <a href="precept-turmas.html" class="btn btn-light me-3" title="Voltar para Minhas Turmas"><i class="bi bi-arrow-left fs-4"></i></a>
                <div>
                    <h2 class="mb-0">${turma.codigo}</h2>
                    <p class="text-muted mb-0">${turma.programaNome}</p>
                </div>
            </div>
        </div>

        <div class="bg-white p-4 p-md-5 rounded shadow-sm">
            <h4 class="fw-light mb-3">Meus Residentes na Turma (${residentes.length})</h4>
            <div class="list-container">
                ${residentesHTML}
            </div>
        </div>
    `;
}