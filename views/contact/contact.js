const express = require("express");
const path = require("path");

const app = express();


// body parser middleware
app.use(express.json());
app.use(express.urlencoded( { extended: false } )); // this is to handle URL encoded data
// end parser middleware


// custom middleware to log data access
const log = function (request, response, next) {
	console.log(`${new Date()}: ${request.protocol}://${request.get('host')}${request.originalUrl}`);
	console.log(request.body); // make sure JSON middleware is loaded before this line
	next();
}
app.use(log);
// end custom middleware


// enable static files pointing to the folder "public"
// this can be used to serve the index.html file
app.use(express.static(path.join(__dirname, "public")));


// HTTP POST
app.post("/ajax/email", function(request, response) { // this will be used to send the emails
	response.json( { message: "You attempted to send a message but this is not implemented yet." } );
});


// set port from environment variable, or 8000
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => console.log(`listening on port ${PORT}`));