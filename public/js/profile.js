console.log(User);

//TODO: handle when there is no preferences. dont show it on the front it.

$('#startChat').attr('action', '/new/'+User._id);

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

//-------------------preferences-------------------

app = new Vue({
	el:'#app',
	data:{
		interests: User.preferences.interests,
		languages:User.preferences.languages,
		technologies:User.preferences.technologies,
		fields: User.preferences.fields
	}
});

