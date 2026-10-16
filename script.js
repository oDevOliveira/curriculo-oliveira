
document.addEventListener("DOMContentLoaded", () => {
    const $ = (seletor, contexto = document) =>
        contexto.querySelector(seletor);

    const $$ = (seletor, contexto = document) =>
        [...contexto.querySelectorAll(seletor)];

    const movimentoReduzido = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    // 1. Ano automático, caso exista no HTML
    const ano = $("#ano");
    if (ano) ano.textContent = new Date().getFullYear();

    // 2. Entrada suave dos elementos
    if (!movimentoReduzido && "IntersectionObserver" in window) {
        const elementos = $$(
            ".section-heading, .skill-card, .project-card, " +
            ".demo-notice, .about-content, .hero-card"
        );

        elementos.forEach((elemento, indice) => {
            elemento.classList.add("js-reveal");
            elemento.style.setProperty(
                "--reveal-delay",
                `${(indice % 4) * 75}ms`
            );
        });

        const observador = new IntersectionObserver((entradas, obs) => {
            entradas.forEach((entrada) => {
                if (entrada.isIntersecting) {
                    entrada.target.classList.add("is-visible");
                    obs.unobserve(entrada.target);
                }
            });
        }, { threshold: 0.12 });

        elementos.forEach((elemento) => observador.observe(elemento));
    }

    // 3. Efeito de digitação no título
    const titulo = $(".hero h1 span");

    if (titulo && !movimentoReduzido) {
        const textoOriginal = titulo.textContent.trim();
        titulo.textContent = "";
        titulo.classList.add("typing-cursor");

        let indice = 0;

        const digitar = () => {
            if (indice < textoOriginal.length) {
                titulo.textContent += textoOriginal[indice];
                indice++;
                setTimeout(digitar, 65);
            } else {
                titulo.classList.remove("typing-cursor");
            }
        };

        setTimeout(digitar, 450);
    }

    // 4. Movimento discreto no terminal
    const terminal = $(".hero-card");

    if (terminal && !movimentoReduzido) {
        terminal.addEventListener("pointermove", (evento) => {
            if (evento.pointerType !== "mouse") return;

            const retangulo = terminal.getBoundingClientRect();
            const x = (evento.clientX - retangulo.left) / retangulo.width;
            const y = (evento.clientY - retangulo.top) / retangulo.height;

            terminal.style.setProperty("--mouse-x", `${x * 100}%`);
            terminal.style.setProperty("--mouse-y", `${y * 100}%`);
        });

        terminal.addEventListener("pointerleave", () => {
            terminal.style.removeProperty("--mouse-x");
            terminal.style.removeProperty("--mouse-y");
        });
    }

    // 5. Efeito de brilho nos cards
    $$(".project-card, .skill-card").forEach((card) => {
        card.addEventListener("pointermove", (evento) => {
            if (evento.pointerType !== "mouse") return;

            const retangulo = card.getBoundingClientRect();

            card.style.setProperty(
                "--pointer-x",
                `${evento.clientX - retangulo.left}px`
            );

            card.style.setProperty(
                "--pointer-y",
                `${evento.clientY - retangulo.top}px`
            );
        });

        card.addEventListener("pointerleave", () => {
            card.style.removeProperty("--pointer-x");
            card.style.removeProperty("--pointer-y");
        });
    });

    // 6. Barra de progresso da página
    const progresso = document.createElement("div");
    progresso.className = "scroll-progress";
    progresso.setAttribute("aria-hidden", "true");
    document.body.appendChild(progresso);

    let aguardandoScroll = false;

    const atualizarProgresso = () => {
        const altura = document.documentElement.scrollHeight -
            window.innerHeight;

        const porcentagem = altura > 0
            ? (window.scrollY / altura) * 100
            : 0;

        progresso.style.transform = `scaleX(${porcentagem / 100})`;
        aguardandoScroll = false;
    };

    window.addEventListener("scroll", () => {
        if (!aguardandoScroll) {
            requestAnimationFrame(atualizarProgresso);
            aguardandoScroll = true;
        }
    }, { passive: true });

    atualizarProgresso();

    // 7. Destaque da seção atual no menu
    const secoes = $$("main section[id]");
    const linksMenu = $$(".nav-links a[href^='#']");

    if ("IntersectionObserver" in window) {
        const observadorMenu = new IntersectionObserver((entradas) => {
            entradas.forEach((entrada) => {
                if (!entrada.isIntersecting) return;

                linksMenu.forEach((link) => {
                    const ativo =
                        link.hash === `#${entrada.target.id}`;

                    if (ativo) {
                        link.setAttribute("aria-current", "location");
                    } else {
                        link.removeAttribute("aria-current");
                    }
                });
            });
        }, {
            rootMargin: "-25% 0px -65% 0px"
        });

        secoes.forEach((secao) => observadorMenu.observe(secao));
    }

    // 8. Navegação suave
    $$('a[href^="#"]').forEach((link) => {
        link.addEventListener("click", (evento) => {
            const destino = link.getAttribute("href");

            if (!destino || destino === "#") {
                evento.preventDefault();
                return;
            }

            const secao = $(destino);

            if (!secao) return;

            evento.preventDefault();

            secao.scrollIntoView({
                behavior: movimentoReduzido ? "auto" : "smooth",
                block: "start"
            });
        });
    });

    // 9. Botão de voltar ao topo
    const topo = document.createElement("button");
    topo.className = "back-to-top";
    topo.type = "button";
    topo.textContent = "↑";
    topo.setAttribute("aria-label", "Voltar ao topo");
    document.body.appendChild(topo);

    const atualizarTopo = () => {
        topo.classList.toggle("is-visible", window.scrollY > 450);
    };

    window.addEventListener("scroll", atualizarTopo, {
        passive: true
    });

    atualizarTopo();

    topo.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: movimentoReduzido ? "auto" : "smooth"
        });
    });

    // 10. Feedback ao clicar nos links externos
    $$('a[target="_blank"]').forEach((link) => {
        link.addEventListener("pointerdown", () => {
            link.classList.add("link-pressed");
        });

        ["pointerup", "pointercancel", "pointerleave"].forEach((evento) => {
            link.addEventListener(evento, () => {
                link.classList.remove("link-pressed");
            });
        });
    });

    // 11. Pequena resposta visual nos botões
    $$(".btn-primary, .btn-secondary, .nav-github").forEach((botao) => {
        botao.addEventListener("pointerdown", (evento) => {
            if (evento.pointerType === "mouse") {
                botao.classList.add("button-pressed");
            }
        });

        ["pointerup", "pointerleave", "pointercancel"].forEach((evento) => {
            botao.addEventListener(evento, () => {
                botao.classList.remove("button-pressed");
            });
        });
    });
});
