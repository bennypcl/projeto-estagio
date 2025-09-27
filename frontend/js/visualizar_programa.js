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
    const programaId = params.get('id');
    if (!programaId) {
        alert('ID do programa não encontrado!');
        window.location.href = 'secret-programas.html';
        return;
    }

    // Chama a nova função da API que já busca e combina todos os dados
    const programa = await getProgramaCompletoById(programaId);
    
    // 3. RENDERIZAR A PÁGINA
    if (programa) {
        renderDetalhesPrograma(programa, loggedUser.role);
    } else {
        document.getElementById('page-content').innerHTML = '<p class="text-center">Programa não encontrado.</p>';
    }
});

/**
 * Constrói e renderiza o conteúdo da página de detalhes do programa.
 * @param {Object} programa - O objeto do programa com dados completos.
 * @param {string} userRole - O perfil do usuário logado.
 */
function renderDetalhesPrograma(programa, userRole) {
    const container = document.getElementById('page-content');

    // Apenas o secretário pode ver o botão de editar
    const editarBtn = userRole === 'secretario' 
        ? `<a href="editar_programa.html?id=${programa.id}" class="btn btn-outline-primary"><i class="bi bi-pencil me-2"></i>Editar Programa</a>`
        : '';

    // Monta o HTML da página com os dados combinados
    container.innerHTML = `
        <div class="page-header d-flex justify-content-between align-items-center mb-4">
            <div class="d-flex align-items-center">
                <a href="secret-programas.html" class="btn btn-light me-3" title="Voltar para a lista"><i class="bi bi-arrow-left fs-4"></i></a>
            </div>
            ${editarBtn}
        </div>

        <div class="bg-white p-4 p-md-5 rounded shadow-sm">
            <h2 class="mb-1">${programa.nome}</h2>
            <p class="text-muted">Código: ${programa.codigo}</p>
            <hr class="my-4">

            <div class="row">
                <div class="col-md-6 mb-3">
                    <strong>Coordenador Responsável:</strong><br>
                    <span>${programa.coordenadorNome}</span>
                </div>
                <div class="col-md-6 mb-3">
                    <strong>Duração:</strong><br>
                    <span>${programa.duracao}</span>
                </div>
            </div>

            <h5 class="mt-4 mb-3 fw-light">Setor Principal de Atuação</h5>
            <div class="row">
                <div class="col-md-12">
                    <strong>Nome do Setor:</strong><br>
                    <span>${programa.setorNome}</span>
                </div>
                <div class="col-md-12 mt-2">
                    <strong>Endereço:</strong><br>
                    <span class="text-muted">${programa.setorEndereco}</span>
                </div>
            </div>
        </div>
    `;
}