document.addEventListener('DOMContentLoaded', async () => {
    // AUTENTICAÇÃO E RENDERIZAÇÃO DO CABEÇALHO
    const loggedUser = getLoggedUser();
    if (!loggedUser) {
        window.location.href = 'login.html';
        return;
    }
    renderHeader();

    // BUSCAR DE DADOS
    const params = new URLSearchParams(window.location.search);
    const residenteId = params.get('id');
    const fromPage = params.get('from'); // Pega a página de origem para o botão "Voltar"
    if (!residenteId) {
        alert('ID do residente não encontrado!');
        window.location.href = 'residentes.html';
        return;
    }

    // Chamada da função do api.js que já busca e combina todos os dados
    const residente = await getResidenteCompletoById(residenteId);
    
    // RENDERIZÇÃO DA PÁGINA
    if (residente) {
        renderDetalhesResidente(residente, loggedUser, fromPage);
    } else {
        document.getElementById('page-content').innerHTML = '<p class="text-center">Residente não encontrado.</p>';
    }
});

/**
 * Construção e renderização do conteúdo da página de detalhes do residente.
 * @param {Object} residente - O objeto do residente com dados completos.
 * @param {Object} loggedUser - O objeto do usuário logado.
 * @param {string} fromPage - A página de onde o usuário veio.
 */
function renderDetalhesResidente(residente, loggedUser, fromPage) {
    const container = document.getElementById('page-content');
    
    const backUrl = fromPage ? `${fromPage}.html` : 'residentes.html'; // Define o link de "Voltar"

    const editarBtn = loggedUser.role === 'secretario' 
        ? `<a href="editar_residente.html?id=${residente.id}" class="btn btn-outline-primary"><i class="bi bi-pencil me-2"></i>Editar</a>`
        : '';

    // Monta o HTML da página com os dados combinados
    container.innerHTML = `
        <div class="page-header d-flex justify-content-between align-items-center mb-4">
            <div class="d-flex align-items-center">
                <a href="${backUrl}" class="btn btn-light me-3" title="Voltar"><i class="bi bi-arrow-left fs-4"></i></a>
            </div>
            ${editarBtn}
        </div>

        <div class="bg-white p-4 p-md-5 rounded shadow-sm">
            <h2 class="mb-1">${residente.nomeCompleto}</h2>
            <p class="text-muted">Residente</p>
            <hr class="my-4">
            
            <h5 class="mb-3 fw-light">Dados Pessoais</h5>
            <div class="row">
                <div class="col-md-4 mb-3"><strong>CPF:</strong><br> ${residente.cpf}</div>
                <div class="col-md-4 mb-3"><strong>Telefone:</strong><br> ${residente.telefone}</div>
                <div class="col-md-12 mb-3"><strong>Email:</strong><br> ${residente.email}</div>
            </div>

            <h5 class="mt-4 mb-3 fw-light">Dados Acadêmicos</h5>
            <div class="row">
                <div class="col-md-4 mb-3"><strong>Matrícula:</strong><br> ${residente.matricula}</div>
                <div class="col-md-4 mb-3"><strong>Turma:</strong><br> ${residente.turmaCodigo}</div>
                <div class="col-md-4 mb-3"><strong>Preceptor Responsável:</strong><br> ${residente.preceptorNome}</div>
            </div>
        </div>
    `;
}