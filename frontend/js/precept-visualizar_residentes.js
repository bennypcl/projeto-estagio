document.addEventListener('DOMContentLoaded', async () => {
    //Verificação de login e renderização do cabeçalho global
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) { window.location.href = 'login.html'; return; }
    renderHeader(currentUser);

    //Busca o ID do residente na URL
    const params = new URLSearchParams(window.location.search);
    const residenteId = params.get('id');
    if (!residenteId) {
        alert('ID do residente não encontrado!');
        window.location.href = 'residentes-preceptor.html'; // Volta para a lista
        return;
    }
    
    // Busca todos os residentes detalhados e encontra o residente específico
    const data = await fetchMockData('residentes-detalhes');
    const residente = data ? data.residentes.find(r => r.id === residenteId) : null;
    
    // Renderiza a página
    if (residente) {
        renderDetalhesResidentePreceptor(residente);
    } else {
        document.getElementById('page-content').innerHTML = '<p class="text-center">Residente não encontrado.</p>';
    }
});

function renderDetalhesResidentePreceptor(residente) {
    const container = document.getElementById('page-content');

    container.innerHTML = `
        <div class="page-header d-flex justify-content-between align-items-center mb-4">
            <div class="d-flex align-items-center">
                <a href="residentes-preceptor.html" class="btn btn-light me-3" title="Voltar para a lista"><i class="bi bi-arrow-left fs-4"></i></a>
            </div>
            </div>

        <div class="bg-white p-4 p-md-5 rounded shadow-sm">
            <h2 class="mb-1">${residente.nome}</h2>
            <p class="text-muted">Residente</p>
            <hr class="my-4">
            
            <h5 class="mb-3 fw-light">Dados Pessoais</h5>
            <div class="row">
                <div class="col-md-4 mb-3"><strong>CPF:</strong><br> ${residente.cpf}</div>
                <div class="col-md-4 mb-3"><strong>Matrícula:</strong><br> ${residente.matricula}</div>
                <div class="col-md-4 mb-3"><strong>Telefone:</strong><br> ${residente.telefone}</div>
                <div class="col-md-12 mb-3"><strong>Email:</strong><br> ${residente.email}</div>
            </div>

            <h5 class="mt-4 mb-3 fw-light">Dados Acadêmicos</h5>
            <div class="row">
                <div class="col-md-6 mb-3"><strong>Turma:</strong><br> ${residente.turmaCodigo}</div>
                <div class="col-md-6 mb-3"><strong>Preceptor Responsável:</strong><br> ${residente.preceptorNome}</div>
            </div>
        </div>
    `;
}