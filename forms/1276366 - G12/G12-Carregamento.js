
var MAPA_CAMPOS = {
    // Identificação
    "COLIGADA": "coligada",
    "FILIAL": "filial",
    "IDMOV": "IDMOV_numero",
    "IDPRJ": "idprj",
    "CNPJ_CLIENTE": "cnpjCliente",
    "CENTRO_DE_CUSTO": "centro_de_custo",
    "CODIGO_DO_PROJETO": "codigo_do_projeto",
    "DESCRICAO_PROJETO": "descricao_projeto",
    "RUA_PROJETO": "rua_projeto",
    "NUMERO_ENDERECO_PROJETO": "numero_endereco_projeto",
    "BAIRRO_PROJETO": "bairro_projeto",
    "COMPLEMENTO_PROJETO": "complemento_projeto",
    "CIDADE_PROJETO": "cidade_projeto",
    "ESTADO_PROJETO": "estado_projeto",
    // Contrato
    "NUMERO_CONTRATO": "numero_contrato",
    "TIPO_CONTRATO": "tipo_contrato",
    "NUMERO_LICITACAO": "numero_licitacao",
    "CODIGO_CLIENTE": "codigo_cliente",
    "DATA_CONTRATO": "data_contrato",
    "DATA_INICIO_CONTRATO": "data_inicio_contrato",
    "DATA_TERMINO": "data_termino",
    "PERIODICIDADE_MEDICAO": "periodicidade_medicao",
    "CONDICAO_PAGAMENTO": "condicao_pagamento",
    "NOME_PRODUTO": "nome_produto",
    "CODIGO_PRODUTO": "codigo_produto",
    "NUMERO_MOVIMENTO": "NumeroMov",
    "CNPJ_EMPRESA": "cnpj",
    // Prestador (campos hidden — GFILIAL)
    "NOME_PRESTADOR": "nomePrestador",
    "INCRICAO_PRESTADOR": "incricaoPrestador",
    "TELEFONE_PRESTADOR": "telefonePrestador",
    "EMAIL_PRESTADOR": "emailPrestador",
    "RUA_PRESTADOR": "ruaPrestador",
    "NUMERO_PRESTADOR": "numeroPrestador",
    "BAIRRO_PRESTADOR": "bairroPrestador",
    "CIDADE_PRESTADOR": "cidadePrestador",
    "ESTADO_PRESTADOR": "estadoPrestador",
    "CEP_PRESTADOR": "cepPrestador",
    // Tomador (campos hidden — FCFO)
    "INSCRICAO_TOMADOR": "incricaoTomador",
    "TELEFONE_TOMADOR": "telefoneTomador",
    "NOME_TOMADOR": "nomeEmpresarial",
    "EMAIL_TOMADOR": "emailTomador",
    "RUA_TOMADOR": "ruaTomador",
    "NUMERO_TOMADOR": "numeroTomador",
    "BAIRRO_TOMADOR": "bairroTomador",
    "CIDADE_TOMADOR": "cidadeTomador",
    "CEP_TOMADOR": "cepTomador",
    // Local IBS (TMOV)
    "COD_MUNI_IBS": "codMuniIbs",
    "COD_UF_IBS": "codUfIbs",
    // Item (TITMMOV)
    "UNIDADE_ITEM": "unidadeItem",
    "QUANTIDADE_ITEM": "quantidadeItem",
    // Tributação
    "TRIBUTOS_NACIONAIS": "tributosNacionais",
    "NATUREZA_ORCAMENTARIA": "naturezaOrcamentaria",
    "IRRF_DO_ITEM": "irrfDoItem",
    "INSS_DO_ITEM": "inssDoItem",
    "TRIBUTOS_MUNICIPAIS": "tributosMunicipais",
    // Histórico
    "INFORMACOES_COMPLEMENTARES_NOTA": "informacoesComplementaresNota"
};



