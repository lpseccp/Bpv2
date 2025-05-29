// app.js
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
    div.className = "conta-item";
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

contaForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const nome = document.getElementById("nome-conta").value;
  const valor = parseFloat(document.getElementById("valor-conta").value);
  const tipo = document.getElementById("tipo-conta").value;

  if (!nome || isNaN(valor)) return;

  contas.push({ nome, valor, tipo });
  salvarContas();
  renderizarContas();
  contaForm.reset();
});

function atualizarTotais() {
  const ativos = contas.filter(c => c.tipo === "ativo");
  const passivos = contas.filter(c => c.tipo === "passivo");

  const totalAtivos = ativos.reduce((acc, c) => acc + c.valor, 0);
  const totalPassivos = passivos.reduce((acc, c) => acc + c.valor, 0);

  const saldoIdeal = totalAtivos * 0.3; // Exemplo
  const diferenca = saldoIdeal - totalPassivos;

  ativosTotalEl.textContent = totalAtivos.toFixed(2);
  passivosTotalEl.textContent = totalPassivos.toFixed(2);
  saldoIdealEl.textContent = saldoIdeal.toFixed(2);

  recomendacaoEl.textContent = diferenca > 0 ?
    `Comprar até R$ ${diferenca.toFixed(2)}` :
    `Aguardar, está em equilíbrio.`;
}

function desenharGraficos() {
  const ctxPizza = document.getElementById("grafico-pizza")?.getContext("2d");
  const ctxBarra = document.getElementById("grafico-barra")?.getContext("2d");
  const ctxComparacao = document.getElementById("grafico-comparacao")?.getContext("2d");

  const ativos = contas.filter(c => c.tipo === "ativo");
  const passivos = contas.filter(c => c.tipo === "passivo");

  const totalAtivos = ativos.reduce((acc, c) => acc + c.valor, 0);
  const totalPassivos = passivos.reduce((acc, c) => acc + c.valor, 0);

  if (ctxPizza) {
    if (window.pizzaChart) window.pizzaChart.destroy();
    window.pizzaChart = new Chart(ctxPizza, {
      type: 'pie',
      data: {
        labels: ['Ativos', 'Passivos'],
        datasets: [{
          label: 'Distribuição',
          data: [totalAtivos, totalPassivos],
          backgroundColor: ['#4caf50', '#f44336']
        }]
      }
    });
  }

  if (ctxBarra) {
    if (window.barraChart) window.barraChart.destroy();
    window.barraChart = new Chart(ctxBarra, {
      type: 'bar',
      data: {
        labels: ['Ativos', 'Passivos'],
        datasets: [{
          label: 'Comparativo',
          data: [totalAtivos, totalPassivos],
          backgroundColor: ['#2196f3', '#ff9800']
        }]
      },
      options: {
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }

  if (ctxComparacao) {
    if (window.comparacaoChart) window.comparacaoChart.destroy();
    window.comparacaoChart = new Chart(ctxComparacao, {
      type: 'line',
      data: {
        labels: ['Ativos', 'Passivos'],
        datasets: [{
          label: 'Evolução',
          data: [totalAtivos, totalPassivos],
          fill: false,
          borderColor: 'rgba(75, 192, 192, 1)',
          tension: 0.1
        }]
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderizarContas();
});
