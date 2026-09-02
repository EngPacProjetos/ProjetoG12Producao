function servicetask334(attempt, message) {

    var codColigada = hAPI.getCardValue("CodColigada");
    var idprd = hAPI.getCardValue("IDPRD");
    var codigoCliente = hAPI.getCardValue("codigo_cliente");
    var codFilial = hAPI.getCardValue("filial") || "1";
    var coligadaCliente = hAPI.getCardValue("coligadaCliente") || "0";

    var idmov = hAPI.getCardValue("historico2102").split(",").pop().trim();

    var usuario_rm = getConstante("rm_usuario");
    var senha_rm = getConstante("rm_senha");

    log.info("[G12-AjustarIRRFeINSS] Iniciando - CODCOLIGADA=" + codColigada);

    // irrfCodigoAjusteSub___i / inssCodigoAjusteSub___i guardam a DESCRICAO (displayKey do zoom),
    // nao o codigo -> usar os campos ocultos espelhados irrfCodSub___i / inssCodSub___i
    // (preenchidos em setSelectedZoomItem, G12-Zoom.js) que guardam o CODIGO_IRRF / CODIGO_INSS reais.
    var codigosIrrf = [];
    var i = 1;
    while (true) {
        var codigoIrrfN = hAPI.getCardValue("irrfCodSub___" + i);
        if (codigoIrrfN == null || codigoIrrfN == "" || codigoIrrfN == "null" || codigoIrrfN == "undefined") break;
        codigosIrrf.push(String(codigoIrrfN).trim());
        i++;
        if (i > 50) break;
    }

    var codigosInss = [];
    var j = 1;
    while (true) {
        var codigoInssN = hAPI.getCardValue("inssCodSub___" + j);
        if (codigoInssN == null || codigoInssN == "" || codigoInssN == "null" || codigoInssN == "undefined") break;
        codigosInss.push(String(codigoInssN).trim());
        j++;
        if (j > 50) break;
    }

    log.info("[G12-AjustarIRRFeINSS] Total IRRF: " + codigosIrrf.length + " | Total INSS: " + codigosInss.length);

    if (codigosIrrf.length === 0 && codigosInss.length === 0) {
        log.warn("[G12-G12-AjustarIRRFeINSS] Nenhum IRRF/INSS encontrado. Abortando.");
        return;
    }

    var ultimoCodigoIrrf = codigosIrrf.length > 0 ? [codigosIrrf[codigosIrrf.length - 1]] : [];
    var ultimoCodigoInss = codigosInss.length > 0 ? [codigosInss[codigosInss.length - 1]] : [];

    if (codigosIrrf.length > 0) {
        log.info("[G12-AjustarIRRFeINSS] IRRF: usando somente a ultima linha (" + codigosIrrf.length + " informadas) -> " + ultimoCodigoIrrf[0]);
    }
    if (codigosInss.length > 0) {
        log.info("[G12-AjustarIRRFeINSS] INSS: usando somente a ultima linha (" + codigosInss.length + " informadas) -> " + ultimoCodigoInss[0]);
    }

    codigosIrrf = ultimoCodigoIrrf;
    codigosInss = ultimoCodigoInss;

    for (var k = 0; k < codigosIrrf.length; k++) {
        var codigoIrrf = codigosIrrf[k];
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


            var xmlFinal =
                "<EstPrdCfoBR>" +
                "<TPrdCfo>" +
                "<CODCOLIGADA>" + codColigada + "</CODCOLIGADA>" +
                "<IDPRD>" + idprd + "</IDPRD>" +
                "<CODCOLCFO>" + coligadaCliente + "</CODCOLCFO>" +
                "<CODCFO>" + codigoCliente + "</CODCFO>" +
                "<ATIVO>1</ATIVO>" +
                "<CODIGOIRRF>" + codigoIrrf + "</CODIGOIRRF>" +
                "</TPrdCfo>" +
                "</EstPrdCfoBR>"

            var resultado = authService.saveRecord("EstPrdCfoDataBR", xmlFinal, contexto);
            log.info("[G12-AjustarIrrfCliente] Resultado (" + codigoIrrf + "): " + resultado);


        } catch (e) {
            log.error("[G12-G12-AjustarIRRFeINSS] Erro ao ajustar IRRF " + codigoIrrf + ": " + String(e));
            throw e;
        }

    }
    for (var m = 0; m < codigosInss.length; m++) {
        var codigoInss = codigosInss[m];
        try {
            var servico = ServiceManager.getService("wsDataServer");
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


            var xmlFinal =
                "<EstPrdCfoBR>" +
                "<TPrdCfo>" +
                "<CODCOLIGADA>" + codColigada + "</CODCOLIGADA>" +
                "<IDPRD>" + idprd + "</IDPRD>" +
                "<CODCOLCFO>" + coligadaCliente + "</CODCOLCFO>" +
                "<CODCFO>" + codigoCliente + "</CODCFO>" +
                "<ATIVO>1</ATIVO>" +
                "<CODIGOINSS>" + codigoInss + "</CODIGOINSS>" +
                "</TPrdCfo>" +
                "</EstPrdCfoBR>"

            var resultado = authService.saveRecord("EstPrdCfoDataBR", xmlFinal, contexto);
            log.info("[G12-AjustarInssDoCliente] Resultado (" + codigoInss + "): " + resultado);

        } catch (e) {
            log.error("[G12-G12-AjustarIRRFeINSS] Erro ao ajustar INSS " + codigoInss + ": " + String(e));
            throw e;
        }

    }


    try {

        var c1 = DatasetFactory.createConstraint("CODCOLIGADA", codColigada, codColigada, ConstraintType.MUST);
        var c2 = DatasetFactory.createConstraint("IDMOV", idmov, idmov, ConstraintType.MUST);

        var dataset = DatasetFactory.getDataset("G12-CARREGAR-TRIBUTOS", null, [c1, c2], null);


        if (dataset == null || dataset.rowsCount == 0) {
            log.warn("[G12] Nenhum tributo retornado. CodColigada=" + codColigada + " IdMov2=" + idmov);
            return;
        }

        hAPI.setCardValue('irrfDoItem', safe(dataset.getValue(0, "IRRF_DO_ITEM")));
        hAPI.setCardValue('irrfDescricao', safe(dataset.getValue(0, "IRRF_DESCRICAO")));
        hAPI.setCardValue('irrfAliquota', safe(dataset.getValue(0, "IRRF_ALIQUOTA")));
        hAPI.setCardValue('irrfTipoDePessoa', safe(dataset.getValue(0, "TIPO_DE_PESSOA")));
        hAPI.setCardValue('inssDescricao', safe(dataset.getValue(0, "INSS_DESCRICAO")));
        hAPI.setCardValue('inssAliquota', safe(dataset.getValue(0, "INSS_ALIQUOTA")));
        hAPI.setCardValue('inssDoItem', safe(dataset.getValue(0, "INSS_DO_ITEM")));



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

