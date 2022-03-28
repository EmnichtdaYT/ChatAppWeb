var apiAddress = "https://45.146.252.58:3000/"
var token = getCookie("token")
init();
function init() {

    var request = new XMLHttpRequest();
    request.open("GET", apiAddress + token, true);
    request.setRequestHeader("Content-type", "application/JSON")

    request.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var jsonResponse = JSON.parse(request.response);
            var tokenCorrect = jsonResponse.tokenCorrect;
            if (!tokenCorrect || jsonResponse.user != getCookie("user")) {
                window.location.href = "/";
            } else {
                initChatlist(jsonResponse)
            }
        } else if (this.readyState == 4) {
            alert("API returned code " + this.status)
            logout()
            return;
        }
    };

    request.onerror = function () {
        alert("Error while connecting to API")
        logout()
        return;
    }

    request.send();

    $('#btn_send_message').click(function () {
        sendMessage($("#in_message").val(), selectedChat);
    })
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

function setCookie(cName, cValue, expDays) {
    let date = new Date();
    date.setTime(date.getTime() + (expDays * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = cName + "=" + cValue + "; " + expires + "; path=/";
}

$('.chat-input input').keyup(function (e) {
    if ($(this).val() == '')
        $(this).removeAttr('good');
    else
        $(this).attr('good', '');
});

function logout() {
    setCookie("token", null, -1)
    setCookie("user", null, -1)
    window.location.href = "/"
}

function initChatlist(json) {
    var firstchat = null;
    if(!json.chats.isArray()) return;
    for (chat in json.chats) {
        if (firstchat == null) {
            firstchat = chat;
        }
        var users = json.chats[chat] + ""
        users = users.replaceAll(",", ", ")
        $("#chatlist").append('<li onClick="selectChat(this.id)" class="chatslistitem list-group-item text-white bg-dark" id="' + chat + '">' + users + '</li>');
    }

    selectChat(firstchat + "");
}

var selectedChat = null;

function selectChat(chat) {
    if (selectedChat != null) {
        $("#" + selectedChat).removeClass('selectedchat')
    }
    selectedChat = chat;
    $("#" + chat).addClass('selectedchat');

    loadChatContent(chat)
}

function loadChatContent(chatid) {

    var request = new XMLHttpRequest();
    request.open("GET", apiAddress + token + "/" + chatid, true);
    request.setRequestHeader("Content-type", "application/JSON")

    request.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var jsonResponse = JSON.parse(request.response);
            var tokenCorrect = jsonResponse.tokenCorrect;
            var hasPermission = jsonResponse.hasPermission;
            if (!tokenCorrect || jsonResponse.user != getCookie("user")) {
                window.location.href = "/";
                return;
            }

            if (!hasPermission) {
                alert("You don't have permission to read this chat!")
                return
            }

            displayChatContent(jsonResponse.messages, chatid)

        } else if (this.readyState == 4) {
            alert("API returned code " + this.status)
            logout()
        }
    };

    request.onerror = function () {
        alert("Error while connecting to API")
        logout()
    }

    request.send();
}

function displayChatContent(messagesJson, chatid) {
    $("#chatcontent").html("")
    for (message in messagesJson) {
        displayMessageByContent(messagesJson[message], chatid)
    }
    scrollToMessageId(messagesJson[messagesJson.length-1].messageid)
}

function sendMessage(text, chatid) {
    if (!chatid) {
        alert("No chat selected!")
        return;
    }

    var request = new XMLHttpRequest();
    request.open("POST", apiAddress + token + "/" + chatid, true);
    request.setRequestHeader("Content-type", "application/JSON")

    request.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var jsonResponse = JSON.parse(request.response);
            var tokenCorrect = jsonResponse.tokenCorrect;
            var hasPermission = jsonResponse.hasPermission;
            var messageid = jsonResponse.messageid;
            var error = jsonResponse.error;

            if (!tokenCorrect) {
                logout();
                return;
            }
            if (!hasPermission) {
                alert("You don't have permissions to write in this chat!")
                return;
            }

            if (error) {
                alert(error)
                return;
            }

            if (messageid) {
                displayMessageById(messageid, chatid)
            }

        }
    };

    request.onerror = function () {
        alert("Error while connecting to API")
        logout()
    }

    request.send(JSON.stringify({ message: text }));

}

function displayMessageById(messageid, chatid) {
    if (selectedChat != chatid) {
        return false;
    }

    var request = new XMLHttpRequest();
    request.open("GET", apiAddress + token + "/" + chatid + "/" + messageid, true);
    request.setRequestHeader("Content-type", "application/JSON")

    request.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var jsonResponse = JSON.parse(request.response);
            var tokenCorrect = jsonResponse.tokenCorrect;
            var hasPermission = jsonResponse.hasPermission;
            if (!tokenCorrect || jsonResponse.user != getCookie("user")) {
                window.location.href = "/";
                return;
            }

            if (!hasPermission) {
                alert("You don't have permission to read this chat!")
                return;
            }

            displayMessageByContent(jsonResponse.message[0], chatid)
            scrollToMessageId(jsonResponse.message[0].messageid)

        } else if (this.readyState == 4) {
            alert("API returned code " + this.status)
            logout()
        }
    };

    request.onerror = function () {
        alert("Error while connecting to API")
        logout()
    }

    request.send();

}

function displayMessageByContent(jsonMessage, chatid) {
    if (selectedChat != chatid) {
        return false;
    }

    var chatcontent = $("#chatcontent");

    var msgContent = jsonMessage.message;
    var msgTimestamp = jsonMessage.timestamp;
    var msgSentBy = jsonMessage.sentby;
    var msgId = jsonMessage.messageid;

    var msgTimestampParsed = new Date(Date.parse(msgTimestamp));
    var msgTimestampParsedToLocale = msgTimestampParsed.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' })

    if (msgSentBy == getCookie("user")) {
        chatcontent.append('<article class="msg-container msg-self" id="' + msgId + '"><div class="msg-box">    <div class="flr">        <div class="messages">            <p class="msg">' + msgContent + '</p>        </div>        <span class="timestamp"><span class="username">' + msgSentBy + '</span>&bull;<span                class="posttime">' + msgTimestampParsedToLocale + '</span></span>    </div>    <img class="user-img"        src="//gravatar.com/avatar/56234674574535734573000000000001?d=retro" /> </div> </article>')
    } else {
        chatcontent.append('<article class="msg-container msg-remote" id="' + msgId + '"><div class="msg-box">    <img class="user-img"        src="//gravatar.com/avatar/00034587632094500000000000000000?d=retro" />    <div class="flr">        <div class="messages">            <p class="msg">               ' + msgContent + '                   </p>        </div>        <span class="timestamp"><span class="username">' + msgSentBy + '</span>&bull;<span                class="posttime">' + msgTimestampParsedToLocale + '</span></span>    </div></div> </article>')
    }


}

function scrollToMessageId(msgId){
    var container = $('#chatcontent');

    var scrollTo = $("#" + msgId);

    var position = scrollTo.offset().top
        - container.offset().top
        + container.scrollTop();

        container.animate({
            scrollTop: position
        });
}