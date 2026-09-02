function servicetask404(attempt, message) {

    var codColigada = hAPI.getCardValue("CodColigada");
    var idPrj = hAPI.getCardValue("idprj");
    var cnopb = hAPI.getCardValue("CNOPB");
    var codFilial = hAPI.getCardValue("filial");
    var idmovMovimento02 = hAPI.getCardValue("historico2102").split(",").pop().trim();
    var historico = hAPI.getCardValue("historicoMovimento") // REDUNDANCIA EM CASO DE NAO ENCONTRAR EM UMA VARIAVEL ALTERADO PELO FLUIG 

    log.info("HISTORICO DO MOVIMENTOa - > " + historico);

    log.info("### INICIANDO SERVIÇO DE ATUALIZAÇÃO DE HISTÓRICO NO RM 2.1.02###");

    var usuario_rm = getConstante("rm_usuario");
    var senha_rm = getConstante("rm_senha");

    log.info("CODCOLIGADA: " + codColigada + " | CODFILIAL: " + codFilial);

    try { /* */ var servico = ServiceManager.getService("RMWsDataServer");
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

        log.info("### Servico OK, executando atualização de hsitorico no RM");

        // var xml = '<MovMovimento>' +
        //     '<TMOV> ' +
        //     '<CODCOLIGADA>' + codColigada + '</CODCOLIGADA>' +
        //     '<IDMOV>' + idmovMovimento02 + '</IDMOV>' +
        //     '</TMOV>' +
        //     '<TMOVFISCAL>' +
        //     '<CODCOLIGADA>' + codColigada + '</CODCOLIGADA>' +
        //     '<IDMOV>' + idmovMovimento02 + '</IDMOV>' +
        //     '<HISTORICOLONGO>' + historico + '</HISTORICOLONGO>' +
        //     '</TMOVFISCAL>' +
        //     '</MovMovimento>';

        var xml =
            "<MovMovimento>" +
            "<TMOV>" +
            "<CODCOLIGADA>" + codColigada + "</CODCOLIGADA>" +
            "<IDMOV>" + idmovMovimento02 + "</IDMOV>" +
            "<INTEGRAAPLICACAO>T</INTEGRAAPLICACAO>" +
            "<HISTORICOLONGO>" + historico + "</HISTORICOLONGO>" +
            "</TMOV>" +
            "</MovMovimento>";

        var resultado = authService.saveRecord("MOVMOVIMENTOTBCDATA", xml, contexto);

        log.info("[G12-AJUSTAR-HISTORICO] Resultado " + ": " + resultado);

    } catch (error) {
        log.error("ERRO AO JUSTAR HISTORICO:  " + error)
        throw ("ERRO AO JUSTAR HISTORICO:  " + error);
    }

}