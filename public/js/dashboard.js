console.log(User);

//----------------------about-----------------------
$('#pfp').attr('src', User.profile.picture);
$('#name').text(User.profile.name || '');
$('#gender').text(User.profile.gender || '');
$('#school').text(User.profile.school || '');
$('#major').text(User.profile.major || '');
$('#gradYear').text(User.profile.graduationYear || '');
$('#eduLevel').text(User.profile.educationLevel || '');
$('#numOfHacks').text(User.numOfHackathons+" Hackathons" || '');

var socialmedias = []
for (var key in User.socialmedia){
	if(User.socialmedia.hasOwnProperty(key)){
		if(User.socialmedia[key] != '' || key.toLowerCase() != 'tokens'){
			var temp = [];
			temp.push(key);
			temp.push(User.socialmedia[key]);
			socialmedias.push(temp);
		}
	}
}

socialmedia = new Vue({
	el: "#about",
	data:{
		socialmedias: socialmedias
	}
});

//-------------------preferences---------------------

langs = []
for(i = 0; i < User.preferences.languages.length; i++){
	langs.push(User.preferences.languages[i][0]);
}
allLanguages=[]
$.getJSON('/assets/languages.json', (data) =>{
	for (i = 0; i < data.length; i++){
		if(!langs.includes(data[i]['name'])){
			allLanguages.push(data[i]['name']);
		}
	}
	console.log(allLanguages);
});


app = new Vue({
	el:'#app',
	data:{
		interests: User.preferences.interests,
		languages:User.preferences.languages,
		allLanguages:allLanguages,
		technologies:User.preferences.technologies,
		fields: User.preferences.fields
	},
	computed:{
		totalLanguages(){
			return this.languages.reduce((sum) => {
				return sum+1;
			},0);
		}
	},
	methods: {
		deleteLanguage: function(index, lan) {
			this.$delete(this.languages, index);
			this.allLanguages.push(lan[0]);
		},
		addLanguage:function(lan, index){
			if(this.languages.length <= 5){
				console.log(lan, index)
				var temp = [lan, 5]
				this.languages.push(temp);
				console.log(allLanguages.indexOf(lan))
				this.allLanguages.splice(allLanguages.indexOf(lan),1);
			}
		}
	}
});


/**
 *================================SETTINGS===================================== 
 */

//display chosen picture in frame
$(document).on('change', '.btn-file :file', function () {
	var input = $(this),
		label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
	input.trigger('fileselect', [label]);
});
$('.btn-file :file').on('fileselect', function (event, label) {
	var input = $(this).parents('.input-group').find(':text'),
		log = label;
	if (input.length) {
		input.val(log);
	} else {
		if (log) alert(log);
	}
});

function readURL(input) {

  if (input.files && input.files[0]) {
    var reader = new FileReader();

    reader.onload = function(e) {
      $('#pfp').attr('src', e.target.result);
    }

    reader.readAsDataURL(input.files[0]);
  }
}

$("#imgInp").change(function() {
  readURL(this);
});




$('#gender-select').val(User.profile.gender);

//populate schools select
$.getJSON('/assets/universities.json', (data) =>{
	for (i = 0; i < data.length; i++){
		var option = new Option(data[i]['institution'], data[i]['institution'], false, false);
		$('#school-select').append(option);
	}
	$('#school-select').val(User.profile.school);
});

//Populate majors select
$.getJSON('/assets/majors.json', (data) =>{
	for (i = 0; i < data.length; i++){
		var option = new Option(data[i]['major'], data[i]['major'], false, false);
		$('#major-select').append(option);
	}
	$('#major-select').val(User.profile.major);
});

$('#gradYear-select').val(User.profile.graduationYear);
$('#eduLevel-select').val(User.profile.educationLevel);

