/**
 * Aplica a máscara de CPF (000.000.000-00) a um valor.
 * @param {string} value - O valor a ser formatado.
 * @returns {string} - O valor com a máscara.
 */
function maskCPF(value) {
    return value
        .replace(/\D/g, '') // Remove tudo o que não é dígito
        .replace(/(\d{3})(\d)/, '$1.$2') // Coloca um ponto entre o terceiro e o quarto dígitos
        .replace(/(\d{3})(\d)/, '$1.$2') 
        .replace(/(\d{3})(\d{1,2})/, '$1-$2') // Coloca o hífen
        .slice(0, 14); // Limita o tamanho
}

/**
 * Aplica a máscara de Telefone ((00) 00000-0000) a um valor.
 * @param {string} value - O valor a ser formatado.
 * @returns {string} - O valor com a máscara.
 */
function maskTelefone(value) {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '($1) $2') // Coloca parênteses em volta dos dois primeiros dígitos
        .replace(/(\d{5})(\d)/, '$1-$2') // Colocado o hífen depois do quinto dígito
        .slice(0, 15);
}

/**
 * Valida um CPF pelo algoritmo oficial.
 * @param {string} cpf - O CPF (pode estar com ou sem máscara).
 * @returns {boolean} - True se o CPF for válido, false caso contrário.
 */
function validarCPF(cpf) {
    const cpfLimpo = cpf.replace(/\D/g, ''); // Remove a máscara
    if (cpfLimpo.length !== 11 || /^(\d)\1{10}$/.test(cpfLimpo)) {
        return false; // Verifica se tem 11 dígitos e se não são todos iguais
    }

    let soma = 0;
    let resto;

    // Validação do primeiro dígito verificador
    for (let i = 1; i <= 9; i++) {
        soma += parseInt(cpfLimpo.substring(i - 1, i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpfLimpo.substring(9, 10))) return false;

    soma = 0;
    // Validação do segundo dígito verificador
    for (let i = 1; i <= 10; i++) {
        soma += parseInt(cpfLimpo.substring(i - 1, i)) * (12 - i);
    }
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpfLimpo.substring(10, 11))) return false;

    return true;
}