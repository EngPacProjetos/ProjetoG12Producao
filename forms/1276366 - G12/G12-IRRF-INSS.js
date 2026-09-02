function exibirTabelaAtualizarIRRF() {
    $("#ajusteIrrf").removeClass("invisible");
}

function esconderTabelaAtualizarIRRF() {
    $("#ajusteIrrf").addClass("invisible");
}

function exibirTabelaAtualizarINSS() {
    $("#ajusteInss").removeClass("invisible");
}

function esconderTabelaAtualizarINSS() {
    $("#ajusteInss").addClass("invisible");
}

function exibirTabelaCadastrarIrrf() {
    $("#cadastrarIrrf").removeClass("invisible");
}

function esconderTabelaCadastrarIrrf() {
    $("#cadastrarIrrf").addClass("invisible");
}


function exibirTabelaCadastrarInss() {
    $("#cadastrarInss").removeClass("invisible");
}

function esconderTabelaCadastrarInss() {
    $("#cadastrarInss").addClass("invisible");
}


function salvarIndex() {
    var index = document.querySelectorAll("#codigoIrrfCadastro").length;
    $("#indexIrrCadastro").val(index);
}
function salvarIndexInss() {
    var index = document.querySelectorAll("#codigoInssCadastro").length;
    $("#indexInssCadastro").val(index);
}