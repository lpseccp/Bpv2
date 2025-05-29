const contaForm = document.getElementById("conta-form");
const contasContainer = document.getElementById("contas-container");
const ativosTotalEl = document.getElementById("ativos-total");
const passivosTotalEl = document.getElementById("passivos-total");
const saldoIdealEl = document.getElementById("saldo-ideal");
const recomendacaoEl = document.getElementById("recomendacao");

let contas = JSON.parse(localStorage.getItem("contas")) || [];

function salvarContas() {
  localStorage.setItem("contas", JSON.stringify(contas));
}

function renderizarContas() {
  contasContainer.innerHTML = "";
  contas.forEach((conta, index) => {
    const div = document.createElement("div");
    div.innerHTML = `
      <strong>${conta.nome}</strong>: R$ ${conta.valor.toFixed(2)} (${conta.tipo})
      <button onclick="removerConta(${index})">Remover</button>
    `;
    contasContainer.appendChild(div);
  });
  atualizarTotais();
  desenharGraficos();
}

function removerConta(index) {
  contas.splice(index, 1);
  salvarContas();
  renderizarContas();
}

contaForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const nome = document.getElementById("nome-conta").value.trim();
  const valor = parseFloat(document.getElementById("valor-conta").value);
  const tipo = document.getElementById("tipo-conta").value;

  if (!nome || isNaN(valor)) return;

  contas.push({ nome, valor, tipo });
  salvarContas();
  renderizarContas();
  contaForm.reset();
});

function atualizarTotais() {
  const totalAtivos = contas
    .filter(c => c.tipo === "ativo")
    .reduce((acc, c) => acc + c.valor, 0);
  const totalPassivos = contas
    .filter(c => c.tipo === "passivo")
    .reduce((acc, c) => acc + c.valor, 0);

  const saldoIdeal = totalAtivos * 0.3;
  const diferenca = saldoIdeal - totalPassivos;

  ativosTotalEl.textContent = totalAtivos.toFixed(2);
  passivosTotalEl.textContent = totalPassivos.toFixed(2);
  saldoIdealEl.textContent = saldoIdeal.toFixed(2);
  recomendacaoEl.textContent =
    diferenca > 0
      ? `Comprar até R$ ${diferenca.toFixed(2)}`
      : `Aguardar, está em equilíbrio.`;
}

function desenharGraficos() {
  const pizza = document.getElementById("grafico-pizza");
  const barra = document.getElementById("grafico-barra");

  const totalAtivos = contas
    .filter(c => c.tipo === "ativo")
    .reduce((acc, c) => acc + c.valor, 0);
  const totalPassivos = contas
    .filter(c => c.tipo === "passivo")
    .reduce((acc, c) => acc + c.valor, 0);

  if (window.pizzaChart) window.pizzaChart.destroy();
  if (window.barraChart) window.barraChart.destroy();

  if (pizza) {
    window.pizzaChart = new Chart(pizza.getContext("2d"), {
      type: "pie",
      data: {
        labels: ["Ativos", "Passivos"],
        datasets: [{
          data: [totalAtivos, totalPassivos],
          backgroundColor: ["#4caf50", "#f44336"],
        }],
      },
    });
  }

  if (barra) {
    window.barraChart = new Chart(barra.getContext("2d"), {
      type: "bar",
      data: {
        labels: ["Ativos", "Passivos"],
        datasets: [{
          data: [totalAtivos, totalPassivos],
          backgroundColor: ["#2196f3", "#ff9800"],
        }],
      },
      options: {
        scales: {
          y: { beginAtZero: true },
        },
      },
    });
  }
}

// Ao carregar a página
document.addEventListener("DOMContentLoaded", renderizarContas);
