// PAINEL "HISTORICO DOS MOVIMENTOS": monta a tabela de status a partir dos campos
// IDMOV_numero (2.1.01, valor unico) e historico2102 / historico2201 (2.1.02 / 2.2.01,
// listas separadas por virgula). Nao depende de integracao - e apenas leitura/derivacao
// dos campos que ja existem no card.

function parseListaHistorico(valor) {
    if (!valor) return [];
    return String(valor)
        .split(",")
        .map(function (item) { return item.trim(); })
        .filter(function (item) {
            return item !== "" && item.toLowerCase() !== "null" && item.toLowerCase() !== "undefined";
        });
}

function statusLabelHistorico(status) {
    if (status === "faturado") return "Faturado";
    if (status === "a-faturar") return "A faturar";
    return "Cancelado";
}

function montarLinhasHistoricoMovimentos() {
    var idmov101 = $("#IDMOV_numero").val();
    var lista2102 = parseListaHistorico($("#historico2102").val());
    var lista2201 = parseListaHistorico($("#historico2201").val());

    var $qtdeCancelamento = Number($("#qtdeCancelamentos").val()) || 0;

    var linhas = [];
    var $qtdeRps = lista2102.length;
    var $qtdeFinanceiro = lista2201.length;


    if (idmov101 != null && String(idmov101).trim() !== "") {

        if ($qtdeCancelamento > 0 && ($qtdeCancelamento == $qtdeRps)) {
            linhas.push({ tipo: "2.1.01", numero: String(idmov101).trim(), status: "a-faturar" });
        }
        else if ($qtdeCancelamento > 0 && ($qtdeCancelamento < $qtdeRps)) {
            linhas.push({ tipo: "2.1.01", numero: String(idmov101).trim(), status: "faturado" });
        }
        else if ($qtdeRps > 0) {
            linhas.push({ tipo: "2.1.01", numero: String(idmov101).trim(), status: "faturado" });
        }
        else {
            linhas.push({ tipo: "2.1.01", numero: String(idmov101).trim(), status: "a-faturar" });
        }
    }


    // 2.1.02: todos os RPS entram na tabela. Todos menos o ultimo sao sempre
    // cancelados (foram substituidos por reemissao); o ultimo usa qtdeCancelamento
    // para saber se a reemissao mais recente tambem ja foi cancelada ("a NFS-e errada"
    // acabou de ser marcada, sem novo RPS ainda) ou se ja seguiu para faturamento.
    if (lista2102.length > 0) {
        var status2102Ultimo;
        if ($qtdeCancelamento > 0 && $qtdeCancelamento >= $qtdeRps) {
            status2102Ultimo = "cancelado";
        } else {
            // ultimo 2.1.02 ativo: so e "faturado" se ja existe o 2.2.01 correspondente
            status2102Ultimo = $qtdeFinanceiro >= $qtdeRps ? "faturado" : "a-faturar";
        }

        for (var i = 0; i < lista2102.length; i++) {
            var ultimo2102 = i === lista2102.length - 1;
            linhas.push({ tipo: "2.1.02", numero: lista2102[i], status: ultimo2102 ? status2102Ultimo : "cancelado" });
        }
    }

    // 2.2.01: mesma regra - todos menos o ultimo titulo financeiro sao cancelados
    // quando uma nova reemissao os substitui.
    if (lista2201.length > 0) {
        var status2201Ultimo = ($qtdeCancelamento > 0 && $qtdeCancelamento >= $qtdeFinanceiro) ? "cancelado" : "faturado";

        for (var j = 0; j < lista2201.length; j++) {
            var ultimo2201 = j === lista2201.length - 1;
            linhas.push({ tipo: "2.2.01", numero: lista2201[j], status: ultimo2201 ? status2201Ultimo : "cancelado" });
        }
    }

    return linhas;
}

function countTipoAtividade() {
    var $atividade = String($("#atividade").val()).trim();

    var $qtdeCancelamentosElement = $("#qtdeCancelamentos");

    var $qtdeCancelamentos = Number(String($qtdeCancelamentosElement.val()).trim()) || 0;

    if ($atividade == 375) {
        $qtdeCancelamentos += 1;

        $($qtdeCancelamentosElement).val($qtdeCancelamentos);
    }
}

function renderizarHistoricoMovimentos() {
    var linhas = montarLinhasHistoricoMovimentos();
    var corpo = $("#tblHistoricoMovimentosBody");

    if (!corpo.length) return;

    corpo.empty();

    if (linhas.length === 0) {
        corpo.append('<tr><td colspan="3" class="text-center">Nenhum movimento encontrado</td></tr>');
        return;
    }

    linhas.forEach(function (linha) {
        var tr = $("<tr></tr>");
        tr.append($("<td></td>").text(linha.tipo));
        tr.append($("<td></td>").text(linha.numero));
        tr.append(
            $("<td></td>").append(
                $("<span></span>")
                    .addClass("historico-status historico-status-" + linha.status)
                    .text(statusLabelHistorico(linha.status))
            )
        );
        corpo.append(tr);
    });
}

function atualizaMovimnentoManualmente(campo) {

    console.log("ENTROU NA FUNCAO")

    var moviment2201Manual = String($(campo).val() || "").trim();

    var $historicoAtualMovimento = $("#historicoNumMov2201");

    console.log("atualizou o campo de historico")

    $historicoAtualMovimento.val(moviment2201Manual);


    if (moviment2201Manual !== "") {
        var $historico2201 = $("#historico2201");
        var listaAtual = parseListaHistorico($historico2201.val());

        if (listaAtual.indexOf(moviment2201Manual) === -1) {
            listaAtual.push(moviment2201Manual);
            $historico2201.val(listaAtual.join(","));
        }
    }

    var $historicoAtualMovimentoChecagemn = $("#historicoNumMov2201").val();

    console.log("checando o campo de historico -> ", $historicoAtualMovimentoChecagemn);

    renderizarHistoricoMovimentos();

    console.log("Historico atualizado")
}
