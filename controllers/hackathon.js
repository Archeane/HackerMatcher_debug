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
	const allSchools = require('../public/assets/universities.json');
	const random_name = require('node-random-name');
	
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
	school1 = allSchools[Math.floor(Math.random()*allSchools.length)]['institution'];


	var Email = k.toString()+"@gmail.com";
	const user = new User({
		email: Email,
		numOfHackathons: Math.floor(Math.random()*5)
	});
	if(k % 2 == 0){
		user.profile.picture = 'https://randomuser.me/api/portraits/women/'+Math.floor(Math.random()*99)+'.jpg';
	}else{
		user.profile.picture = 'https://randomuser.me/api/portraits/men/'+Math.floor(Math.random()*99)+'.jpg';
	}
	user.preferences.interests = interests1;
	user.preferences.languages = languages1;
	user.preferences.fields = fields1;
	user.preferences.technologies = technologies1;
	user.profile.name = random_name();
	user.profile.major = major1;
	user.profile.school = school1;
	user.profile.graduationYear = 2018+Math.random()*5;
	user.profile.educationLevel = "Undergraduate";
	user.careScores.interests = Math.floor(Math.random()*5);
	user.careScores.languages = Math.floor(Math.random()*5);
	user.careScores.technologies = Math.floor(Math.random()*5);
	user.careScores.fields = Math.floor(Math.random()*5);
	return user;

	
}
//TODO: 
//**include viewall visualization route/page/client backend visualization
//??sepeate function for requesting algorithmn information -> only call it once 


let pleasework = 'not working :(';

//TODO:
// 1. add corresponding fields after users controllers is finished
// 2. link to preferences page and view all visualization
exports.getHackathon = async(req,res, next) => {
	userArr = [];
	for(let i = 1; i < 40; i++){
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

	Hackathon.findOne({id:req.params.id}, (err, hackathon)=>{
		if(err){throw err;}
		var zerorpc = require("zerorpc");

		var client = new zerorpc.Client();
		client.connect("tcp://127.0.0.1:4242");
		client.invoke("hello", req.user.email, hackathon.name, function(error, response, more) {
			result = response;
			pleasework = response;
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

exports.getHackathonVisualization = (req, res, next) =>{
	Hackathon.findOne({id:"1"}, (err, hackathon)=>{
		if(err){throw err;}
		var zerorpc = require("zerorpc");

		var client = new zerorpc.Client();
		client.connect("tcp://127.0.0.1:4242");
		client.invoke("hello", req.user.email, hackathon.name, function(error, response, more) {
			let topfiftyhackers = response.slice(0, 50); 
			var minifiedUsers = [];						//array of top 50 hackers with minified data
			new Promise(async(resolve, reject) => {
				for(let hacker of topfiftyhackers){
					let data = await User.findOne({'email':hacker[0]});
					var user = JSON.stringify({
						"email":data.email,
						"numOfHackathons":data.numOfHackathons,
						"name": data.profile.name,
						"profileurl": data.profile.picture,
						"school":data.profile.school,
						"major":data.profile.major,
						"graduationYear":data.profile.graduationYear,
						"educationLevel":data.profile.educationLevel,
						"score": hacker[1]
					});
					//console.log(user);
					minifiedUsers.push(user);
				}
				console.log(minifiedUsers);
				resolve(minifiedUsers);
			}).then(function(result){
				res.render('visualization', {
					title:'Visualization', matches: result
				});
			}, function(err){
				throw err;
			});
		});
		
	});
/*
	console.log(pleasework);
*/
	

}

