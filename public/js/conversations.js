
$.ajax({
	type:"POST",
	url:"http://localhost:8080/chat",
	success: function(data){
		console.log(data);
		for (var key in data) {
		    if (data.hasOwnProperty(key)) {
		    	var conversation = $('<div>').attr('id', key);
		    	var conversationLink = $('<a>').attr('href', "http://localhost:8080/chat/"+key).appendTo(conversation);
		    	var conversationImg = $('<img>').attr('src', data[key]);
		    	conversationImg.attr('height', 60).appendTo(conversationLink);
		    	$('#conversation-list').append(conversation);
		    }
		}
	},
    error : function(request,error)
    {
        console.log("there is an error with the server");
    }
});