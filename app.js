<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Controle Financeiro</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
    }
    nav a {
      margin: 10px;
      text-decoration: none;
      font-weight: bold;
    }
    .pagina {
      display: none;
    }
    .ativa {
      display: block;
    }
  </style>
</head>
<body>
  <nav>
    <a href="#" onclick="mostrarPagina('cadastro')">Cadastro</a>
    <a href="#" onclick="mostrarPagina('resumo')">Resumo</a>
    <a href="#" onclick="mostrarPagina('pizza')">Gráfico Pizza</a>
    <a href="#" onclick="mostrarPagina('barra')">Gráfico Barra</a>
  </nav>

  <div id="cadastro" class="pagina ativa">
    <h2>Cadastro de Conta</h2>
    <form id="conta-form">
      <input id="nome-conta" placeholder="Nome da conta" required />
      <input id="valor-conta" type="number" placeholder="Valor" required />
      <select id="tipo-conta">
        <option value="ativo">Ativo</option>
        <option value="passivo">Passivo</option>
      </select>
      <button type="submit">Adicionar Conta</button>
    </form>
    <div id="contas-container"></div>
  </div>

  <div id="resumo" class="pagina">
    <h2>Resumo</h2>
    <p>Total de Ativos: R$ <span id="ativos-total">0.00</span></p>
    <p>Total de Passivos: R$ <span id="passivos-total">0.00</span></p>
    <p>Saldo Ideal (30% dos Ativos): R$ <span id="saldo-ideal">0.00</span></p>
    <p><strong id="recomendacao">Aguardando dados...</strong></p>
  </div>

  <div id="pizza" class="pagina">
    <h2>Gráfico de Pizza</h2>
    <canvas id="grafico-pizza" width="400" height="400"></canvas>
  </div>

  <div id="barra" class="pagina">
    <h2>Gráfico de Barras</h2>
    <canvas id="grafico-barra" width="400" height="400"></canvas>
  </div>

  <script>
    let contas = JSON.parse(localStorage.getItem("contas")) || [];

    function salvarContas() {
      localStorage.setItem("contas", JSON.stringify(contas));
    }

    function mostrarPagina(id) {
      document.querySelectorAll('.pagina').forEach(p => p.classList.remove('ativa'));
      document.getElementById(id).classList.add('ativa');
      if (id === 'pizza' || id === 'barra') desenharGraficos();
    }

    function renderizarContas() {
      const container = document.getElementById("contas-container");
      container.innerHTML = "";
      contas.forEach((c, i) => {
        const div = document.createElement("div");
        div.innerHTML = `${c.nome}: R$ ${c.valor.toFixed(2)} (${c.tipo}) <button onclick="removerConta(${i})">Remover</button>`;
        container.appendChild(div);
      });
      atualizarResumo();
    }

    function removerConta(index) {
      contas.splice(index, 1);
      salvarContas();
      renderizarContas();
    }

    document.getElementById("conta-form").addEventListener("submit", e => {
      e.preventDefault();
      const nome = document.getElementById("nome-conta").value.trim();
      const valor = parseFloat(document.getElementById("valor-conta").value);
      const tipo = document.getElementById("tipo-conta").value;
      if (!nome || isNaN(valor)) return;
      contas.push({ nome, valor, tipo });
      salvarContas();
      renderizarContas();
      e.target.reset();
    });

    function atualizarResumo() {
      const ativos = contas.filter(c => c.tipo === "ativo").reduce((acc, c) => acc + c.valor, 0);
      const passivos = contas.filter(c => c.tipo === "passivo").reduce((acc, c) => acc + c.valor, 0);
      const ideal = ativos * 0.3;
      const diff = ideal - passivos;
      document.getElementById("ativos-total").textContent = ativos.toFixed(2);
      document.getElementById("passivos-total").textContent = passivos.toFixed(2);
      document.getElementById("saldo-ideal").textContent = ideal.toFixed(2);
      document.getElementById("recomendacao").textContent = diff > 0 ? `Comprar até R$ ${diff.toFixed(2)}` : `Aguardar`;
    }

    let pizzaChart, barraChart;

    function desenharGraficos() {
      const ativos = contas.filter(c => c.tipo === "ativo").reduce((acc, c) => acc + c.valor, 0);
      const passivos = contas.filter(c => c.tipo === "passivo").reduce((acc, c) => acc + c.valor, 0);

      const ctxPizza = document.getElementById("grafico-pizza").getContext("2d");
      if (pizzaChart) pizzaChart.destroy();
      pizzaChart = new Chart(ctxPizza, {
        type: "pie",
        data: {
          labels: ["Ativos", "Passivos"],
          datasets: [{
            data: [ativos, passivos],
            backgroundColor: ["#4caf50", "#f44336"]
          }]
        }
      });

      const ctxBarra = document.getElementById("grafico-barra").getContext("2d");
      if (barraChart) barraChart.destroy();
      barraChart = new Chart(ctxBarra, {
        type: "bar",
        data: {
          labels: ["Ativos", "Passivos"],
          datasets: [{
            data: [ativos, passivos],
            backgroundColor: ["#2196f3", "#ff9800"]
          }]
        },
        options: {
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
    }

    document.addEventListener("DOMContentLoaded", () => {
      renderizarContas();
      atualizarResumo();
    });
  </script>
</body>
</html>
