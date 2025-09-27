const API_BASE_URL = 'http://127.0.0.1:8000/api';

const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorMessage = document.getElementById('error-message');
        
        try {
            // Passo 1: Obter o token
            const tokenResponse = await fetch(`${API_BASE_URL}/token/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }) 
            });

            if (!tokenResponse.ok) throw new Error('Credenciais inválidas');

            const tokenData = await tokenResponse.json();
            localStorage.setItem('accessToken', tokenData.access);
            
            // Passo 2: Com o token, buscar os dados do usuário
            const userResponse = await fetch(`${API_BASE_URL}/usuarios/me/`, {
                headers: { 'Authorization': `Bearer ${tokenData.access}` }
            });
            
            if (!userResponse.ok) throw new Error('Não foi possível buscar dados do usuário.');

            const userData = await userResponse.json();
            // Salva o objeto do usuário logado
            localStorage.setItem('currentUser', JSON.stringify(userData));

            window.location.href = 'index.html';

        } catch (error) {
            errorMessage.textContent = error.message || 'CPF ou senha inválidos.';
        }
    });
}

function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser'); // Limpa também o usuário antigo
    window.location.href = 'login.html';
}

// A função getLoggedUser() ainda será útil, mas precisará ser aprimorada
// para buscar os dados do usuário da API usando o token.
// Por enquanto, a deixamos como está para não quebrar outras partes.
function getLoggedUser() {
    const userJSON = localStorage.getItem('currentUser');
    return userJSON ? JSON.parse(userJSON) : null;
}