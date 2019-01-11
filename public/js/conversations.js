
//TODO: run only when user is logged in
$.ajax({
	type:"POST",
	url:"http://localhost:8080/chat",
	success: function(data){
		console.log(data);
		if(typeof data ==='object'){
			for (var key in data) {
			    if (data.hasOwnProperty(key)) {
			    	var conversation = $('<li>');
			    	var conversationLink = $('<a>').attr('href', "http://localhost:8080/chat/"+key).appendTo(conversation);
			    	var conversationImg = $('<img>').attr('src', data[key]);
			    	conversationImg.attr('id', key);
			    	conversationImg.attr('class', "conversation");
			    	conversationImg.appendTo(conversationLink);
			    	$('#conversation-list').append(conversation);
			    }
			}
		}
	},
    error : function(request,error)
    {
    	//TODO: handle this on the front-end (replace no chats yet with "there is an error with the server")
        console.log("there is an error with the server");
    },
    completed:function(req, err){
    	console.log("process completed");
    }
});




