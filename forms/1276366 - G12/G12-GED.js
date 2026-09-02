function buscarInfoGed() {
    var codColigada = $("#CodColigada").val();
    var idprj = $("#idprj").val();
    var idmov = $("#IdMov").val();
    var idContrato = $("#idContrato").val();
    var revisao = $("#revisaoProjeto").val();
    var periodoMedicaoFinal;

    console.log("COLIGADA GED - > " + codColigada);
    console.log("IDPRJ DO GED - > " + idprj);
    console.log("IDMOV DO GED - > " + idmov);
    console.log("ID DO CONTRATO DO GED - > " + idContrato);
    console.log("REVISAO DO GED - > " + revisao);
    console.log("PERIODO DO GED - > " + (periodoMedicaoFinal || "0"));




    try {




        var dataset = DatasetFactory.getDataset("G12-PERIODOS-MEDICAO", null, [
            DatasetFactory.createConstraint("IDMOV", idmov, idmov, ConstraintType.MUST),
            DatasetFactory.createConstraint("CODCOLIGADA", codColigada, codColigada, ConstraintType.MUST)
        ], null);


        if (dataset == null || dataset.values.length == 0) {
            console.warn("[G12-GED] Nenhum tributo retornado. CodColigada=" + codColigada + "  Idmov=" + idmov + " idContrato=" + idContrato);
            return;
        }

        for (var index = 0; index < dataset.values.length; index++) {
            periodoMedicaoFinal = dataset.values[index]["PERIODOMED"];




        }

        $("#periodoMedicao").val(periodoMedicaoFinal);



    } catch (error) {
        console.error("G12-GED - > ERRO AO BUSCAR O PERIODO DE MEDICAO DO CONTRATO PARA BUSCA NO GED")
        throw error;
    }

    try {


        console.log("COLIGADA GED 2 - > " + codColigada);
        console.log("IDPRJ DO GED 2 - > " + idprj);
        console.log("IDMOV DO GED 2 - > " + idmov);
        console.log("ID DO CONTRATO DO GED 2 - > " + idContrato);
        console.log("REVISAO DO GED 2 - > " + revisao);
        console.log("PERIODO DO GED 2 - > " + (periodoMedicaoFinal || "0"));

        var valoresGuardados = new Array();

        var dataset = DatasetFactory.getDataset("G12-GED", null, [
            DatasetFactory.createConstraint("CODCOLIGADA", codColigada, codColigada, ConstraintType.MUST),
            DatasetFactory.createConstraint("IDPRJ", idprj, idprj, ConstraintType.MUST),
            DatasetFactory.createConstraint("IDCONTRATO", idContrato, idContrato, ConstraintType.MUST),
            DatasetFactory.createConstraint("PERIODO", periodoMedicaoFinal, periodoMedicaoFinal, ConstraintType.MUST),
            DatasetFactory.createConstraint("REVISAO", revisao, revisao, ConstraintType.MUST)
        ], null);


        if (dataset == null || dataset.values.length == 0) {
            console.warn("[G12-GED] Nenhum tributo retornado. CodColigada=" + codColigada + "  Idprj=" + idprj + " idContrato=" + idContrato + " periodo=" + periodoMedicaoFinal);
            return;
        }

        for (var index = 0; index < dataset.values.length; index++) {
            var nomePasta = dataset.values[index]["NOMEPASTA"];
            var codigoDocumento = dataset.values[index]["CODDOCUMENTO"];
            var descricao = dataset.values[index]["DESCRICAO"];

            var info = nomePasta + "|" + codigoDocumento + "|" + descricao

            valoresGuardados.push(info);

        }

        $("#gedInfo").val(valoresGuardados.join(";"));


    } catch (error) {
        console.error("G12-GED - > ERRO AO BUSCAR OS DADOS")
        throw error;
    }
}

function GED() {

    var infoGed = $("#gedInfo").val();
    var arrayGed = infoGed.split(";");

    var periodosContrato = $("#periodoMedicao").val();

    console.log("PERIODOS ENCONTRADOS NO FINAL", periodosContrato);

    $("#gedAnexos").empty();

    var htmlFinal = "<div class='ged-wrapper'>";


    var periodoAtual = periodosContrato;
    console.log("PERIODO DA VEZ ->", periodoAtual);

    var linhasPeriodo = "";
    var totalAnexos = 0;

    for (var j = 0; j < arrayGed.length; j++) {

        var partes = arrayGed[j].split("|");
        var codigoPasta = String(partes[0] || "");
        var codDocumentFolder = String(partes[1] || "");
        var documentDescription = String(partes[2] || "");

        if (codigoPasta.indexOf(periodoAtual) !== -1) {

            console.log("CODIGO DA PASTA", codigoPasta, "-> MATCH com periodo", periodoAtual);
            console.log("CODIGO DO DOCUMENTO", codDocumentFolder);
            console.log("DESCRICAO DO DOCUMENTO", documentDescription);

            var urlVisualizacao = "https://gennesisengenharia160516.fluig.cloudtotvs.com.br:443/portal/p/1/ecmnavigation?app_ecm_navigation_doc=" + codDocumentFolder;

            console.log("URL VISUALIZACAO ->", urlVisualizacao);

            totalAnexos++;

            linhasPeriodo += "" +
                "<div class='ged-item'>" +
                "<div class='ged-item-icon'><i class='fa fa-file-text-o'></i></div>" +
                "<div class='ged-item-nome' title='" + documentDescription + "'>" + documentDescription + "</div>" +
                "<a href='" + urlVisualizacao + "' target='_blank' class='ged-item-btn'>" +
                "<i class='fa fa-eye'></i> Visualizar Documento GED" +
                "</a>" +
                "</div>";
        }
    }

    var temAnexos = totalAnexos > 0;

    htmlFinal += "<div class='ged-card" + (temAnexos ? "" : " ged-card-vazio") + "'>";
    htmlFinal += "" +
        "<div class='ged-card-header'>" +
        "<span class='ged-card-titulo'><i class='fa fa-folder-open-o'></i> Período " + periodoAtual + "</span>" +
        "<span class='ged-card-badge'>" + totalAnexos + (totalAnexos === 1 ? " anexo" : " anexos") + "</span>" +
        "</div>";

    if (temAnexos) {
        htmlFinal += "<div class='ged-card-body'>" + linhasPeriodo + "</div>";
    } else {
        htmlFinal += "" +
            "<div class='ged-card-body ged-card-body-vazio'>" +
            "<i class='fa fa-info-circle'></i> Nenhum anexo encontrado para este período." +
            "</div>";
    }

    htmlFinal += "</div>";


    htmlFinal += "</div>";

    $("#gedAnexos").html(htmlFinal);
}

$(document).ready(function () {
    buscarInfoGed();
    setTimeout(GED, 1000);
});