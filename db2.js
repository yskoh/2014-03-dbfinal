var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var mysql = require('mysql');
var ejs = require('ejs');
var path = require('path');
// var logger = require('morgan');

//init
var connection = mysql.createConnection({
	host: '127.0.0.1',
	port: 3306,
	user: 'yskoh',
	password: '1234',
	database: 'news',
	multipleStatements: true
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
	// console.log('index');
	fs.readFile("index.html", function(error, data) {
		res.writeHead(200, {"Content-Type": "text/html"});
		res.end(data);
	});
});

//////
app.use(cookieParser());
app.use(bodyParser.urlencoded());

//LOGIN
app.get("/login", function(req, res){
	fs.readFile("2login.html", function(error, data){
		res.writeHead(200, {"Content-Type":"text/html"});
		res.end(data);
	});
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

//FAIL LOGIN
app.get("/failLogin", function(req, res, next){

	// if(req.cookies.failLogin){
		res.end('<h1>Login fail</h1>');
	// }
	// else{
	// 	res.redirect('/viewOrWrite');
	// }
	// 만약,id는 잇는데 비번이 틀리면 말해주기-> 비번을 다시 입력하라
});

//REGISTER
app.get("/register", function(req, res){
	fs.readFile("2register.html", function(error, data){
		res.writeHead(200, {"Content-Type":"text/html"});
		res.end(data);
	});
});

app.post('/register', function(req,res){
	// console.log(req.body.userid);

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

//VIEW OR WRITE
app.get("/viewOrWrite", function(req, res){
	fs.readFile("3viewOrWrite.html", function(error,data){
		res.writeHead(200, {"Content-Type":"text/html"});
		res.end(data);
	});
});

//WRITE NEWS
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

//SHOW COLLECTION OF NEWS
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

//SHOW {SELECTED} NEWS + COMMENTS
app.get("/showNews", function(req, res){
	var articleid = req.query.articleid;
	var str = 'select * from articles where article_id =' + articleid;
	var query = connection.query(str, function(err1, rows1){
		if(err1){
			console.log(err1);
		}
		else{
			var str2 = 'select * from comments where article_id=' + articleid; 
			var query2 = connection.query(str2, function(err2, rows2){
				if(err2){
					console.log(err2);
				}
				else{
					// console.log(rows2);
					var str3= 'select count from likes where article_id='+articleid;
					var query3=connection.query(str3, function(err3, rows3){
						if(err3){
							console.log(err3);
						}
						else{
							// console.log(rows3);
							res.render('showNews.ejs',{
								data : rows1,
								comments_data : rows2,
								likes_data : rows3
							});
						}
					});
				}
			});
		}
	});
});

//DELETE
 app.post("/showNews", function(req, res){

	var deleteid = req.query.articleid;
	var str = 'delete from articles where article_id ='+ deleteid;
	var query = connection.query(str, function(err, rows){
		if(err){
			console.log(err);
		}
		else{
			res.send(200, 'Your article is deleted!');
		}
	});

 });

//EDIT
app.get("/updateNews", function(req,res){
	var articleid = req.query.articleid;
	var str = 'select * from articles where article_id =' + articleid;
	var query = connection.query(str, function(err, rows){
		if(err){
			console.log(err);
		}
		else{
			res.render('updateNews.ejs',
				{
					data : rows
				});
		}
	});
});

app.post("/updateNews", function(req, res){
	var updateid = req.query.articleid;
	// console.log(updateid);

	var articles = {
		// 'article_id': req.body.articleid, 
		'userid':req.body.userid,
		// 'date':req.body.date, 
		'title': req.body.title,
		'contents': req.body.contents
	}

	var str = 'update articles set ? where article_id =' + updateid;
	var query = connection.query(str, articles, function(err, result){
		if(err){
			console.log(err);
		}
		res.send(200, 'Thank you. Your article is updated!');
		// res.redirect('/showCollection');
	});
});

//COMMENTS
app.post("/comments", function(req,res){
	var comment = {
		'article_id': req.body.articleid,
		// comment_order
		'userid':req.body.reporter,
		// date 
		'comments': req.body.comments
	}
	// console.log("article id:" + comment.article_id +", userid: " + comment.userid + ",  comments: " + comment.comments);
	var str = 'insert into comments set ?';
	var query = connection.query(str, comment, function(err, result){
		if(err){
			console.log(err);
		}
		res.send(200, 'Thank you. Your comment is submitted!');
		// res.redirect('/showCollection'); //특정 기사의 articleid, show page
	});
});



//RECOMMEND
app.post("/star", function(req, res){
	var like_articleid = req.query.articleid;
	// var sql = 'update articles set ??=??+1 where ??=?';
	// connection.query(sql, ['count', 'count', 'article_id', like_articleid],function(err, results, fields){
	// 	if(err){
	// 		console.log(err);
	// 	}
	// 	res.send(200, "Thank you your recommendation has been submitted");
	// });
// ******stored proecedure이용해여 성공한 방법***********
	connection.query("CALL news.addCount(?,@rcount); SELECT @rcount", [like_articleid], function(err, result,fields) {
	    if (err) {
	        console.log(err);
	    }
	    else {
	    	console.log(result);
	    	res.send(200, "Thank you your recommendation has been submitted");
	    }
	});
// *************************************************
// storedprocedure내용
// CREATE DEFINER=`yskoh`@`localhost` PROCEDURE `addCount`(IN like_articleid int, OUT rcount int)
// begin
// declare inum integer default 0;
// select count into inum from articles where article_id= like_articleid;
// update articles set count = inum + 1 where article_id = like_articleid;
// set rcount:= inum + 1;
// end
// ~~~~~~??이거 왜 안될까?~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// 	var like_articleid = req.query.articleid;
// 	var str = 'select count from articles where article_id =' + like_articleid;
// 	var query = connection.query(str, function(err1, rows1){
// 		if(err1){
// 			console.log(err1);
// 		}
// 		else{
// 			console.log(rows1);
// 			???var str2 = 'update articles set count = 'rows1.value, rows1, str,(select count from articles where article_id=' + like_articleid + ')...'+1 where article_id=' + like_articleid;
// 			var query2 = connection.query(str2, function(err2, rows2){
// 				if(err2){
// 					console.log(err2);					
// 				}
// 				else{
// 					console.log(rows2);
// 					res.send(200, "Thank you for your recommendation");
// 				}
// 			});
// 		}
// 	});
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


});


