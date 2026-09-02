
function adicionarSeloCancelado($container) {
    if (!$container || !$container.length) return;
    if ($container.find(".historico-status-cancelado").length) return;


    if ($container.css("position") === "static") {
        $container.css("position", "relative");
    }
    $container.css("padding-top", "36px");

    $container.prepend(
        $("<span></span>")
            .addClass("historico-status historico-status-cancelado selo-nota-cancelada")
            .text("Cancelado")
    );
}

function checarNotaCancelada() {
    var quantidaDeNotas = String($("#historico2201").val()).split(",").length;

    console.log("quantidade de notas presentes - >", quantidaDeNotas)
    var bodyPanelPrimeiraNota = $("#enviarNota").find(".panel-body");

    console.log("body encontrados - > ", bodyPanelPrimeiraNota)
    var notasPaiFilho = document.querySelectorAll("input[name^='notaFiscalSub___']")

    console.log("notas pai e filho -->", notasPaiFilho)
    if (quantidaDeNotas > 1) {


        $(bodyPanelPrimeiraNota).css("background-color", "#f7b9bf");
        adicionarSeloCancelado(bodyPanelPrimeiraNota);

        quantidaDeNotas -= 2;

        for (var i = 0; i < quantidaDeNotas; i++) {
            var $tdNota = $(notasPaiFilho[i]).closest('td');
            $tdNota.css("background-color", "#f7b9bf")
            adicionarSeloCancelado($tdNota);
            console.log("printando o backfround da vez")
        }
    }
}

function preencherMovimentoEmNotasCanceladas() {
    var movimentosEncontrados = String($("#historico2201").val()).split(",");

    var notasPaiFilho = document.querySelectorAll("input[name^='numeroIdmov2201Sub___']")

    for (var index = 1; index <= movimentosEncontrados.length; index++) {
        console.log("FILHO DA VEZ -> ", notasPaiFilho[index - 1])
        console.log("VALOR DA VEZ -> ", movimentosEncontrados[index])
        $(notasPaiFilho[index - 1]).val(movimentosEncontrados[index]);



    }
}