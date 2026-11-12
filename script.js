// Motor Financeiro - Regra 50/30/20 para o Só Fluxo
document.addEventListener("DOMContentLoaded", () => {
    console.log("Só Fluxo MVP inicializado com sucesso.");

    // Exemplo de lógica interativa para simular o cálculo automático
    const calcularBtn = document.querySelector("#calcular-btn");
    
    if (calcularBtn) {
        calcularBtn.addEventListener("click", () => {
            const rendaInput = document.querySelector("#renda").value;
            const renda = parseFloat(rendaInput) || 0;

            const essencial = renda * 0.50;
            const lazer = renda * 0.30;
            const dividas = renda * 0.20;

            document.querySelector("#val-essencial").textContent = R$ ${essencial.toFixed(2)};
            document.querySelector("#val-lazer").textContent = R$ ${lazer.toFixed(2)};
            document.querySelector("#val-dividas").textContent = R$ ${dividas.toFixed(2)};
        });
    }
});