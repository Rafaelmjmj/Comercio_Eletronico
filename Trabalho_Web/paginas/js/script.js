/* ========================== IMAGENS LOCAIS ========================== */
const imagensProdutos = {
  "Camiseta Seleção Brasil": "../imagens/produto1.jpeg",
  "Tênis Ja Morant 3": "../imagens/produto2.jpg",
  "Bola de Vôlei Mikasa": "../imagens/produto3.webp",
  "Camiseta Internacional": "../imagens/produto4.webp",
  "Chuteira Adidas": "../imagens/produto5.webp",
  "Camiseta Vasco da Gama": "../imagens/produto6.avif"
};

/* ========================== VARIÁVEL GLOBAL ========================== */
let produtosCarregados = [];

/* ========================== DOM READY ========================== */
document.addEventListener("DOMContentLoaded", () => {
  verificarLogin();
  atualizarBadgeCarrinho();
  carregarProdutos();
  ativarBusca();
  mostrarCarrinho();
  configurarCadastro();
  configurarLogin();
});

/* ========================== LOGIN / HEADER ========================== */
function verificarLogin() {
  const usuario = localStorage.getItem("usuario");
  const linkCadastrar = document.getElementById("linkCadastrar");
  const linkEntrar = document.getElementById("linkEntrar");
  const linkMeusDados = document.getElementById("linkMeusDados");
  const linkMeusPedidos = document.getElementById("linkMeusPedidos");
  const linkSair = document.getElementById("linkSair");

  if (!linkCadastrar) return;

  if (usuario) {
    linkCadastrar.style.display = "none";
    linkEntrar.style.display = "none";
    linkMeusDados.style.display = "block";
    linkMeusPedidos.style.display = "block";
    linkSair.style.display = "block";
  } else {
    linkCadastrar.style.display = "block";
    linkEntrar.style.display = "block";
    linkMeusDados.style.display = "none";
    linkMeusPedidos.style.display = "none";
    linkSair.style.display = "none";
  }
}

document.getElementById("linkSair")?.addEventListener("click", () => {
  localStorage.removeItem("usuario");
  window.location.href = "index.html";
});

/* ========================== PRODUTOS ========================== */
function carregarProdutos() {
  fetch("dados/produtos.json")
    .then(res => res.json())
    .then(produtos => {
      produtosCarregados = produtos;
      mostrarProdutos(produtos);
      mostrarCarrinho();
    })
    .catch(err => console.error("Erro ao carregar produtos", err));
}

function mostrarProdutos(produtos) {
  const container = document.getElementById("listaProdutos");
  if (!container) return;

  container.innerHTML = "";

  produtos.forEach(produto => {
    const imagem = imagensProdutos[produto.name] || "../imagens/placeholder.jpg";

    container.innerHTML += `
      <div class="col-sm-6 col-md-4">
        <div class="card h-100 shadow-sm">
          <img src="${imagem}" class="card-img-top" alt="${produto.name}">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${produto.name}</h5>
            <p class="fw-bold text-success mt-auto">
              R$ ${produto.price.toFixed(2)}
            </p>
            <button class="btn btn-primary mt-2" onclick="adicionarCarrinho(${produto.id})">
              Adicionar ao carrinho
            </button>
          </div>
        </div>
      </div>
    `;
  });
}

/* ========================== BUSCA ========================== */
function ativarBusca() {
  const campoBusca = document.getElementById("campoBusca");
  if (!campoBusca) return;

  campoBusca.addEventListener("input", () => {
    const termo = campoBusca.value.toLowerCase();
    const filtrados = produtosCarregados.filter(produto =>
      produto.name.toLowerCase().includes(termo)
    );
    mostrarProdutos(filtrados);
  });
}

/* ========================== CARRINHO ========================== */
function adicionarCarrinho(idProduto) {
  let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  const item = carrinho.find(p => p.id === idProduto);

  if (item) item.quantidade++;
  else carrinho.push({ id: idProduto, quantidade: 1 });

  localStorage.setItem("carrinho", JSON.stringify(carrinho));
  atualizarBadgeCarrinho();
  atualizarTotalCarrinho();
}

