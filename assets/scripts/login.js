var apiAddress = "https://45.146.252.58:3000/"
$(document).ready(function () {
    $("#btn_login").click(function () { login($("#in_user").val(), $("#in_pass").val()) })

    var token = getCookie("token")

    var request = new XMLHttpRequest();
    request.open("GET", apiAddress + token, true);
    request.setRequestHeader("Content-type", "application/JSON")

    request.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var parsedResponse = JSON.parse(request.response);
            var tokenCorrect = parsedResponse.tokenCorrect;
            var tokenUsername = parsedResponse.user;
            if (tokenCorrect && tokenUsername === getCookie("user")) {
                window.location.href = "/chatapp.html";
            }else{
                setCookie("token", null, -1)
                setCookie("user", null, -1)
            }
        } else if (this.readyState == 4) {
            $("#apiErrors").html("The API might be down or unreachable.")
        }
    };

    request.onerror = function () {
        $("#apiErrors").html("The API might be down or unreachable.")
    }

    request.send();
});

function login(user, pass) {
    var request = new XMLHttpRequest();
    request.open("POST", apiAddress + "login", true);
    request.setRequestHeader("Content-type", "application/JSON")

    request.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var token = JSON.parse(request.response).token;
            console.log(token)
            if (token == null) {
                alert("Invalid username or password")
            } else {
                setCookie("token", token, 100)
                setCookie("user", user, 100)
                window.location.href = "/chatapp.html"
            }
        } else if (this.readyState == 4) {
            alert("API returned code " + this.status)
        }
    };

    request.onerror = function () {
        alert("Error while connecting to API")
    }

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
    const cArr = cDecoded.split('; ');
    let res;
    cArr.forEach(val => {
        if (val.indexOf(name) === 0) res = val.substring(name.length);
    })
    return res;
}