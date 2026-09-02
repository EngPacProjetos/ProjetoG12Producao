function servicetask418(attempt, message) {

	log.info("INICIANDO SERVICE TASK DE ATUALIZACAO DE VALOR DO RPS GERADO")

	var codColigada = hAPI.getCardValue("CodColigada");
	var codFilial = hAPI.getCardValue("filial");
	var idmovMovimento02 = hAPI.getCardValue("historico2102").split(",").pop().trim();
	var valorAlterado = hAPI.getCardValue("valorAlterado").trim();

	if (valorAlterado == null || valorAlterado == undefined || valorAlterado == "") return

	log.info("INFO DE VALOR NAO NULA PARA O RPS, EXECUTANDO INTEGRACAO COM RM ")


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

		log.info("### Servico OK, executando atualização de valor do RPS");

		var xml =
			"<MovMovimento>" +
			"<TMOV>" +
			"<CODCOLIGADA>" + codColigada + "</CODCOLIGADA>" +
			"<IDMOV>" + idmovMovimento02 + "</IDMOV>" +
			"<INTEGRAAPLICACAO>T</INTEGRAAPLICACAO>" +
			"</TMOV>" +
			"<TITMMOV>" +
			"<CODCOLIGADA>" + codColigada + "</CODCOLIGADA>" +
			"<IDMOV>" + idmovMovimento02 + "</IDMOV>" +
			"<NSEQITMMOV>1</NSEQITMMOV>" +
			"<NUMEROSEQUENCIAL>1</NUMEROSEQUENCIAL>" +
			"<PRECOUNITARIO>" + valorAlterado + "</PRECOUNITARIO>" +
			"</TITMMOV>" +
			"</MovMovimento>";

		var resultado = authService.saveRecord("MOVMOVIMENTOTBCDATA", xml, contexto);

		log.info("G12-AJUSTAR-RPS  -> Resultado " + ": " + resultado);

	} catch (error) {
		log.error("ERRO AO JUSTAR RPS:  " + error)
		throw ("ERRO AO JUSTAR RPS:  " + error);
	}

	try {

		var c1 = DatasetFactory.createConstraint("CODCOLIGADA", codColigada, codColigada, ConstraintType.MUST);
		var c2 = DatasetFactory.createConstraint("IDMOV", idmovMovimento02, idmovMovimento02, ConstraintType.MUST);

		var datasetTributos = DatasetFactory.getDataset("G12-CARREGAR-TRIBUTOS", null, [c1, c2], null);

		if (datasetTributos == null || datasetTributos.rowsCount == 0) {
			log.warn("[G12-AJUSTAR-RPS] Nenhum tributo retornado apos atualizacao do valor. CodColigada=" + codColigada + " IdMov2=" + idmovMovimento02);
			return;
		}

		hAPI.setCardValue('tributosNacionais', safe(datasetTributos.getValue(0, "TRIBUTOS_NACIONAIS")));

		log.info("TRIBUTOS NACIONAIS ATUALIZADOS APOS AJUSTE DO VALOR DO RPS -> " + datasetTributos.getValue(0, "TRIBUTOS_NACIONAIS"));

	} catch (error) {
		log.error("### Erro ao recarregar tributos nacionais apos ajuste do valor do RPS -> " + error);
		throw error;
	}

}