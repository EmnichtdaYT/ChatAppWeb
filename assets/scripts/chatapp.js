$(document).ready(function () {
    var token = getCookie("token")

    var request = new XMLHttpRequest();
    request.open("GET", "http://127.0.0.1:3000/" + token, true);
    request.setRequestHeader("Content-type", "application/JSON")

    request.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var jsonResponse = JSON.parse(request.response);
            var tokenCorrect = jsonResponse.tokenCorrect;
            if (!tokenCorrect) {
                window.location.href = "/";
            }
        }
    };

    request.send();
});

function getCookie(cName) {
    const name = cName + "=";
    const cDecoded = decodeURIComponent(document.cookie); //to be careful
    const cArr = cDecoded.split('; ');
    let res;
    cArr.forEach(val => {
        if (val.indexOf(name) === 0) res = val.substring(name.length);
    })
    return res;
}

$('.chat-input input').keyup(function(e) {
	if ($(this).val() == '')
		$(this).removeAttr('good');
	else
		$(this).attr('good', '');
});