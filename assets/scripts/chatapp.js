var apiAddress = "https://easychatapi.emnichtda.de:3000/"
var token = getCookie("token")

var socket = new WebSocket("wss://easychatapi.emnichtda.de:3000/");

socket.onopen = function (e) {
    console.log("Websocket opened!");
    init();
};

function init() {

    socket.onmessage = function (event) {
        console.log(`Data from Websocket: ${event.data}`);
        var jsonFromServer;
        try {
            jsonFromServer = JSON.parse(event.data)
        } catch (e) {
            alert("Websocket responded with non JSON answer: " + event.data)
            return;
        }
        try {
            if (jsonFromServer.message[0].chatid) {
                console.log("Message is chatmessage")
                displayMessageByContent(jsonFromServer.message[0], jsonFromServer.message[0].chatid);
                scrollToMessageId(jsonFromServer.message[0].messageid)
            }
        } catch (e) {
            console.log("Message is not a chatmessage")
        }
    };

    socket.onclose = function (event) {
        if (event.wasClean) {
            console.log("Websocket connection closed!")
        } else {
            // e.g. server process killed or network down
            // event.code is usually 1006 in this case
            alert('Websocket connection died!');
            logout()
        }
    };

    socket.onerror = function (error) {
        alert(`Websocket error: ${error.message}`);
    };

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
                socket.send(token)
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

    $('#btn_addchat').click(function () {
        addToNewChat($('#in_addchat_usernames').val());
        $('#in_addchat_usernames').val("");
        $('#in_addchat_usernames').removeAttr('good');
    })
}

var addToChatUsernames = [];

function addToNewChat(username) {
    if (username.length < 1) {
        return;
    }
    if ($("#tempaddchat").children().length < 1) {
        $("#tempaddchat").html('<form class="chat-input" style="border-top: none !important;" onsubmit="return false;"> <input type="text" id="tempaddchatuserlist" autocomplete="on" good="" disabled />  <button id="btn_createchat">  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-right-square" viewBox="0 0 16 16"> <path fill-rule="evenodd" d="M15 2a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2zM0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm4.5 5.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H4.5z"/> </svg> </form> </button> ');
        $("#btn_createchat").click(function () {
            $("#tempaddchat").html("");
            createNewChat(addToChatUsernames);
            addToChatUsernames = [];
        })
    }
    if ($('#tempaddchatuserlist').val().length == 0) {
        $("#tempaddchatuserlist").val(username);
    } else {
        $("#tempaddchatuserlist").val($("#tempaddchatuserlist").val() + ", " + username);
    }
    addToChatUsernames.push(username);
}

function createNewChat(usernames) {

    var request = new XMLHttpRequest();
    request.open("POST", apiAddress + token, true);
    request.setRequestHeader("Content-type", "application/JSON")

    request.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var jsonResponse = JSON.parse(request.response);
            var tokenCorrect = jsonResponse.tokenCorrect;
            var message = jsonResponse.message;
            var users = jsonResponse.users;
            var chatid = jsonResponse.chatid;

            if (!tokenCorrect) {
                window.location.href = "/";
                return;
            }

            if (message) {
                alert(message)
            }

            if (chatid) {
                $("#chatlist").append('<li onClick="selectChat(this.id)" class="chatslistitem list-group-item text-white bg-dark" id="' + chatid + '">' + users + '</li>');
                console.log("Sending listening request to Websocket for chatid: " + chat)
                socket.send(chatid)
            }



        } else if (this.readyState == 4) {
            alert("API returned code " + this.status)
            logout()
        }
    };

    request.onerror = function () {
        alert("Error while connecting to API")
        logout()
    }

    request.send(JSON.stringify(Object.assign({}, usernames)));
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
    for (chat in json.chats) {
        if (firstchat == null) {
            firstchat = chat;
        }
        var users = json.chats[chat] + ""
        users = users.replaceAll(",", ", ")
        $("#chatlist").append('<li onClick="selectChat(this.id)" class="chatslistitem list-group-item text-white bg-dark" id="' + chat + '">' + users + '</li>');
        console.log("Sending listening request to Websocket for chatid: " + chat)
        socket.send(chat);
    }

    if (firstchat == null || selectedChat != null) {
        return;
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

            displayChatContent(jsonResponse.messages.reverse(), chatid)

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
    if (messagesJson.length > 0) {
        for (message in messagesJson) {
            displayMessageByContent(messagesJson[message], chatid)
        }
        scrollToMessageId(messagesJson[messagesJson.length - 1].messageid)
    }
}

function sendMessage(text, chatid) {
    if (!chatid) {
        alert("No chat selected!")
        return;
    }

    if (!text || text.length < 1) {
        return;
    }

    $("#in_message").attr('disabled', 'disabled');
    $("#btn_send_message").attr('disabled', 'disabled')
    $('#in_message').removeAttr('good');

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
                $("#in_message").removeAttr("disabled");
                $("#btn_send_message").removeAttr("disabled");
                $('#in_message').attr('good', '');
                return;
            }

            if (error) {
                alert(error)
                $("#in_message").removeAttr("disabled");
                $("#btn_send_message").removeAttr("disabled");
                $('#in_message').attr('good', '');
                return;
            }

            if (messageid) {
                $("#in_message").val("");
                $("#in_message").removeAttr("disabled");
                $("#btn_send_message").removeAttr("disabled");
                //The WebSocket SHOULD recieve the message and display it automatically
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
        chatcontent.append('<article class="msg-container msg-self" id="' + msgId + '"><div class="msg-box">    <div class="flr">        <div class="messages">            <p class="msg">' + htmlEntities(msgContent) + '</p>        </div>        <span class="timestamp"><span class="username">' + msgSentBy + '</span>&bull;<span                class="posttime">' + msgTimestampParsedToLocale + '</span></span>    </div>    <img class="user-img"        src="//gravatar.com/avatar/56234674574535734573000000000001?d=retro" /> </div> </article>')
    } else {
        chatcontent.append('<article class="msg-container msg-remote" id="' + msgId + '"><div class="msg-box">    <img class="user-img"        src="//gravatar.com/avatar/00034587632094500000000000000000?d=retro" />    <div class="flr">        <div class="messages">            <p class="msg">               ' + htmlEntities(msgContent) + '                   </p>        </div>        <span class="timestamp"><span class="username">' + msgSentBy + '</span>&bull;<span                class="posttime">' + msgTimestampParsedToLocale + '</span></span>    </div></div> </article>')
    }


}

function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function scrollToMessageId(msgId) {
    var container = $('#chatcontent');

    var scrollTo = $("#" + msgId);

    var position = scrollTo.offset().top
        - container.offset().top
        + container.scrollTop();

    container.animate({
        scrollTop: position
    });
}