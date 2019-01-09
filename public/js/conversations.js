

$.ajax({
	type:"POST",
	url:"http://localhost:8080/chat",
	success: function(data){
		console.log(data);
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
	},
    error : function(request,error)
    {
        console.log("there is an error with the server");
    }
});/*.done((data)=>{
	console.log(data);
	$(document).on("click",".conversation", function (event) {
		var conversationId = event.target.id;
	    $.ajax({
	    	type:"POST",
	    	url:"http://localhost:8080/chat/"+conversationId,
	    	success:function(data){

	    	},
	    	error : function(request,error){
		        console.log("there is an error with the server");
		    }
	    });
	});
	
});*/




