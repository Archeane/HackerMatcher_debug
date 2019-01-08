var url = window.location.href;
var conversationId = url.substr(url.lastIndexOf('/') + 1)
var socket = io();
//enter the clients into a chatroom
socket.emit('enter conversation', conversationId);


//send reply to all clients in this conversation room
$('#messageForm').submit(function(e){
  e.preventDefault(); // prevents page reloading
  console.log('form submitted!');
  var message = $('#m').val();
  socket.emit('new message', $('#m').val(), conversationId);
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

//display messages to this conversation room
socket.on('new message', function(msg){
  /*console.log("new message receieved!");
  console.log(msg);*/
  $('#messages').append($('<li>').text(msg));
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