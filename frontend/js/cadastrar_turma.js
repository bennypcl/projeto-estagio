document.addEventListener('DOMContentLoaded', async () => {
    // 1. AUTENTICAÇÃO E PERMISSÃO
    const loggedUser = getLoggedUser();
    if (!loggedUser || loggedUser.role !== 'secretario') {
        alert('Acesso negado. Apenas secretários podem cadastrar turmas.');
        window.location.href = 'index.html';
        return;
    }
    renderHeader();

    // 2. REFERÊNCIAS E POPULAR O DROPDOWN DE PROGRAMAS
    const programaSelect = document.getElementById('programa');
    const anoInput = document.getElementById('ano');
    const codigoInput = document.getElementById('codigo');

    // Busca os programas usando nossa função da API que lê do localStorage
    const programas = await getProgramas();
    if (programas && programas.length > 0) {
        programaSelect.innerHTML = '<option value="" selected disabled>Selecione um programa</option>';
        programas.forEach(programa => {
            const option = document.createElement('option');
            option.value = programa.id;
            option.textContent = programa.nome;
            // Guarda o código do programa no próprio option para usar na geração automática
            option.dataset.codigo = programa.nome.substring(0, 3).toUpperCase(); // Pega as 3 primeiras letras
            programaSelect.appendChild(option);
        });
    } else {
        programaSelect.innerHTML = '<option value="" disabled>Nenhum programa encontrado</option>';
    }

    // 3. LÓGICA PARA GERAR O CÓDIGO DA TURMA AUTOMATICAMENTE
    const atualizarCodigoTurma = () => {
        const programaSelecionado = programaSelect.options[programaSelect.selectedIndex];
        const programaCodigo = programaSelecionado.dataset.codigo;
        const ano = anoInput.value;

        if (programaCodigo && ano) {
            codigoInput.value = `${programaCodigo}_${ano}`;
        } else {
            codigoInput.value = '';
        }
    };
    programaSelect.addEventListener('change', atualizarCodigoTurma);
    anoInput.addEventListener('input', atualizarCodigoTurma);
    
    // 4. LÓGICA PARA SALVAR O FORMULÁRIO
    const form = document.getElementById('form-cadastro-turma');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Monta o objeto da nova turma no formato correto
        const novaTurma = {
            id: `turma${Date.now()}`, // ID único
            codigo: codigoInput.value,
            programaId: programaSelect.value
        };
        
        await saveTurma(novaTurma);
        alert('Turma cadastrada com sucesso!');
        window.location.href = 'secret-turmas.html';
    });

    // 5. LÓGICA DO BOTÃO CANCELAR
    document.getElementById('cancel-btn').addEventListener('click', () => {
        if (confirm('Tem certeza que deseja cancelar?')) {
            window.location.href = 'secret-turmas.html';
        }
    });
});