//auto search on search bar
var typingTimer;                //timer identifier
var doneTypingInterval = 1000;  //time in ms (1.5 seconds)

$('#searchContent').keyup(function(){
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
            //console.log('process complete');
          },
          data:{
            query: content
          },
          success: function(data) {
            //console.log(data);
            //empty datalist on each search, then append search results to datalist
            $('#potentials').empty();
            for(i = 0; i < data.length; i++){
              data[i].forEach((d)=>{
                $("#potentials").append($("<option>").text(d.name));
              });
            }
            //console.log('process sucess');
          },
          error: function() {
            //console.log('process error');
          }
      });
    }
});

/*var bestPictures = new Bloodhound({
  datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
  queryTokenizer: Bloodhound.tokenizers.whitespace,
  remote: {
    url: '/search?keyword=',
    wildcard: '%QUERY',
    prepare: function (query, settings) {
      settings.url += query;
      settings.type = "POST";
      return settings;
   },
   filter: function (movies) {
      // Map the remote source JSON array to a JavaScript object array
      return $.map(movies[1], function (movie) {
        console.log(movie);
          return {
              value: movie.name
          };
      });
    }  
  }
});
$('#searchContent').typeahead(null, {
  name: 'best-pictures',
  display: 'value',
  source: bestPictures,
  backdrop: {
          "background-color": "#fff"
  },
  empty: "no result",
});*/

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