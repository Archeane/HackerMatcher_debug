const { promisify } = require('util');
const Hackathon = require('../models/Hackathon');
const User = require('../models/User');

function createTestUsers(k){
	var fs = require('fs');
	const allInterests = require('../public/assets/interests.json');
	const allLanguages = require('../public/assets/languages.json');
	const allTechnologies = require('../public/assets/technologies.json');
	const allFields = require('../public/assets/fields.json');
	const allMajors = require('../public/assets/majors.json');
	
	var interests1 = [];
	var languages1 = [];
	var fields1 = [];
	var technologies1 = [];
	var major1;

	var n = Math.random()*5;
	for (i = 0; i < n; i++){
		var temp = [];
		temp.push(allInterests[Math.floor(Math.random()*allInterests.length)]['name']);
		temp.push(Math.random()*10);
		temp.push(Math.random()*10);
		interests1.push(temp);
	}
	n = Math.random()*5;
	for (i = 0; i < n; i++){
		var temp = [];
		temp.push(allLanguages[Math.floor(Math.random()*allLanguages.length)]['name']);
		temp.push(Math.random()*10);
		languages1.push(temp);
	}
	n = Math.random()*5;
	for (i = 0; i < n; i++){
		var temp = [];
		temp.push(allTechnologies[Math.floor(Math.random()*allTechnologies.length)]['name']);
		temp.push(Math.random()*10);
		technologies1.push(temp);
	}
	n = Math.random()*5;
	for (i = 0; i < n; i++){
		var temp = [];
		temp.push(allFields[Math.floor(Math.random()*allFields.length)]['name']);
		temp.push(Math.random()*10);
		fields1.push(temp);
	}
	major1 = allMajors[Math.floor(Math.random()*allMajors.length)]['major'];
		
	var Email = k.toString()+"@gmail.com";
	const user = new User({
		email: Email,
		numOfHackathons: Math.floor(Math.random()*5)
	});
	user.preferences.interests = interests1;
	user.preferences.languages = languages1;
	user.preferences.fields = fields1;
	user.preferences.technologies = technologies1;
	user.profile.major = major1;
	user.careScores.interests = Math.floor(Math.random()*5);
	user.careScores.languages = Math.floor(Math.random()*5);
	user.careScores.technologies = Math.floor(Math.random()*5);
	user.careScores.fields = Math.floor(Math.random()*5);
	return user;

	
}
//TODO: 
//**include viewall visualization route/page/client backend visualization
//??sepeate function for requesting algorithmn information -> only call it once 


//TODO:
// 1. add corresponding fields after users controllers is finished
// 2. link to preferences page and view all visualization
exports.getHackathon = async(req,res) => {
	/*
	userArr = [];
	for(let i = 1; i < 20; i++){
		var user = await createTestUsers(i);
		userArr.push(user);
	}
	console.log(userArr);
	try{
		console.log('userArr', userArr.length);
		User.insertMany(userArr, {ordered:false});
	}catch(e){
		console.log('Error!', e);
	}
	*/

	Hackathon.findOne({id:req.params.id}, (err, hackathon)=>{
		if(err){throw err;}
		var zerorpc = require("zerorpc");

		var client = new zerorpc.Client();
		client.connect("tcp://127.0.0.1:4242");
		client.invoke("hello", req.user.email, hackathon.name, function(error, response, more) {
			result = response;
			result = result.slice(0,10);
			toptenhackers = [];

			//TODO: fix this wait for foreach method
			var found = result.length-1;
			result.forEach((hacker) =>{
				User.findOne({'email': hacker[0]}, (err, user)=>{
					if(err){throw err;}
					toptenhackers.push(user);
					found--;
					if(found == 0){
						res.render('hackathon', {
							title: hackathon.name, Hackathon: hackathon, result: toptenhackers, currentHacker: req.user
						});
					}
				});
				
			});
		});
		
	});
};
