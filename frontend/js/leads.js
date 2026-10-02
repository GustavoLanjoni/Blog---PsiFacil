const apiLeads = "/leads";


/* =========================================================
   ELEMENTOS
========================================================= */

const listaLeadsAdmin =
    document.getElementById(
        "listaLeadsAdmin"
    );


const totalLeads =
    document.getElementById(
        "totalLeads"
    );


/* =========================================================
   TOKEN ADMIN
========================================================= */

function obterTokenAdmin() {

    return localStorage.getItem(
        "tokenAdmin"
    );

}


/* =========================================================
   ESCAPAR HTML
========================================================= */

function escaparHtmlLead(valor) {

    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =========================================================
   FORMATAR DATA
========================================================= */

function formatarDataLead(data) {

    if (!data) {

        return "Data não informada";

    }


    const objetoData =
        new Date(data);


    if (
        Number.isNaN(
            objetoData.getTime()
        )
    ) {

        return "Data não informada";

    }


    return objetoData.toLocaleDateString(
        "pt-BR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );

}


/* =========================================================
   EXTRAIR ARRAY DE LEADS
========================================================= */

function extrairLeads(resultado) {

    /*
       Caso a API retorne diretamente:

       [
           {...},
           {...}
       ]
    */

    if (
        Array.isArray(
            resultado
        )
    ) {

        return resultado;

    }


    /*
       Caso retorne:

       {
           leads: [...]
       }
    */

    if (
        Array.isArray(
            resultado?.leads
        )
    ) {

        return resultado.leads;

    }


    /*
       Caso retorne:

       {
           dados: [...]
       }
    */

    if (
        Array.isArray(
            resultado?.dados
        )
    ) {

        return resultado.dados;

    }


    /*
       Se nenhuma estrutura conhecida existir,
       devolvemos um array vazio.
    */

    return [];

}


/* =========================================================
   ÍCONES
========================================================= */

function atualizarIconesLeads() {

    if (window.lucide) {

        lucide.createIcons();

    }

}


/* =========================================================
   ESTADO DE CARREGAMENTO
========================================================= */

function mostrarCarregamentoLeads() {

    if (!listaLeadsAdmin) {

        return;

    }


    listaLeadsAdmin.innerHTML = `

        <div class="leads-loading-state">

            <i data-lucide="loader-circle"></i>

            <div>

                <strong>
                    Carregando leads...
                </strong>

                <span>
                    Aguarde um momento.
                </span>

            </div>

        </div>

    `;


    atualizarIconesLeads();

}


/* =========================================================
   ESTADO VAZIO
========================================================= */

function mostrarLeadsVazios() {

    if (!listaLeadsAdmin) {

        return;

    }


    listaLeadsAdmin.innerHTML = `

        <div class="leads-empty-state">

            <div class="leads-empty-icon">

                <i data-lucide="inbox"></i>

            </div>

            <strong>
                Nenhum lead capturado ainda
            </strong>

            <p>
                Quando alguém solicitar o ebook,
                os dados aparecerão aqui.
            </p>

        </div>

    `;


    atualizarIconesLeads();

}


/* =========================================================
   ESTADO DE ERRO
========================================================= */

function mostrarErroLeads(
    mensagem =
        "Não foi possível carregar os leads."
) {

    if (!listaLeadsAdmin) {

        return;

    }


    listaLeadsAdmin.innerHTML = `

        <div class="leads-empty-state">

            <div class="leads-empty-icon">

                <i data-lucide="circle-alert"></i>

            </div>

            <strong>
                Não foi possível carregar
            </strong>

            <p>
                ${escaparHtmlLead(mensagem)}
            </p>

            <button
                type="button"
                class="leads-retry-button"
                onclick="carregarLeads()"
            >

                <i data-lucide="refresh-cw"></i>

                Tentar novamente

            </button>

        </div>

    `;


    atualizarIconesLeads();

}


/* =========================================================
   TOTAL
========================================================= */

function atualizarTotalLeads(
    quantidade
) {

    if (!totalLeads) {

        return;

    }


    /*
       Agora mostramos apenas o número porque
       o card já diz "Total de leads".
    */

    totalLeads.textContent =
        String(
            quantidade
        );

}


/* =========================================================
   CRIAR CARD
========================================================= */

function criarCardLead(
    lead
) {

    const id =
        Number(
            lead.id
        );


    const nome =
        escaparHtmlLead(
            lead.nome ||
            "Nome não informado"
        );


    const email =
        escaparHtmlLead(
            lead.email ||
            lead["e-mail"] ||
            "E-mail não informado"
        );


    const data =
        formatarDataLead(
            lead.criado_em
        );


    const enviado =
        Boolean(
            lead.enviado
        );


    const classeEnviado =
        enviado
            ? "lead-enviado"
            : "";


    const textoStatus =
        enviado
            ? "Ebook enviado"
            : "Aguardando envio";


    const textoAcao =
        enviado
            ? "Ebook enviado"
            : "Marcar como enviado";


    const iconeStatus =
        enviado
            ? "circle-check"
            : "clock-3";


    return `

        <article
            class="lead-card ${classeEnviado}"
            data-lead-id="${id}"
        >


            <!-- =================================
                 IDENTIFICAÇÃO
            ================================== -->

            <div class="lead-info">


                <div class="lead-avatar">

                    <i data-lucide="user"></i>

                </div>


                <div class="lead-info-text">

                    <h3>
                        ${nome}
                    </h3>

                    <a
                        href="mailto:${email}"
                        class="lead-email"
                    >
                        ${email}
                    </a>

                    <small>

                        <i data-lucide="calendar-days"></i>

                        ${data}

                    </small>

                </div>


            </div>



            <!-- =================================
                 STATUS
            ================================== -->

            <div class="lead-status-area">

                <span
                    class="
                        lead-status
                        ${enviado
                            ? "is-enviado"
                            : "is-pendente"
                        }
                    "
                >

                    <i data-lucide="${iconeStatus}"></i>

                    ${textoStatus}

                </span>

            </div>



            <!-- =================================
                 AÇÃO
            ================================== -->

            <label
                class="
                    lead-check
                    ${enviado
                        ? "is-checked"
                        : ""
                    }
                "
            >

                <input
                    type="checkbox"
                    ${enviado ? "checked" : ""}
                    onchange="
                        marcarEnviado(
                            ${id},
                            this.checked,
                            this
                        )
                    "
                >

                <span class="lead-check-box">

                    <i data-lucide="check"></i>

                </span>


                <span class="lead-check-text">
                    ${textoAcao}
                </span>

            </label>


        </article>

    `;

}


/* =========================================================
   RENDERIZAR LEADS
========================================================= */

function renderizarLeads(
    leads
) {

    if (!listaLeadsAdmin) {

        return;

    }


    atualizarTotalLeads(
        leads.length
    );


    if (
        leads.length === 0
    ) {

        mostrarLeadsVazios();

        return;

    }


    listaLeadsAdmin.innerHTML =
        leads
            .map(
                criarCardLead
            )
            .join("");


    atualizarIconesLeads();

}


/* =========================================================
   CARREGAR LEADS
========================================================= */

async function carregarLeads() {

    mostrarCarregamentoLeads();


    try {

        const tokenAdmin =
            obterTokenAdmin();


        const headers = {};


        /*
           Se sua rota já estiver protegida,
           o token será enviado.

           Se ela ainda for pública, isso
           também não atrapalha.
        */

        if (tokenAdmin) {

            headers.Authorization =
                `Bearer ${tokenAdmin}`;

        }


        const resposta =
            await fetch(
                apiLeads,
                {
                    method: "GET",
                    headers
                }
            );


        const resultado =
            await resposta
                .json()
                .catch(
                    () => null
                );


        if (!resposta.ok) {

            throw new Error(
                resultado?.erro ||
                resultado?.mensagem ||
                "Não foi possível carregar os leads."
            );

        }


        const leads =
            extrairLeads(
                resultado
            );


        console.log(
            "Leads carregados:",
            leads
        );


        renderizarLeads(
            leads
        );


    } catch (error) {

        console.error(
            "Erro ao carregar leads:",
            error
        );


        atualizarTotalLeads(
            0
        );


        mostrarErroLeads(
            error.message
        );

    }

}


/* =========================================================
   MARCAR COMO ENVIADO
========================================================= */

async function marcarEnviado(
    id,
    enviado,
    checkbox = null
) {

    const tokenAdmin =
        obterTokenAdmin();


    /*
       Evita clique repetido enquanto
       atualizamos o servidor.
    */

    if (checkbox) {

        checkbox.disabled = true;

    }


    try {

        const headers = {

            "Content-Type":
                "application/json"

        };


        if (tokenAdmin) {

            headers.Authorization =
                `Bearer ${tokenAdmin}`;

        }


        const resposta =
            await fetch(
                `${apiLeads}/${id}/enviado`,
                {
                    method:
                        "PATCH",

                    headers,

                    body:
                        JSON.stringify({
                            enviado
                        })
                }
            );


        const resultado =
            await resposta
                .json()
                .catch(
                    () => ({})
                );


        if (!resposta.ok) {

            throw new Error(
                resultado.erro ||
                resultado.mensagem ||
                "Não foi possível atualizar o status do lead."
            );

        }


        /*
           Recarregamos para garantir que
           a interface reflita exatamente
           o que ficou salvo no banco.
        */

        await carregarLeads();


    } catch (error) {

        console.error(
            "Erro ao atualizar lead:",
            error
        );


        /*
           Se falhar, voltamos visualmente
           o checkbox ao estado anterior.
        */

        if (checkbox) {

            checkbox.checked =
                !enviado;

            checkbox.disabled =
                false;

        }


        alert(
            error.message ||
            "Erro ao conectar com o servidor."
        );

    }

}


/* =========================================================
   DISPONIBILIZAR FUNÇÕES
========================================================= */

window.carregarLeads =
    carregarLeads;


window.marcarEnviado =
    marcarEnviado;


/* =========================================================
   INICIAR
========================================================= */

carregarLeads();