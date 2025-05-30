// app.js

function getContas() {
  return JSON.parse(localStorage.getItem("contas") || "[]");
}

function salvarContas(contas) {
  localStorage.setItem("contas", JSON.stringify(contas));
}

function adicionarConta() {
  const nome = document.getElementById("nome").value.trim();
  const valor = parseFloat(document.getElementById("valor").value);
  const tipo = document.getElementById("tipo").value;

  if (!nome || isNaN(valor)) {
    alert("Preencha corretamente o nome e o valor!");
    return;
  }

  const novaConta = { nome, valor, tipo };
  const contas = getContas();
  contas.push(novaConta);
  salvarContas(contas);
  listarContas();
}

function removerConta(index) {
  const contas = getContas();
  contas.splice(index, 1);
  salvarContas(contas);
  listarContas();
}

function listarContas() {
  const lista = document.getElementById("listaContas");
  if (!lista) return;
  lista.innerHTML = "";
  const contas = getContas();
  contas.forEach((conta, index) => {
    const item = document.createElement("li");
    item.textContent = `${conta.nome}: R$ ${conta.valor.toFixed(2)} (${conta.tipo})`;
    const btn = document.createElement("button");
    btn.textContent = "Remover";
    btn.onclick = () => removerConta(index);
    item.appendChild(btn);
    lista.appendChild(item);
  });
}

listarContas(); // Carrega as contas na página automaticamente