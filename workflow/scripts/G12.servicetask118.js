function servicetask118(attempt, message) {


    var codColigada = hAPI.getCardValue("CodColigada");
    var idprd = hAPI.getCardValue("IDPRD");
    var codigoCliente = hAPI.getCardValue("codigo_cliente");
    var codFilial = hAPI.getCardValue("filial") || "1";
    var idmovMovimento02 = hAPI.getCardValue("idmov2");
    var coligadaCliente = hAPI.getCardValue("coligadaCliente") || "0";

    var codigoIrrf = hAPI.getCardValue("irrfCodigoAjuste");
    var codigoInss = hAPI.getCardValue("inssCodigoAjuste");

    var usuario_rm = getConstante("rm_usuario");
    var senha_rm = getConstante("rm_senha");

    log.info("[G12-AjustarIRRFeINSS] Iniciando - CODCOLIGADA=" + codColigada);




    if (
        (codigoIrrf == "" || codigoIrrf == null || codigoIrrf == "undefined") &&
        (codigoInss == "" || codigoInss == null || codigoInss == "undefined")
    ) {
        log.warn("[G12-G12-AjustarIRRFeINSS] Nenhum IRRF encontrado. Abortando.");
        return;
    }
    if (codigoIrrf != "" && codigoIrrf != null && codigoIrrf != "undefined") {
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
            log.info("[G12-AjustarIrrfCliente] Resultado: " + resultado);


            if (resultado && String(resultado).indexOf("Exception") !== -1) {
                throw new Error("Erro retornado pelo RM: " + resultado);
            }

            if (resultado && String(resultado).indexOf("Error") !== -1) {
                throw new Error("Erro retornado pelo RM: " + resultado);
            }


        } catch (e) {
            log.error("[G12-G12-AjustarIRRFeINSS] Erro: " + String(e));
            throw e;
        }

    }
    if (codigoInss != "" && codigoInss != null && codigoInss != "undefined") {
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
            log.info("[G12-AjustarInssDoCliente] Resultado: " + resultado);


        } catch (e) {
            log.error("[G12-G12-AjustarIRRFeINSS] Erro: " + String(e));
            throw e;
        }

    }



    try {
        var c1 = DatasetFactory.createConstraint("CODCOLIGADA", codColigada, codColigada, ConstraintType.MUST);
        var c2 = DatasetFactory.createConstraint("IDMOV", idmovMovimento02, idmovMovimento02, ConstraintType.MUST);

        var dataset = DatasetFactory.getDataset("G12-CARREGAR-TRIBUTOS", null, [c1, c2], null);


        if (dataset == null || dataset.rowsCount == 0) {
            log.warn("[G12] Nenhum IRRF retornado. CodColigada=" + codColigada + " IdMov2=" + idmovMovimento02);
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
        log.error("### Erro ao carregar IRRF atualizados do dataset  G12-CARRRGAR-TRIBUTOS ->  " + e);
        throw e;
    }
}