var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var mysql = require('mysql');
var ejs = require('ejs');
var path = require('path');
var logger = require('morgan');

//init
var connection = mysql.createConnection({
	host: '127.0.0.1',
	port: 3306,
	user: 'yskoh',
	password: '1234',
	database: 'news'
});

var app = express();
// app.use(logger('dev'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.json()); // for parsing application/json 포스트로 받은 내용 파싱하기 위해
app.use(bodyParser.urlencoded({ extended: true })); 

app.use(express.static(path.join(__dirname)));

// LISTEN
app.listen(8888, function() {
	console.log("SERVER START!!!!!");
});

// URL MAPPING
app.get("/", function(req, res) {
	console.log('index');
	fs.readFile("index.html", function(error, data) {
		res.writeHead(200, {"Content-Type": "text/html"});
		res.end(data);
	});
});

//////
app.use(cookieParser());
app.use(bodyParser.urlencoded());

app.get("/login", function(req, res){
	fs.readFile("2login.html", function(error, data){
		res.writeHead(200, {"Content-Type":"text/html"});
		res.end(data);
	});
});

app.get("/failLogin", function(req, res, next){

	// if(req.cookies.failLogin){
		res.end('<h1>Login fail</h1>');
	// }
	// else{
	// 	res.redirect('/viewOrWrite');
	// }
	// 만약,id는 잇는데 비번이 틀리면 말해주기-> 비번을 다시 입력하라
});

app.post("/login", function (request, response, next) {
	var userid = request.body.userid;
	var password = request.body.password;
	console.log('login request : ',userid, password);
	handleLogin(userid, password, response);
});

function handleLogin(userid, password, response) {
	connection.query('SELECT * FROM users WHERE userid="'+userid+'";', function (error, result, fields) {
		console.log('isRightAuth called');
		if(error) {
			console.log('쿼리 문장에 오류가 있습니다.');
			// response.redirect('/login');
		} else {
			if(result[0]) {
				console.log("has result");
				if(result[0].password == password) {
					console.log('RightAuth');
					// response.cookie('correctLogin', true);
					response.redirect('/viewOrWrite');
				}
				else {
					console.log('Wrong pw');
					response.redirect('/failLogin');
				}
			} else {
				console.log("no result");
				response.redirect('/failLogin');
			}
		}
		console.log('hi');
		// response.redirect('/login');
	});
}

app.get("/register", function(req, res){
	fs.readFile("2register.html", function(error, data){
		res.writeHead(200, {"Content-Type":"text/html"});
		res.end(data);
	});
});

app.post('/register', function(req,res){
	console.log(req.body.userid);

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
		// res.send(200, 'Thank you. Your article is submitted!');
		res.redirect('/showCollection');
	});
});

app.get("/showCollection", function(req, res){
	var str = 'select * from articles';
	var query = connection.query(str, function(err, rows){
		if(err){
			//!!! 여기서는 에러 메세지만 출력하고 에러 처리는 하지 않아요(빠른 테스트를 위해서!)
			console.log(err);
		}
		else{
			res.render('listOfNews.ejs',
				{
					data : rows
				});
		}
	});
});

app.get("/showNews", function(req, res){
	var articleid = req.query.articleid;
	var str = 'select * from articles where article_id =' + articleid;
	var query = connection.query(str, function(err, rows){
		if(err){
			console.log(err);
		}
		else{
			res.render('showNews.ejs',
				{
					data : rows
				});
		}
	});

});