function atualizarBadgeCarrinho() {
  const badge = document.getElementById("cart-count");
  if (!badge) return;

  const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  const total = carrinho.reduce((soma, item) => soma + item.quantidade, 0);

  badge.textContent = total;
  badge.classList.toggle("d-none", total === 0);
}

function atualizarTotalCarrinho() {
  const totalSpan = document.getElementById("totalCarrinho");
  if (!totalSpan) return;

  const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  let total = 0;

  carrinho.forEach(item => {
    const produto = produtosCarregados.find(p => p.id === item.id);
    if (produto) total += produto.price * item.quantidade;
  });

  // SOMA DO FRETE (se houver)
  const freteSelecionado = document.querySelector('input[name="frete"]:checked');
  const valorFrete = freteSelecionado ? Number(freteSelecionado.value) : 0;

  total += valorFrete;

  totalSpan.textContent = `R$ ${total.toFixed(2).replace(".", ",")}`;
}


function mostrarCarrinho() {
  const container = document.getElementById("listaCarrinho");
  if (!container) return;

  const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  container.innerHTML = "";

  if (carrinho.length === 0) {
    container.innerHTML = "<p class='text-center'>Seu carrinho está vazio.</p>";
    atualizarTotalCarrinho();
    return;
  }

  carrinho.forEach(item => {
    const produto = produtosCarregados.find(p => p.id === item.id);
    if (!produto) return;

    const imagem = imagensProdutos[produto.name] || "../imagens/placeholder.jpg";

    container.innerHTML += `
      <div class="col-md-4">
        <div class="card shadow-sm h-100">
          <img src="${imagem}" class="card-img-top" alt="${produto.name}">
          <div class="card-body">
            <h5 class="card-title">${produto.name}</h5>
            <p class="fw-semibold text-success">
              R$ ${(produto.price * item.quantidade).toFixed(2)}
            </p>
            <button class="btn btn-outline-danger btn-sm" onclick="removerDoCarrinho(${item.id})">
              Remover
            </button>
          </div>
        </div>
      </div>
    `;
  });

  atualizarTotalCarrinho();
}

function removerDoCarrinho(idProduto) {
  let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  carrinho = carrinho.filter(item => item.id !== idProduto);

  localStorage.setItem("carrinho", JSON.stringify(carrinho));
  atualizarBadgeCarrinho();
  mostrarCarrinho();
}

/* ========================== CADASTRO - API ========================== */
function configurarCadastro() {
  const form = document.getElementById("formCadastro");
  const mensagem = document.getElementById("mensagem");
  if (!form) return;

  form.addEventListener("submit", e => {
    e.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;
    const confirma = document.getElementById("confirma").value;

    mensagem.innerHTML = "";

    if (!nome || !email || !senha || !confirma)
      return mostrarErro("Preencha todos os campos.");

    if (senha !== confirma)
      return mostrarErro("As senhas não coincidem.");

    fetch("https://ppw-1-tads.vercel.app/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome,
        email,
        senha,
        confirmacaoSenha: confirma
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.sucesso) {
          mensagem.innerHTML = `<div class="alert alert-success text-center">${data.mensagem}</div>`;
          setTimeout(() => window.location.href = "login.html", 2000);
        } else {
          mostrarErro(data.erro);
        }
      })
      .catch(() => mostrarErro("Erro ao conectar com servidor."));
  });

  function mostrarErro(msg) {
    mensagem.innerHTML = `<div class="alert alert-danger text-center">${msg}</div>`;
  }
}

