document.addEventListener('DOMContentLoaded', async () => {
    // 1. AUTENTICAÇÃO E RENDERIZAÇÃO DO CABEÇALHO
    const loggedUser = getLoggedUser();
    if (!loggedUser) {
        window.location.href = 'login.html';
        return;
    }
    renderHeader();

    // 2. BUSCAR DADOS
    const params = new URLSearchParams(window.location.search);
    const coordenadorId = params.get('id');
    if (!coordenadorId) {
        alert('ID do coordenador não encontrado!');
        window.location.href = 'secret-coordenadores.html';
        return;
    }

    // Chama a função da API que já busca e combina todos os dados
    const coordenador = await getCoordenadorCompletoById(coordenadorId);
    
    // 3. RENDERIZAR A PÁGINA
    if (coordenador) {
        renderDetalhesCoordenador(coordenador, loggedUser);
    } else {
        document.getElementById('page-content').innerHTML = '<p class="text-center">Coordenador não encontrado.</p>';
    }
});

/**
 * Constrói e renderiza o conteúdo da página de detalhes do coordenador.
 * @param {Object} coordenador - O objeto do coordenador com dados completos.
 * @param {Object} loggedUser - O objeto do usuário logado.
 */
function renderDetalhesCoordenador(coordenador, loggedUser) {
    const container = document.getElementById('page-content');

    const editarBtn = loggedUser.role === 'secretario' 
        ? `<a href="editar_coordenador.html?id=${coordenador.id}" class="btn btn-outline-primary"><i class="bi bi-pencil me-2"></i>Editar</a>`
        : '';

    // Prepara o bloco de "Informações do Cargo" dinamicamente
    let infoCargoHTML = '';
    if (coordenador.role === 'coordenador_programa') {
        infoCargoHTML = `
            <div class="col-md-12 mb-3">
                <strong>Programa que Coordena:</strong><br> ${coordenador.descricao || 'Não informado'}
            </div>
        `;
    } else if (coordenador.role === 'coordenador_geral') {
        infoCargoHTML = `
            <div class="col-md-12 mb-3">
                <strong>Título / Cargo:</strong><br> ${coordenador.titulo || 'Não informado'}
            </div>
        `;
    }

    // Monta o HTML da página com os dados combinados
    container.innerHTML = `
        <div class="page-header d-flex justify-content-between align-items-center mb-4">
            <div class="d-flex align-items-center">
                <a href="secret-coordenadores.html" class="btn btn-light me-3" title="Voltar para a lista"><i class="bi bi-arrow-left fs-4"></i></a>
            </div>
            ${editarBtn}
        </div>

        <div class="bg-white p-4 p-md-5 rounded shadow-sm">
            <h2 class="mb-1">${coordenador.nomeCompleto}</h2>
            <p class="text-muted">Coordenador(a)</p>
            <hr class="my-4">
            
            <h5 class="mb-3 fw-light">Dados Pessoais</h5>
            <div class="row">
                <div class="col-md-4 mb-3"><strong>CPF:</strong><br> ${coordenador.cpf}</div>
                <div class="col-md-4 mb-3"><strong>Telefone:</strong><br> ${coordenador.telefone}</div>
                <div class="col-md-12 mb-3"><strong>Email:</strong><br> ${coordenador.email}</div>
            </div>

            <h5 class="mt-4 mb-3 fw-light">Informações do Cargo</h5>
            <div class="row">
                ${infoCargoHTML}
            </div>
        </div>
    `;
}