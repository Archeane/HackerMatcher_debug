//auto search on search bar
var typingTimer;                //timer identifier
var doneTypingInterval = 1000;  //time in ms (1.5 seconds)

$('#searchContent').keyup(function(){
    console.log('key up!!');
    clearTimeout(typingTimer);
    var content = $('#searchContent').val()
    if (content) {
      typingTimer = setTimeout(doneTyping, doneTypingInterval);
    }
    function doneTyping(){
      
      $.ajax({
          type: 'POST',
          url: '/search?query='+content,
          complete: function() {
            console.log('process complete');
          },
          data:{
            query: content
          },
          success: function(data) {
            console.log(data);
            //TODO: on front end, display search results
            console.log('process sucess');
          },

          error: function() {
            console.log('process error');
          }
      });
    }
});

//pressing the search button -> redirect to search results page
$('#searchForm').submit((e)=>{
  e.preventDefault();
  var content = $('#searchContent').val();
  console.log(content)
  $.ajax({
      type: 'POST',
      url: '/search/'+content,
      complete: function() {
        console.log('process complete');
      },

      success: function(data) {
        console.log(data);
        //TODO: on front end, display search results
        console.log('process sucess');
      },

      error: function() {
        console.log('process error');
      }
  });

  return false;
});