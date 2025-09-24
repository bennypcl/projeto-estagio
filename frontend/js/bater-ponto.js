document.addEventListener('DOMContentLoaded', async () => {
    // 1. AUTENTICAÇÃO E RENDERIZAÇÃO INICIAL
    const loggedUser = getLoggedUser();
    if (!loggedUser || loggedUser.role !== 'residente') {
        alert('Acesso negado.');
        window.location.href = 'index.html';
        return;
    }
    renderHeader();
    renderBaterPontoPage(loggedUser);
    
    // 2. BUSCA A JORNADA ATUAL PARA SABER O ESTADO DO DIA
    const jornadas = await getJornadasDoResidente(loggedUser.id);
    const hoje = new Date().toLocaleDateString('pt-BR');
    const jornadaAtual = jornadas.find(j => j.data === hoje);

    // 3. ANEXA OS EVENTOS E DEFINE O ESTADO INICIAL
    anexarEventListeners(loggedUser, jornadaAtual);
});

/**
 * Constrói e injeta o HTML principal da página de bater ponto.
 * @param {Object} loggedUser - O objeto do usuário logado.
 */
function renderBaterPontoPage(loggedUser) {
    const container = document.getElementById('page-content');
    if (!container) return;

    container.innerHTML = `
        <div class="page-header d-flex justify-content-between align-items-center mb-4">
            <div class="d-flex align-items-center">
                <a href="index.html" class="btn btn-light me-3" title="Voltar para o Início"><i class="bi bi-house-door fs-4"></i></a>
                <div>
                    <h2 class="mb-0">Bater Ponto</h2>
                    <div id="live-clock" class="live-clock-display"></div>
                </div>
            </div>
        </div>
        <div class="col-md-9 col-lg-8 mx-auto">
            <div class="card p-4 point-card">
                <div class="resident-info p-3 mb-4">
                    <h4 class="fw-bold mb-0">${loggedUser.nomeCompleto}</h4>
                    <p class="mb-0">${new Date().toLocaleDateString('pt-BR')}</p>
                </div>
                <div class="point-options mb-4">
                    <div class="form-check form-check-inline"><input class="form-check-input" type="radio" name="pointType" id="entradaSaida" value="entrada_saida" checked><label class="form-check-label" for="entradaSaida">Entrada/Saída</label></div>
                    <div class="form-check form-check-inline"><input class="form-check-input" type="radio" name="pointType" id="aulaTeorica" value="aula_teorica"><label class="form-check-label" for="aulaTeorica">Aula Teórica</label></div>
                    <div class="form-check form-check-inline"><input class="form-check-input" type="radio" name="pointType" id="atestadoMedico" value="atestado"><label class="form-check-label" for="atestadoMedico">Atestado</label></div>
                    <div class="form-check form-check-inline"><input class="form-check-input" type="radio" name="pointType" id="eventoAutorizado" value="evento_autorizado"><label class="form-check-label" for="eventoAutorizado">Evento Autorizado</label></div>
                </div>
                <div id="time-tracking-section" class="d-none">
                    <div class="time-inputs d-flex justify-content-around align-items-center mb-4"><div class="text-center"><label class="form-label" id="time-in-label">Entrada:</label><div class="time-display" id="time-in">--:--</div></div><div class="text-center"><label class="form-label" id="time-out-label">Saída:</label><div class="time-display" id="time-out">--:--</div></div></div>
                </div>
                <div id="theory-class-section" class="d-none mb-5"><p class="fw-bold">Selecione o período:</p><div class="form-check fs-5"><input class="form-check-input" type="checkbox" value="manha" id="manha-check"><label class="form-check-label" for="manha-check">Manhã</label></div><div class="form-check fs-5"><input class="form-check-input" type="checkbox" value="tarde" id="tarde-check"><label class="form-check-label" for="tarde-check">Tarde</label></div></div>
                <div id="medical-certificate-section" class="d-none mb-5"><div class="alert alert-warning" role="alert">Não esqueça de enviar o atestado para a coordenação.</div></div>
                <div class="card p-3 my-4">
                    <div class="form-check fs-5"><input class="form-check-input" type="checkbox" value="" id="justificativa-check"><label class="form-check-label" for="justificativa-check">Adicionar Justificativa Geral</label></div>
                    <div id="justificativa-box" class="mt-3 d-none"><label for="justificativa-text" class="form-label">Justificativa:</label><textarea class="form-control" id="justificativa-text" rows="3"></textarea></div>
                </div>
                <div id="action-buttons-container" class="mt-4">
                    <div id="botoes-ponto-normal" class="d-grid gap-2 d-none">
                        <button id="btn-entrada" class="btn btn-success btn-lg">Registrar Entrada</button>
                        <button id="btn-intervalo" class="btn btn-warning btn-lg">Iniciar Intervalo</button>
                        <button id="btn-saida" class="btn btn-danger btn-lg">Registrar Saída</button>
                    </div>
                    <div id="botoes-atividade-dia" class="d-grid gap-2 d-none">
                        <button id="btn-registrar-atividade" class="btn btn-primary btn-lg">Registrar</button>
                    </div>
                    <div class="text-center mt-3">
                        <a href="index.html" class="btn btn-link text-secondary">Cancelar</a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Anexa todos os "ouvintes" de eventos e controla a lógica da página.
 * @param {Object} loggedUser - O objeto do usuário logado.
 * @param {Object} jornadaAtual - A jornada de trabalho do dia atual, se existir.
 */
function anexarEventListeners(loggedUser, jornadaAtual) {
    const clockDiv = document.getElementById('live-clock');
    if (clockDiv) {
        setInterval(() => {
            const now = new Date();
            clockDiv.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        }, 1000);
    }
    
    const pointOptions = document.querySelectorAll('input[name="pointType"]');
    const timeTrackingSection = document.getElementById('time-tracking-section');
    const theoryClassSection = document.getElementById('theory-class-section');
    const medicalCertificateSection = document.getElementById('medical-certificate-section');
    const justificativaCheck = document.getElementById('justificativa-check');
    const justificativaBox = document.getElementById('justificativa-box');
    const botoesPontoNormal = document.getElementById('botoes-ponto-normal');
    const botoesAtividadeDia = document.getElementById('botoes-atividade-dia');
    const btnRegistrarAtividade = document.getElementById('btn-registrar-atividade');
    const btnEntrada = document.getElementById('btn-entrada');
    const btnIntervalo = document.getElementById('btn-intervalo');
    const btnSaida = document.getElementById('btn-saida');
    const timeInEl = document.getElementById('time-in');
    const timeOutEl = document.getElementById('time-out');

    let pontosDoDia = jornadaAtual ? jornadaAtual.atividades.find(a => a.tipo === 'normal')?.pontos || [] : [];

    function atualizarEstadoBotoesPontoNormal() {
        const ultimoPonto = pontosDoDia.length > 0 ? pontosDoDia[pontosDoDia.length - 1].tipo : null;

        btnEntrada.classList.add('d-none');
        btnIntervalo.classList.add('d-none');
        btnSaida.classList.add('d-none');

        switch (ultimoPonto) {
            case 'entrada':
            case 'fim_intervalo':
                btnIntervalo.classList.remove('d-none');
                btnIntervalo.textContent = 'Iniciar Intervalo';
                btnIntervalo.className = 'btn btn-warning btn-lg';
                btnSaida.classList.remove('d-none');
                break;
            case 'inicio_intervalo':
                btnIntervalo.classList.remove('d-none');
                btnIntervalo.textContent = 'Finalizar Intervalo';
                btnIntervalo.className = 'btn btn-info btn-lg';
                break;
            case 'saida':
                break;
            default:
                btnEntrada.classList.remove('d-none');
                break;
        }

        const entrada = pontosDoDia.find(p => p.tipo === 'entrada');
        const saida = pontosDoDia.find(p => p.tipo === 'saida');
        if (entrada) timeInEl.textContent = entrada.hora;
        if (saida) timeOutEl.textContent = saida.hora;
    }

    function updateInterface() {
        const tipoSelecionado = document.querySelector('input[name="pointType"]:checked').value;

        timeTrackingSection.classList.add('d-none');
        theoryClassSection.classList.add('d-none');
        medicalCertificateSection.classList.add('d-none');
        botoesPontoNormal.classList.add('d-none');
        botoesAtividadeDia.classList.add('d-none');

        if (tipoSelecionado === 'entrada_saida') {
            timeTrackingSection.classList.remove('d-none');
            botoesPontoNormal.classList.remove('d-none');
            atualizarEstadoBotoesPontoNormal();
        } else {
            botoesAtividadeDia.classList.remove('d-none');
            if (tipoSelecionado === 'aula_teorica' || tipoSelecionado === 'evento_autorizado') {
                theoryClassSection.classList.remove('d-none');
                btnRegistrarAtividade.textContent = 'Registrar Atividade';
                btnRegistrarAtividade.disabled = false;
            } else if (tipoSelecionado === 'atestado') {
                medicalCertificateSection.classList.remove('d-none');
                btnRegistrarAtividade.textContent = 'Registrar Atestado';
                btnRegistrarAtividade.disabled = false;
            }
        }
    }

    pointOptions.forEach(radio => radio.addEventListener('change', updateInterface));
    justificativaCheck.addEventListener('change', () => justificativaBox.classList.toggle('d-none'));

    async function registrarPontoNormal(tipoPonto) {
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        if (tipoPonto === 'saida') {
            const entrada = pontosDoDia.find(p => p.tipo === 'entrada');
            if (entrada && currentTime <= entrada.hora) {
                alert('Erro: A hora de saída não pode ser anterior ou igual à hora de entrada.');
                return;
            }
        }
        if (tipoPonto === 'fim_intervalo') {
            const ultimoInicioIntervalo = pontosDoDia.filter(p => p.tipo === 'inicio_intervalo').pop();
            if (ultimoInicioIntervalo && currentTime <= ultimoInicioIntervalo.hora) {
                alert('Erro: A hora de fim do intervalo não pode ser anterior ou igual à hora de início.');
                return;
            }
        }

        const dadosParaAPI = {
            residenteId: loggedUser.id,
            tipoAtividade: 'normal',
            hora: currentTime,
            tipoPonto: tipoPonto,
            justificativaGeral: justificativaCheck.checked ? document.getElementById('justificativa-text').value : '',
        };

        await registrarPontoOuAtividade(dadosParaAPI);
        pontosDoDia.push({ hora: currentTime, tipo: tipoPonto });
        atualizarEstadoBotoesPontoNormal();
        alert('Ponto registrado com sucesso!');
    }

    btnEntrada.addEventListener('click', () => registrarPontoNormal('entrada'));
    btnSaida.addEventListener('click', () => registrarPontoNormal('saida'));
    btnIntervalo.addEventListener('click', () => {
        const ultimoPonto = pontosDoDia.length > 0 ? pontosDoDia[pontosDoDia.length - 1].tipo : null;
        const tipoIntervalo = (ultimoPonto === 'inicio_intervalo') ? 'fim_intervalo' : 'inicio_intervalo';
        registrarPontoNormal(tipoIntervalo);
    });

    btnRegistrarAtividade.addEventListener('click', async () => {
        const tipoAtividade = document.querySelector('input[name="pointType"]:checked').value;
        const justificativa = justificativaCheck.checked ? document.getElementById('justificativa-text').value : '';
        let detalhes = '';

        if (tipoAtividade === 'aula_teorica' || tipoAtividade === 'evento_autorizado') {
            const periodos = [];
            if (document.getElementById('manha-check').checked) periodos.push('Manhã');
            if (document.getElementById('tarde-check').checked) periodos.push('Tarde');
            detalhes = periodos.join(', ') || 'Não especificado';
        }

        const dadosParaAPI = {
            residenteId: loggedUser.id,
            justificativaGeral: justificativa,
            tipoAtividade: tipoAtividade,
            detalhe: detalhes
        };

        await registrarPontoOuAtividade(dadosParaAPI);
        btnRegistrarAtividade.disabled = true;
        btnRegistrarAtividade.textContent = 'Registrado';
        alert('Atividade registrada com sucesso e enviada para validação!');
    });

    updateInterface();
}