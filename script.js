document.addEventListener("DOMContentLoaded", () => {
    let rendaMensal = parseFloat(localStorage.getItem("sofluxo_renda")) || 0;
    let lancamentos = JSON.parse(localStorage.getItem("sofluxo_lancamentos")) || [];

    const rendaInput = document.getElementById("renda-input");
    const btnCalcular = document.getElementById("btn-calcular");
    const btnLimparTudo = document.getElementById("btn-limpar-tudo");
    const formLancamento = document.getElementById("form-lancamento");
    const listaLancamentos = document.getElementById("lista-lancamentos");
    const dataInput = document.getElementById("data-input");

    if (dataInput) {
        dataInput.valueAsDate = new Date();
    }
    if (rendaInput && rendaMensal > 0) {
        rendaInput.value = rendaMensal.toFixed(2);
    }

    const formatarMoeda = (valor) => {
        return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    };

    const salvarDados = () => {
        localStorage.setItem("sofluxo_renda", rendaMensal.toString());
        localStorage.setItem("sofluxo_lancamentos", JSON.stringify(lancamentos));
    };

    const atualizarDashboard = () => {
        const metas = {
            essencial: rendaMensal * 0.50,
            lazer: rendaMensal * 0.30,
            investimentos: rendaMensal * 0.20
        };

        const gastos = {
            essencial: 0,
            lazer: 0,
            investimentos: 0
        };

        lancamentos.forEach((item) => {
            if (gastos[item.categoria] !== undefined) {
                gastos[item.categoria] += item.valor;
            }
        });

        ["essencial", "lazer", "investimentos"].forEach((cat) => {
            const elMeta = document.getElementById(`meta-${cat}`);
            const elGasto = document.getElementById(`gasto-${cat}`);
            const bar = document.getElementById(`bar-${cat}`);
            const alerta = document.getElementById(`alerta-${cat}`);

            if (elMeta) elMeta.textContent = formatarMoeda(metas[cat]);
            if (elGasto) elGasto.textContent = formatarMoeda(gastos[cat]);

            let percentual = metas[cat] > 0 ? (gastos[cat] / metas[cat]) * 100 : 0;
            if (bar) bar.style.width = `${Math.min(percentual, 100)}%`;

            if (alerta) {
                if (metas[cat] > 0 && gastos[cat] > metas[cat]) {
                    if (bar) bar.style.backgroundColor = "#dc2626";
                    alerta.textContent = `Atenção: Cota excedida em ${formatarMoeda(gastos[cat] - metas[cat])}!`;
                    alerta.classList.add("status-danger");
                } else {
                    if (bar) bar.style.backgroundColor = "";
                    alerta.classList.remove("status-danger");
                    alerta.textContent = metas[cat] > 0 ? `${percentual.toFixed(0)}% da cota utilizada` : "Defina sua receita acima";
                }
            }
        });

        const totalGasto = gastos.essencial + gastos.lazer + gastos.investimentos;
        const saldoLivre = rendaMensal - totalGasto;
        const saldoEl = document.getElementById("saldo-restante");

        if (saldoEl) {
            saldoEl.textContent = `Saldo Livre: ${formatarMoeda(saldoLivre)}`;
            saldoEl.style.background = saldoLivre < 0 ? "#fee2e2" : "#e0f2fe";
            saldoEl.style.color = saldoLivre < 0 ? "#dc2626" : "#0369a1";
        }

        if (listaLancamentos) {
            listaLancamentos.innerHTML = "";
            if (lancamentos.length === 0) {
                listaLancamentos.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#64748b;">Nenhum lançamento registrado ainda.</td></tr>`;
            } else {
                const nomesCategorias = {
                    essencial: "Essenciais (50%)",
                    lazer: "Estilo de Vida (30%)",
                    investimentos: "Futuro / Dívidas (20%)"
                };

                lancamentos.forEach((item, index) => {
                    const dataFormatada = item.data ? item.data.split("-").reverse().join("/") : "";
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td>${dataFormatada}</td>
                        <td><strong>${item.descricao}</strong></td>
                        <td>${nomesCategorias[item.categoria] || item.categoria}</td>
                        <td>${formatarMoeda(item.valor)}</td>
                        <td><button class="btn-delete" data-index="${index}">Excluir</button></td>
                    `;
                    listaLancamentos.appendChild(tr);
                });

                document.querySelectorAll(".btn-delete").forEach((btn) => {
                    btn.addEventListener("click", (e) => {
                        const idx = parseInt(e.target.getAttribute("data-index"));
                        lancamentos.splice(idx, 1);
                        salvarDados();
                        atualizarDashboard();
                    });
                });
            }
        }
    };

    if (btnCalcular) {
        btnCalcular.addEventListener("click", () => {
            const valor = parseFloat(rendaInput.value);
            if (isNaN(valor) || valor < 0) {
                alert("Por favor, insira um valor de receita válido.");
                return;
            }
            rendaMensal = valor;
            salvarDados();
            atualizarDashboard();
        });
    }

    if (formLancamento) {
        formLancamento.addEventListener("submit", (e) => {
            e.preventDefault();
            const descricao = document.getElementById("desc-input").value.trim();
            const valor = parseFloat(document.getElementById("valor-input").value);
            const categoria = document.getElementById("categoria-input").value;
            const data = dataInput.value;

            if (!descricao || isNaN(valor) || valor <= 0 || !data) return;

            lancamentos.unshift({ descricao, valor, categoria, data });
            salvarDados();
            atualizarDashboard();

            document.getElementById("desc-input").value = "";
            document.getElementById("valor-input").value = "";
        });
    }

    if (btnLimparTudo) {
        btnLimparTudo.addEventListener("click", () => {
            if (confirm("Deseja realmente apagar a receita e todos os lançamentos?")) {
                rendaMensal = 0;
                lancamentos = [];
                if (rendaInput) rendaInput.value = "";
                salvarDados();
                atualizarDashboard();
            }
        });
    }

    atualizarDashboard();
});