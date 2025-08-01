let socket = io();
const typeInput = document.getElementById('message');
const textInput = document.getElementById('messages');
const isTyping = document.getElementById('isTyping');
const jokeButton = document.querySelector(".getJokeBtn");
const nudgeContainer = document.querySelector('#window');
const nudgeButton = document.querySelector('#nudge-button');
const messageScroll = document.querySelector(".messageContainer");
const onlineUsersCountElement = document.getElementById('onlineUsersCount');

const { userName } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

socket.emit('new-user', userName);

window.onbeforeunload = function(e) {
  e.preventDefault();
};

socket.on('online-users-count', count => {
  onlineUsersCountElement.textContent = `Online Users: ${count}`;
});

let canSendMessage = true;
let cooldownInterval;

function startMessageCooldown() {
    canSendMessage = false;
    let cooldownDuration = 5; // Cooldown duration in seconds
    let countdown = cooldownDuration;

    // Disable send button
    document.getElementById('sendBtn').disabled = true;

    // Display countdown
    document.getElementById('sendBtn').innerText = `00:0${countdown}`;

    // Start countdown timer
    cooldownInterval = setInterval(() => {
        countdown--;
        if (countdown <= 0) {
            clearInterval(cooldownInterval);
            canSendMessage = true;
            // Enable send button
            document.getElementById('sendBtn').disabled = false;
            document.getElementById('sendBtn').innerText = 'Send';
        } else {
            // Update countdown display
            document.getElementById('sendBtn').innerText = `00:0${countdown}`;
        }
    }, 1000);
}

document.getElementById('sendBtn').addEventListener('click', () => {
    if (canSendMessage) {
        sendMessage();
        startMessageCooldown();
    }
});

var input = document.getElementById("message");
input.addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    if (canSendMessage) {
      sendMessage();
      startMessageCooldown();
    }
  }
});

async function handleClick() {
    const { joke } = await getJoke();
    if (joke) {
        const input = document.getElementById("message");
        input.value = joke;
        sendMessage(); // Send the joke message immediately
        socket.emit('joke', { userName });
    }
}


async function getJoke() {
    const response = await fetch("https://icanhazdadjoke.com", {
        headers: {
          Accept: "application/json",
        },
    });
    const joke = await response.json();
    return joke;
}

function scrollDown() {
    messageScroll.scrollTop = messageScroll.scrollHeight;
}

socket.on('message', incoming => {
    isTyping.innerText = "";
    const list = document.getElementById("messages");
    let listItem = document.createElement("li");
    listItem.innerHTML = '<h6>' + incoming.userName + " says: </h6>" + '<br/>' + '<h5>' + incoming.message + '</h5>';
    list.appendChild(listItem);
    scrollDown();
});

socket.on('existing-messages', (existingMessages) => {
    existingMessages.forEach((msg) => {
        const list = document.getElementById("messages");
        let listItem = document.createElement("li");
        listItem.innerHTML = '<h6>' + msg.userName + " says: </h6>" + '<br/>' + '<h5>' + msg.message + '</h5>';
        list.appendChild(listItem);
    });
});

var laudio = new Audio("assets/login.mp3");
socket.on('user-connected', userName => {
    const list = document.getElementById("messages");
    let pItem = document.createElement("p");
    pItem.innerText = userName + " joined the chat";
    list.appendChild(pItem);
    scrollDown();
});

socket.on('user-disconnected', userName => {
    const list = document.getElementById("messages");
    let pItem = document.createElement("p");
    pItem.innerText = userName + " left the chat";
    list.appendChild(pItem);
    scrollDown();
});

const mraudio = new Audio("assets/mrec.mp3");
function sendMessage() {
    const input = document.getElementById("message");
    const message = input.value;
    input.value = "";
    socket.emit('message', { userName, message });
    mraudio.play();
    scrollDown();
}

function sendSmile() {
  const input = document.getElementById("message");
  const message = "😊";
  socket.emit('message', { userName, message });
  mraudio.play();
}

function sendFlirt() {
  const input = document.getElementById("message");
  const message = "😉";
  socket.emit('message', { userName, message });
  mraudio.play();
}

function sendLol() {
  const input = document.getElementById("message");
  const message = "😃";
  socket.emit('message', { userName, message });
  mraudio.play();
}

function sendSad() {
  const input = document.getElementById("message");
  const message = "🙁";
  socket.emit('message', { userName, message });
  mraudio.play();
}

function sendAngry() {
  const input = document.getElementById("message");
  const message = "😡";
  socket.emit('message', { userName, message });
  mraudio.play();
}

var naudio = new Audio('assets/nudge.mp3');
nudgeButton.addEventListener('click', (e) => {
    e.preventDefault();
    socket.emit('nudge', userName );
    
    socket.on('nudge', userName => {
      const list = document.getElementById("messages");
      let h6Item = document.createElement("h6");
      h6Item.innerText = userName + " have just sent a nudge.";
      naudio.play();
      list.appendChild(h6Item);
      nudgeContainer.classList.add('is-nudged');
      scrollDown();
      setTimeout(() => nudgeContainer.classList.remove('is-nudged'), 200);
    });
});

function autocomplete(inp, arr) {
    var currentFocus;

    inp.addEventListener("input", function(e) {
        var autocompleteContainer, matchingElement, i, val = this.value;
        
        closeAllLists();
        if (!val) { return false;}
        currentFocus = -1;
        
        autocompleteContainer = document.createElement("div");
        autocompleteContainer.setAttribute("id", this.id + "autocomplete-list");
        autocompleteContainer.setAttribute("class", "autocomplete-items");
        this.parentNode.appendChild(autocompleteContainer);

        for (i = 0; i < arr.length; i++) {
          if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
            matchingElement = document.createElement("div");
            matchingElement.innerHTML += arr[i].substr(val.length);
            matchingElement.innerHTML += "<input type='hidden' value='" + "1" + arr[i] + "'>";
            matchingElement.addEventListener("click", function(e) {
                handleClick();
                closeAllLists();
            });
            autocompleteContainer.appendChild(matchingElement);
          }
        }
    });

    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
    });
    
    function closeAllLists(elmnt) {
      var x = document.getElementsByClassName("autocomplete-items");
      for (var i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != inp) {
          x[i].parentNode.removeChild(x[i]);
        }
      }
    }
}
  
var jokeArray = ["/ 🤡"];
autocomplete(document.getElementById("message"), jokeArray);

