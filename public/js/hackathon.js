console.log(Hackathon);
console.log(result);
console.log(currentHacker)

$('#name').text(Hackathon.name);
$('#university').text(Hackathon.university);
$('#location').text(Hackathon.city+" "+Hackathon.state);
$('#date').text(Hackathon.date);

//currentHackerInterests = ["Machine Learning", "AI"...]
var currentHackerInterests = [];
var currentHackerLanguages = [];
var currentHackerTech = [];
var currentHackerFields = [];
var tempArr = currentHacker['preferences']['interests'];
for(i = 0; i < tempArr.length; i++){
	currentHackerInterests.push(tempArr[i][0]);
}
tempArr = currentHacker['preferences']['languages'];
for(i = 0; i < tempArr.length; i++){
	currentHackerLanguages.push(tempArr[i][0]);
}
tempArr = currentHacker['preferences']['technologies'];
for(i = 0; i < tempArr.length; i++){
	currentHackerTech.push(tempArr[i][0]);
}
tempArr = currentHacker['preferences']['fields'];
for(i = 0; i < tempArr.length; i++){
	currentHackerFields.push(tempArr[i][0]);
}

//preferences = common preferences between current hacker and all top ten hackers
//currentHackerInterests = [a,b,c]    result[0]['preferences']['interests'] = [a]
//currentHackerLanguages = [d,e,f]	  result[0]['preferences']['languages'] = [e]
//prefernces[0] = [a,e]
var preferences = [];
for(let i = 0; i < result.length; i++){
	var thishackerpref = [];
	const interestsArr = result[i]['preferences']['interests'];
	const languagesArr = result[i]['preferences']['languages'];
    var	temp = [];
	for(let j = 0; j < interestsArr.length; j++){
		if(currentHackerInterests.includes(interestsArr[j][0])){
			temp.push(interestsArr[j][0]);
		}
	}
	thishackerpref.push(temp);
	temp = [];
	for(let j = 0; j < languagesArr.length; j++){
		if(currentHackerLanguages.includes(languagesArr[j][0])){
			temp.push(languagesArr[j][0]);
		}
	}
	thishackerpref.push(temp);
	preferences.push(thishackerpref);
}

console.log(preferences)

app = new Vue({
	el: '#app',
	data:{
		preferences: preferences
	}
});