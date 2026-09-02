function servicetask30(attempt, message) {
	try {
		Cancelamento();
	} catch (e) {
		throw "servicetask30 " + e;
	}
}

function Cancelamento() {
	try {
		var usuario = getAccess()[0];
		var pass = getAccess()[1];
		var senha = new java.lang.String(pass);

		log.info("USUARIO LOGADO PARA CANCELAMENTO - > " + usuario)
		log.info("SENHA LOGADA PARA CANCELAMENTO - > " + senha)

		var codColigada = hAPI.getCardValue("CodColigada");
		var idMov = hAPI.getCardValue("IdMov");
		var numeroMov = hAPI.getCardValue("numeroMov");

		log.info("========== G12 servicetask30 - INICIO ==========");
		log.info(">> codColigada : [" + codColigada + "]");
		log.info(">> idMov       : [" + idMov + "]");
		log.info(">> numeroMov   : [" + numeroMov + "]");
		log.info(">> usuario     : [" + usuario + "]");

		var hoje = new java.text.SimpleDateFormat("dd/MM/yyyy")
			.format(new java.util.Date());


		var XML = "<MovCancelMovProcParams>";
		XML += "<MovimentosACancelar>";
		XML += "<MovimentosCancelar>";
		XML += "<ApagarMovRelac>false</ApagarMovRelac>";
		XML += "<CancelarMovimentosGeradosSimultFaturamento>false</CancelarMovimentosGeradosSimultFaturamento>";
		XML += "<CancelarMovimentosGeradosSimultReabriCotacao>false</CancelarMovimentosGeradosSimultReabriCotacao>";
		XML += "<CodColigada>" + codColigada + "</CodColigada>";
		XML += "<CodSistemaLogado>T</CodSistemaLogado>";
		XML += "<CodUsuarioLogado>fluig</CodUsuarioLogado>";
		XML += ValidaCampo("DataCancelamento", hoje);
		XML += "<ExcluirItensDaCotacao>false</ExcluirItensDaCotacao>";
		XML += ValidaCampo("IdMov", idMov);
		XML += ValidaCampo("MotivoCancelamento", "Movimento Cancelado por WorkFlow Fluig");
		XML += ValidaCampo("NumeroMov", numeroMov);
		XML += "</MovimentosCancelar>";
		XML += "</MovimentosACancelar>";
		XML += "</MovCancelMovProcParams>";

		log.info(">> XML enviado : [" + XML + "]");

		var NOME_SERVICO = "wsProcess";
		var CAMINHO_SERVICO = "com.totvs.WsProcess";
		var servico = ServiceManager.getServiceInstance(NOME_SERVICO);
		var serviceHelper = servico.getBean();
		var instancia = servico.instantiate(CAMINHO_SERVICO);
		var ws = instancia.getRMIwsProcess();
		var authenticatedService = serviceHelper.getBasicAuthenticatedClient(ws, "com.totvs.IwsProcess", usuario, senha);

		log.info(">> Chamando RM - MovCancelMovProc...");
		var response = authenticatedService.executeWithParams("MovCancelMovProc", XML);
		log.info(">> Response RM completo : [" + response + "]");


		log.warn("TIPO RESPONSE: " + typeof response);
		log.warn("RESPONSE RAW: " + response);

		if (response != null && (
			response.indexOf("===") != -1 ||
			response.indexOf("System.Exception") != -1 ||
			response.indexOf("Exception") != -1 ||
			response.indexOf("erro") != -1 ||
			response.indexOf("Erro") != -1
		)) {
			log.error(">> ERRO do RM detectado: [" + response + "]");
			throw "Erro RM: " + response;
		}


		log.info(">> Cancelamento executado com sucesso");
		log.info("========== G12 servicetask30 - FIM ==========");

		var dataset = DatasetBuilder.newDataset();
		dataset.addColumn("result");
		dataset.addRow(new Array(response));
		return dataset;

	} catch (e) {
		log.error(">> EXCECAO: [" + e.toString() + "]");
		return getDatasetError("ERRO:" + e.toString());
	}
}

function ValidaCampo(campo, valor) {
	if ((valor != null) && (valor != "")) {
		return "<" + campo + ">" + valor + "</" + campo + ">";
	} else {
		log.warn(">> Campo [" + campo + "] vazio - ignorado no XML");
		return "";
	}
}

function getAccess() {
	try {
		var response = new Array();
		var dataset = DatasetFactory.getDataset("dsTBCConnector", null, null, null);
		var u = dataset.getValue(0, "user");
		var p = dataset.getValue(0, "pass");
		log.info(">> getAccess: usuario [" + u + "]");
		response.push(u, p);
		return response;
	} catch (e) {
		throw "getAccess / " + e.toString();
	}
}

function getDatasetError(exception) {
	var dtsError = DatasetBuilder.newDataset();
	dtsError.addColumn("ERROR");
	dtsError.addRow([exception.toString()]);
	return dtsError;
}