// FUNCOES DISPARADAS AO CARREGAR O DOM DA PAGINA 
$(document).ready(function () {
    exibirCarregamento(); // CARREGAMENTO COM O SIMBOLO DO G12 PARA MELHOR EXPERIENCIA DO USUARIO
    dispararTributosTimeOut(); // atrasa a execuçao do ajuste de tributos para dar tepo do dom ser montado
    //checkOnCno();
    checkAllInfo(); // Check as informacoes do formulario para o bot exibir ao usuario 
    competenciaMudou(); // Marca de em algum momento a competência foi alterada ou nao 
    restaurarBotoesTransmissao(); // Reaplica o estado "selecionado" dos botoes de transmissao/recebimento ao reabrir o formulario
    desabilitarParaAjuste(); //Desabilita campos quando entra na fase de ajuste de solicitacao
    countTipoAtividade(); // Conta a quantidade de vezess que a atividade passou por cancelar movimento
    renderizarHistoricoMovimentos(); // Monta a tabela do painel Historico dos Movimentos
    desabilitarCampos(); //verifica se deve ou nao desabilitar os campos das div de checagem de transmissao e recebimento baseado no id da atividade 
    checarNotaCancelada(); //verifica quantas notas fiscais foram canceladas para mudar a cor do fundo e colocar uma etiqueta de cancelado
    preencherMovimentoEmNotasCanceladas() // preenchimento dos movimentos 2.2.01 nos inputs corretos das notas correspondentes.
    restaurarAvisoVariacaoValor(); // Reexibe o aviso de variacao >= 1% no valor alterado ao reabrir o formulario

})

$(document).on('change', 'input, select, textarea', function () {
    checkAllInfo();
    renderizarHistoricoMovimentos();
});







