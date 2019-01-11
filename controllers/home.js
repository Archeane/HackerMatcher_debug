exports.index = async (req, res) => {
  const Hackathon = require('../models/Hackathon');
  var hackathons = await Hackathon.find();
  res.render('home', {
    title: 'Home', hackathons: hackathons
  });
};

exports.landing = (req, res) => {
	res.render('landing',{
		title: 'Hacker Matcher'
	});
};

exports.getChat = (req, res) =>{
	res.render('chat');
};


exports.search = (req, res, next)=>{
	//console.log(req.params);
	var query = req.params.query;
	var p1 = new Promise((res, rej) =>{
		const User = require('../models/User');
		User.find({ "email": { $regex: query, $options:"i m"}}, (err, docs)=>{
			if(err) throw err;
			res(docs);
		});
	});
	var p2 = new Promise((res, rej) =>{
		const Hackathon = require('../models/Hackathon');
		Hackathon.find({ "name": { $regex: query, $options:"i m"}}, (err, docs)=>{
			if(err) throw err;
			//console.log('docs:',docs);
			res(docs);
		});
	});

	Promise.all([p1,p2]).then((values)=>{
		//console.log('result:', values);
		res.status(200).send(values);
	});
	
};

exports.autoSearch = (req, res, next)=>{
	//console.log(req.body);
	var query = req.body.query;
	var p1 = new Promise((res, rej) =>{
		const User = require('../models/User');
		User.find({ "email": { $regex: query, $options:"i m"}}, (err, docs)=>{
			if(err) throw err;
			//console.log('docs:',docs);
			res(docs);
		});
	});
	var p2 = new Promise((res, rej) =>{
		const Hackathon = require('../models/Hackathon');
		Hackathon.find({ "name": { $regex: query, $options:"i m"}}, (err, docs)=>{
			if(err) throw err;
			//console.log('docs:',docs);
			res(docs);
		});
	});

	Promise.all([p1,p2]).then((values)=>{
		//console.log('result:', values);
		res.status(200).send(values);
	});
};
