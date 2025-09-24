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
    const preceptorId = params.get('id');
    if (!preceptorId) {
        alert('ID do preceptor não encontrado!');
        window.location.href = 'preceptores.html';
        return;
    }

    // Chama a função da API que já busca e combina os dados
    const preceptor = await getPreceptorCompletoById(preceptorId);
    
    // 3. RENDERIZAR A PÁGINA
    if (preceptor) {
        renderDetalhesPreceptor(preceptor, loggedUser.role);
    } else {
        document.getElementById('page-content').innerHTML = '<p class="text-center">Preceptor não encontrado.</p>';
    }
});

/**
 * Constrói e renderiza o conteúdo da página de detalhes do preceptor.
 * @param {Object} preceptor - O objeto do preceptor com dados completos.
 * @param {string} userRole - O perfil do usuário logado.
 */
function renderDetalhesPreceptor(preceptor, userRole) {
    const container = document.getElementById('page-content');

    // Verifica se o usuário logado é secretário para mostrar o botão de editar
    const editarBtn = userRole === 'secretario' 
        ? `<a href="editar_preceptor.html?id=${preceptor.id}" class="btn btn-outline-primary"><i class="bi bi-pencil me-2"></i>Editar</a>`
        : '';

    // Monta o HTML da página com os dados combinados
    container.innerHTML = `
        <div class="page-header d-flex justify-content-between align-items-center mb-4">
            <div class="d-flex align-items-center">
                <a href="secret-preceptores.html" class="btn btn-light me-3" title="Voltar para a lista"><i class="bi bi-arrow-left fs-4"></i></a>
            </div>
            ${editarBtn}
        </div>

        <div class="bg-white p-4 p-md-5 rounded shadow-sm">
            <h2 class="mb-1">${preceptor.nomeCompleto}</h2>
            <p class="text-muted">${preceptor.especialidade}</p>
            <hr class="my-4">
            
            <h5 class="mb-3 fw-light">Dados Pessoais</h5>
            <div class="row">
                <div class="col-md-4 mb-3"><strong>CPF:</strong><br> ${preceptor.cpf}</div>
                <div class="col-md-4 mb-3"><strong>Telefone:</strong><br> ${preceptor.telefone}</div>
                <div class="col-md-12 mb-3"><strong>Email:</strong><br> ${preceptor.email}</div>
            </div>

            <h5 class="mt-4 mb-3 fw-light">Informações Profissionais</h5>
            <div class="row">
                 <div class="col-md-6 mb-3"><strong>CRM:</strong><br> ${preceptor.crm}</div>
            </div>
        </div>
    `;
}