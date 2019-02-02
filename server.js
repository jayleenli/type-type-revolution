const express = require('express');

const mongoose = require('mongoose');
const bodyParser = require('body-parser');

//const db = require('./config/db');

const app = express();

const port = process.env.PORT || 8000;

//to render views
app.set('view engine', 'ejs');

//for static files
app.use(express.static('./static'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/*
mongoose.connect(db.url, function(err){
	if (err)
	{
		return console.log(err);
	}
	else
	{
		require('./app/routes')(app);
		app.listen(port, () => {
		console.log('We are live on ' + port);
	});
	}
});
*/

require('./controllers/routes')(app);
app.listen(port, () => {
	console.log('We are live on ' + port);
});