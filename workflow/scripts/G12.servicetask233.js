function servicetask233(attempt, message) {

    var codColigada = hAPI.getCardValue("CodColigada");
    var idmov = hAPI.getCardValue("idmov2");
    var codFilial = hAPI.getCardValue("filial") || "1";
    var historico = hAPI.getCardValue("historicoMovimento");


    log.info("HISTORICO DO MOVIMENTO - > " + historico)


    var usuario_rm = getConstante("rm_usuario");
    var senha_rm = getConstante("rm_senha");

    log.info("[G12-AjustarHistorico] Iniciando - CODCOLIGADA=" + codColigada + " IDMOV=" + idmov);


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


        // APENAS USAR OR READRECORD EM SITUACOES EM QUE SE PRECISA EXTRAIR OS DADOS REAIS DO XML PARA PODER ENVIALOS POSTERIORMENTE

        // log.info("[G12-AjustarHistorico] Fazendo ReadRecord...");
        // var xmlAtual = authService.readRecord("MovMovimentoTBCData", codColigada + ";" + idmov, contexto);
        // log.info("[G12-AjustarHistorico] ReadRecord OK");


        var xmlFinal =
            "<MovMovimento>" +
            "<TMOV>" +
            "<CODCOLIGADA>" + codColigada + "</CODCOLIGADA>" +
            "<IDMOV>" + idmov + "</IDMOV>" +
            "<INTEGRAAPLICACAO>T</INTEGRAAPLICACAO>" +
            "<HISTORICOLONGO>" + historico + "</HISTORICOLONGO>" +
            "</TMOV>" +
            "</MovMovimento>";

        var resultado = authService.saveRecord("MovMovimentoTBCData", xmlFinal, contexto);
        log.info("[G12-AjustarHistorico] Resultado SaveRecord: " + resultado);


        if (resultado && String(resultado).indexOf("Exception") !== -1) {
            throw new Error("Erro retornado pelo RM: " + resultado);
        }

        if (resultado && String(resultado).indexOf("Error") !== -1) {
            throw new Error("Erro retornado pelo RM: " + resultado);
        }

    } catch (e) {
        log.error("[G12-AjustarHistorico] Erro: " + String(e));
        throw e;
    }


}