function parseTributosNacionais(raw) {
    var resultado = [];
    if (!raw || !raw.trim()) return resultado;
    var entradas = raw.split(" | ");
    for (var i = 0; i < entradas.length; i++) {
        var e = entradas[i].trim();
        if (!e) continue;
        var m = e.match(/C[ÓO]DIGO:\s*(.+?)\s+-\s+VALOR:\s*(.+?)\s+-\s+ALIQUOTA:\s*(.+?)\s+-\s+BASE:\s*(.+)/i);
        if (m) {
            resultado.push({
                codigo: m[1].trim(),
                valor: m[2].trim(),
                aliquota: m[3].trim(),
                base: m[4].trim()
            });
        }
    }
    return resultado;
}

function parseTributosMunicipais(raw) {
    if (!raw) return [];
    var parts = raw.split("|");
    var result = [];
    for (var i = 0; i < parts.length; i++) {
        var part = parts[i].trim();
        if (!part) continue;

        var m = part.match(
            /CODIGO:(.+?)\s*-\s*ALIQUOTA:([\d.]*)\s*-\s*BASE REDUCAO ISS\(%\):([\d.]*)/
        );
        if (m) {
            result.push({
                codigo: m[1].trim(),
                aliquota: m[2].trim() || "—",
                fator: m[3].trim() || "—"
            });
        }
    }
    return result;
}


// RENDERIZAÇÃO DAS TABELAS NA PÁGINA (chamado por preencherFormulario)


function renderizarTabelasTributacao(rawNac, rawMun, natureza) {
    var $nat = $("#naturezaOrcamentariaDisplay");
    if ($nat.length) $nat.text(natureza || "—");

    var tributosNac = parseTributosNacionais(rawNac);
    var $cNac = $("#tabelaTributosNacionais");
    if ($cNac.length) {
        if (!tributosNac.length) {
            $cNac.html("<p class='text-muted'>Nenhum tributo nacional registrado.</p>");
        } else {
            var h = "<table class='table table-bordered table-condensed table-hover'>";
            h += "<thead><tr><th>Código</th><th>Valor</th><th>Alíquota</th><th>Base de Cálculo</th></tr></thead><tbody>";
            for (var i = 0; i < tributosNac.length; i++) {
                var t = tributosNac[i];
                h += "<tr><td>" + (t.codigo || "—") + "</td><td>" + (t.valor || "—") +
                    "</td><td>" + (t.aliquota || "—") + "</td><td>" + (t.base || "—") + "</td></tr>";
            }
            h += "</tbody></table>";
            $cNac.html(h);
        }
    }

    var tributosMun = parseTributosMunicipais(rawMun);
    var $cMun = $("#tabelaTributosMunicipais");
    if ($cMun.length) {
        if (!tributosMun.length) {
            $cMun.html("<p class='text-muted'>Nenhum tributo municipal registrado.</p>");
        } else {
            var hm = "<table class='table table-bordered table-condensed table-hover'>";
            hm += "<thead><tr><th>Código</th><th>Alíquota</th><th>Base Redução ISS (%)</th></tr></thead><tbody>";
            for (var j = 0; j < tributosMun.length; j++) {
                var tm = tributosMun[j];
                hm += "<tr><td>" + (tm.codigo || "—") + "</td><td>" + (tm.aliquota || "—") +
                    "</td><td>" + (tm.fator || "—") + "</td></tr>";
            }
            hm += "</tbody></table>";
            $cMun.html(hm);
        }
    }
}



