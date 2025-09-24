// =================================================================================
// FUNÇÃO INTERNA GENÉRICA (MOTOR DO NOSSO BANCO DE DADOS FALSO)
// =================================================================================

/**
 * (Função interna) Pega uma lista de itens do localStorage. Se não existir,
 * carrega do arquivo JSON correspondente e salva no localStorage.
 * @param {string} storeName - O nome da "tabela" (ex: 'usuarios', 'residentes').
 * @returns {Promise<Array>} - A lista de itens.
 */
async function _getStore(storeName) {
    const storeSalvo = localStorage.getItem(storeName);
    if (storeSalvo) {
        return JSON.parse(storeSalvo);
    }

    const url = `../mock-api/${storeName}.json`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Arquivo não encontrado: ${url}`);
        const data = await response.json();
        const items = data[storeName] || []; // Pega a lista de dentro do JSON
        localStorage.setItem(storeName, JSON.stringify(items));
        return items;
    } catch (error) {
        console.error(`Falha ao buscar a lista inicial de ${storeName}:`, error);
        return [];
    }
}

/**
 * (Função interna) Salva uma lista de itens de volta no localStorage.
 * @param {string} storeName - O nome da "tabela".
 * @param {Array} items - A lista de itens a ser salva.
 */
function _saveStore(storeName, items) {
    localStorage.setItem(storeName, JSON.stringify(items));
}


// =================================================================================
// SERVIÇOS DE API (CRUD PARA CADA ENTIDADE)
// =================================================================================

// --- SERVIÇO DE USUÁRIOS ---

async function getUsuarios() {
    return await _getStore('usuarios');
}

async function getUsuarioById(userId) {
    const usuarios = await getUsuarios();
    return usuarios.find(u => u.id === userId) || null;
}

/* ------------------------------------------------ */
// CRUD RESIDENTES

/** oficial
 * Busca um único residente pelo seu id com os dados já combinados.
 * @param {string} residenteId - O id do residente.
 * @returns {Promise<Object|null>} - Objeto do residente com todos os dados.
 */
async function getResidenteCompletoById(residenteId) {
    // Busca todos os dados necessários em paralelo para mais performance
    const [usuario, perfisResidentes, turmas, preceptoresCompletos] = await Promise.all([
        getUsuarioById(residenteId),
        _getStore('residentes'),
        _getStore('turmas'),
        getPreceptoresCompletos() // Reutiliza a função que já busca e combina os preceptores
    ]);

    // Valida se o usuário encontrado é de fato um residente
    if (!usuario || usuario.role !== 'residente') return null;

    const perfil = perfisResidentes.find(p => p.id === residenteId) || {};
    const turma = turmas.find(t => t.id === perfil.turmaId) || {};
    const preceptor = preceptoresCompletos.find(p => p.id === perfil.preceptorId) || {};

    // Retorna um objeto "enriquecido" com todas as informações
    return {
        ...usuario,
        ...perfil,
        turmaCodigo: turma.codigo || 'Não definida',
        preceptorNome: preceptor.nomeCompleto || 'Não definido'
    };
}

/** oficial
 * Busca a lista de residentes com os dados combinados de usuário e turma.
 * @returns {Promise<Array>} - Lista de residentes com todos os dados.
 */
async function getResidentesCompletos() {
    const [usuarios, perfisResidentes, turmas] = await Promise.all([
        _getStore('usuarios'),
        _getStore('residentes'),
        _getStore('turmas')
    ]);

    const usuariosResidentes = usuarios.filter(u => u.role === 'residente');

    // Combinação dos dados
    return usuariosResidentes.map(usuario => {
        const perfil = perfisResidentes.find(p => p.id === usuario.id) || {};
        const turma = turmas.find(t => t.id === perfil.turmaId) || {};
        
        return { 
            ...usuario, 
            ...perfil,
            turmaCodigo: turma.codigo || 'Sem Turma'
        };
    });
}

/** oficial
 * Deleta um residente de ambas as "tabelas" (usuarios e residentes).
 * @param {string} residenteId - O ID do residente a ser removido.
 */
async function deleteResidente(residenteId) {
    let usuarios = await _getStore('usuarios');
    let residentes = await _getStore('residentes');

    const novosUsuarios = usuarios.filter(u => u.id !== residenteId);
    const novosResidentes = residentes.filter(r => r.id !== residenteId);

    _saveStore('usuarios', novosUsuarios);
    _saveStore('residentes', novosResidentes);
}

/**
 * Cria um novo residente, salvando os dados nas duas "tabelas".
 * @param {Object} dadosResidente - Objeto com todos os dados (nome, cpf, matricula, etc).
 */
async function criarNovoResidente(dadosResidente) {
    const [usuarios, perfisResidentes] = await Promise.all([
        _getStore('usuarios'),
        _getStore('residentes')
    ]);

    const novoUsuario = {
        id: `user${Date.now()}`, // ID único
        username: dadosResidente.username,
        password: dadosResidente.password,
        nomeCompleto: dadosResidente.nomeCompleto,
        cpf: dadosResidente.cpf,
        email: dadosResidente.email,
        telefone: dadosResidente.telefone,
        role: 'residente'
    };

    const novoPerfilResidente = {
        id: novoUsuario.id, // O MESMO ID!
        matricula: dadosResidente.matricula,
        programaId: dadosResidente.programaId,
        preceptorId: dadosResidente.preceptorId
    };

    usuarios.push(novoUsuario);
    perfisResidentes.push(novoPerfilResidente);

    _saveStore('usuarios', usuarios);
    _saveStore('residentes', perfisResidentes);
}

/** oficial
 * Busca os dados do dashboard (módulos) da API do Django.
 * @returns {Promise<Object|null>}
 */
async function getDashboardData() {
    const url = `${API_BASE_URL}/dashboard-modules/`;
    const token = localStorage.getItem('accessToken');

    if (!token) {
        console.error("Token de acesso não encontrado.");
        return null;
    }

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Erro ao buscar módulos do dashboard.');
        
        return await response.json();
    } catch (error) {
        console.error("Falha ao buscar dados do dashboard:", error);
        logout(); // Se o token for inválido, desloga o usuário
        return null;
    }
}

// ... (O restante das funções de CRUD para residentes, preceptores, etc. pode vir aqui,
//      usando o padrão _getStore e _saveStore para consistência) ...

// Exemplo:
async function getUsuarios() {
    return await _getStore('usuarios');
}

async function getUsuarioById(userId) {
    const usuarios = await getUsuarios();
    return usuarios.find(u => u.id === userId) || null;
}

/* ------------------------------------------------ */
/* CRUD PROGRAMAS */

/** oficial
 * Busca a lista de programas da API do Django.
 * @returns {Promise<Array>}
 */
async function getProgramas() {
    try {
        const response = await fetch(`${API_BASE_URL}/programas/`);
        if (!response.ok) {
            throw new Error('Erro ao buscar programas da API.');
        }
        return await response.json();
    } catch (error) {
        console.error("Falha ao buscar programas:", error);
        return [];
    }
}

/**
 * Salva um novo programa na base de dados falsa.
 * @param {Object} novoPrograma - O objeto do programa a ser salvo.
 */
async function savePrograma(novoPrograma) {
    // Pega a lista de programas atual
    const programas = await _getStore('programas');
    // Adiciona o novo programa à lista
    programas.push(novoPrograma);
    // Salva a lista atualizada de volta no localStorage
    _saveStore('programas', programas);
}

/**
 * Deleta um programa da base de dados falsa.
 * @param {string} programaId - O ID do programa a ser removido.
 */
async function deletePrograma(programaId) {
    // Pega a lista de programas atual
    let programas = await _getStore('programas');
    // Cria uma nova lista com todos os programas, EXCETO aquele com o ID correspondente
    const novosProgramas = programas.filter(p => p.id !== programaId);
    // Salva a nova lista (sem o item removido) de volta no localStorage
    _saveStore('programas', novosProgramas);
}

/**
 * Atualiza um programa existente na base de dados falsa.
 * @param {Object} programaAtualizado - O objeto do programa com as informações atualizadas.
 */
async function updatePrograma(programaAtualizado) {
    let programas = await _getStore('programas');
    // Cria uma nova lista, substituindo o programa antigo pelo atualizado
    const novosProgramas = programas.map(p => {
        // Usa '==' pois o ID do objeto pode ser número e o do JSON string, ou vice-versa
        if (p.id == programaAtualizado.id) {
            return programaAtualizado; // Encontrou, então retorna o objeto atualizado
        }
        return p; // Se não for o que procuramos, retorna o objeto original
    });
    // Salva a lista de volta no localStorage
    _saveStore('programas', novosProgramas);
}

/**
 * Busca um único programa pelo seu ID com os dados JÁ COMBINADOS.
 * @param {string} programaId - O ID do programa.
 * @returns {Promise<Object|null>}
 */
async function getProgramaCompletoById(programaId) {
    // Busca todos os dados necessários em paralelo
    const [programas, todosUsuarios, dataSetores] = await Promise.all([
        _getStore('programas'),
        _getStore('usuarios'),
        fetchMockData('setores')
    ]);

    const programa = programas.find(p => p.id === programaId);
    if (!programa) return null;

    // Encontra o nome do coordenador
    const coordenador = todosUsuarios.find(u => u.id === programa.coordenadorId);
    // Encontra os detalhes do setor
    const setor = dataSetores.setores.find(s => s.id === programa.setorId);

    // Retorna um objeto "enriquecido" com todas as informações
    return {
        ...programa,
        coordenadorNome: coordenador ? coordenador.nomeCompleto : 'Não encontrado',
        setorNome: setor ? setor.nome : 'Não encontrado',
        setorEndereco: setor ? setor.endereco : 'Não encontrado'
    };
}

/* ------------------------------------------------ */
/* CRUD PRECEPTORES */

/**
 * Busca a lista de preceptores com os dados JÁ COMBINADOS com os de usuário.
 * @returns {Promise<Array>} - Lista de preceptores com todos os dados.
 */
async function getPreceptoresCompletos() {
    const [usuarios, perfisPreceptores] = await Promise.all([
        _getStore('usuarios'),
        _getStore('preceptores')
    ]);

    // Filtra apenas os usuários que são preceptores
    const usuariosPreceptores = usuarios.filter(u => u.role === 'preceptor');

    // Combina os dados de usuário com os dados do perfil de preceptor
    return usuariosPreceptores.map(usuario => {
        const perfil = perfisPreceptores.find(p => p.id === usuario.id) || {};
        return { ...usuario, ...perfil }; // Junta os dois objetos
    });
}

/**
 * Cria um novo preceptor, salvando os dados nas "tabelas" de usuários e preceptores.
 * @param {Object} dadosPreceptor - Objeto com todos os dados (nome, cpf, username, especialidade, etc).
 */
async function criarNovoPreceptor(dadosPreceptor) {
    // Busca as listas atuais de usuários e perfis de preceptores
    const [usuarios, perfisPreceptores] = await Promise.all([
        _getStore('usuarios'),
        _getStore('preceptores')
    ]);

    // 1. Cria o objeto para a "tabela" de usuários
    const novoUsuario = {
        id: `user${Date.now()}`, // ID único para o novo usuário
        username: dadosPreceptor.username,
        password: dadosPreceptor.password,
        nomeCompleto: dadosPreceptor.nomeCompleto,
        cpf: dadosPreceptor.cpf,
        email: dadosPreceptor.email,
        telefone: dadosPreceptor.telefone,
        role: 'preceptor' // Define o perfil
    };

    // 2. Cria o objeto para a "tabela" de especialização de preceptores
    const novoPerfilPreceptor = {
        id: novoUsuario.id, // O ID DEVE SER O MESMO para criar a ligação!
        especialidade: dadosPreceptor.especialidade,
        crm: dadosPreceptor.crm
    };

    // 3. Adiciona os novos registros às suas respectivas listas
    usuarios.push(novoUsuario);
    perfisPreceptores.push(novoPerfilPreceptor);

    // 4. Salva as listas atualizadas de volta no localStorage
    _saveStore('usuarios', usuarios);
    _saveStore('preceptores', perfisPreceptores);
}

/**
 * Busca a lista de preceptores com os dados JÁ COMBINADOS com os de usuário.
 * @returns {Promise<Array>} - Lista de preceptores com todos os dados.
 */
async function getPreceptoresCompletos() {
    const [usuarios, perfisPreceptores] = await Promise.all([
        _getStore('usuarios'),
        _getStore('preceptores')
    ]);

    // Filtra apenas os usuários que são preceptores
    const usuariosPreceptores = usuarios.filter(u => u.role === 'preceptor');

    // Combina os dados de usuário com os dados do perfil de preceptor
    return usuariosPreceptores.map(usuario => {
        const perfil = perfisPreceptores.find(p => p.id === usuario.id) || {};
        return { ...usuario, ...perfil }; // Junta os dois objetos
    });
}

/**
 * Deleta um preceptor de ambas as "tabelas" (usuarios e preceptores).
 * @param {string} preceptorId - O ID do preceptor a ser removido.
 */
async function deletePreceptor(preceptorId) {
    let usuarios = await _getStore('usuarios');
    let preceptores = await _getStore('preceptores');

    // Cria novas listas sem o preceptor com o ID correspondente
    const novosUsuarios = usuarios.filter(u => u.id !== preceptorId);
    const novosPreceptores = preceptores.filter(p => p.id !== preceptorId);

    // Salva as novas listas de volta no localStorage
    _saveStore('usuarios', novosUsuarios);
    _saveStore('preceptores', novosPreceptores);
}

/**
 * Busca um único preceptor pelo seu ID com os dados combinados.
 * @param {string} preceptorId - O ID do preceptor.
 * @returns {Promise<Object|null>}
 */
async function getPreceptorCompletoById(preceptorId) {
    const [usuario, perfisPreceptores] = await Promise.all([
        getUsuarioById(preceptorId),
        _getStore('preceptores')
    ]);

    if (!usuario || usuario.role !== 'preceptor') return null;

    const perfil = perfisPreceptores.find(p => p.id === preceptorId) || {};
    return { ...usuario, ...perfil };
}

/**
 * Atualiza um preceptor existente em ambas as "tabelas".
 * @param {Object} preceptorAtualizado - Objeto com todos os dados atualizados.
 */
async function updatePreceptor(preceptorAtualizado) {
    let usuarios = await _getStore('usuarios');
    let preceptores = await _getStore('preceptores');

    // Atualiza a lista de usuários
    const novosUsuarios = usuarios.map(u => {
        if (u.id === preceptorAtualizado.id) {
            // Retorna o usuário com os dados gerais atualizados
            return {
                ...u, // Mantém dados imutáveis como id, username, password, role
                nomeCompleto: preceptorAtualizado.nomeCompleto,
                cpf: preceptorAtualizado.cpf,
                email: preceptorAtualizado.email,
                telefone: preceptorAtualizado.telefone
            };
        }
        return u;
    });

    // Atualiza a lista de perfis de preceptores
    const novosPreceptores = preceptores.map(p => {
        if (p.id === preceptorAtualizado.id) {
            // Retorna o perfil com os dados específicos atualizados
            return {
                ...p, // Mantém o id
                especialidade: preceptorAtualizado.especialidade,
                crm: preceptorAtualizado.crm
            };
        }
        return p;
    });

    // Salva ambas as listas atualizadas de volta no localStorage
    _saveStore('usuarios', novosUsuarios);
    _saveStore('preceptores', novosPreceptores);
}

async function getPreceptoresCompletos() {
    const [usuarios, perfisPreceptores] = await Promise.all([_getStore('usuarios'), _getStore('preceptores')]);
    const usuariosPreceptores = usuarios.filter(u => u.role === 'preceptor');
    return usuariosPreceptores.map(usuario => {
        const perfil = perfisPreceptores.find(p => p.id === usuario.id) || {};
        return { ...usuario, ...perfil };
    });
}

/* ------------------------------------------------ */
/* CRUD TURMAS */

/**
 * Busca a lista de turmas com os dados JÁ COMBINADOS.
 * @returns {Promise<Array>} - Lista de turmas com nome do programa e contagem de residentes.
 */
async function getTurmasCompletas() {
    const [turmas, programas, residentes] = await Promise.all([
        _getStore('turmas'),
        _getStore('programas'),
        _getStore('residentes')
    ]);

    // Combina os dados
    return turmas.map(turma => {
        const programa = programas.find(p => p.id === turma.programaId) || {};
        const residentesNaTurma = residentes.filter(r => r.turmaId === turma.id);
        
        return {
            ...turma,
            programaNome: programa.nome || 'Programa não encontrado',
            residentesCount: residentesNaTurma.length // Contagem dinâmica!
        };
    });
}

/**
 * Deleta uma turma da base de dados falsa.
 * @param {string} turmaId - O ID da turma a ser removida.
 */
async function deleteTurma(turmaId) {
    let turmas = await _getStore('turmas');
    // Em um sistema real, você verificaria se a turma tem residentes antes de excluir
    const novasTurmas = turmas.filter(t => t.id !== turmaId);
    _saveStore('turmas', novasTurmas);
}

/**
 * Salva uma nova turma na base de dados falsa.
 * @param {Object} novaTurma - O objeto da turma a ser salvo.
 */
async function saveTurma(novaTurma) {
    // Pega a lista de turmas atual
    const turmas = await _getStore('turmas');
    // Adiciona a nova turma à lista
    turmas.push(novaTurma);
    // Salva a lista atualizada de volta no localStorage
    _saveStore('turmas', turmas);
}

/**
 * Busca uma única turma pelo seu ID.
 * @param {string} turmaId - O ID da turma.
 * @returns {Promise<Object|null>}
 */
async function getTurmaById(turmaId) {
    const turmas = await _getStore('turmas');
    return turmas.find(t => t.id === turmaId) || null;
}

/**
 * Busca a lista de turmas, priorizando o localStorage.
 * @returns {Promise<Array>}
 */
async function getTurmas() {
    return await _getStore('turmas');
}

/**
 * Atualiza uma turma existente na base de dados falsa.
 * @param {Object} turmaAtualizada - O objeto da turma com as informações atualizadas.
 */
async function updateTurma(turmaAtualizada) {
    let turmas = await _getStore('turmas');
    const novasTurmas = turmas.map(t => {
        if (t.id === turmaAtualizada.id) {
            return turmaAtualizada; // Encontrou, retorna o objeto atualizado
        }
        return t; // Se não for, retorna o objeto original
    });
    _saveStore('turmas', novasTurmas);
}

/**
 * Busca todos os residentes que pertencem a uma turma específica.
 * @param {string} turmaId - O ID da turma.
 * @returns {Promise<Array>} - Lista de residentes completos daquela turma.
 */
async function getResidentesPorTurma(turmaId) {
    const residentesCompletos = await getResidentesCompletos();
    return residentesCompletos.filter(r => r.turmaId === turmaId);
}

/**
 * Busca todos os residentes que não estão vinculados a nenhuma turma.
 * @returns {Promise<Array>} - Lista de residentes "disponíveis".
 */
async function getResidentesDisponiveis() {
    const residentesCompletos = await getResidentesCompletos();
    // Retorna residentes cujo turmaId é nulo, indefinido ou uma string vazia.
    return residentesCompletos.filter(r => !r.turmaId); 
}

/**
 * Vincula um residente a uma turma (adiciona).
 * @param {string} residenteId - O ID do residente.
 * @param {string} turmaId - O ID da turma à qual ele será vinculado.
 */
async function vincularResidenteATurma(residenteId, turmaId) {
    let perfisResidentes = await _getStore('residentes');
    const perfisAtualizados = perfisResidentes.map(perfil => {
        if (perfil.id === residenteId) {
            // Retorna uma nova versão do perfil com o turmaId atualizado
            return { ...perfil, turmaId: turmaId };
        }
        return perfil;
    });
    _saveStore('residentes', perfisAtualizados);
}

/**
 * Desvincula um residente de uma turma (remove).
 * @param {string} residenteId - O ID do residente a ser desvinculado.
 */
async function desvincularResidenteDeTurma(residenteId) {
    let perfisResidentes = await _getStore('residentes');
    const perfisAtualizados = perfisResidentes.map(perfil => {
        if (perfil.id === residenteId) {
            // Retorna uma nova versão do perfil com o turmaId nulo
            return { ...perfil, turmaId: null };
        }
        return perfil;
    });
    _saveStore('residentes', perfisAtualizados);
}

/**
 * Busca uma única turma pelo seu ID com os dados JÁ COMBINADOS.
 * @param {string} turmaId - O ID da turma.
 * @returns {Promise<Object|null>} - Objeto da turma com nome do programa e lista de residentes.
 */
async function getTurmaCompletaById(turmaId) {
    // Busca todos os dados necessários em paralelo
    const [turma, programas, todosResidentesCompletos] = await Promise.all([
        getTurmaById(turmaId), // Reutiliza a função que já tínhamos
        getProgramas(),
        getResidentesCompletos() // Reutiliza a função que já tínhamos
    ]);

    if (!turma) return null;

    // Encontra o nome do programa
    const programa = programas.find(p => p.id === turma.programaId);
    // Filtra para encontrar apenas os residentes desta turma
    const residentesDaTurma = todosResidentesCompletos.filter(r => r.turmaId === turmaId);

    // Retorna um objeto "enriquecido" com todas as informações
    return {
        ...turma,
        programaNome: programa ? programa.nome : 'Não encontrado',
        residentes: residentesDaTurma // Adiciona a lista de residentes
    };
}

/* ------------------------------------------------ */
/* CRUD RESIDENTES */

/**
 * Cria um novo residente, salvando os dados nas "tabelas" de usuários e residentes.
 * @param {Object} dadosResidente - Objeto com todos os dados.
 */
async function criarNovoResidente(dadosResidente) {
    const [usuarios, perfisResidentes] = await Promise.all([
        _getStore('usuarios'),
        _getStore('residentes')
    ]);

    // 1. Cria o objeto para a "tabela" de usuários
    const novoUsuario = {
        id: `user${Date.now()}`,
        username: dadosResidente.username,
        password: dadosResidente.password,
        nomeCompleto: dadosResidente.nomeCompleto,
        cpf: dadosResidente.cpf,
        email: dadosResidente.email,
        telefone: dadosResidente.telefone,
        role: 'residente'
    };

    // 2. Cria o objeto para a "tabela" de especialização de residentes
    const novoPerfilResidente = {
        id: novoUsuario.id, // O ID DEVE SER O MESMO!
        matricula: dadosResidente.matricula,
        turmaId: dadosResidente.turmaId, // Pode ser nulo ou vazio
        preceptorId: dadosResidente.preceptorId
    };

    // 3. Adiciona os novos registros
    usuarios.push(novoUsuario);
    perfisResidentes.push(novoPerfilResidente);

    // 4. Salva as listas atualizadas
    _saveStore('usuarios', usuarios);
    _saveStore('residentes', perfisResidentes);
}

/**
 * Atualiza um residente existente em ambas as "tabelas".
 * @param {Object} residenteAtualizado - Objeto com todos os dados atualizados.
 */
async function updateResidente(residenteAtualizado) {
    let usuarios = await _getStore('usuarios');
    let residentes = await _getStore('residentes');

    // Atualiza a lista de usuários
    const novosUsuarios = usuarios.map(u => {
        if (u.id === residenteAtualizado.id) {
            return {
                ...u,
                nomeCompleto: residenteAtualizado.nomeCompleto,
                cpf: residenteAtualizado.cpf,
                email: residenteAtualizado.email,
                telefone: residenteAtualizado.telefone
            };
        }
        return u;
    });

    // Atualiza a lista de perfis de residentes
    const novosResidentes = residentes.map(r => {
        if (r.id === residenteAtualizado.id) {
            return {
                ...r,
                matricula: residenteAtualizado.matricula,
                turmaId: residenteAtualizado.turmaId,
                preceptorId: residenteAtualizado.preceptorId
            };
        }
        return r;
    });

    // Salva ambas as listas atualizadas de volta no localStorage
    _saveStore('usuarios', novosUsuarios);
    _saveStore('residentes', novosResidentes);
}

/**
 * Busca um único residente pelo seu ID com os dados JÁ COMBINADOS.
 * @param {string} residenteId - O ID do residente.
 * @returns {Promise<Object|null>} - Objeto do residente com todos os dados.
 */
async function getResidenteCompletoById(residenteId) {
    // Busca todos os dados necessários em paralelo
    const [usuario, perfisResidentes, turmas, preceptoresCompletos] = await Promise.all([
        getUsuarioById(residenteId),
        _getStore('residentes'),
        _getStore('turmas'),
        getPreceptoresCompletos() // Reutiliza a função que já busca e combina os preceptores
    ]);

    if (!usuario || usuario.role !== 'residente') return null;

    const perfil = perfisResidentes.find(p => p.id === residenteId) || {};
    const turma = turmas.find(t => t.id === perfil.turmaId) || {};
    const preceptor = preceptoresCompletos.find(p => p.id === perfil.preceptorId) || {};

    // Retorna um objeto "enriquecido" com todas as informações
    return {
        ...usuario,
        ...perfil,
        turmaCodigo: turma.codigo || 'Não definida',
        preceptorNome: preceptor.nomeCompleto || 'Não definido'
    };
}

/* ------------------------------------------------ */
/* CRUD COORDENADORES */

/**
 * Busca a lista de TODOS os coordenadores com os dados JÁ COMBINADOS.
 * @returns {Promise<Array>} - Lista de coordenadores com todos os dados.
 */
async function getCoordenadoresCompletos() {
    // Busca todos os dados necessários em paralelo
    const [
        usuarios, 
        perfisProg, 
        perfisGeral, 
        programas
    ] = await Promise.all([
        _getStore('usuarios'),
        _getStore('coordenadores_programa'),
        _getStore('coordenadores_gerais'),
        _getStore('programas')
    ]);

    // Filtra apenas os usuários que são coordenadores
    const usuariosCoordenadores = usuarios.filter(
        u => u.role === 'coordenador_programa' || u.role === 'coordenador_geral'
    );

    // Combina os dados de cada coordenador com seu perfil específico
    return usuariosCoordenadores.map(usuario => {
        let perfil = {};
        let infoExtra = {};
        if (usuario.role === 'coordenador_programa') {
            perfil = perfisProg.find(p => p.id === usuario.id) || {};
            const programa = programas.find(prog => prog.id === perfil.programaId) || {};
            infoExtra.descricao = `Coordenador(a) do Programa: ${programa.nome || 'Não definido'}`;
        } else if (usuario.role === 'coordenador_geral') {
            perfil = perfisGeral.find(p => p.id === usuario.id) || {};
            infoExtra.descricao = perfil.titulo || 'Coordenador(a) Geral';
        }
        return { ...usuario, ...perfil, ...infoExtra }; // Junta tudo em um só objeto
    });
}

/**
 * Deleta um coordenador de ambas as "tabelas".
 * @param {string} coordenadorId - O ID do coordenador a ser removido.
 */
async function deleteCoordenador(coordenadorId) {
    let usuarios = await _getStore('usuarios');
    // Descobre o perfil do usuário para saber qual arquivo de perfil deletar
    const usuarioParaDeletar = usuarios.find(u => u.id === coordenadorId);
    if (!usuarioParaDeletar) return; // Se não achar o usuário, não faz nada

    // Deleta o usuário da lista principal
    const novosUsuarios = usuarios.filter(u => u.id !== coordenadorId);
    _saveStore('usuarios', novosUsuarios);

    // Deleta o perfil da lista específica
    if (usuarioParaDeletar.role === 'coordenador_programa') {
        let perfis = await _getStore('coordenadores_programa');
        const novosPerfis = perfis.filter(p => p.id !== coordenadorId);
        _saveStore('coordenadores_programa', novosPerfis);
    } else if (usuarioParaDeletar.role === 'coordenador_geral') {
        let perfis = await _getStore('coordenadores_gerais');
        const novosPerfis = perfis.filter(p => p.id !== coordenadorId);
        _saveStore('coordenadores_gerais', novosPerfis);
    }
}

/**
 * Cria um novo Coordenador de Programa.
 * @param {Object} dados - Objeto com todos os dados.
 */
async function criarNovoCoordenadorPrograma(dados) {
    const [usuarios, perfis] = await Promise.all([
        _getStore('usuarios'),
        _getStore('coordenadores_programa')
    ]);

    const novoUsuario = {
        id: `user${Date.now()}`,
        username: dados.username,
        password: dados.password,
        nomeCompleto: dados.nomeCompleto,
        cpf: dados.cpf,
        email: dados.email,
        telefone: dados.telefone,
        role: 'coordenador_programa'
    };

    const novoPerfil = {
        id: novoUsuario.id,
        programaId: dados.programaId
    };

    usuarios.push(novoUsuario);
    perfis.push(novoPerfil);
    _saveStore('usuarios', usuarios);
    _saveStore('coordenadores_programa', perfis);
}

/**
 * Cria um novo Coordenador Geral.
 * @param {Object} dados - Objeto com todos os dados.
 */
async function criarNovoCoordenadorGeral(dados) {
    const [usuarios, perfis] = await Promise.all([
        _getStore('usuarios'),
        _getStore('coordenadores_gerais')
    ]);

    const novoUsuario = {
        id: `user${Date.now()}`,
        username: dados.username,
        password: dados.password,
        nomeCompleto: dados.nomeCompleto,
        cpf: dados.cpf,
        email: dados.email,
        telefone: dados.telefone,
        role: 'coordenador_geral'
    };

    const novoPerfil = {
        id: novoUsuario.id,
        titulo: dados.titulo
    };

    usuarios.push(novoUsuario);
    perfis.push(novoPerfil);
    _saveStore('usuarios', usuarios);
    _saveStore('coordenadores_gerais', perfis);
}

/**
 * Busca um único coordenador pelo seu ID com os dados JÁ COMBINADOS.
 * @param {string} coordenadorId - O ID do coordenador.
 * @returns {Promise<Object|null>}
 */
async function getCoordenadorCompletoById(coordenadorId) {
    const usuario = await getUsuarioById(coordenadorId);
    if (!usuario || (usuario.role !== 'coordenador_programa' && usuario.role !== 'coordenador_geral')) {
        return null;
    }

    let perfil = {};
    if (usuario.role === 'coordenador_programa') {
        const perfisProg = await _getStore('coordenadores_programa');
        perfil = perfisProg.find(p => p.id === coordenadorId) || {};
    } else if (usuario.role === 'coordenador_geral') {
        const perfisGeral = await _getStore('coordenadores_gerais');
        perfil = perfisGeral.find(p => p.id === coordenadorId) || {};
    }

    return { ...usuario, ...perfil };
}

/**
 * Atualiza um coordenador existente em ambas as "tabelas".
 * @param {Object} coordAtualizado - Objeto com todos os dados atualizados.
 */
async function updateCoordenador(coordAtualizado) {
    let usuarios = await _getStore('usuarios');
    
    // Atualiza a lista de usuários
    const novosUsuarios = usuarios.map(u => {
        if (u.id === coordAtualizado.id) {
            return { ...u, nomeCompleto: coordAtualizado.nomeCompleto, cpf: coordAtualizado.cpf, email: coordAtualizado.email, telefone: coordAtualizado.telefone };
        }
        return u;
    });
    _saveStore('usuarios', novosUsuarios);

    // Atualiza o perfil específico
    if (coordAtualizado.role === 'coordenador_programa') {
        let perfis = await _getStore('coordenadores_programa');
        const novosPerfis = perfis.map(p => (p.id === coordAtualizado.id) ? { ...p, programaId: coordAtualizado.programaId } : p);
        _saveStore('coordenadores_programa', novosPerfis);
    } else if (coordAtualizado.role === 'coordenador_geral') {
        let perfis = await _getStore('coordenadores_gerais');
        const novosPerfis = perfis.map(p => (p.id === coordAtualizado.id) ? { ...p, titulo: coordAtualizado.titulo } : p);
        _saveStore('coordenadores_gerais', novosPerfis);
    }
}

/* ------------------------------------------------ */
/* PONTOS */

/**
 * Salva um novo registro de ponto na base de dados falsa.
 * @param {Object} novoPonto - O objeto de ponto a ser salvo.
 */
async function savePonto(novoPonto) {
    // Usamos 'historicoPontos' como o nome da nossa "tabela" no localStorage
    const historico = await _getStore('historicoPontos');
    historico.push(novoPonto);
    _saveStore('historicoPontos', historico);
}

/**
 * Busca todos os registros de ponto de um residente específico.
 * @param {string} residenteId - O ID do usuário residente.
 * @returns {Promise<Array>} - Lista de registros de ponto do residente.
 */
async function getHistoricoDoResidente(residenteId) {
    const historicoCompleto = await _getStore('historicoPontos');
    if (!residenteId) return []; // Retorna vazio se não houver ID
    return historicoCompleto.filter(ponto => ponto.residenteId === residenteId);
}

/* ------------------------------------------------ */
/* JORNADAS */

/**
 * Função principal para registrar uma batida de ponto ou atividade.
 * Ela encontra ou cria a jornada do dia e adiciona a nova atividade/ponto.
 * @param {Object} dadosBatida - Contém residenteId, tipoAtividade, hora, detalhe, etc.
 */
async function registrarPontoOuAtividade(dadosBatida) {
    const jornadas = await _getStore('jornadas');
    const hoje = new Date().toLocaleDateString('pt-BR');

    // Procura por uma jornada existente para este residente neste dia
    let jornadaDoDia = jornadas.find(j => j.data === hoje && j.residenteId === dadosBatida.residenteId);

    // Se não houver jornada para o dia, cria uma nova
    if (!jornadaDoDia) {
        jornadaDoDia = {
            id: `jornada${Date.now()}`,
            residenteId: dadosBatida.residenteId,
            data: hoje,
            status: 'pendente',
            justificativaGeral: dadosBatida.justificativaGeral || '',
            atividades: [],
            validadorId: null,
            dataValidacao: null,
            observacaoValidador: ''
        };
        jornadas.push(jornadaDoDia);
    }

    // Adiciona ou atualiza a atividade dentro da jornada
    let atividadeExistente = jornadaDoDia.atividades.find(a => a.tipo === dadosBatida.tipoAtividade);

    if (dadosBatida.tipoAtividade === 'normal') {
        if (!atividadeExistente) {
            atividadeExistente = { tipo: 'normal', pontos: [] };
            jornadaDoDia.atividades.push(atividadeExistente);
        }
        atividadeExistente.pontos.push({ hora: dadosBatida.hora, tipo: dadosBatida.tipoPonto });
    } else {
        // Para atividades de dia inteiro como Aula, Atestado, etc.
        if (!atividadeExistente) {
            atividadeExistente = { tipo: dadosBatida.tipoAtividade, detalhe: dadosBatida.detalhe };
            jornadaDoDia.atividades.push(atividadeExistente);
        } else {
            // Se já existir, talvez atualize o detalhe (ex: adiciona "Tarde" se "Manhã" já estava)
            atividadeExistente.detalhe = dadosBatida.detalhe;
        }
    }

    // Salva a lista de jornadas atualizada de volta no localStorage
    _saveStore('jornadas', jornadas);
}

/**
 * Busca todas as jornadas de trabalho de um residente específico.
 * @param {string} residenteId - O ID do usuário residente.
 * @returns {Promise<Array>} - Lista de jornadas do residente.
 */
async function getJornadasDoResidente(residenteId) {
    const todasJornadas = await _getStore('jornadas');
    if (!residenteId) return [];
    return todasJornadas.filter(jornada => jornada.residenteId === residenteId);
}

/* PRECEPTORES - Tela de meus residentes */

/**
 * Busca a lista de residentes completos que são supervisionados por um preceptor específico.
 * @param {string} preceptorId - O ID do preceptor.
 * @returns {Promise<Array>} - Lista de residentes completos do preceptor.
 */
async function getResidentesPorPreceptor(preceptorId) {
    // Reutiliza a função que já busca todos os residentes com dados completos
    const todosResidentes = await getResidentesCompletos();
    
    // Filtra a lista para manter apenas os residentes com o preceptorId correspondente
    return todosResidentes.filter(residente => residente.preceptorId === preceptorId);
}

/* PRECEPTORES - Tela de pendências */

/**
 * Busca todas as jornadas pendentes dos residentes de um preceptor específico.
 * @param {string} preceptorId - O ID do preceptor logado.
 * @returns {Promise<Array>} - Lista de jornadas pendentes com dados combinados.
 */
async function getPendenciasPorPreceptor(preceptorId) {
    // Busca todos os dados necessários em paralelo
    const [todasJornadas, todosResidentes, todosUsuarios] = await Promise.all([
        _getStore('jornadas'),
        _getStore('residentes'),
        _getStore('usuarios')
    ]);

    // 1. Encontra os IDs dos residentes deste preceptor
    const idsDosMeusResidentes = todosResidentes
        .filter(r => r.preceptorId === preceptorId)
        .map(r => r.id);

    // 2. Filtra as jornadas para encontrar apenas as que são:
    //    - Pendentes
    //    - Pertencentes a um dos residentes do preceptor
    const pendencias = todasJornadas.filter(jornada => 
        jornada.status === 'pendente' && idsDosMeusResidentes.includes(jornada.residenteId)
    );

    // 3. "Enriquece" cada pendência com o nome do residente
    return pendencias.map(jornada => {
        const residenteInfo = todosUsuarios.find(u => u.id === jornada.residenteId);
        return {
            ...jornada,
            residenteNome: residenteInfo ? residenteInfo.nomeCompleto : 'Residente desconhecido'
        };
    });
}

/**
 * Atualiza o status de uma jornada de trabalho.
 * @param {string} jornadaId - O ID da jornada a ser atualizada.
 * @param {string} novoStatus - O novo status ('aprovado', 'reprovado', 'justificado').
 * @param {string} validadorId - O ID do preceptor que está validando.
 * @param {string} [observacao=''] - Uma observação opcional do preceptor.
 */
async function atualizarStatusJornada(jornadaId, novoStatus, validadorId, observacao = '') {
    let jornadas = await _getStore('jornadas');

    const jornadasAtualizadas = jornadas.map(jornada => {
        if (jornada.id === jornadaId) {
            return {
                ...jornada,
                status: novoStatus,
                validadorId: validadorId,
                dataValidacao: new Date().toLocaleString('pt-BR'),
                observacaoValidador: observacao
            };
        }
        return jornada;
    });

    _saveStore('jornadas', jornadasAtualizadas);
}

/**
 * Busca todas as jornadas já validadas (aprovadas, reprovadas, etc.) 
 * dos residentes de um preceptor específico.
 * @param {string} preceptorId - O ID do preceptor logado.
 * @returns {Promise<Array>} - Lista de jornadas com dados combinados.
 */
async function getAtividadesRealizadasPorPreceptor(preceptorId) {
    // Busca todos os dados necessários em paralelo
    const [todasJornadas, todosResidentes, todosUsuarios] = await Promise.all([
        _getStore('jornadas'),
        _getStore('residentes'),
        _getStore('usuarios')
    ]);

    // 1. Encontra os IDs dos residentes deste preceptor
    const idsDosMeusResidentes = todosResidentes
        .filter(r => r.preceptorId === preceptorId)
        .map(r => r.id);

    // 2. Filtra as jornadas para encontrar apenas as que:
    //    - NÃO estão pendentes
    //    - Pertencem a um dos residentes do preceptor
    const atividadesRealizadas = todasJornadas.filter(jornada => 
        jornada.status !== 'pendente' && idsDosMeusResidentes.includes(jornada.residenteId)
    );

    // 3. "Enriquece" cada atividade com o nome do residente
    return atividadesRealizadas.map(jornada => {
        const residenteInfo = todosUsuarios.find(u => u.id === jornada.residenteId);
        return {
            ...jornada,
            residenteNome: residenteInfo ? residenteInfo.nomeCompleto : 'Residente desconhecido'
        };
    });
}

/**
 * Cria uma notificação para o residente e atualiza o status da jornada.
 * @param {string} jornadaId - O ID da jornada que precisa de correção.
 * @param {string} preceptorId - O ID do preceptor que está solicitando.
 * @param {string} [observacao=''] - Uma observação opcional do preceptor.
 */
async function solicitarCorrecaoPonto(jornadaId, preceptorId, observacao = 'Correção solicitada pelo preceptor.') {
    // 1. Atualiza o status da jornada para 'justificado'
    await atualizarStatusJornada(jornadaId, 'justificado', preceptorId, observacao);

    // 2. Busca os dados da jornada para criar a mensagem da notificação
    const jornadas = await _getStore('jornadas');
    const jornadaCorrigir = jornadas.find(j => j.id === jornadaId);
    if (!jornadaCorrigir) return;

    // 3. Cria a nova notificação
    const notificacoes = await _getStore('notificacoes');
    const novaNotificacao = {
        id: `notif${Date.now()}`,
        residenteId: jornadaCorrigir.residenteId,
        tipo: 'correcao_ponto',
        jornadaId: jornadaId,
        mensagem: `Correção solicitada para a jornada do dia ${jornadaCorrigir.data}. Motivo: ${observacao}`,
        status: 'nao_lida'
    };
    notificacoes.push(novaNotificacao);
    _saveStore('notificacoes', notificacoes);
}

/* RESIDENTES - Notificações */

/**
 * Busca todas as notificações de um residente específico.
 * @param {string} residenteId - O ID do usuário residente.
 * @returns {Promise<Array>} - Lista de notificações do residente.
 */
async function getNotificacoesDoResidente(residenteId) {
    const todasNotificacoes = await _getStore('notificacoes');
    if (!residenteId) return [];
    return todasNotificacoes.filter(n => n.residenteId === residenteId);
}

/**
 * Atualiza o status de uma notificação (ex: para 'lida').
 * @param {string} notificacaoId - O ID da notificação a ser atualizada.
 * @param {string} novoStatus - O novo status.
 */
async function updateStatusNotificacao(notificacaoId, novoStatus) {
    let notificacoes = await _getStore('notificacoes');
    const notificacoesAtualizadas = notificacoes.map(n => {
        if (n.id === notificacaoId) {
            return { ...n, status: novoStatus };
        }
        return n;
    });
    _saveStore('notificacoes', notificacoesAtualizadas);
}

/* Ponto Retroativo */

/**
 * Busca jornada pelo seu ID.
 * @param {string} jornadaId - O ID da jornada.
 * @returns {Promise<Object|null>}
 */
async function getJornadaById(jornadaId) {
    const jornadas = await _getStore('jornadas');
    return jornadas.find(j => j.id === jornadaId) || null;
}

/**
 * Atualiza uma jornada existente na base de dados falsa.
 * @param {Object} jornadaAtualizada - O objeto da jornada com as informações atualizadas.
 */
async function updateJornada(jornadaAtualizada) {
    let jornadas = await _getStore('jornadas');
    const jornadasNovas = jornadas.map(j => {
        if (j.id === jornadaAtualizada.id) {
            return jornadaAtualizada; // Encontrou, retorna o objeto atualizado
        }
        return j; // Se não for, retorna o objeto original
    });
    _saveStore('jornadas', jornadasNovas);
}

/* PRECEPTORES - Avaliação */

/**
 * Busca as instâncias de avaliação de um preceptor, já combinadas com o nome do residente.
 * @param {string} preceptorId - O ID do preceptor logado.
 * @returns {Promise<Array>}
 */
async function getAvaliacoesPorPreceptor(preceptorId) {
    const [avaliacoes, usuarios] = await Promise.all([
        _getStore('avaliacoes'),
        _getStore('usuarios')
    ]);

    const minhasAvaliacoes = avaliacoes.filter(a => a.preceptorId === preceptorId);

    // "Enriquece" cada avaliação com o nome do residente
    return minhasAvaliacoes.map(avaliacao => {
        const residenteInfo = usuarios.find(u => u.id === avaliacao.residenteId);
        return {
            ...avaliacao,
            residenteNome: residenteInfo ? residenteInfo.nomeCompleto : 'Desconhecido'
        };
    });
}

/**
 * Busca uma instância de avaliação com todos os dados relacionados (residente e gabarito do formulário).
 * @param {string} avaliacaoId - O ID da instância de avaliação.
 * @returns {Promise<Object|null>} - Objeto da avaliação com todos os dados combinados.
 */
async function getAvaliacaoCompletaById(avaliacaoId) {
    const [avaliacoes, formularios, usuarios] = await Promise.all([
        _getStore('avaliacoes'),
        _getStore('formularios_avaliacao'), // Busca os gabaritos
        _getStore('usuarios')
    ]);

    const avaliacao = avaliacoes.find(a => a.id === avaliacaoId);
    if (!avaliacao) return null;

    // Encontra o gabarito do formulário correspondente
    const formularioGabarito = formularios.find(f => f.id === avaliacao.formularioId);
    // Encontra as informações do residente
    const residenteInfo = usuarios.find(u => u.id === avaliacao.residenteId);

    // Retorna um objeto "enriquecido" com tudo
    return {
        ...avaliacao,
        residenteNome: residenteInfo ? residenteInfo.nomeCompleto : 'Desconhecido',
        formulario: formularioGabarito // Anexa o gabarito inteiro
    };
}