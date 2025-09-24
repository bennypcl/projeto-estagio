document.addEventListener('DOMContentLoaded', async () => {
    // AUTENTICAÇÃO E PERMISSÃO
    const loggedUser = getLoggedUser();
    if (!loggedUser || loggedUser.role !== 'secretario') {
        alert('Acesso negado. Apenas secretários podem cadastrar preceptores.');
        window.location.href = 'index.html';
        return;
    }
    renderHeader();

    // REFERÊNCIAS AOS ELEMENTOS E APLICAÇÃO DAS MÁSCARAS
    const form = document.getElementById('form-cadastro-preceptor');
    const cpfInput = document.getElementById('cpf');
    const telefoneInput = document.getElementById('telefone');
    const cpfError = document.getElementById('cpf-error');

    cpfInput.addEventListener('input', () => {
        // Chama a função maskCPF do utils.js
        cpfInput.value = maskCPF(cpfInput.value);

        // Limpa o erro de CPF ao digitar
        cpfError.textContent = ''; 
    });

    telefoneInput.addEventListener('input', () => {
        // Chama a função maskTelefone do utils.js
        telefoneInput.value = maskTelefone(telefoneInput.value);
    });

    // LÓGICA PARA SALVAR O FORMULÁRIO
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        // VALIDAÇÃO: Usa a função validarCPF do utils.js antes de salvar DESATIVADO PARA FACILITAR TESTES!!!!
        /*if (!validarCPF(cpfInput.value)) {
            cpfError.textContent = 'CPF inválido. Verifique o número digitado.';
            return; // Para a execução se o CPF for inválido
        }*/

        // Coleta todos os dados do formulário
        const dadosNovoPreceptor = {
            username: document.getElementById('username').value,
            password: document.getElementById('password').value,
            nomeCompleto: document.getElementById('nome').value,
            cpf: document.getElementById('cpf').value,
            email: document.getElementById('email').value,
            telefone: document.getElementById('telefone').value,
            matricula: document.getElementById('matricula').value,
            especialidade: document.getElementById('especialidade').value
        };
        
        // Chama a função da API para criar o usuário e o perfil
        await criarNovoPreceptor(dadosNovoPreceptor);

        alert('Preceptor cadastrado com sucesso!');
        window.location.href = 'secret-preceptores.html';
    });

    // 4. LÓGICA DO BOTÃO CANCELAR
    document.getElementById('cancel-btn').addEventListener('click', () => {
        if(confirm('Deseja cancelar o cadastro?')) {
            window.location.href = 'secret-preceptores.html';
        }
    });
});