/* ========================== LOGIN - API ========================== */
function configurarLogin() {
  const formLogin = document.getElementById("formLogin");
  const mensagem = document.getElementById("mensagem");
  if (!formLogin) return;

  formLogin.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("usuario").value.trim(); // AQUI
    const senha = document.getElementById("senha").value;

    mensagem.innerHTML = "";

    if (!email || !senha) {
      mensagem.innerHTML = `
        <div class="alert alert-danger text-center">
          Preencha todos os campos.
        </div>
      `;
      return;
    }

    const payload = { email, senha };
    console.log("Payload login:", payload);

    fetch("https://ppw-1-tads.vercel.app/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        console.log("Resposta login:", data);
        if (data.success) {
          localStorage.setItem("usuario", JSON.stringify(data.usuario));
          window.location.href = "index.html";
        } else {
          mensagem.innerHTML = `
            <div class="alert alert-danger text-center">
              ${data.message}
            </div>
          `;
        }
      })
      .catch(() => {
        mensagem.innerHTML = `
          <div class="alert alert-danger text-center">
            Erro ao conectar com o servidor.
          </div>
        `;
      });
  });
}

/* ==========================
   CÁLCULO DE FRETE - API
========================== */
function calcularFrete() {
  const cepInput = document.getElementById("cep");
  const opcoesDiv = document.getElementById("opcoesFrete");

  if (!cepInput || !opcoesDiv) return;

  const cep = cepInput.value.trim();

  if (!cep) {
    alert("Informe o CEP para calcular o frete.");
    return;
  }

  opcoesDiv.innerHTML = "<p>Calculando frete...</p>";

  fetch("https://ppw-1-tads.vercel.app/api/frete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ cep })
  })
    .then(res => {
      console.log("Status:", res.status);
      return res.json();
    })
    .then(data => {
      console.log("Resposta da API de frete (JSON):", data);

      if (!data.sucesso || !Array.isArray(data.fretes)) {
        opcoesDiv.innerHTML =
          "<p class='text-danger'>Nenhuma opção de frete encontrada.</p>";
        return;
      }

      opcoesDiv.innerHTML = "<h5 class='mt-4'>Opções de Frete</h5>";

      data.fretes.forEach((frete, index) => {
        opcoesDiv.innerHTML += `
          <div class="form-check mt-2">
          <input 
            class="form-check-input" 
            type="radio" 
            name="frete" 
            id="frete${index}" 
            value="${frete.valor}"
            data-descricao="${frete.tipo} (${frete.prazo})"
      >
      <label class="form-check-label" for="frete${index}">
        ${frete.tipo} - ${frete.prazo} — R$ ${frete.valor.toFixed(2)}
      </label>
    </div>
  `;
});
    })
    .catch(err => {
      console.error(err);
      opcoesDiv.innerHTML =
        "<p class='text-danger'>Erro ao conectar com a API de frete.</p>";
    });
}



/* ==========================
   ATUALIZA TOTAL AO ESCOLHER FRETE
========================== */
document.addEventListener("change", e => {
  if (e.target.name === "frete") {
    atualizarTotalCarrinho();
  }
});

/* ==========================
   Finaliza pedido
========================== */

function finalizarPedido() {
  const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  if (carrinho.length === 0) {
    alert("Seu carrinho está vazio.");
    return;
  }

  const freteSelecionado = document.querySelector('input[name="frete"]:checked');
  if (!freteSelecionado) {
    alert("Selecione uma opção de frete.");
    return;
  }

  const produtosPedido = carrinho.map(item => {
    const produto = produtosCarregados.find(p => p.id === item.id);
    return {
      id: produto.id,
      nome: produto.name,
      quantidade: item.quantidade,
      preco: produto.price
    };
  });

  const valorFrete = Number(freteSelecionado.value);
  const descricaoFrete = freteSelecionado.dataset.descricao;

  let totalProdutos = 0;
  produtosPedido.forEach(p => {
    totalProdutos += p.preco * p.quantidade;
  });

  const pedido = {
    data: new Date().toISOString(),
    itens: produtosPedido,
    frete: {
      descricao: descricaoFrete,
      valor: valorFrete
    },
    total: totalProdutos + valorFrete
  };

  const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
  pedidos.push(pedido);

  localStorage.setItem("pedidos", JSON.stringify(pedidos));

  // Limpa carrinho após finalizar
  localStorage.removeItem("carrinho");

  window.location.href = "sucesso-pedido.html";
}
