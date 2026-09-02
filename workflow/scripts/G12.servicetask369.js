function servicetask369(attempt, message) {

    var codColigada = hAPI.getCardValue("CodColigada");
    var codFilial = hAPI.getCardValue("filial");
    var idMov = hAPI.getCardValue("historico2102").split(",").pop().trim();
    var exercicioFiscal = hAPI.getCardValue("exercicioFiscal");
    var status = hAPI.getCardValue("statusAutorizacao");


    log.info("VALOR DO STATUS DE NOTA FISSCAL ->" + status);


    var usuario_rm = getConstante("rm_usuario");
    var senha_rm = getConstante("rm_senha");

    if (status != "VAZIO") {

        var servico = ServiceManager.getService("wsProcess");
        var instancia = servico.instantiate("com.totvs.WsProcess");
        var ws = instancia.getRMIwsProcess();
        var properties = {};
        properties['basic.authorization'] = 'true';
        properties['basic.authorization.username'] = usuario_rm;
        properties['basic.authorization.password'] = senha_rm;
        properties['disable.chunking'] = 'true';
        properties['log.soap.messages'] = 'true';
        properties['receive.timeout'] = '180000';

        var authService = servico.getCustomClient(ws, properties, []);

        try {


            var xmlParams = '<?xml version="1.0" encoding="utf-16"?>'
                + '<FisNFSeCancelarParamsProc z:Id="i1" xmlns="http://www.totvs.com.br/RM/" xmlns:i="http://www.w3.org/2001/XMLSchema-instance" xmlns:z="http://schemas.microsoft.com/2003/10/Serialization/">'
                + '<ActionModule xmlns="http://www.totvs.com/">D</ActionModule>'
                + '<ActionName xmlns="http://www.totvs.com/">FisNFSeCancelarNotasAction</ActionName>'
                + '<CanParallelize xmlns="http://www.totvs.com/">true</CanParallelize>'
                + '<CanSendMail xmlns="http://www.totvs.com/">false</CanSendMail>'
                + '<CanWaitSchedule xmlns="http://www.totvs.com/">false</CanWaitSchedule>'
                + '<CodUsuario xmlns="http://www.totvs.com/">' + usuario_rm + '</CodUsuario>'
                + '<Context z:Id="i2" xmlns="http://www.totvs.com/" xmlns:a="http://www.totvs.com.br/RM/">'
                + '<a:_params xmlns:b="http://schemas.microsoft.com/2003/10/Serialization/Arrays">'
                + '<b:KeyValueOfanyTypeanyType><b:Key i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">$EXERCICIOFISCAL</b:Key><b:Value i:type="c:int" xmlns:c="http://www.w3.org/2001/XMLSchema">' + exercicioFiscal + '</b:Value></b:KeyValueOfanyTypeanyType>'
                + '<b:KeyValueOfanyTypeanyType><b:Key i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">$CODLOCPRT</b:Key><b:Value i:type="c:int" xmlns:c="http://www.w3.org/2001/XMLSchema">-1</b:Value></b:KeyValueOfanyTypeanyType>'
                + '<b:KeyValueOfanyTypeanyType><b:Key i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">$CODTIPOCURSO</b:Key><b:Value i:type="c:int" xmlns:c="http://www.w3.org/2001/XMLSchema">-1</b:Value></b:KeyValueOfanyTypeanyType>'
                + '<b:KeyValueOfanyTypeanyType><b:Key i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">$EDUTIPOUSR</b:Key><b:Value i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">-1</b:Value></b:KeyValueOfanyTypeanyType>'
                + '<b:KeyValueOfanyTypeanyType><b:Key i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">$CODUNIDADEBIB</b:Key><b:Value i:type="c:int" xmlns:c="http://www.w3.org/2001/XMLSchema">-1</b:Value></b:KeyValueOfanyTypeanyType>'
                + '<b:KeyValueOfanyTypeanyType><b:Key i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">$CODCOLIGADA</b:Key><b:Value i:type="c:int" xmlns:c="http://www.w3.org/2001/XMLSchema">' + codColigada + '</b:Value></b:KeyValueOfanyTypeanyType>'
                + '<b:KeyValueOfanyTypeanyType><b:Key i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">$RHTIPOUSR</b:Key><b:Value i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">-1</b:Value></b:KeyValueOfanyTypeanyType>'
                + '<b:KeyValueOfanyTypeanyType><b:Key i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">$CODIGOEXTERNO</b:Key><b:Value i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">-1</b:Value></b:KeyValueOfanyTypeanyType>'
                + '<b:KeyValueOfanyTypeanyType><b:Key i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">$CODSISTEMA</b:Key><b:Value i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">T</b:Value></b:KeyValueOfanyTypeanyType>'
                + '<b:KeyValueOfanyTypeanyType><b:Key i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">$CODUSUARIOSERVICO</b:Key><b:Value i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema" /></b:KeyValueOfanyTypeanyType>'
                + '<b:KeyValueOfanyTypeanyType><b:Key i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">$CODUSUARIO</b:Key><b:Value i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">' + usuario_rm + '</b:Value></b:KeyValueOfanyTypeanyType>'
                + '<b:KeyValueOfanyTypeanyType><b:Key i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">$IDPRJ</b:Key><b:Value i:type="c:int" xmlns:c="http://www.w3.org/2001/XMLSchema">-1</b:Value></b:KeyValueOfanyTypeanyType>'
                + '<b:KeyValueOfanyTypeanyType><b:Key i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">$CHAPAFUNCIONARIO</b:Key><b:Value i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">-1</b:Value></b:KeyValueOfanyTypeanyType>'
                + '<b:KeyValueOfanyTypeanyType><b:Key i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">$CODFILIAL</b:Key><b:Value i:type="c:int" xmlns:c="http://www.w3.org/2001/XMLSchema">' + codFilial + '</b:Value></b:KeyValueOfanyTypeanyType>'
                + '</a:_params>'
                + '<a:Environment>DotNet</a:Environment>'
                + '</Context>'
                + '<CustomData i:nil="true" xmlns="http://www.totvs.com/" />'
                + '<DisableIsolateProcess xmlns="http://www.totvs.com/">false</DisableIsolateProcess>'
                + '<HideProgressDialog xmlns="http://www.totvs.com/">false</HideProgressDialog>'
                + '<Initialized xmlns="http://www.totvs.com/">true</Initialized>'
                + '<IsolateProcess xmlns="http://www.totvs.com/">false</IsolateProcess>'
                + '<MasterActionName xmlns="http://www.totvs.com/">FisNFEMunicipalAction</MasterActionName>'
                + '<MaximumQuantityOfPrimaryKeysPerProcess xmlns="http://www.totvs.com/">1000</MaximumQuantityOfPrimaryKeysPerProcess>'
                + '<MinimumQuantityOfPrimaryKeysPerProcess xmlns="http://www.totvs.com/">1</MinimumQuantityOfPrimaryKeysPerProcess>'
                + '<NotifyEmail xmlns="http://www.totvs.com/">false</NotifyEmail>'
                + '<NotifyFluig xmlns="http://www.totvs.com/">false</NotifyFluig>'
                + '<OnlineMode xmlns="http://www.totvs.com/">false</OnlineMode>'
                + '<PrimaryKeyList xmlns="http://www.totvs.com/" xmlns:a="http://schemas.microsoft.com/2003/10/Serialization/Arrays">'
                + '<a:ArrayOfanyType>'
                + '<a:anyType i:type="b:short" xmlns:b="http://www.w3.org/2001/XMLSchema">' + codColigada + '</a:anyType>'
                + '<a:anyType i:type="b:int" xmlns:b="http://www.w3.org/2001/XMLSchema">' + idMov + '</a:anyType>'
                + '</a:ArrayOfanyType>'
                + '</PrimaryKeyList>'
                + '<PrimaryKeyNames xmlns="http://www.totvs.com/" xmlns:a="http://schemas.microsoft.com/2003/10/Serialization/Arrays">'
                + '<a:string>CODCOLIGADA</a:string>'
                + '<a:string>IDMOV</a:string>'
                + '</PrimaryKeyNames>'
                + '<PrimaryKeyTableName xmlns="http://www.totvs.com/">TNFEMUNICIPAL</PrimaryKeyTableName>'
                + '<ProcessName xmlns="http://www.totvs.com/">Cancelar NFS-e</ProcessName>'
                + '<QuantityOfSplits xmlns="http://www.totvs.com/">0</QuantityOfSplits>'
                + '<SaveLogInDatabase xmlns="http://www.totvs.com/">true</SaveLogInDatabase>'
                + '<SaveParamsExecution xmlns="http://www.totvs.com/">false</SaveParamsExecution>'
                + '<SendMail xmlns="http://www.totvs.com/">false</SendMail>'
                + '<ServerName xmlns="http://www.totvs.com/">FisNFSeCancelarNotasData</ServerName>'
                + '<ShouldParallelize xmlns="http://www.totvs.com/">false</ShouldParallelize>'
                + '<ShowReExecuteButton xmlns="http://www.totvs.com/">true</ShowReExecuteButton>'
                + '<SuccessMessage xmlns="http://www.totvs.com/">Processo executado com sucesso</SuccessMessage>'
                + '<FailureMessage xmlns="http://www.totvs.com/">Falha na execução do processo</FailureMessage>'
                + '<SyncExecution xmlns="http://www.totvs.com/">false</SyncExecution>'
                + '<UseJobMonitor xmlns="http://www.totvs.com/">true</UseJobMonitor>'
                + '<UserName xmlns="http://www.totvs.com/">' + usuario_rm + '</UserName>'
                + '<WaitSchedule xmlns="http://www.totvs.com/">false</WaitSchedule>'
                + '<CodigoMotivoCancelamento>1</CodigoMotivoCancelamento>'
                + '<MotivoCancelamento>DADOS INCORRETOS</MotivoCancelamento>'
                + '</FisNFSeCancelarParamsProc>';


            log.info("[NFSe Checagem] XML enviado: " + xmlParams);

            var resp = authService.executeWithXmlParams("FisNFSeCancelarNotasData", xmlParams);

            log.info("[NFSe Checagem] Resposta: " + resp);

        } catch (e) {
            log.error("[NFSe-Checagem] Erro: " + String(e));
            throw e;
        }



        try {

            var xmlParams =
                '<?xml version="1.0" encoding="utf-16"?> ' +
                '<FisNFSeRetornarParamsProc z:Id="i1" xmlns="http://www.totvs.com.br/RM/" xmlns:i="http://www.w3.org/2001/XMLSchema-instance" xmlns:z="http://schemas.microsoft.com/2003/10/Serialization/"> ' +
                '  <ActionModule xmlns="http://www.totvs.com/">D</ActionModule>' +
                '  <ActionName xmlns="http://www.totvs.com/">FisNFSeRetornarNotasAction</ActionName>' +
                '  <CanParallelize xmlns="http://www.totvs.com/">true</CanParallelize>' +
                '  <CanSendMail xmlns="http://www.totvs.com/">false</CanSendMail>' +
                '  <CanWaitSchedule xmlns="http://www.totvs.com/">false</CanWaitSchedule>' +
                '  <CodUsuario xmlns="http://www.totvs.com/">fluig</CodUsuario>' +
                '  <ConnectionId i:nil="true" xmlns="http://www.totvs.com/" />' +
                '  <ConnectionString i:nil="true" xmlns="http://www.totvs.com/" />' +
                '  <Context z:Id="i2" xmlns="http://www.totvs.com/" xmlns:a="http://www.totvs.com.br/RM/">' +
                '    <a:_params xmlns:b="http://schemas.microsoft.com/2003/10/Serialization/Arrays">' +
                '      <b:KeyValueOfanyTypeanyType>' +
                '        <b:Key i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">$EXERCICIOFISCAL</b:Key>' +
                '        <b:Value i:type="c:int" xmlns:c="http://www.w3.org/2001/XMLSchema">7</b:Value>' +
                '      </b:KeyValueOfanyTypeanyType>' +
                '      <b:KeyValueOfanyTypeanyType>' +
                '        <b:Key i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">$CODLOCPRT</b:Key>' +
                '        <b:Value i:type="c:int" xmlns:c="http://www.w3.org/2001/XMLSchema">-1</b:Value>' +
                '      </b:KeyValueOfanyTypeanyType>' +
                '      <b:KeyValueOfanyTypeanyType>' +
                '        <b:Key i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">$CODTIPOCURSO</b:Key>' +
                '        <b:Value i:type="c:int" xmlns:c="http://www.w3.org/2001/XMLSchema">-1</b:Value>' +
                '      </b:KeyValueOfanyTypeanyType>' +
                '      <b:KeyValueOfanyTypeanyType>' +
                '        <b:Key i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">$EDUTIPOUSR</b:Key>' +
                '        <b:Value i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">-1</b:Value>' +
                '      </b:KeyValueOfanyTypeanyType>' +
                '      <b:KeyValueOfanyTypeanyType>' +
                '        <b:Key i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">$CODUNIDADEBIB</b:Key>' +
                '        <b:Value i:type="c:int" xmlns:c="http://www.w3.org/2001/XMLSchema">-1</b:Value>' +
                '      </b:KeyValueOfanyTypeanyType>' +
                '      <b:KeyValueOfanyTypeanyType>' +
                '        <b:Key i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">$CODCOLIGADA</b:Key>' +
                '        <b:Value i:type="c:int" xmlns:c="http://www.w3.org/2001/XMLSchema">3</b:Value>' +
                '      </b:KeyValueOfanyTypeanyType>' +
                '      <b:KeyValueOfanyTypeanyType>' +
                '        <b:Key i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">$RHTIPOUSR</b:Key>' +
                '        <b:Value i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">-1</b:Value>' +
                '      </b:KeyValueOfanyTypeanyType>' +
                '      <b:KeyValueOfanyTypeanyType>' +
                '        <b:Key i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">$CODIGOEXTERNO</b:Key>' +
                '        <b:Value i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">-1</b:Value>' +
                '      </b:KeyValueOfanyTypeanyType>' +
                '      <b:KeyValueOfanyTypeanyType>' +
                '        <b:Key i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">$CODSISTEMA</b:Key>' +
                '        <b:Value i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">T</b:Value>' +
                '      </b:KeyValueOfanyTypeanyType>' +
                '      <b:KeyValueOfanyTypeanyType>' +
                '        <b:Key i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">$CODUSUARIOSERVICO</b:Key>' +
                '        <b:Value i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema" />' +
                '      </b:KeyValueOfanyTypeanyType>' +
                '      <b:KeyValueOfanyTypeanyType>' +
                '        <b:Key i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">$CODUSUARIO</b:Key>' +
                '        <b:Value i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">fluig</b:Value>' +
                '      </b:KeyValueOfanyTypeanyType>' +
                '      <b:KeyValueOfanyTypeanyType>' +
                '        <b:Key i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">$IDPRJ</b:Key>' +
                '        <b:Value i:type="c:int" xmlns:c="http://www.w3.org/2001/XMLSchema">-1</b:Value>' +
                '      </b:KeyValueOfanyTypeanyType>' +
                '      <b:KeyValueOfanyTypeanyType>' +
                '        <b:Key i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">$CHAPAFUNCIONARIO</b:Key>' +
                '        <b:Value i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">-1</b:Value>' +
                '      </b:KeyValueOfanyTypeanyType>' +
                '      <b:KeyValueOfanyTypeanyType>' +
                '        <b:Key i:type="c:string" xmlns:c="http://www.w3.org/2001/XMLSchema">$CODFILIAL</b:Key>' +
                '        <b:Value i:type="c:int" xmlns:c="http://www.w3.org/2001/XMLSchema">1</b:Value>' +
                '      </b:KeyValueOfanyTypeanyType>' +
                '    </a:_params>' +
                '    <a:Environment>DotNet</a:Environment>' +
                '  </Context>' +
                '  <CustomData i:nil="true" xmlns="http://www.totvs.com/" />' +
                '  <DisableIsolateProcess xmlns="http://www.totvs.com/">false</DisableIsolateProcess>' +
                '  <DriverType i:nil="true" xmlns="http://www.totvs.com/" />' +
                '  <FriendlyLogs i:nil="true" xmlns="http://www.totvs.com/" />' +
                '  <HideProgressDialog xmlns="http://www.totvs.com/">false</HideProgressDialog>' +
                '  <HostName xmlns="http://www.totvs.com/">DESKTOP-HBHNI5F</HostName>' +
                '  <Initialized xmlns="http://www.totvs.com/">true</Initialized>' +
                '  <Ip xmlns="http://www.totvs.com/">10.0.2.3</Ip>' +
                '  <IsolateProcess xmlns="http://www.totvs.com/">false</IsolateProcess>' +
                '  <JobServerHostName xmlns="http://www.totvs.com/">136710-core-instance-N-RM-D-CO2TNX-1-f8b95WIN-CE01</JobServerHostName>' +
                '  <MasterActionName xmlns="http://www.totvs.com/">FisNFEMunicipalAction</MasterActionName>' +
                '  <MaximumQuantityOfPrimaryKeysPerProcess xmlns="http://www.totvs.com/">1000</MaximumQuantityOfPrimaryKeysPerProcess>' +
                '  <MinimumQuantityOfPrimaryKeysPerProcess xmlns="http://www.totvs.com/">1</MinimumQuantityOfPrimaryKeysPerProcess>' +
                '  <NetworkUser xmlns="http://www.totvs.com/">ANA P2 - LOG NAT</NetworkUser>' +
                '  <NotifyEmail xmlns="http://www.totvs.com/">false</NotifyEmail>' +
                '  <NotifyEmailList i:nil="true" xmlns="http://www.totvs.com/" xmlns:a="http://schemas.microsoft.com/2003/10/Serialization/Arrays" />' +
                '  <NotifyFluig xmlns="http://www.totvs.com/">false</NotifyFluig>' +
                '  <OnlineMode xmlns="http://www.totvs.com/">false</OnlineMode>' +
                '  <PrimaryKeyList xmlns="http://www.totvs.com/" xmlns:a="http://schemas.microsoft.com/2003/10/Serialization/Arrays">' +
                '    <a:ArrayOfanyType>' +
                '      <a:anyType i:type="b:short" xmlns:b="http://www.w3.org/2001/XMLSchema">' + codColigada + '</a:anyType>' +
                '      <a:anyType i:type="b:int" xmlns:b="http://www.w3.org/2001/XMLSchema">' + idMov + '</a:anyType>' +
                '    </a:ArrayOfanyType>' +
                '  </PrimaryKeyList>' +
                '  <PrimaryKeyNames xmlns="http://www.totvs.com/" xmlns:a="http://schemas.microsoft.com/2003/10/Serialization/Arrays">' +
                '    <a:string>CODCOLIGADA</a:string>' +
                '    <a:string>IDMOV</a:string>' +
                '  </PrimaryKeyNames>' +
                '  <PrimaryKeyTableName xmlns="http://www.totvs.com/">TNFEMUNICIPAL</PrimaryKeyTableName>' +
                '  <ProcessName xmlns="http://www.totvs.com/">Consultar Autorização/Cancelamento</ProcessName>' +
                '  <QuantityOfSplits xmlns="http://www.totvs.com/">0</QuantityOfSplits>' +
                '  <SaveLogInDatabase xmlns="http://www.totvs.com/">true</SaveLogInDatabase>' +
                '  <SaveParamsExecution xmlns="http://www.totvs.com/">false</SaveParamsExecution>' +
                '  <ScheduleDateTime xmlns="http://www.totvs.com/">2026-06-25T14:42:25.5623927-03:00</ScheduleDateTime>' +
                '  <Scheduler xmlns="http://www.totvs.com/">JobMonitor</Scheduler>' +
                '  <SendMail xmlns="http://www.totvs.com/">false</SendMail>' +
                '  <ServerName xmlns="http://www.totvs.com/">FisNFSeRetornarNotasData</ServerName>' +
                '  <ServiceInterface i:nil="true" xmlns="http://www.totvs.com/" xmlns:a="http://schemas.datacontract.org/2004/07/System" />' +
                '  <ShouldParallelize xmlns="http://www.totvs.com/">false</ShouldParallelize>' +
                '  <ShowReExecuteButton xmlns="http://www.totvs.com/">true</ShowReExecuteButton>' +
                '  <StatusMessage i:nil="true" xmlns="http://www.totvs.com/" />' +
                '  <SuccessMessage xmlns="http://www.totvs.com/">Processo executado com sucesso</SuccessMessage>' +
                '  <SyncExecution xmlns="http://www.totvs.com/">true</SyncExecution>' +
                '  <UseJobMonitor xmlns="http://www.totvs.com/">true</UseJobMonitor>' +
                '  <UserName xmlns="http://www.totvs.com/">fluig</UserName>' +
                '  <WaitSchedule xmlns="http://www.totvs.com/">false</WaitSchedule>' +
                '  <CodColigada>0</CodColigada>' +
                '  <GerarMovimentosPrefeitura>true</GerarMovimentosPrefeitura>' +
                '  <IdExercicio>' + exercicioFiscal + '</IdExercicio>' +
                '  <NomeArqImportacao i:nil="true" />' +
                '</FisNFSeRetornarParamsProc>';

            log.info("[NFSe Checagem] XML enviado: " + xmlParams);

            var resp = authService.executeWithXmlParams("FisNFSeRetornarNotasData", xmlParams);

            log.info("[NFSe Checagem] Resposta: " + resp);

        } catch (e) {
            log.error("[NFSe-Checagem] Erro: " + String(e));
            throw e;
        }
    } else {


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

