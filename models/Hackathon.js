const mongoose = require('mongoose');

const hackathonSchema = new mongoose.Schema({
	id:String,
	logo: String,
	url: String,
	name: String,
	university: String,
	email: String,
	state: String,
	city: String,
	date: Date,
	address: String,
	
	hackers: Array
}, {
	timestamps: true
});

const Hackathon = mongoose.model('Hackathon', hackathonSchema);

module.exports = Hackathon;