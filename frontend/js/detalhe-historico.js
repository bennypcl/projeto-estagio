document.addEventListener('DOMContentLoaded', () => {
    // Inicialização e bloco de cabeçalho
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    const userInfoPlaceholder = document.getElementById('user-info-placeholder');
    if (userInfoPlaceholder) {
        userInfoPlaceholder.innerHTML = `
            <div class="user-info d-flex align-items-center p-2">
                <div class="icon rounded-circle d-flex justify-content-center align-items-center me-2">
                    <i class="bi bi-person-fill text-white"></i>
                </div>
                <span class="fw-bold">Usuário: ${currentUser}</span>
            </div>
        `;
    }
    const urlParams = new URLSearchParams(window.location.search);
    const dataSelecionada = urlParams.get('data');
    document.getElementById('detail-date').textContent = dataSelecionada;

    const detailsListContainer = document.getElementById('details-list');
    const todosRegistros = JSON.parse(localStorage.getItem('historicoPontos')) || [];
    const registrosDoDia = todosRegistros.filter(registro => registro.data === dataSelecionada);

    if (registrosDoDia.length === 0) {
        detailsListContainer.innerHTML = '<p class="text-center">Nenhum detalhe encontrado para esta data.</p>';
        return;
    }

    // --- FUNÇÕES HELPER ---

    /**
     * Converte uma string de hora "HH:MM" para o total de minutos desde a meia-noite.
     * @param {string} horaString - A hora no formato "HH:MM".
     * @returns {number} - O total de minutos.
     */
    function converterHoraParaMinutos(horaString) {
        if (!horaString) return 0;
        const [horas, minutos] = horaString.split(':').map(Number);
        return (horas * 60) + minutos;
    }

    /**
     * Calcula o total de horas líquidas trabalhadas em uma sessão.
     * @param {object} sessao - O objeto de sessão com entrada, saída e intervalos.
     * @returns {string} - O total de horas formatado (ex: "8h 15m").
     */
    function calcularTotalHoras(sessao) {
        if (!sessao.entrada || !sessao.saida) {
            return 'Cálculo pendente';
        }

        let minutosEntrada = converterHoraParaMinutos(sessao.entrada.hora);
        let minutosSaida = converterHoraParaMinutos(sessao.saida.hora);

        // Lida com turnos que atravessam a meia-noite
        if (minutosSaida < minutosEntrada) {
            minutosSaida += 24 * 60; // Adiciona 24 horas em minutos
        }

        let duracaoTotalBruta = minutosSaida - minutosEntrada;
        
        let duracaoTotalIntervalos = 0;
        sessao.intervalos.forEach(intervalo => {
            if (intervalo.inicio && intervalo.fim) {
                const minutosInicioIntervalo = converterHoraParaMinutos(intervalo.inicio.hora);
                const minutosFimIntervalo = converterHoraParaMinutos(intervalo.fim.hora);
                duracaoTotalIntervalos += (minutosFimIntervalo - minutosInicioIntervalo);
            }
        });

        const minutosTrabalhados = duracaoTotalBruta - duracaoTotalIntervalos;

        if (minutosTrabalhados < 0) return 'Erro no cálculo';

        const horas = Math.floor(minutosTrabalhados / 60);
        const minutos = minutosTrabalhados % 60;

        return `${horas}h ${minutos}m`;
    }
    
    // Lógica de processamento e renderização

    /**
     * Processa os registros de ponto para agrupar entradas, saídas e intervalos.
     * @param {Array} registros - A lista de registros de ponto (entrada, saida, intervalo).
     * @returns {Array} - Um array de objetos de sessão.
     */
    function processarSessoesDeTrabalho(registros) {
        const sessoes = [];
        let sessaoAtual = null;

        registros.forEach(registro => {
            if (registro.tipo === 'entrada') {
                if (sessaoAtual) sessoes.push(sessaoAtual);
                sessaoAtual = { entrada: registro, intervalos: [], saida: null };
            } else if (registro.tipo === 'inicio_intervalo' && sessaoAtual) {
                sessaoAtual.intervalos.push({ inicio: registro, fim: null });
            } else if (registro.tipo === 'fim_intervalo' && sessaoAtual) {
                const ultimoIntervalo = sessaoAtual.intervalos[sessaoAtual.intervalos.length - 1];
                if (ultimoIntervalo && !ultimoIntervalo.fim) {
                    ultimoIntervalo.fim = registro;
                }
            } else if (registro.tipo === 'saida' && sessaoAtual) {
                sessaoAtual.saida = registro;
                sessoes.push(sessaoAtual);
                sessaoAtual = null;
            }
        });
        
        if (sessaoAtual) sessoes.push(sessaoAtual);
        
        return sessoes;
    }

    /**
     * Renderiza um card para uma sessão de trabalho completa.
     * @param {object} sessao - O objeto da sessão de trabalho.
     */
    function renderizarSessao(sessao) {
        const totalHorasTrabalhadas = calcularTotalHoras(sessao);

        let intervalosHTML = '';
        if (sessao.intervalos.length > 0) {
            intervalosHTML += '<div class="session-intervals"><h6>Intervalos</h6>';
            sessao.intervalos.forEach(intervalo => {
                intervalosHTML += `
                    <div class="interval-item">
                        <span><i class="bi bi-cup-hot-fill"></i> Intervalo</span>
                        <span class="fw-bold">${intervalo.inicio.hora} - ${intervalo.fim ? intervalo.fim.hora : '...'}</span>
                    </div>
                `;
            });
            intervalosHTML += '</div>';
        }
        
        const card = document.createElement('div');
        card.className = 'session-card';
        card.innerHTML = `
            <div class="session-entry-exit">
                <div>
                    <h5 class="fw-normal mb-0">Entrada</h5>
                    <p class="text-muted small">${sessao.entrada.justificativa || ''}</p>
                </div>
                <span class="badge bg-dark text-white time-badge">${sessao.entrada.hora}</span>
            </div>
            ${intervalosHTML}
            <div class="session-entry-exit mt-3" style="border-bottom: none; padding-bottom: 0;">
                <div>
                    <h5 class="fw-normal mb-0">Saída</h5>
                    <p class="text-muted small">${sessao.saida ? sessao.saida.justificativa : ''}</p>
                </div>
                <span class="badge bg-dark text-white time-badge">${sessao.saida ? sessao.saida.hora : '--:--'}</span>
            </div>
            <div class="session-footer">
                <strong>Total Trabalhado:</strong> ${totalHorasTrabalhadas}
            </div>
        `;
        detailsListContainer.appendChild(card);
    }

    /**
     * Renderiza um card para registros que ocupam o dia todo (Aula, Atestado, etc.).
     * @param {object} registro - O objeto do registro.
     */
    function renderizarRegistroAvulso(registro) {
        const tipos = {
            'aula_teorica': { texto: 'Aula Teórica', bg: 'bg-primary' },
            'evento_autorizado': { texto: 'Evento Autorizado', bg: 'bg-primary' },
            'atestado': { texto: 'Atestado Médico', bg: 'bg-secondary' }
        };
        const tipoFormatado = tipos[registro.tipo] || { texto: registro.tipo, bg: 'bg-dark' };

        const card = document.createElement('div');
        card.className = 'detail-card';
        card.innerHTML = `
            <div class="detail-header">
                <h4 class="fw-normal">${tipoFormatado.texto}</h4>
                <span class="fs-5">${registro.detalhe}</span>
            </div>
            ${registro.justificativa ? `<div class="detail-body mt-2"><p><strong>Justificativa:</strong> ${registro.justificativa}</p></div>` : ''}
        `;
        detailsListContainer.appendChild(card);
    }

    // Lógica principal de execução
    detailsListContainer.innerHTML = '';
    
    const registrosDePonto = registrosDoDia.filter(r => ['entrada', 'saida', 'inicio_intervalo', 'fim_intervalo'].includes(r.tipo));
    const registrosAvulsos = registrosDoDia.filter(r => !registrosDePonto.includes(r));
    
    registrosAvulsos.forEach(renderizarRegistroAvulso);
    
    const sessoesProcessadas = processarSessoesDeTrabalho(registrosDePonto);
    sessoesProcessadas.forEach(renderizarSessao);
});