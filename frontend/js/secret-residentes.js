document.addEventListener('DOMContentLoaded', async () => {
    // AUTENTICAÇÃO
    const loggedUser = getLoggedUser();
    if (!loggedUser) {
        window.location.href = 'login.html';
        return;
    }
    renderHeader();
    
    // Carrega o conteúdo da página
    await carregarResidentes();
});

async function carregarResidentes() {
    const loggedUser = getLoggedUser();
    // Chama a nova função do api.js que já junta todos os dados
    const residentes = await getResidentesCompletos(); 
    renderResidentesPage(residentes, loggedUser);
}

async function removerResidente(residenteId) {
    if (confirm('Tem certeza que deseja remover este residente?')) {
        await deleteResidente(residenteId);
        await carregarResidentes();
    }
}

function renderResidentesPage(residentes, loggedUser) {
    const container = document.getElementById('page-content');
    const isSecretario = loggedUser.role === 'secretario';
    const cadastrarButtonHTML = isSecretario ? `<a href="cadastrar_residente.html" class="btn btn-primary fw-bold">Cadastrar</a>` : '';

    let residentesHTML = '';
    if (residentes && residentes.length > 0) {
        residentes.forEach(residente => {
            const actionsHTML = isSecretario ? `
                <div class="list-item-actions">
                    <a href="editar_residente.html?id=${residente.id}" class="btn btn-sm" title="Editar"><i class="bi bi-pencil fs-5"></i></a>
                    <button class="btn btn-sm" onclick="removerResidente('${residente.id}')" title="Remover"><i class="bi bi-trash fs-5 text-danger"></i></button>
                </div>
            ` : '';

            residentesHTML += `
                <div class="list-item-wrapper">
                    <a href="visualizar_residente.html?id=${residente.id}&from=residentes" class="list-item-link">
                        <div class="list-item-content">
                            <h5 class="mb-1">${residente.nomeCompleto}</h5>
                            <small class="text-muted">Turma: ${residente.turmaCodigo}</small>
                        </div>
                    </a>
                    ${actionsHTML}
                </div>
            `;
        });
    } else {
        residentesHTML = '<p class="text-center">Nenhum residente cadastrado.</p>';
    }

    container.innerHTML = `
        <div class="page-header d-flex justify-content-between align-items-center mb-4">
            <div class="d-flex align-items-center">
                <a href="index.html" class="btn btn-light me-3" title="Voltar para o Início"><i class="bi bi-house-door fs-4"></i></a>
                <h2 class="mb-0">Residentes</h2>
            </div>
            ${cadastrarButtonHTML}
        </div>
        <div class="list-container">${residentesHTML}</div>
    `;
}