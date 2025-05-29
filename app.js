// app.js

const form = document.getElementById("form-conta");
const tabelaContas = document.getElementById("tabela-contas").getElementsByTagName("tbody")[0];
const totalAtualEl = document.getElementById("total-atual");
const totalIdealEl = document.getElementById("total-ideal");
const recomendacaoEl = document.getElementById("recomendacao");

const graficoPizzaCtx = document.getElementById("grafico-pizza").getContext("2d");
const graficoBarrasCtx = document.getElementById("grafico-barras").getContext("2d");
const graficoImportanciaCtx = document.getElementById("grafico-importancia").getContext("2d");

let contas = [];

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value;
  const atual = parseFloat(document.getElementById("atual").value);
  const ideal = parseFloat(document.getElementById("ideal").value);
  const importancia = parseFloat(document.getElementById("importancia").value);

  if (!nome || isNaN(atual) || isNaN(ideal) || isNaN(importancia)) return;

  contas.push({ nome, atual, ideal, importancia });
  atualizarTabela();
  form.reset();
});

function atualizarTabela() {
  tabelaContas.innerHTML = "";
  let totalAtual = 0;
  let totalIdeal = 0;

  contas.forEach((conta, index) => {
    const row = tabelaContas.insertRow();
    const percentual = ((conta.atual / conta.ideal) * 100).toFixed(1);
    const diferenca = conta.ideal - conta.atual;
    const acao = diferenca > 0 ? "Comprar" : "Esperar";

    row.innerHTML = `
      <td>${conta.nome}</td>
      <td>R$ ${conta.atual.toFixed(2)}</td>
      <td>R$ ${conta.ideal.toFixed(2)}</td>
      <td>${percentual}%</td>
      <td>${conta.importancia}</td>
      <td>${acao}</td>
      <td><button onclick="removerConta(${index})">Remover</button></td>
    `;

    totalAtual += conta.atual;
    totalIdeal += conta.ideal;
  });

  totalAtualEl.textContent = totalAtual.toFixed(2);
  totalIdealEl.textContent = totalIdeal.toFixed(2);
  recomendacaoEl.textContent = totalIdeal > totalAtual ? "Comprar mais ativos" : "Manter posição";

  atualizarGraficos();
}

function removerConta(index) {
  contas.splice(index, 1);
  atualizarTabela();
}

let graficoPizza, graficoBarras, graficoImportancia;

function atualizarGraficos() {
  const nomes = contas.map(c => c.nome);
  const valoresAtuais = contas.map(c => c.atual);
  const valoresIdeais = contas.map(c => c.ideal);
  const importancias = contas.map(c => c.importancia);

  if (graficoPizza) graficoPizza.destroy();
  if (graficoBarras) graficoBarras.destroy();
  if (graficoImportancia) graficoImportancia.destroy();

  graficoPizza = new Chart(graficoPizzaCtx, {
    type: 'pie',
    data: {
      labels: nomes,
      datasets: [{
        data: valoresAtuais,
        backgroundColor: gerarCores(nomes.length)
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' },
        title: { display: true, text: 'Distribuição Atual (Pizza)' }
      }
    }
  });

  graficoBarras = new Chart(graficoBarrasCtx, {
    type: 'bar',
    data: {
      labels: nomes,
      datasets: [
        {
          label: 'Atual',
          data: valoresAtuais,
          backgroundColor: 'rgba(54, 162, 235, 0.7)'
        },
        {
          label: 'Ideal',
          data: valoresIdeais,
          backgroundColor: 'rgba(75, 192, 192, 0.7)'
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: 'Comparação Atual x Ideal' }
      }
    }
  });

  graficoImportancia = new Chart(graficoImportanciaCtx, {
    type: 'bar',
    data: {
      labels: nomes,
      datasets: [{
        label: 'Importância',
        data: importancias,
        backgroundColor: 'rgba(255, 159, 64, 0.7)'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Notas de Importância dos Ativos' }
      }
    }
  });
}

function gerarCores(n) {
  const cores = [];
  for (let i = 0; i < n; i++) {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    cores.push(`rgba(${r}, ${g}, ${b}, 0.7)`);
  }
  return cores;
}
