function validateForm(form) {

    var atividade = Number(getValue("WKNumState")) ? Number(getValue("WKNumState")) : 0;

    var cno = form.getValue("cno");

    var centroDeCusto = form.getValue("centro_de_custo");

    var cnoPb = form.getValue("CNOPB");

    var centroParaiba = [
        "02.01.01.01.001"
        , "02.01.01.01.003"
        , "02.01.01.01.004"
        , "02.01.01.01.008"
        , "02.01.01.01.010"
        , "02.01.01.01.011"
        , "02.01.01.01.012"
        , "02.01.01.02.001"
        , "02.01.01.02.003"
        , "02.01.01.02.004"
        , "02.01.01.02.005"
        , "02.01.01.02.007"

    ]


    for (var index = 0; index < centroParaiba.length; index++) {
        if (centroParaiba[index] == centroDeCusto) {
            if (atividade == 173) {
                if (cno == "" && cnoPb == "") {
                    throw "<div style='display:flex;align-items:center;gap:12px;padding:12px 16px;background:#fff3f3;border-left:4px solid #d9534f;border-radius:6px;color:#a94442;font-family:Arial,sans-serif;font-size:13px;line-height:1.5;'>" +
                    "<img src='https://i.imgur.com/QMNgQ6x.png' style='width:120px;flex-shrink:0;' alt='mascote'/>" +
                    "<div>" +
                    "<strong>Campo obrigatório:</strong> CNOPB.<br>Selecione um código de obra para prosseguir com a solicitação." +
                    "</div>" +
                    "</div>";
                }
            }
        }

    }



}