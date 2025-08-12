document.addEventListener('DOMContentLoaded', () => {
    // --- LÓGICA DO MODO ESCURO (NOVO) ---
    const themeSwitch = document.getElementById('themeSwitch');

    // Função para aplicar o tema com base na preferência salva
    function aplicarTema(tema) {
        if (tema === 'dark') {
            document.body.classList.add('dark-mode');
            themeSwitch.checked = true;
        } else {
            document.body.classList.remove('dark-mode');
            themeSwitch.checked = false;
        }
    }

    // Ao carregar a página, verifica se há um tema salvo no localStorage
    const temaSalvo = localStorage.getItem('tema');
    // Aplica o tema salvo ou o padrão (claro)
    aplicarTema(temaSalvo);

    // Adiciona o listener para o clique no interruptor
    themeSwitch.addEventListener('change', () => {
        let temaAtual = 'light';
        if (themeSwitch.checked) {
            temaAtual = 'dark';
        }
        // Salva a nova preferência no localStorage
        localStorage.setItem('tema', temaAtual);
        // Aplica o novo tema
        aplicarTema(temaAtual);
    });
    // --- FIM DA LÓGICA DO MODO ESCURO ---


    // --- LÓGICA ORIGINAL DA APLICAÇÃO ---
    // (Todo o código que já tínhamos para a funcionalidade de digitação)
    
    const textoReferenciaEl = document.getElementById('texto-referencia');
    const areaDigitacaoEl = document.getElementById('area-digitacao');
    const botaoReiniciarEl = document.getElementById('botao-reiniciar');
    const ppmEl = document.getElementById('ppm');
    const precisaoEl = document.getElementById('precisao');
    const tempoEl = document.getElementById('tempo');

    let textos = [];
    let textoAtual = '';
    let timer;
    let tempoDecorrido = 0;
    let erros = 0;
    let jogoIniciado = false;

    async function carregarTextos() {
        try {
            const response = await fetch('textos.json');
            const data = await response.json();
            textos = data.textos;
            selecionarNovoTexto();
        } catch (error) {
            console.error('Erro ao carregar textos:', error);
            textoReferenciaEl.textContent = 'Não foi possível carregar os textos.';
        }
    }

    function selecionarNovoTexto() {
        const indiceAleatorio = Math.floor(Math.random() * textos.length);
        textoAtual = textos[indiceAleatorio];
        
        textoReferenciaEl.innerHTML = '';
        textoAtual.split('').forEach(char => {
            const span = document.createElement('span');
            span.innerText = char;
            textoReferenciaEl.appendChild(span);
        });

        resetarValores();
    }

    function resetarValores() {
        areaDigitacaoEl.value = '';
        areaDigitacaoEl.disabled = false;
        clearInterval(timer);
        tempoDecorrido = 0;
        erros = 0;
        jogoIniciado = false;
        
        ppmEl.textContent = '0';
        precisaoEl.textContent = '100';
        tempoEl.textContent = '0';
        
        Array.from(textoReferenciaEl.children).forEach(span => {
            span.classList.remove('correto', 'incorreto');
        });
    }

    function iniciarTimer() {
        jogoIniciado = true;
        timer = setInterval(() => {
            tempoDecorrido++;
            tempoEl.textContent = tempoDecorrido;
            atualizarPPM();
        }, 1000);
    }

    function atualizarEstatisticas() {
        const textoDigitado = areaDigitacaoEl.value;
        const arrayReferencia = textoReferenciaEl.querySelectorAll('span');
        erros = 0;

        arrayReferencia.forEach((charSpan, index) => {
            const charDigitado = textoDigitado[index];
            if (charDigitado == null) {
                charSpan.classList.remove('correto', 'incorreto');
            } else if (charDigitado === charSpan.innerText) {
                charSpan.classList.add('correto');
                charSpan.classList.remove('incorreto');
            } else {
                charSpan.classList.add('incorreto');
                charSpan.classList.remove('correto');
                erros++;
            }
        });

        const caracteresCorretos = textoDigitado.length - erros;
        const precisao = textoDigitado.length > 0 ? ((caracteresCorretos / textoDigitado.length) * 100).toFixed(2) : 100;
        precisaoEl.textContent = Math.round(precisao);

        if (textoDigitado.length === textoAtual.length) {
            clearInterval(timer);
            areaDigitacaoEl.disabled = true;
        }

        atualizarPPM();
    }
    
    function atualizarPPM() {
        if (tempoDecorrido > 0) {
            const textoDigitado = areaDigitacaoEl.value;
            const caracteresCorretos = textoDigitado.length - erros;
            const minutos = tempoDecorrido / 60;
            const ppm = Math.round((caracteresCorretos / 5) / minutos);
            ppmEl.textContent = ppm > 0 ? ppm : 0;
        }
    }

    areaDigitacaoEl.addEventListener('input', () => {
        if (!jogoIniciado) {
            iniciarTimer();
        }
        atualizarEstatisticas();
    });

    botaoReiniciarEl.addEventListener('click', selecionarNovoTexto);

    // Ponto de partida da aplicação
    carregarTextos();
});