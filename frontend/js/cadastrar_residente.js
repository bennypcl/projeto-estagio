document.addEventListener('DOMContentLoaded', async () => {
    // AUTENTICAÇÃO E PERMISSÃO
    const loggedUser = getLoggedUser();
    if (!loggedUser || loggedUser.role !== 'secretario') {
        alert('Acesso negado.');
        window.location.href = 'index.html';
        return;
    }
    renderHeader();

    // REFERÊNCIAS E MÁSCARAS
    const form = document.getElementById('form-cadastro-residente');
    const cpfInput = document.getElementById('cpf');
    const telefoneInput = document.getElementById('telefone');
    const cpfError = document.getElementById('cpf-error');
    const turmaSelect = document.getElementById('turma');
    const preceptorSelect = document.getElementById('preceptor');

    cpfInput.addEventListener('input', () => {
        cpfInput.value = maskCPF(cpfInput.value);
        cpfError.textContent = '';
    });
    telefoneInput.addEventListener('input', () => {
        telefoneInput.value = maskTelefone(telefoneInput.value);
    });

    // POPULAR DROPDOWNS (TURMAS E PRECEPTORES)
    const turmas = await getTurmas();
    if (turmas) {
        turmas.forEach(t => {
            const option = document.createElement('option');
            option.value = t.id;
            option.textContent = t.codigo;
            turmaSelect.appendChild(option);
        });
    }

    const preceptores = await getPreceptoresCompletos();
    if (preceptores) {
        preceptores.forEach(p => {
            const option = document.createElement('option');
            option.value = p.id;
            option.textContent = p.nomeCompleto;
            preceptorSelect.appendChild(option);
        });
    }

    // LÓGICA PARA SALVAR O FORMULÁRIO
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        /*if (!validarCPF(cpfInput.value)) {
            cpfError.textContent = 'CPF inválido.';
            return;
        }*/

        const dadosNovoResidente = {
            username: usernameInput.value,
            password: document.getElementById('password').value,
            nomeCompleto: document.getElementById('nome').value,
            cpf: cpfInput.value,
            email: document.getElementById('email').value,
            telefone: telefoneInput.value,
            matricula: document.getElementById('matricula').value,
            turmaId: turmaSelect.value, // Pode ser "" (string vazia) se "Nenhuma" for selecionado
            preceptorId: preceptorSelect.value
        };
        
        await criarNovoResidente(dadosNovoResidente);

        alert('Residente cadastrado com sucesso!');
        window.location.href = 'secret-residentes.html';
    });

    // LÓGICA DO BOTÃO CANCELAR
    document.getElementById('cancel-btn').addEventListener('click', () => {
        if(confirm('Deseja cancelar o cadastro?')) {
            window.location.href = 'secret-residentes.html';
        }
    });
});