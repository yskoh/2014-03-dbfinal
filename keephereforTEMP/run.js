var express = require('express');
var app = express();
var fs = require('fs');
var server = require('http').createServer(app).listen(8000);
var io = require('socket.io').listen(server);
var ejs = require('ejs');

app.use(express.static(__dirname+'/views'));

app.get('/', function(req, res){

	fs.readFile('contents.ejs','utf8', function(err,data){
		var fn = ejs.render(data, {
			name: '홍길동'
		});

		res.writeHead(200, {'Content-Type':'text/html'});
		res.end(fn);
	});

}); 
