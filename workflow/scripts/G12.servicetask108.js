function servicetask108(attempt, message) {

    var codigoMunicio = hAPI.getCardValue("codigoMunicipio");
    var estadoMunicipio = hAPI.getCardValue("estado_projeto");
    var codColigada = hAPI.getCardValue("CodColigada");
    var codFilial = hAPI.getCardValue("filial") || "1";
    var idmovMovimento02 = hAPI.getCardValue("idmov2");
    var municipio = hAPI.getCardValue("cidade_projeto");
    var idprd = hAPI.getCardValue("IDPRD");

    var usuario_rm = getConstante("rm_usuario");
    var senha_rm = getConstante("rm_senha");

    log.info("[G12-AjustarTributosMunicipais] Iniciando - CODCOLIGADA=" + codColigada);


    var tributos = [];
    var i = 1;

    while (true) {
        var sufixo = "___" + i;
        var codtrbN = hAPI.getCardValue("impostos_selecao_municipal" + sufixo);

        if (codtrbN == null || codtrbN == "" || codtrbN == "null" || codtrbN == undefined) break;

        var aliqN = hAPI.getCardValue("aliquotaMunicipal" + sufixo);
        var reduN = hAPI.getCardValue("baseReucaoMunicipal" + sufixo);

        tributos.push({
            codtrb: String(codtrbN).trim(),
            aliquota: aliqN ? String(aliqN).replace(",", ".") : "0.0000",
            reducao: reduN ? String(reduN).replace(",", ".") : "0.0000"
        });

        log.info("[G12-AjustarTributosMunicipais] Tributo coletado: " + String(codtrbN).trim() + " aliquota=" + aliqN);

        i++;
        if (i > 50) break;
    }

    log.info("[G12-AjustarTributosMunicipais] Total tributos: " + tributos.length);

    if (tributos.length === 0) {
        log.warn("[G12-AjustarTributosMunicipais] Nenhum tributo encontrado. Abortando.");
        return;
    }

    try {
        var servico = ServiceManager.getService("RMWsDataServer");
        var instancia = servico.instantiate("com.totvs.WsDataServer");
        var ws = instancia.getRMIwsDataServer();

        var properties = {};
        properties['basic.authorization'] = 'true';
        properties['basic.authorization.username'] = usuario_rm;
        properties['basic.authorization.password'] = senha_rm;
        properties['disable.chunking'] = 'true';
        properties['log.soap.messages'] = 'true';
        properties['receive.timeout'] = '180000';

        var authService = servico.getCustomClient(ws, properties, []);
        var contexto = "CODCOLIGADA=" + codColigada + ";CODFILIAL=" + codFilial + ";CODSISTEMA=T;CODUSUARIO=fluig";

        for (var t = 0; t < tributos.length; t++) {
            log.info("[G12-AjustarTributosMunicipais] Enviando tributo[" + t + "]: " + JSON.stringify(tributos[t]));

            var xmlFinal =
                "<FisTrbMunicipioPrd>" +
                "<DTrbMunicipioPrd>" +
                "<CODCOLIGADA>" + codColigada + "</CODCOLIGADA>" +
                "<CODMUNICIPIO>" + codigoMunicio + "</CODMUNICIPIO>" +
                "<CODETDMUNICIPIO>" + estadoMunicipio + "</CODETDMUNICIPIO>" +
                "<CODTRB>" + tributos[t].codtrb + "</CODTRB>" +
                "<IDPRD>" + idprd + "</IDPRD>" +
                "<ALIQUOTA>" + formatarParaRM(tributos[t].aliquota) + "</ALIQUOTA>" +
                "<FATORISS>" + formatarParaRM(tributos[t].reducao) + "</FATORISS>" +
                "</DTrbMunicipioPrd>" +
                "</FisTrbMunicipioPrd>";

            var resultado = authService.saveRecord("FisTrbMunicipioPrdData", xmlFinal, contexto);
            log.info("[G12-AjustarTributosMunicipais] Resultado " + tributos[t].codtrb + ": " + resultado);


            if (resultado && String(resultado).indexOf("Exception") !== -1) {
                throw new Error("Erro retornado pelo RM: " + resultado);
            }

            if (resultado && String(resultado).indexOf("Error") !== -1) {
                throw new Error("Erro retornado pelo RM: " + resultado);
            }
        }

    } catch (e) {
        log.error("[G12-AjustarTributosMunicipais] Erro: " + String(e));
        throw e;
    }


    try {
        var c1 = DatasetFactory.createConstraint("CODCOLIGADA", codColigada, codColigada, ConstraintType.MUST);
        var c2 = DatasetFactory.createConstraint("IDMOV", idmovMovimento02, idmovMovimento02, ConstraintType.MUST);
        var c3 = DatasetFactory.createConstraint("NOMEMUNICIPIO", municipio, municipio, ConstraintType.MUST);

        var dataset = DatasetFactory.getDataset("G12-TRIBUTOS-MUNICIPAIS", null, [c1, c2, c3], null);


        if (dataset == null || dataset.rowsCount == 0) {
            log.warn("[G12] Nenhum tributo retornado. CodColigada=" + codColigada + " IdMov2=" + idmovMovimento02 + " Municipio=" + municipio);
            return;
        }
        hAPI.setCardValue('tributosMunicipais', safe(dataset.getValue(0, "TRIBUTOS_MUNICIPAIS")));


    } catch (e) {
        log.error("### Erro ao carregar impostos nacionais e municipias do dataset ->  " + e);
        throw e;
    }




}


function getConstante(param) {
    var oConstantes = DatasetFactory.getDataset('ds_Constantes', null, null, null);
    for (var i = 0; i < oConstantes.rowsCount; i++) {
        if (oConstantes.getValue(i, "id").trim() == param.trim()) {
            return oConstantes.getValue(i, "Valor").trim();
        }
    }
    return '0';
}

function formatarParaRM(valor) {
    return String(valor).replace(".", ",");
}

