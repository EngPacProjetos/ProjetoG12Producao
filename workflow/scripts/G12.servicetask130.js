function servicetask130(attempt, message) {

    var codColigada = hAPI.getCardValue("CodColigada");
    var codFilial = hAPI.getCardValue("filial") || "1";
    var idprd = hAPI.getCardValue("IDPRD");
    var codigoCliente = hAPI.getCardValue("codigo_cliente");
    var idmovMovimento02 = hAPI.getCardValue("idmov2");
    var coligadaCliente = hAPI.getCardValue("coligadaCliente") || "0";

    var usuario_rm = getConstante("rm_usuario");
    var senha_rm = getConstante("rm_senha");

    var indexIrrfCadastro = hAPI.getCardValue("indexIrrCadastro");
    var indexInssCadastro = hAPI.getCardValue("indexInssCadastro");

    var contexto = "CODCOLIGADA=" + codColigada + ";CODFILIAL=" + codFilial + ";CODSISTEMA=T;CODUSUARIO=fluig";

    var codigoIrrfCliente = "";
    var codigoInssCliente = "";

    log.info("[G12-CadastrarIRRFeINSS] Iniciando - CODCOLIGADA=" + codColigada);


    function criarClienteRM() {
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

        return servico.getCustomClient(ws, properties, []);
    }


    if (indexIrrfCadastro != "" && indexIrrfCadastro != null && indexIrrfCadastro != "undefined") {
        log.warn("[G12-CADASTRO-DE-NOVO-IRRF] Iniciada integracao de cadastro de IRRF");

        for (var index = 1; index <= indexIrrfCadastro; index++) {
            var codigoIrrf = hAPI.getCardValue("codigoIrrfCadastro___" + index);
            var descricaoIrrf = hAPI.getCardValue("descricaoIrrfCadastro___" + index);
            var aliquotaIrrf = hAPI.getCardValue("aliquotaIrrfCadastro___" + index);
            var codigoOficial = hAPI.getCardValue("codOficialIrrfCadastro___" + index);
            var aplicavelA = hAPI.getCardValue("aplicavelA___" + index);


            if (!codigoIrrf) {
                continue;
            }

            codigoIrrfCliente = codigoIrrf;

            log.info("CODIGO IRRF PARA CADASTRO -> " + codigoIrrf);
            log.info("DESCRICAO IRRF PARA CADASTRO -> " + descricaoIrrf);
            log.info("ALIQUOTA IRRF PARA CADASTRO -> " + aliquotaIrrf);
            log.info("CODIGO OFICIAL IRRF PARA CADASTRO -> " + codigoOficial);
            log.info("APLICAVEL A IRRF PARA CADASTRO -> " + aplicavelA);

            try {
                var authService = criarClienteRM();


                var xmlIrrf =
                    "<FinIRRF>" +
                    "<FIRRF>" +
                    "<CODRECEITA>" + codigoIrrf + "</CODRECEITA>" +
                    "<DESCRICAO>" + descricaoIrrf + "</DESCRICAO>" +
                    "<ALIQUOTA>" + aliquotaIrrf + "</ALIQUOTA>" +
                    "<PESSOAFISOUJUR>" + aplicavelA + "</PESSOAFISOUJUR>" +
                    "<CODRECEITAOFICIAL>" + codigoOficial + "</CODRECEITAOFICIAL>" +
                    "</FIRRF>" +
                    "</FinIRRF>";

                var resultado = authService.saveRecord("FinIRRFData", xmlIrrf, contexto);
                log.info("[G12-CADASTRO-DE-NOVO-IRRF] Resultado: " + resultado);

                if (resultado && String(resultado).indexOf("Exception") !== -1) {
                    throw new Error("Erro retornado pelo RM: " + resultado);
                }

                if (resultado && String(resultado).indexOf("Error") !== -1) {
                    throw new Error("Erro retornado pelo RM: " + resultado);
                }

            } catch (e) {
                log.error("[G12-CADASTRO-DE-NOVO-IRRF] Erro: " + String(e));
                throw e;
            }
        }
    }


    if (indexInssCadastro != "" && indexInssCadastro != null && indexInssCadastro != "undefined") {
        log.warn("[G12-CADASTRO-DE-NOVO-INSS] Iniciada integracao de cadastro de INSS");

        for (var index = 1; index <= indexInssCadastro; index++) {
            var codigoInss = hAPI.getCardValue("codigoInssCadastro___" + index);
            var descricaoInss = hAPI.getCardValue("descricaoInssCadastro___" + index);
            var aliquotaInss = hAPI.getCardValue("aliquotaInssCadastro___" + index);
            var reducaoInss = hAPI.getCardValue("reducaoInssCadastro___" + index);

            if (!codigoInss) {
                continue;
            }

            codigoInssCliente = codigoInss;

            log.info("CODIGO INSS PARA CADASTRO -> " + codigoInss);
            log.info("DESCRICAO INSS PARA CADASTRO -> " + descricaoInss);
            log.info("ALIQUOTA INSS PARA CADASTRO -> " + aliquotaInss);
            log.info("REDUCAO INSS PARA CADASTRO -> " + reducaoInss);

            try {
                var authService = criarClienteRM();


                var xmlInss =
                    "<MovINSS>" +
                    "<TINSS>" +
                    "<CODCOLIGADA>" + codColigada + "</CODCOLIGADA>" +
                    "<CODIGOINSS>" + codigoInss + "</CODIGOINSS>" +
                    "<DESCRICAO>" + descricaoInss + "</DESCRICAO>" +
                    "<ALIQUOTA>" + aliquotaInss + "</ALIQUOTA>" +
                    "<REDUCAOINSS>" + reducaoInss + "</REDUCAOINSS>" +
                    "</TINSS>" +
                    "</MovINSS>";

                var resultado = authService.saveRecord("MovINSSData", xmlInss, contexto);
                log.info("[G12-CADASTRO-DE-NOVO-INSS] Resultado: " + resultado);

                if (resultado && String(resultado).indexOf("Exception") !== -1) {
                    throw new Error("Erro retornado pelo RM: " + resultado);
                }

                if (resultado && String(resultado).indexOf("Error") !== -1) {
                    throw new Error("Erro retornado pelo RM: " + resultado);
                }

            } catch (e) {
                log.error("[G12-CADASTRO-DE-NOVO-INSS] Erro: " + String(e));
                throw e;
            }
        }
    }


    if (!codigoIrrfCliente && !codigoInssCliente) {
        log.warn("[G12-CADASTRAR-IRRFeINSS] Nenhum IRRF/INSS novo encontrado. Abortando sincronizacao.");
        return;
    }

    try {
        var authService = criarClienteRM();

        var xmlPrdCfo =
            "<EstPrdCfoBR>" +
            "<TPrdCfo>" +
            "<CODCOLIGADA>" + codColigada + "</CODCOLIGADA>" +
            "<IDPRD>" + idprd + "</IDPRD>" +
            "<CODCOLCFO>" + coligadaCliente + "</CODCOLCFO>" +
            "<CODCFO>" + codigoCliente + "</CODCFO>" +
            "<ATIVO>1</ATIVO>" +
            (codigoIrrfCliente ? "<CODIGOIRRF>" + codigoIrrfCliente + "</CODIGOIRRF>" : "") +
            (codigoInssCliente ? "<CODIGOINSS>" + codigoInssCliente + "</CODIGOINSS>" : "") +
            "</TPrdCfo>" +
            "</EstPrdCfoBR>";

        var resultado = authService.saveRecord("EstPrdCfoDataBR", xmlPrdCfo, contexto);
        log.info("[G12-SINCRONIZACAO IRRF/INSS NO PRODUTOxFORNECEDOR] Resultado: " + resultado);

        if (resultado && String(resultado).indexOf("Exception") !== -1) {
            throw new Error("Erro retornado pelo RM: " + resultado);
        }

        if (resultado && String(resultado).indexOf("Error") !== -1) {
            throw new Error("Erro retornado pelo RM: " + resultado);
        }

    } catch (e) {
        log.error("[G12-ERRO SINCRONIZACAO IRRF/INSS NO PRODUTOxFORNECEDOR] Erro: " + String(e));
        throw e;
    }

    try {
        var c1 = DatasetFactory.createConstraint("CODCOLIGADA", codColigada, codColigada, ConstraintType.MUST);
        var c2 = DatasetFactory.createConstraint("IDMOV", idmovMovimento02, idmovMovimento02, ConstraintType.MUST);

        var dataset = DatasetFactory.getDataset("G12-CARREGAR-TRIBUTOS", null, [c1, c2], null);

        if (dataset == null || dataset.rowsCount == 0) {
            log.warn("[G12] Nenhum tributo retornado. CodColigada=" + codColigada + " IdMov2=" + idmovMovimento02);
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
        log.error("### Erro ao carregar tributos do dataset G12-CARREGAR-TRIBUTOS -> " + e);
        throw e;
    }
}