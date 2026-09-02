function exibirTabelaAtualizarTributos() {
    $("#impostosajustaveis").removeClass("invisible");
}

function esconderTabelaAtualizarTributos() {
    $("#impostosajustaveis").addClass("invisible");
}


// FUNCAO PARA REMOCAO ANIMADA DA LINHA DA TABELA PAI E FILHO  
function removerComAnimacao(botao) {
    var card = botao.closest(".card-imposto");
    if (!card) return;
    card.classList.add("card-removendo");
    setTimeout(function () {
        fnWdkRemoveChild(botao);
    }, 400);
}

