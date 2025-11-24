// Aguarda todo o conteúdo do DOM (HTML) ser carregado antes de rodar o script.
// Isso evita erros de tentar acessar elementos que ainda não existem na página.
document.addEventListener('DOMContentLoaded', () => {

    // SELEÇÃO DE ELEMENTOS DO DOM (INTERFACE)
    
    // Captura o input slider que define o nível de recursão (0 a 15 dependendo do fractal)
    const slider = document.getElementById('sliderIteracao');
    
    // Captura o span onde mostramos o número atual do nível ao lado do slider
    const valorSliderSpan = document.getElementById('valorSlider');
    
    // Captura o elemento <canvas> onde os desenhos serão renderizados
    const canvas = document.getElementById('fractalCanvas');
    
    // Captura o dropdown (select) onde o usuário escolhe qual fractal ver
    const fractalSelect = document.getElementById('selectFractal');
    
    // Obtém o contexto de desenho 2D do Canvas. É através do 'ctx' que desenhamos linhas e formas.
    const ctx = canvas.getContext('2d');
    
    // Armazena a largura e altura do canvas para cálculos de posicionamento
    const LARGURA = canvas.width;
    const ALTURA = canvas.height;
    
    // Definição das cores globais do tema "Neon/Dark"
    const corPrincipal = "#FF0054"; // Pink eletric para as linhas/formas
    const corFundo = "#000000";     // Preto absoluto para o fundo

    // ELEMENTOS DE CONTROLE DE ANIMAÇÃO
    
    // Botão de Play/Pause
    const playButton = document.getElementById('playButton');
    
    // Slider de velocidade (controla o delay em milissegundos)
    const speedSlider = document.getElementById('speedSlider');
    
    // Mostrador visual da velocidade (ex: "1.0s")
    const speedValue = document.getElementById('speedValue');
    
    // Flag (variável de estado) para saber se a animação está rodando ou parada
    let isAnimating = false;
    
    // Variável para armazenar o ID do timer (setTimeout), permitindo cancelar a animação
    let animationTimer = null;

    // ELEMENTOS DO PAINEL DIDÁTICO (BARRA LATERAL)
    
    // Título e descrição do fractal atual
    const infoTitulo = document.getElementById('infoTitulo');
    const infoDescricao = document.getElementById('infoDescricao');
    
    // Mostrador do nível matemático na seção de informações
    const infoNivel = document.getElementById('infoNivel');
    
    // Elementos para exibir as fórmulas e limites de Perímetro
    const infoPerimetroFormula = document.getElementById('infoPerimetroFormula');
    const infoPerimetroLimite = document.getElementById('infoPerimetroLimite');
    
    // Elementos para exibir as fórmulas e limites de Área
    const infoAreaFormula = document.getElementById('infoAreaFormula');
    const infoAreaLimite = document.getElementById('infoAreaLimite');
    
    // Elementos para exibir as fórmulas e limites da Dimensão Fractal
    const infoDimensaoFormula = document.getElementById('infoDimensaoFormula');
    const infoDimensaoLimite = document.getElementById('infoDimensaoLimite');

    // Elemento onde inserimos o texto sobre aplicações práticas (Biologia, Engenharia, etc)
    const aplicacoesConteudo = document.getElementById('aplicacoesConteudo');


    // FUNÇÕES UTILITÁRIAS DE GEOMETRIA E DESENHO 
    
    // Função auxiliar para calcular o ponto médio (x, y) entre dois pontos p1 e p2
    // Fórmula: ( (x1+x2)/2 , (y1+y2)/2 )
    function getMidpoint(p1, p2) { 
        return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 }; 
    }

    // Função para desenhar um triângulo preenchido
    function drawTriangle(p1, p2, p3) { 
        ctx.beginPath();             // Inicia um novo caminho de desenho
        ctx.moveTo(p1.x, p1.y);      // Move a "caneta" para o ponto 1
        ctx.lineTo(p2.x, p2.y);      // Risca uma linha até o ponto 2
        ctx.lineTo(p3.x, p3.y);      // Risca uma linha até o ponto 3
        ctx.closePath();             // Fecha o caminho (liga p3 de volta ao p1)
        ctx.fillStyle = corPrincipal; // Define a cor de preenchimento (Rosa)
        ctx.fill();                  // Preenche o triângulo
    }

    // Função para desenhar uma linha simples entre dois pontos
    function drawLine(p1, p2) { 
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = corPrincipal; // Define a cor da linha
        ctx.stroke();                   // Desenha a borda (o traço em si)
    }

    // Função para desenhar um polígono de 4 pontos (usado na Árvore de Pitágoras)
    function drawSquare(p1, p2, p3, p4) { 
        ctx.beginPath(); 
        ctx.moveTo(p1.x, p1.y); 
        ctx.lineTo(p2.x, p2.y); 
        ctx.lineTo(p3.x, p3.y); 
        ctx.lineTo(p4.x, p4.y); 
        ctx.closePath(); 
        ctx.fillStyle = corPrincipal; 
        ctx.fill(); 
    }
    
    
    // FUNÇÃO DE CONTROLE PRINCIPAL (HUB)
    function desenharFractal() {
        // Converte o valor do slider (string) para número inteiro
        const iteracao = parseInt(slider.value, 10);
        
        // Pega o valor do fractal selecionado no dropdown (ex: 'koch', 'sierpinski')
        const fractalEscolhido = fractalSelect.value;
        
        // Limpa o canvas pintando tudo de preto antes de redesenhar
        ctx.fillStyle = corFundo;
        ctx.fillRect(0, 0, LARGURA, ALTURA);
        
        // Atualiza os textos de nível na interface
        infoNivel.textContent = iteracao;
        valorSliderSpan.textContent = iteracao; 

        // Lógica de Roteamento: Qual fractal desenhar?
        if (fractalEscolhido === 'sierpinski') {
            slider.max = 8; // Limita o slider para evitar travamento do navegador (exponencial)
            // Se o usuário trocou de um fractal "pesado" para este, ajusta o valor atual se exceder o máx
            if (iteracao > slider.max) { slider.value = slider.max; }
            
            desenharSierpinski(iteracao);      // Chama a função de desenho
            atualizarPainelSierpinski(iteracao); // Atualiza as fórmulas matemáticas
            atualizarPainelAplicacoes('sierpinski'); // Atualiza o texto de curiosidades

        } else if (fractalEscolhido === 'koch') {
            slider.max = 6; // Koch cresce muito rápido em vértices, limite baixo
            if (iteracao > slider.max) { slider.value = slider.max; }
            
            desenharKoch(iteracao);
            atualizarPainelKoch(iteracao);
            atualizarPainelAplicacoes('koch');

        } else if (fractalEscolhido === 'pitagoras') {
            slider.max = 12; // Árvore suporta mais níveis pois objetos diminuem rápido
            if (iteracao > slider.max) { slider.value = slider.max; }
            
            desenharPitagoras(iteracao);
            atualizarPainelPitagoras(iteracao);
            atualizarPainelAplicacoes('pitagoras');

        } else if (fractalEscolhido === 'dragao') {
            slider.max = 15; // Dragão é apenas linha, suporta mais iterações
            if (iteracao > slider.max) { slider.value = slider.max; }
            
            desenharDragao(iteracao);
            atualizarPainelDragao(iteracao);
            atualizarPainelAplicacoes('dragao');
        }
        
        // Atualiza o texto do slider caso tenhamos forçado uma mudança de valor (limite max)
        valorSliderSpan.textContent = slider.value;
    }


    // ATUALIZAÇÃO DO TEXTO DE APLICAÇÕES
    // Insere HTML dinâmico dependendo do fractal selecionado
    function atualizarPainelAplicacoes(fractal) {
        let htmlConteudo = "";
        
        if (fractal === 'sierpinski') {
            htmlConteudo = `
                <ul>
                    <li><strong>Antenas (Telecomunicações):</strong> A forma do triângulo é usada para criar antenas compactas que operam eficientemente em múltiplas frequências (ex: Wi-Fi, 4G, 5G).</li>
                    <li><strong>Biologia:</strong> Modela a estrutura de algumas esponjas do mar.</li>
                </ul>`;
        } else if (fractal === 'koch') {
            htmlConteudo = `
                <ul>
                    <li><strong>Biologia (Pulmões):</strong> A forma do floco de neve é ideal para modelar como os brônquios se dividem nos pulmões, maximizando a área de absorção de oxigênio em um volume pequeno.</li>
                    <li><strong>Biologia (Vasos Sanguíneos):</strong> O mesmo princípio se aplica à rede de capilares e vasos sanguíneos.</li>
                </ul>`;
        } else if (fractal === 'pitagoras') {
            htmlConteudo = `
                <ul>
                    <li><strong>Computação Gráfica:</strong> É um método clássico usado para gerar árvores e folhagens de aparência natural em jogos e filmes.</li>
                    <li><strong>Arquitetura:</strong> A ideia de ramificação auto-similar inspira designs de estruturas e suportes.</li>
                </ul>`;
        } else if (fractal === 'dragao') {
            htmlConteudo = `
                <ul>
                    <li><strong>Biologia (Dobramento de Proteínas):</strong> A forma como a curva se dobra sobre si mesma é um modelo útil para estudar o complexo processo de dobramento de moléculas de proteína.</li>
                    <li><strong>Arte e Design:</strong> É famoso por sua beleza e complexidade inesperada a partir de uma regra tão simples.</li>
                </ul>`;
        }
        
        // Injeta o HTML construído dentro da div na barra lateral
        aplicacoesConteudo.innerHTML = htmlConteudo;
    }


    // SISTEMA DE ANIMAÇÃO
    
    // Função chamada recursivamente para avançar os níveis automaticamente
    function runAnimationStep() {
        if (!isAnimating) return; // Se o usuário pausou, para a execução.
        
        let nivelAtual = parseInt(slider.value, 10);
        let nivelMax = parseInt(slider.max, 10);
        
        // Se chegou ao fim, para a animação
        if (nivelAtual >= nivelMax) {
            stopAnimation(); 
            return;
        } else {
            // Caso contrário, incrementa o nível
            slider.value = nivelAtual + 1;
        }
        
        // Dispara manualmente o evento 'input' para o slider avisar ao sistema que mudou
        // e acionar a função desenharFractal()
        slider.dispatchEvent(new Event('input', { bubbles: true }));
        
        // Pega o delay atual do slider de velocidade
        const delay = parseInt(speedSlider.value, 10);
        
        // Agenda a próxima chamada desta mesma função (Loop)
        animationTimer = setTimeout(runAnimationStep, delay);
    }

    // Função para parar a animação e resetar o estado do botão
    function stopAnimation() {
        isAnimating = false;
        playButton.textContent = "Play ▶";
        playButton.classList.remove("playing"); // Remove estilo visual de "ativo"
        
        // Se houver um timer pendente, cancela ele para não rodar mais nada
        if (animationTimer) {
            clearTimeout(animationTimer);
            animationTimer = null;
        }
    }

    // EVENT LISTENERS
    
    // Clique no botão Play/Pause
    playButton.addEventListener('click', () => {
        if (isAnimating) {
            stopAnimation(); // Se já está rodando, para.
        } else {
            // Se está parado, começa.
            isAnimating = true;
            playButton.textContent = "Pause ||";
            playButton.classList.add("playing");
            
            // Se o slider já estiver no máximo, reseta para 0 para começar do início
            let nivelAtual = parseInt(slider.value, 10);
            let nivelMax = parseInt(slider.max, 10);
            if (nivelAtual >= nivelMax) {
                slider.value = 0;
                slider.dispatchEvent(new Event('input', { bubbles: true }));
            }
            runAnimationStep(); // Inicia o loop
        }
    });

    // Mudança no slider de velocidade (apenas visual, o JS lê o valor na hora do loop)
    speedSlider.addEventListener('input', (e) => {
        const segundos = (parseInt(e.target.value, 10) / 1000).toFixed(1);
        speedValue.textContent = `${segundos}s`;
    });

    // Se o usuário clicar no slider manualmente, para a animação automática
    slider.addEventListener('mousedown', () => {
        if (isAnimating) { stopAnimation(); }
    });

    // Quando o valor do slider muda (arrastado ou via script), redesenha tudo
    slider.addEventListener('input', desenharFractal);

    // Quando troca o tipo de fractal no dropdown
    fractalSelect.addEventListener('change', () => {
        if (isAnimating) { stopAnimation(); } // Para animação antiga
        desenharFractal(); // Desenha o novo fractal (nível 0 ou atual)
    });
    
    // Chama o desenho inicial ao carregar a página
    desenharFractal();
    
    
    // LÓGICA ESPECÍFICA DE CADA FRACTAL

    // 1. TRIÂNGULO DE SIERPINSKI
    function desenharSierpinski(level) {
        const padding = 20;
        // Define os 3 vértices do triângulo principal
        const p1 = { x: LARGURA / 2, y: padding }; // Topo centro
        const p2 = { x: padding, y: ALTURA - padding }; // Base esquerda
        const p3 = { x: LARGURA - padding, y: ALTURA - padding }; // Base direita
        
        // Inicia a recursão
        sierpinskiRecursivo(p1, p2, p3, level);
    }

    function sierpinskiRecursivo(p1, p2, p3, level) {
        // CASO BASE: Se nível é 0, desenha o triângulo cheio e para.
        if (level === 0) { drawTriangle(p1, p2, p3); }
        else {
            // PASSO RECURSIVO:
            // 1. Acha os pontos médios dos lados
            const m1 = getMidpoint(p1, p2);
            const m2 = getMidpoint(p2, p3);
            const m3 = getMidpoint(p3, p1);
            
            // 2. Chama a função para os 3 novos triângulos menores (topo, esq, dir)
            // O triângulo central NÃO é chamado, criando o "buraco".
            sierpinskiRecursivo(p1, m1, m3, level - 1);
            sierpinskiRecursivo(m1, p2, m2, level - 1);
            sierpinskiRecursivo(m3, m2, p3, level - 1);
        }
    }

    function atualizarPainelSierpinski(level) {
        infoTitulo.textContent = "Triângulo de Sierpinski";
        infoDescricao.textContent = "A regra é: 'Comece com um triângulo equilátero. A cada nível, divida cada triângulo em 4 menores, removendo o triângulo central.'";
        
        // Cálculos Matemáticos
        const perimetro = 3 * Math.pow(1.5, level); // Perímetro cresce 1.5x a cada nível
        const area = Math.pow(0.75, level); // Área diminui para 75% a cada nível
        const dimensao = Math.log(3) / Math.log(2); // Constante de Hausdorff
        
        // Atualização do HTML com MathJax/HTML simples
        infoPerimetroFormula.innerHTML = `P(N) = 3 &times; (1.5)<sup>N</sup> = 3 &times; (1.5)<sup>${level}</sup> = <strong>${perimetro.toFixed(2)}</strong>`;
        infoPerimetroLimite.textContent = "PG de razão 1.5 (> 1). O perímetro tende ao Infinito.";
        
        infoAreaFormula.innerHTML = `A(N) = (0.75)<sup>N</sup> = (0.75)<sup>${level}</sup> = <strong>${area.toFixed(4)}</strong>`;
        infoAreaLimite.textContent = "PG de razão 0.75 (< 1). A área preenchida tende a Zero.";
        
        infoDimensaoFormula.innerHTML = `D = log(Nº cópias) / log(Escala) = log(3) / log(2) &#x2248; <strong>${dimensao.toFixed(3)}</strong>`;
        infoDimensaoLimite.textContent = "A dimensão é constante e mede a 'complexidade' do fractal. Está entre 1 (linha) e 2 (plano).";
    }

    // 2. FLOCO DE NEVE DE KOCH
    function desenharKoch(level) {
        const lado = 500; 
        const altura = lado * Math.sqrt(3) / 2; // Altura triângulo equilátero
        const cx = LARGURA / 2; const cy = ALTURA / 2;
        
        // Define triângulo inicial invertido para centralizar melhor
        const p1 = { x: cx - lado / 2, y: cy + altura / 3 };
        const p2 = { x: cx + lado / 2, y: cy + altura / 3 };
        const p3 = { x: cx, y: cy - (2 * altura / 3) };
        
        // Aplica a recursão em cada uma das 3 linhas do triângulo inicial
        kochRecursivo(p1, p2, level);
        kochRecursivo(p2, p3, level);
        kochRecursivo(p3, p1, level);
    }

    function kochRecursivo(p1, p2, level) {
        // CASO BASE: Desenha a linha reta
        if (level === 0) { drawLine(p1, p2); return; }
        
        // PASSO RECURSIVO: Divide a linha em 4 segmentos formando o "bico"
        
        // pa: 1/3 do caminho
        const pa = { x: p1.x + (p2.x - p1.x) / 3, y: p1.y + (p2.y - p1.y) / 3 };
        // pc: 2/3 do caminho
        const pc = { x: p1.x + 2 * (p2.x - p1.x) / 3, y: p1.y + 2 * (p2.y - p1.y) / 3 };
        
        // pb: O ponto "para fora" que forma o triângulo. Usa rotação de vetor (Matriz de Rotação 60 graus)
        const angulo = -Math.PI / 3; // 60 graus negativo (para fora) - Correção visual: No canvas Y cresce pra baixo, inverti sinal se necessário mas aqui usei pi/3
        // (Nota: a fórmula abaixo rotaciona o vetor pa->pc em 60 graus)
        const pb = { 
            x: pa.x + (pc.x - pa.x) * Math.cos(Math.PI/3) - (pc.y - pa.y) * Math.sin(Math.PI/3), 
            y: pa.y + (pc.x - pa.x) * Math.sin(Math.PI/3) + (pc.y - pa.y) * Math.cos(Math.PI/3) 
        };
        
        // Chama recursão para os 4 novos segmentos
        kochRecursivo(p1, pa, level - 1);
        kochRecursivo(pa, pb, level - 1);
        kochRecursivo(pb, pc, level - 1); 
        kochRecursivo(pc, p2, level - 1);
    }

    function atualizarPainelKoch(level) {
        infoTitulo.textContent = "Floco de Neve de Koch";
        infoDescricao.textContent = "A regra é: 'Comece com um triângulo equilátero. A cada nível, divida cada segmento de linha em três, remova o segmento do meio e adicione um novo triângulo equilátero virado para fora.'";
        
        const perimetro = 3 * Math.pow(4/3, level);
        
        // Cálculo de soma de PG para a área (mais complexo)
        let area = 1; let areaAdicionada = 1/3;
        for (let i = 0; i < level; i++) { area += areaAdicionada; areaAdicionada *= (4/9); }
        
        const limiteArea = 8/5; // Limite teórico matemático
        const dimensao = Math.log(4) / Math.log(3);

        infoPerimetroFormula.innerHTML = `P(N) = 3 &times; (4/3)<sup>N</sup> = 3 &times; (4/3)<sup>${level}</sup> = <strong>${perimetro.toFixed(2)}</strong>`;
        infoPerimetroLimite.textContent = "PG de razão 4/3 (> 1). O perímetro tende ao Infinito.";
        infoAreaFormula.innerHTML = `A(N) &#x2248; <strong>${area.toFixed(4)}</strong> (relativo à A<sub>0</sub>=1)`;
        infoAreaLimite.innerHTML = `PG complexa. A área total tende a um limite finito (<strong>${limiteArea.toFixed(4)}</strong> da área inicial).`;
        infoDimensaoFormula.innerHTML = `D = log(Nº cópias) / log(Escala) = log(4) / log(3) &#x2248; <strong>${dimensao.toFixed(3)}</strong>`;
        infoDimensaoLimite.textContent = "A dimensão é constante e mede a 'complexidade' do fractal.";
    }

    // 3. ÁRVORE DE PITÁGORAS
    function desenharPitagoras(level) {
        const tamanhoTronco = 100;
        // Define base do tronco no centro inferior
        const p1 = { x: (LARGURA / 2) - (tamanhoTronco / 2), y: ALTURA - 100 };
        const p2 = { x: (LARGURA / 2) + (tamanhoTronco / 2), y: ALTURA - 100 };
        pitagorasRecursivo(p1, p2, level);
    }

    function pitagorasRecursivo(p1, p2, level) {
        // 1. Desenha o quadrado base (Tronco atual)
        const dx = p2.x - p1.x; 
        const dy = p2.y - p1.y;
        
        // Calcula p3 e p4 (topo do quadrado) rotacionando 90 graus
        const p4 = { x: p1.x + dy, y: p1.y - dx }; 
        const p3 = { x: p2.x + dy, y: p2.y - dx };
        
        drawSquare(p1, p2, p3, p4);
        
        if (level === 0) { return; } // Caso base
        
        // 2. Calcula o "telhado" (triângulo retângulo imaginário em cima)
        // Vamos achar o vértice do triângulo isósceles retângulo
        const dx_top = p3.x - p4.x; 
        const dy_top = p3.y - p4.y;
        
        // Ponto médio do topo do quadrado
        const mid = { x: (p4.x + p3.x) / 2, y: (p4.y + p3.y) / 2 };
        
        // Vértice do triângulo (pTopo)
        const pTopo = { x: mid.x + dy_top / 2, y: mid.y - dx_top / 2 }; // /2 define altura do isósceles retângulo
        
        // 3. Recursão: O lado esquerdo do telhado vira base da nova árvore esq
        pitagorasRecursivo(p4, pTopo, level - 1);
        
        // O lado direito do telhado vira base da nova árvore dir
        pitagorasRecursivo(pTopo, p3, level - 1);
    }

    function atualizarPainelPitagoras(level) {
        infoTitulo.textContent = "Árvore de Pitágoras";
        infoDescricao.textContent = "A regra é: 'Comece com um quadrado. Em cima dele, adicione um triângulo retângulo isósceles e, em cada cateto, novos quadrados.'";
        infoPerimetroFormula.textContent = "O cálculo do perímetro é complexo (não é PG simples).";
        infoPerimetroLimite.textContent = "O limite é complexo de determinar.";
        infoAreaFormula.textContent = "A soma das áreas é finita.";
        infoAreaLimite.textContent = "A árvore é limitada, ela não cresce indefinidamente para fora de uma caixa.";
        infoDimensaoFormula.innerHTML = `D = <strong>2.000</strong>`;
        infoDimensaoLimite.textContent = "Como os ramos eventualmente se tocam e se sobrepõem, ela preenche o plano 2D.";
    }

    // 4. CURVA DO DRAGÃO
    function desenharDragao(level) {
        const ladoInicial = LARGURA * 0.6;
        const p1 = { x: LARGURA * 0.2, y: ALTURA * 0.6 };
        const p2 = { x: p1.x + ladoInicial, y: p1.y };
        
        // Inicia recursão. 'true' indica primeira dobra para a direita.
        dragaoRecursivo(p1, p2, level, true);
    }

    function dragaoRecursivo(p1, p2, level, dobrarDireita) {
        if (level === 0) { drawLine(p1, p2); return; }
        
        const dx = p2.x - p1.x; 
        const dy = p2.y - p1.y;
        
        // Calcula o ponto médio (pm) que forma um triângulo retângulo isósceles
        let pm;
        if (dobrarDireita) { 
            // Rotação +45 graus escalada
            pm = { x: p1.x + (dx + dy) / 2, y: p1.y + (dy - dx) / 2 }; 
        } else { 
            // Rotação -45 graus escalada
            pm = { x: p1.x + (dx - dy) / 2, y: p1.y + (dy + dx) / 2 }; 
        }
        
        // Recursão Crítica:
        // O primeiro segmento mantêm a dobra atual? Não necessariamente.
        // A regra do Dragão é: O 1º filho dobra à DIREITA, o 2º filho dobra à ESQUERDA (relativo ao pai? não, fixo).
        // Correção da regra clássica:
        // Passo 1: Sempre dobra "para fora" do segmento atual.
        // Para obter a forma correta, invertemos a lógica no segundo segmento?
        // Implementação padrão: Next level -> (True, False)
        
        dragaoRecursivo(p1, pm, level - 1, true);
        dragaoRecursivo(pm, p2, level - 1, false);
    }

    function atualizarPainelDragao(level) {
        infoTitulo.textContent = "Curva do Dragão";
        infoDescricao.textContent = "Regra: 'Substitua cada segmento por dois em ângulo de 90°, alternando a dobra (direita/esquerda).'";
        infoPerimetroFormula.textContent = "Comprimento cresce sqrt(2) a cada nível.";
        infoPerimetroLimite.textContent = "Tende ao infinito.";
        infoAreaFormula.textContent = "Curva de preenchimento de espaço.";
        infoAreaLimite.textContent = "Preenche uma área finita (fractal denso).";
        infoDimensaoFormula.innerHTML = `D = <strong>2.000</strong>`;
        infoDimensaoLimite.textContent = "Dimensão Fractal é 2, pois a curva (1D) eventualmente preenche uma área (2D) completa.";
    }
});