function preencherFormulario(ds) {

    if (!ds || ds.rowsCount === 0) {
        mostrarErro("Dataset retornou vazio. Verifique IDMOV e CodColigada.");
        return;
    }


    for (var coluna in MAPA_CAMPOS) {
        var idCampo = MAPA_CAMPOS[coluna];
        var valor = ds.getValue(0, coluna);
        $("#" + idCampo).val(valor || "CAMPO NAO PREENCHIDO");
    }


    // Compõe endereços compostos (usados como fallback pelo G12-NF-e.js)
    var ruaP = ds.getValue(0, "RUA_PRESTADOR") || "";
    var numP = ds.getValue(0, "NUMERO_PRESTADOR") || "";
    var baiP = ds.getValue(0, "BAIRRO_PRESTADOR") || "";
    $("#enderecoPrestador").val([ruaP, numP, baiP].filter(Boolean).join(", "));
    $("#municipioPrestador").val(ds.getValue(0, "CIDADE_PRESTADOR") || "");
    $("#nomeEmpresarialPrestador").val(ds.getValue(0, "NOME_PRESTADOR") || "");
    $("#inscricaoMunicipalPrestador").val(ds.getValue(0, "INCRICAO_PRESTADOR") || "");

    var ruaT = ds.getValue(0, "RUA_TOMADOR") || "";
    var numT = ds.getValue(0, "NUMERO_TOMADOR") || "";
    var baiT = ds.getValue(0, "BAIRRO_TOMADOR") || "";
    $("#enderecoTomador").val([ruaT, numT, baiT].filter(Boolean).join(", "));
    $("#municipioTomador").val(ds.getValue(0, "CIDADE_TOMADOR") || "");

    // Preenche os <p> de exibição no painel de tributação
    $("#irrfDisplay").text(ds.getValue(0, "IRRF_DO_ITEM") || "—");
    $("#inssDisplay").text(ds.getValue(0, "INSS_DO_ITEM") || "—");

    renderizarTabelasTributacao(
        ds.getValue(0, "TRIBUTOS_NACIONAIS") || "",
        ds.getValue(0, "TRIBUTOS_MUNICIPAIS") || "",
        ds.getValue(0, "NATUREZA_ORCAMENTARIA") || ""
    );
}

function mostrarErro(msg) {
    $("#loadingDados").hide();
    $("#msgErro").text(msg);
    $("#erroDados").show();
}

function carregarDadosContrato(codColigada, idMov) {
    $("#loadingDados").show();
    $("#erroDados").hide();

    try {
        var constraints = [
            DatasetFactory.createConstraint("CODCOLIGADA", codColigada, codColigada, ConstraintType.MUST),
            DatasetFactory.createConstraint("IDMOV", idMov, idMov, ConstraintType.MUST)
        ];

        var ds = DatasetFactory.getDataset("G12-CARREGAR-DADOS", null, constraints, null);

        $("#loadingDados").hide();

        if (ds && ds.getValue(0, "ERROR") != null && ds.getValue(0, "ERROR") != "") {
            mostrarErro(ds.getValue(0, "ERROR"));
            return;
        }

        preencherFormulario(ds);

    } catch (e) {
        mostrarErro("Erro ao chamar dataset: " + String(e));
    }
}


// Indica que estamos em modo de visualização e precisamos aguardar o Fluig
// restaurar os campos antes de renderizar (a restauração é assíncrona).
var _aguardandoRestauracao = false;

function onLoad() {
    setTimeout(_renderizarVisuais, 500);
}

function onLoadView() {
    _aguardandoRestauracao = true;
    setTimeout(_renderizarVisuais, 500);
}

function _renderizarVisuais(tentativas) {
    tentativas = tentativas || 0;

    var rawNac = $("#tributosNacionais").val() || "";
    var rawMun = $("#tributosMunicipais").val() || "";
    var natureza = $("#naturezaOrcamentaria").val() || "";
    var irrf = $("#irrfDoItem").val() || "—";
    var inss = $("#inssDoItem").val() || "—";

    // Em modo de visualização, o Fluig restaura os campos de forma assíncrona.
    // Usa numero_contrato como sentinela: enquanto estiver vazio, os dados
    // ainda não chegaram — reagenda com backoff até 8 tentativas (~4 s total).
    if (_aguardandoRestauracao && tentativas < 8 && !$("#numero_contrato").val()) {
        setTimeout(function () { _renderizarVisuais(tentativas + 1); }, 500);
        return;
    }

    _aguardandoRestauracao = false;

    $("#irrfDisplay").text(irrf);
    $("#inssDisplay").text(inss);

    renderizarTabelasTributacao(rawNac, rawMun, natureza);

    console.log("[G12] Visuais renderizados (tentativa " + (tentativas + 1) + ") | tributosNacionais=" + rawNac.length +
        " chars | tributosMunicipais=" + rawMun.length + " chars");
}
