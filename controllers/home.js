exports.index = (req, res) => {
  res.render('home', {
    title: 'Home'
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