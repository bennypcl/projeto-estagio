document.addEventListener('DOMContentLoaded', async () => {
    // AUTENTICAÇÃO E PERMISSÃO
    const loggedUser = getLoggedUser();
    if (!loggedUser || loggedUser.role !== 'secretario') {
        alert('Acesso negado.');
        window.location.href = 'index.html';
        return;
    }
    renderHeader();

    // REFERÊNCIAS AOS ELEMENTOS DO FORMULÁRIO
    const form = document.getElementById('form-cadastro-coordenador');
    const tipoSelect = document.getElementById('tipo-coordenador');
    const camposProg = document.getElementById('campos-coord-programa');
    const camposGeral = document.getElementById('campos-coord-geral');
    const cpfInput = document.getElementById('cpf');
    const telefoneInput = document.getElementById('telefone');
    const cpfError = document.getElementById('cpf-error');

    // LÓGICA DE MÁSCARAS E AUTO-PREENCHIMENTO
    cpfInput.addEventListener('input', () => {
        // Aplica a máscara de CPF chamando a função do utils.js
        cpfInput.value = maskCPF(cpfInput.value);
        // Limpa qualquer erro de validação anterior
        cpfError.textContent = '';
    });

    telefoneInput.addEventListener('input', () => {
        // Aplica a máscara de telefone
        telefoneInput.value = maskTelefone(telefoneInput.value);
    });

    // LÓGICA DO FORMULÁRIO DINÂMICO
    tipoSelect.addEventListener('change', () => {
        if (tipoSelect.value === 'programa') {
            camposProg.classList.remove('d-none');
            camposGeral.classList.add('d-none');
        } else if (tipoSelect.value === 'geral') {
            camposProg.classList.add('d-none');
            camposGeral.classList.remove('d-none');
        }
    });

    // Popula o dropdown de programas
    const programas = await getProgramas();
    if (programas) {
        const programaSelect = document.getElementById('programa');
        programas.forEach(p => {
            const option = document.createElement('option');
            option.value = p.id;
            option.textContent = p.nome;
            programaSelect.appendChild(option);
        });
    }

    // 5. LÓGICA DE SALVAMENTO CONDICIONAL
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        /*if (!validarCPF(cpfInput.value)) {
            cpfError.textContent = 'CPF inválido. Verifique o número digitado.';
            return;
        }*/

        const dadosComuns = {
            username: document.getElementById('username').value,
            password: document.getElementById('password').value,
            nomeCompleto: document.getElementById('nome').value,
            cpf: cpfInput.value,
            email: document.getElementById('email').value,
            telefone: document.getElementById('telefone').value,
        };

        if (tipoSelect.value === 'programa') {
            const dadosCompletos = { ...dadosComuns, programaId: document.getElementById('programa').value };
            await criarNovoCoordenadorPrograma(dadosCompletos);
        } else if (tipoSelect.value === 'geral') {
            const dadosCompletos = { ...dadosComuns, titulo: document.getElementById('titulo').value };
            await criarNovoCoordenadorGeral(dadosCompletos);
        } else {
            alert('Por favor, selecione um tipo de coordenador.');
            return;
        }

        alert('Coordenador cadastrado com sucesso!');
        window.location.href = 'secret-coordenadores.html';
    });
    
    // 6. LÓGICA DO BOTÃO CANCELAR
    document.getElementById('cancel-btn').addEventListener('click', () => {
        if (confirm('Tem certeza que deseja cancelar?')) {
            window.location.href = 'secret-coordenadores.html';
        }
    });
});