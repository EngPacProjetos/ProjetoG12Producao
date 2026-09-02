function afterTaskComplete(colleagueId, nextSequenceId, userList) {


    var atividadeAtual = getValue("WKNumState");
    var proximaAtividade = getValue("WKNextState");
    var usuario = getValue('WKUser');
    var numSolicitacao = getValue("WKNumProces");


    log.info("atividade atual: " + atividadeAtual);
    log.info("proxima atividade: " + proximaAtividade);
    log.info("USUARIO EXECUTOR DA ATIVIDADE:" + usuario);
    log.info("NUMERO DA SOLICITACAO" + numSolicitacao);


    var motivoDoAjusteTextoChacagem = hAPI.getCardValue("ajusteTransmissao")
    var motivoDoAjusteSelectChecagem = String(hAPI.getCardValue("motivoReemissao")).replace(/_/g, " ") || "";

    var motivoDoAjusteTextRecebimento = hAPI.getCardValue("ajusteTransmissaoRecebimento")
    var motivoDoAjusteSelectRecebimento = String(hAPI.getCardValue("motivoReemissaoRecebimento")).replace(/_/g, " ") || "";

    log.info("TEXTO REFERENTE A ATIVIDADE CHECAGEM DE NFSE:" + motivoDoAjusteTextoChacagem);
    log.info("TEXTO REFERENTE A ATIVIDADE DE CHECAGEM DE NFSE" + motivoDoAjusteSelectChecagem);

    log.info("TEXTO REFERENTE A ATIVIDADE AGUARDANDO RECEBIMENTO:" + motivoDoAjusteTextRecebimento);
    log.info("TEXTO REFERENTE A ATIVIDADE DE AGUARDANDO RECEBIMENTO" + motivoDoAjusteSelectRecebimento);








    if (atividadeAtual == 242) {
        log.info("ENTROU DENTRO DO MECANISMO DE COMENTARIOS AUTOMATICOS - CHECAGEM DE TRANSMISSAO")
        log.info("O TEXTO DIGITADO FOI:" + motivoDoAjusteTextoChacagem)
        log.info("O TEXTO DIGITADO FOI:" + motivoDoAjusteSelectChecagem)
        if (motivoDoAjusteTextoChacagem && motivoDoAjusteTextoChacagem.trim() !== "") {
            log.info("ENTROU DENTRO DO IF PARA SETAR O COMENTARIO");

            var conteudoDaMensagem = "MOTIVO DO AJUSTE: " + motivoDoAjusteSelectChecagem + " | " + "DESCRIÇÃO DETALHADA: " + motivoDoAjusteTextoChacagem;
            hAPI.setTaskComments(
                usuario,
                numSolicitacao,
                0,
                conteudoDaMensagem
            );

            log.info("Comentário registrado com sucesso.");
        } else {
            var conteudoDaMensagem = "MOTIVO DO AJUSTE: " + motivoDoAjusteSelectChecagem;
            hAPI.setTaskComments(
                usuario,
                numSolicitacao,
                0,
                conteudoDaMensagem
            );
        }

    }


    if (atividadeAtual == 62) {

        log.info("ENTROU DENTRO DO MECANISMO DE COMENTARIOS AUTOMATICOS - AGUARDANDO RECEBIMENTO")
        log.info("O TEXTO DIGITADO FOI:" + motivoDoAjusteTextRecebimento)
        log.info("O PROBLEMA SELECIONADO FOI:" + motivoDoAjusteSelectRecebimento)
        if (motivoDoAjusteTextRecebimento && motivoDoAjusteTextRecebimento.trim() !== "") {

            log.info("ENTROU DENTRO DO IF PARA SETAR O COMENTARIO");

            var conteudoDaMensagem = "MOTIVO DO AJUSTE: " + motivoDoAjusteSelectRecebimento + " | " + "DESCRIÇÃO DETALHADA: " + motivoDoAjusteTextRecebimento;

            hAPI.setTaskComments(
                usuario,
                numSolicitacao,
                0,
                conteudoDaMensagem
            );

            log.info("Comentário registrado com sucesso.");
        } else {

            log.info("ENTROU DENTRO DO IF PARA SETAR O COMENTARIO");

            var conteudoDaMensagem = "MOTIVO DO AJUSTE: " + motivoDoAjusteSelectRecebimento;

            hAPI.setTaskComments(
                usuario,
                numSolicitacao,
                0,
                conteudoDaMensagem
            );

            log.info("Comentário registrado com sucesso.");
        }









    }







}
