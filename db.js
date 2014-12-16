var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var mysql = require('mysql');
//init
var connection = mysql.createConnection({
	host: '127.0.0.1',
	port: 3306,
	user: 'yskoh',
	password: '1234',
	database: 'news'
});

var app = express();
app.use(bodyParser.json()); // for parsing application/json 포스트로 받은 내용 파싱하기 위해
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(express.static(__dirname));

// LISTEN
app.listen(8888, function() {
	console.log("SERVER START!!!!!");
});

// URL MAPPING
app.get("/", function(req, res) {
	fs.readFile("1index.html", function(error, data) {
		res.writeHead(200, {"Content-Type": "text/html"});
		res.end(data);
	});
});


// app.post("/login", function(req, res){
// 	var str =
// 		if exist(select top 1 from users where userid=@userid and password=@password)
// 			begin
// 	//다음 페이지로 이동하기 
// 			end
// 		else
// 			begin
// 			console.log("Wrong input or your id doesn’t exist. Please try again.")
// 			end;

// 	var query = connection.query(str, function(err, rows){
// 		if(err){
// 			//!!! 여기서는 에러 메세지만 출력하고 에러 처리는 하지 않아요(빠른 테스트를 위해서!)
// 			console.log(err);
// 		}
// 		res.send(200, success);
// 		// console.log(rows);
// 	});



// });

app.get("/login", function(req, res){
	fs.readFile("2login.html", function(error, data){
		res.writeHead(200, {"Content-Type":"text/html"});
		res.end(data);
	});
});

app.get("/register", function(req, res){
	fs.readFile("2register.html", function(error, data){
		res.writeHead(200, {"Content-Type":"text/html"});
		res.end(data);
	});
});


// app.get("/css/bootstrap.min.css", function(req, res){
// 	fs.readFile("/css/bootstrap.min.css", function(error, data){
// 		res.writeHead(200, {"Content-Type":"text/css"});
// 		res.end(data);
// 	});
// });

app.post('/register', function(req,res){
	var users = {
		// 잠깐!! post요청의 parameter를 req.body.{html에서 설정한 name}로 받아온다.
		// '{mysql 테이블의 column 이름과 동일해야 함}': parameter
		'userid': req.body.userid,
		'name': req.body.name,
		'password': req.body.password
	};

	var str = 'insert into users set ?';
	//위의 str을 갖고 query를 만들고 실행.
	//? 자리에 user object를 넣는다 
	var query = connection.query(str, users, function(err,result) {
		if (err) {
			//!!! 여기서는 에러 메세지만 출력하고 에러 처리는 하지 않아요(빠른 테스트를 위해서!)
			console.log(err);
		}
		// console.log(query);
		//뒤에 sucess를 달고 status code는 200코드를 보낸다. 
		res.send(200, 'success');
	});
	//*****만약에 없는 결과이면 리턴. 있는 거면 들어가기
});

app.get("/viewOrWrite", function(req, res){
	fs.readFile("3viewOrWrite.html", function(error,data){
		res.writeHead(200, {"Content-Type":"text/html"});
		res.end(data);
	});
});


app.get("/write", function(req, res){

	fs.readFile("4createNews2.html", function(error, data){
		res.writeHead(200, {"Content-Type":"text/html"});
		res.end(data);
	});

});

app.post("/write", function(req, res){

	var articles = {
		// articleid
		'userid':req.body.userid,
		// 'date'
		'title': req.body.title,
		'contents': req.body.contents
	}

	var str = 'insert into articles set ?';
	var query = connection.query(str, articles, function(err, result){
		if(err){
			console.log(err);
		}
		res.send(200, 'Thank you. Your article is submitted!');
	});
});

app.get("/showCollection", function(req, res){
	var str = 'select * from articles';
	var query = connection.query(str, function(err, rows){
		if(err){
			//!!! 여기서는 에러 메세지만 출력하고 에러 처리는 하지 않아요(빠른 테스트를 위해서!)
			console.log(err);
		}
		res.send(200, rows);
	});
});

//5.select & show certain article
