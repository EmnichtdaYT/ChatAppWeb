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
            }else{
                initChatlist(jsonResponse)
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

function initChatlist(json){
    var firstchat = null;
    for(chat in json.chats){
        if(firstchat == null){
            firstchat = chat;
        }
        var users = json.chats[chat] + ""
        users = users.replaceAll(",", ", ")
        $("#chatlist").append('<li onClick="selectChat(this.id)" class="chatslistitem list-group-item text-white bg-dark" id="' + chat + '">' + users + '</li>');
    }
    
    selectChat(firstchat + "");
}

var selectedChat = null;

function selectChat(chat){
    if(selectedChat != null){
        $("#" + selectedChat).removeClass('selectedchat')
    }
    selectedChat = chat;
    $("#" + chat).addClass('selectedchat');
}
