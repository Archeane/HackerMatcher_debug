var url = window.location.href;
var conversationId = url.substr(url.lastIndexOf('/') + 1)
var socket = io();
//enter the clients into a chatroom
socket.emit('enter conversation', conversationId);

//render past messages
var clientsHash = {};
for(i = 0; i < Participants.length; i++){
  clientsHash[Participants[i][0]]=[Participants[i][1], Participants[i][2], false];
} 
clientsHash[User._id]=[User.name, "", true];
console.log(clientsHash);
var messages = [];
for(i = 0; i < Messages.length; i++){
  var temp = [];
  var author = clientsHash[Messages[i].author.toString()][0];
  temp.push(author);
  var pic = clientsHash[Messages[i].author.toString()][1];
  temp.push(pic);
  temp.push(Messages[i].body);
  var createdAt = new Date(Messages[i].createdAt);
  temp.push(createdAt.toLocaleTimeString());
  temp.push(createdAt.toLocaleDateString());
  var isCurrentUser = clientsHash[Messages[i].author.toString()][2];
  temp.push(isCurrentUser);
  messages.push(temp);
}

var messagesApp = new Vue({
  el:"#messages-app",
  data:{
    historyMessages: messages
  }
});


//send reply to all clients in this conversation room
$('#messageForm').submit(function(e){
  e.preventDefault(); // prevents page reloading
  var message = $('#m').val();

  var date = moment();

  socket.emit('new message', User.name, message, conversationId); 
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
  var date = moment();
  
  //determine if current user sent the message
  var currentUserMessage = false;
  if(sender.toString() === User.name.toString()){
    currentUserMessage = true;
  }

  var messageText = $('<p>').text(msg);
  var messageTime = $('<span>');
  messageTime.attr('class', 'time_date');
  messageTime.text(date.format('ll')+" | "+date.format('LT'));
  
  var messageContainer = $('<div>');
  var messageBody = $('<div>');

  if(currentUserMessage){
    messageContainer.attr('class', 'outgoing_msg');
    messageBody.attr('class', 'sent_msg');
    messageBody.append(messageText);
    messageBody.append(messageTime);
  }else{
    messageContainer.attr('class', 'incoming_msg');
    messageBody.attr('class', 'received_msg');
    var messageBodyProperty = $('<div>');
    messageBodyProperty.attr('class','received_withd_msg');

    messageBodyProperty.append(messageText);
    messageBodyProperty.append(messageTime);
    messageBody.append(messageBodyProperty);
    //profile image
    var senderImageContainer = $('<div>');
    senderImageContainer.attr('class','incoming_msg_img');
    var senderImage = $('<img>');
    senderImage.attr('src', nameToPicHash[sender]);
    var senderName = $('<span>');
    senderName.attr('class','incoming_name');
    senderName.text(sender);

    senderImageContainer.append(senderImage);
    senderImageContainer.append(senderName);
    messageContainer.append(senderImageContainer);


  }
  
  messageContainer.append(messageBody);
  $('.msg_history').append(messageContainer);
  var newMessage = $('<li>').text(sender+": "+msg);
  var senderImg = $('<img />',
                   { 
                     src: nameToPicHash[sender], 
                     height: 30
                   })
                    .appendTo(newMessage);
  //newMessage.append($('<img>').attr('height',30).src(nameToPicHash[sender]));
  
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