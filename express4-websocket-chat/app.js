var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var ejs = require('ejs');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var port = process.env.PORT || 3000;
//app.set('port', process.env.PORT || 3000);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', ejs.__express);
app.set('view engine', 'html');

app.get('/', function(req, res){
  res.sendfile('views/index.html');
});

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// 定制500页面
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('text/plain');
  res.status(500);
  res.send('500 - Server Error');
});

// 主要代码
var onlineUsers = [];
var onlineCount = 0;
io.on('connection', function (socket) {
  console.log('a user connected');

  socket.on('disconnect', function(){
    console.log(socket.name + ' disconnected');
    onlineUsers = onlineUsers.filter(function(item){
      return item !== socket.name;
    });
    if(typeof(socket.name) !== 'undefined'){
      onlineCount--;
    }
    socket.broadcast.emit('online',{onlineUsers, onlineCount});
  });

  socket.on('login', function(name){
    console.log(name);
    if(onlineUsers.indexOf(name) !== -1){
      console.log(onlineUsers.indexOf(name));
      socket.emit('errorMsg', 'false');
    }else {
      socket.emit('errorMsg', 'true');
      onlineUsers.push(name);
      socket.name = name;
      onlineCount++;
      socket.emit('online',{onlineUsers, onlineCount});
      // 广播让其他用户也知道有新用户进入
      socket.broadcast.emit('online',{onlineUsers, onlineCount});
    }
  });

  socket.on('message', function(obj){
    socket.broadcast.emit('msg', obj);
    console.log(obj.msg);
    console.log(obj.name + ' say: ' + obj.msg);
  });

}); // connection 监听结束

http.listen(port, function(){
  console.log('express started on http://localhost:' + port + '.');
});

/*
app.listen(app.get('port'), function(){
  console.log('express started on http://localhost:' + app.get('port') + '.');
});
*/

module.exports = app;
