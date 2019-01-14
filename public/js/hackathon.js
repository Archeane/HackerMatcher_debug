console.log(Hackathon);
console.log(result);
console.log(currentHacker);

$('#name').text(Hackathon.name || "");
$('#university').text(Hackathon.university || "");
$('#location').text(Hackathon.city || "");
$('<span>'+Hackathon.state+'</span>').appendTo('#location')

$('#date').text(Hackathon.date || "");

//----------------------top hackers----------------------
$('#pref').on('click', ()=>{
	location.href = window.location.origin+"/preferences";
});
$('#showVis').on('click', ()=>{
	console.log('huh');
	window.location.replace(window.location.href+"/visualization");
});
if(result == false){
	$('#app').hide();
	$('#zerohackers').hide();
	$('#changePrefMessage').show();
}else if(result == -1){
	$('#app').hide();
	$('#changePrefMessage').hide();
	$('#zerohackers').show();
}else{
	$('#app').show();
	$('#changePrefMessage').hide();
	$('#zerohackers').hide();


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
	var hackers = [];  //preferences[i] = common preferences between thisHacker and hacker[i]
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
		thishackerpref.push(temp); //array of common preferences
		var thishackerabout = [];
		var temp2 = result[i].profile;
		temp2['email'] = result[i].email;

		var temp3 = [];
		temp3.push(temp2);
		temp3.push(thishackerpref);

		hackers.push(temp3);
	}

	console.log(hackers);

	app = new Vue({
		el: '#app',
		data:{
			hackers: hackers
		}
	});
	
}
