$(document).ready(function () {
    var token = getCookie("token")

    var request = new XMLHttpRequest();
    request.open("GET", "http://127.0.0.1:3000/" + token, true);
    request.setRequestHeader("Content-type", "application/JSON")

    request.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var jsonResponse = JSON.parse(request.response);
            var tokenCorrect = jsonResponse.tokenCorrect;
            if (!tokenCorrect || jsonResponse.user != getCookie("user")) {
                window.location.href = "/";
            }
        }else if(this.readyState == 4){
            alert("API returned code " + this.status)
            logout()
        }
    };

    request.onerror = function(){
        alert("Error while connecting to API")
        logout()
    }

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

function setCookie(cName, cValue, expDays) {
    let date = new Date();
    date.setTime(date.getTime() + (expDays * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = cName + "=" + cValue + "; " + expires + "; path=/";
}

$('.chat-input input').keyup(function(e) {
	if ($(this).val() == '')
		$(this).removeAttr('good');
	else
		$(this).attr('good', '');
});

function logout(){
    setCookie("token", null, -1)
    setCookie("user", null, -1)
    window.location.href = "/"
}