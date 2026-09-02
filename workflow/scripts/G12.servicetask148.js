function servicetask148(attempt, message) {

    var codColigada = parseInt(hAPI.getCardValue("CodColigada"));
    var idMov = parseInt(hAPI.getCardValue("idmov2"));
    var codFilial = parseInt(hAPI.getCardValue("filial"));

    var usuario_rm = getConstante("rm_usuario");
    var senha_rm = getConstante("rm_senha");

    log.info("[NFSe] Iniciando. CODCOLIGADA=" + codColigada + " IDMOV=" + idMov);

    try {
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

        // var contexto = "CODCOLIGADA=" + codColigada + ";CODFILIAL=" + codFilial + ";CODSISTEMA=T;CODUSUARIO=fluig";

        var xmlParams =
            '<?xml version="1.0" encoding="utf-16"?>' +
            '<FisNFSeEnvioParamsProc z:Id="i1" xmlns="http://www.totvs.com.br/RM/" xmlns:i="http://www.w3.org/2001/XMLSchema-instance" xmlns:z="http://schemas.microsoft.com/2003/10/Serialization/">' +
            '  <ActionModule xmlns="http://www.totvs.com/">T</ActionModule>' +
            '  <ActionName xmlns="http://www.totvs.com/">MovEnviaNFSeMovAction</ActionName>' +
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
            '  <MasterActionName xmlns="http://www.totvs.com/">MovMovimentoMDIPedidoVendaAction</MasterActionName>' +
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
            '  <PrimaryKeyTableName xmlns="http://www.totvs.com/">TMOV</PrimaryKeyTableName>' +
            '  <ProcessName xmlns="http://www.totvs.com/">Enviar NFS-e</ProcessName>' +
            '  <QuantityOfSplits xmlns="http://www.totvs.com/">0</QuantityOfSplits>' +
            '  <SaveLogInDatabase xmlns="http://www.totvs.com/">true</SaveLogInDatabase>' +
            '  <SaveParamsExecution xmlns="http://www.totvs.com/">false</SaveParamsExecution>' +
            '  <ScheduleDateTime xmlns="http://www.totvs.com/">2026-06-25T13:11:07.1996384-03:00</ScheduleDateTime>' +
            '  <Scheduler xmlns="http://www.totvs.com/">JobMonitor</Scheduler>' +
            '  <SendMail xmlns="http://www.totvs.com/">false</SendMail>' +
            '  <ServerName xmlns="http://www.totvs.com/">FisNFSeEnvioData</ServerName>' +
            '  <ServiceInterface i:nil="true" xmlns="http://www.totvs.com/" xmlns:a="http://schemas.datacontract.org/2004/07/System" />' +
            '  <ShouldParallelize xmlns="http://www.totvs.com/">false</ShouldParallelize>' +
            '  <ShowReExecuteButton xmlns="http://www.totvs.com/">true</ShowReExecuteButton>' +
            '  <StatusMessage i:nil="true" xmlns="http://www.totvs.com/" />' +
            '  <SuccessMessage xmlns="http://www.totvs.com/">Processo executado com sucesso</SuccessMessage>' +
            '  <SyncExecution xmlns="http://www.totvs.com/">false</SyncExecution>' +
            '  <UseJobMonitor xmlns="http://www.totvs.com/">true</UseJobMonitor>' +
            '  <UserName xmlns="http://www.totvs.com/">fluig</UserName>' +
            '  <WaitSchedule xmlns="http://www.totvs.com/">false</WaitSchedule>' +
            '  <EnableJobErrorProgressbar xmlns="http://www.totvs.com/">false</EnableJobErrorProgressbar>' +
            '  <EnableTracing xmlns="http://www.totvs.com/">false</EnableTracing>' +
            '  <LocalOnlyExecutor xmlns="http://www.totvs.com/">RMSJobData</LocalOnlyExecutor>' +
            '  <RMSJobIds i:nil="true" xmlns="http://www.totvs.com/" />' +
            '  <SlicesCount xmlns="http://www.totvs.com/">0</SlicesCount>' +
            '  <CodColigada>0</CodColigada>' +
            '  <CodFilial>0</CodFilial>' +
            '  <CodTipoMovimento i:nil="true" />' +
            '  <DataEmissaoFinal>0001-01-01T00:00:00</DataEmissaoFinal>' +
            '  <DataEmissaoInicial>0001-01-01T00:00:00</DataEmissaoInicial>' +
            '  <HSMLabel i:nil="true" />' +
            '  <HSMLabelKey i:nil="true" />' +
            '  <HSMModule i:nil="true" />' +
            '  <HSMSlot i:nil="true" />' +
            '  <IdClassifMunicipio i:nil="true" />' +
            '  <NumeroFinal i:nil="true" />' +
            '  <NumeroInicial i:nil="true" />' +
            '  <ParametrosFracionados>false</ParametrosFracionados>' +
            '  <PrivateKeyNFSe i:nil="true" />' +
            '  <QtdeNfseLote>0</QtdeNfseLote>' +
            '  <TipoLayoutNacional i:nil="true" />' +
            '</FisNFSeEnvioParamsProc>';


        log.info("[NFSe] XML montado:\n" + xmlParams);

        var resp = authService.executeWithXmlParams("FisNFSeEnvioData", xmlParams);
        log.info("[NFSe] Resposta: [" + resp + "]");


        if (resp && String(resp).indexOf("Exception") !== -1) {
            throw new Error("Erro retornado pelo RM: " + resp);
        }

        if (resp && String(resp).indexOf("Error") !== -1) {
            throw new Error("Erro retornado pelo RM: " + resp);
        }

        log.info("[NFSe] NFS-e enviada com sucesso para IDMOV=" + idMov);

    } catch (e) {
        log.error("[NFSe] Erro fatal: " + String(e));
        throw e;
    }
}