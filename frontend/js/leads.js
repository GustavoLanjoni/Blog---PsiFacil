const apiLeads = "/leads";

const listaLeadsAdmin = document.getElementById("listaLeadsAdmin");
const totalLeads = document.getElementById("totalLeads");

async function carregarLeads() {
  try {
    const resposta = await fetch(apiLeads);
    const leads = await resposta.json();

    totalLeads.textContent = `${leads.length} leads`;

    if (leads.length === 0) {
      listaLeadsAdmin.innerHTML = `
        <div class="empty-posts">
          <i data-lucide="inbox"></i>
          <p>Nenhum lead capturado ainda.</p>
        </div>
      `;
      lucide.createIcons();
      return;
    }

    listaLeadsAdmin.innerHTML = "";

    leads.forEach((lead) => {
      listaLeadsAdmin.innerHTML += `
        <div class="lead-card ${lead.enviado ? "lead-enviado" : ""}">
          <div class="lead-info">
            <h3>${lead.nome}</h3>
            <p>${lead.email}</p>
            <small>${new Date(lead.criado_em).toLocaleDateString("pt-BR")}</small>
          </div>

          <label class="lead-check">
            <input
              type="checkbox"
              ${lead.enviado ? "checked" : ""}
              onchange="marcarEnviado(${lead.id}, this.checked)"
            >
            <span>
              ${lead.enviado ? "Ebook enviado" : "Marcar como enviado"}
            </span>
          </label>
        </div>
      `;
    });

  } catch (error) {
    console.error("Erro ao carregar leads:", error);
  }
}

async function marcarEnviado(id, enviado) {
  try {
    const resposta = await fetch(`${apiLeads}/${id}/enviado`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ enviado })
    });

    if (!resposta.ok) {
      alert("Erro ao atualizar status do lead.");
      return;
    }

    carregarLeads();

  } catch (error) {
    console.error(error);
    alert("Erro ao conectar com o servidor.");
  }
}

carregarLeads();