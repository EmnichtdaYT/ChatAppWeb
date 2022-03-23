$(document).ready(function () {
    $("#btn_login").click(function () { login($("#in_user").val(), $("#in_pass").val()) })

    var token = getCookie("token")

    var request = new XMLHttpRequest();
    request.open("GET", "http://roleplay.emnichtda.de:3000/" + token, true);
    request.setRequestHeader("Content-type", "application/JSON")

    request.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var tokenCorrect = JSON.parse(request.response).tokenCorrect;
            if(tokenCorrect){
                window.location.href = "/chatapp.html";
            }
        }
    };

    request.send();
});

function login(user, pass) {
    var request = new XMLHttpRequest();
    request.open("POST", "http://roleplay.emnichtda.de:3000/login", true);
    request.setRequestHeader("Content-type", "application/JSON")

    request.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var token = JSON.parse(request.response).token;
            console.log(token)
            if(token==null){
                alert("Invalid username or password")
            }else{
                setCookie("token", token, 100)
                window.location.href = "/chatapp.html"
            }
        }
    };

    request.send(JSON.stringify({ user: user, pass: pass }));
}

// Set a Cookie
function setCookie(cName, cValue, expDays) {
    let date = new Date();
    date.setTime(date.getTime() + (expDays * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = cName + "=" + cValue + "; " + expires + "; path=/";
}


function getCookie(cName) {
    const name = cName + "=";
    const cDecoded = decodeURIComponent(document.cookie); //to be careful
    const cArr = cDecoded .split('; ');
    let res;
    cArr.forEach(val => {
        if (val.indexOf(name) === 0) res = val.substring(name.length);
    })
    return res;
}