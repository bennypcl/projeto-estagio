document.addEventListener('DOMContentLoaded', async () => {
    // 1. NOVO BLOCO DE AUTENTICAÇÃO E PERMISSÃO
    const loggedUser = getLoggedUser();
    if (!loggedUser || loggedUser.role !== 'secretario') {
        alert('Acesso negado. Apenas secretários podem cadastrar programas.');
        window.location.href = 'index.html';
        return;
    }
    renderHeader(); // Renderiza o cabeçalho global

    // 2. REFERÊNCIAS AOS ELEMENTOS DO FORMULÁRIO
    const form = document.getElementById('form-cadastro-programa');
    const coordenadorSelect = document.getElementById('coordenador');
    const setorSelect = document.getElementById('setor');
    const cancelBtn = document.getElementById('cancel-btn');

    // 3. POPULAR OS DROPDOWNS (COORDENADORES E SETORES)
    
    // Popula o dropdown de coordenadores
    const todosUsuarios = await fetchMockData('usuarios');
    if (todosUsuarios && todosUsuarios.usuarios) {
        const coordenadores = todosUsuarios.usuarios.filter(u => u.role === 'coordenador_programa');
        coordenadores.forEach(c => {
            const option = document.createElement('option');
            option.value = c.id;
            option.textContent = c.nomeCompleto;
            coordenadorSelect.appendChild(option);
        });
    }

    // Popula o dropdown de setores
    const dataSetores = await fetchMockData('setores');
    if (dataSetores && dataSetores.setores) {
        dataSetores.setores.forEach(s => {
            const option = document.createElement('option');
            option.value = s.id;
            option.textContent = s.nome;
            setorSelect.appendChild(option);
        });
    }

    // 4. LÓGICA PARA SALVAR O FORMULÁRIO
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Monta o objeto do novo programa com os campos corretos
        const novoPrograma = {
            id: `prog${Date.now()}`, // ID único
            codigo: document.getElementById('codigo').value,
            nome: document.getElementById('nome').value,
            coordenadorId: coordenadorSelect.value,
            setorId: setorSelect.value,
            duracao: document.getElementById('duracao').value
        };

        // Salva na nossa "API Falsa" (localStorage)
        // Assumindo que você tem a função savePrograma no api.js
        await savePrograma(novoPrograma);

        alert('Programa cadastrado com sucesso!');
        window.location.href = 'secret-programas.html';
    });

    // Botão Cancelar
    cancelBtn.addEventListener('click', () => {
        if (confirm('Tem certeza que deseja cancelar?')) {
            window.location.href = 'secret-programas.html';
        }
    });
});