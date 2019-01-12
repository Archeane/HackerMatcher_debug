var url = window.location.href;
var conversationId = url.substr(url.lastIndexOf('/') + 1)
var socket = io();
//enter the clients into a chatroom
socket.emit('enter conversation', conversationId);

//render past messages
var clientsHash = {};
for(i = 0; i < Participants.length; i++){
  clientsHash[Participants[i][0]]=[Participants[i][1], Participants[i][2]];
} 
clientsHash[User._id]=[User.profile.name, ""];
console.log(clientsHash);
var messages = [];
for(i = 0; i < Messages.length; i++){
  var temp = [];
  var author = clientsHash[Messages[i].author._id.toString()][0];
  temp.push(author);
  var pic = clientsHash[Messages[i].author._id.toString()][1];
  temp.push(pic);
  temp.push(Messages[i].body);
  messages.push(temp);
}
console.log(messages);
var messagesApp = new Vue({
  el:"#messages-app",
  data:{
    messages: messages
  }
});


//send reply to all clients in this conversation room
$('#messageForm').submit(function(e){
  e.preventDefault(); // prevents page reloading
  var message = $('#m').val();
  socket.emit('new message', User.profile.name, message, conversationId); 
  $('#m').val('');
  //send message to server to save to database
  $.ajax({
      type: 'POST',
      url: url,
      dataType: "text",
      data: {msg: message},
      complete: function() {
        console.log('process complete');
      },

      success: function(data) {
        console.log(data);
        console.log('process sucess');
      },

      error: function() {
        console.log('process error');
      }
  });

  return false;
});

var nameToPicHash = {};
for(i = 0; i < Participants.length; i++){
  nameToPicHash[Participants[i][1]]=Participants[i][2];
} 

//display messages to this conversation room
socket.on('new message', function(sender, msg){
  var newMessage = $('<li>').text(sender+": "+msg);
  var senderImg = $('<img />',
                   { 
                     src: nameToPicHash[sender], 
                     height: 30
                   })
                    .appendTo(newMessage);
  //newMessage.append($('<img>').attr('height',30).src(nameToPicHash[sender]));
  if(sender.toString() === User.profile.name.toString()){
    $('#myMessages').append(newMessage);
  }else{
    $('#othersMessages').append(newMessage);
  }
 // $('#messages').append($('<li>').text(sender, "   ", msg));
  window.scrollTo(0, document.body.scrollHeight);
});


//add person to chat room
$('#addMemberForm').submit((e)=>{
  e.preventDefault();
  var member = $('#newMember').val();
  $.ajax({
      type: 'POST',
      url: url+'/add',
      dataType: "text",
      data: {new_member: member},
      complete: function() {
        console.log('process complete');
      },

      success: function(data) {
        console.log(data);
        //TODO: on front end, show that the new user has been added
        //if a new group chat needs to be made, do that action
        console.log('process sucess');
      },

      error: function() {
        console.log('process error');
      }
  });

  return false;
});