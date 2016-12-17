var express = require('express'),
    app = express(),
    //createServer:调用该返回的对象中的 listen 方法，对服务端口进行监听
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    path = require('path'); // 提供用于处理文件和目录路径的工具

io.set('log level', 1); //将socket.io中的debug信息关闭

// 监听websocket连接事件
io.on('connection', function(socket){
     // emit用于发送数据，在另一端接收时，可以这么写： socket.on('open',function(){...});
    socket.emit('open'); // 通知客户端已连接

    // 定义用户对象
    var client = {
      socket : socket,
      name : false,
      color : getColor()
    };

    // 监听message事件
    socket.on('message', function(msg){
        var obj = {
          time : getTime(),
          color : client.color
        };

        // 判断是不是第一次连接，以第一条消息作为用户名
        if(!client.name){
            client.name = msg;
            obj.text = client.name;
            obj.author = 'System';
            obj.type = 'welcome';
            console.log(client.name + ' login');

            // 返回欢迎语
            socket.emit('system', obj);
            // 广播新用户已登陆
            socket.broadcast.emit('system', obj);
        }else {
            // 不是第一次连接，则是正常的聊天信息
            obj.text = msg;
            obj.author = client.name;
            obj.type = 'message';
            console.log(client.name + ' say ' + msg);

            // 返回消息（可以省略）
            socket.emit('message', obj);
            // 向其他用户广播此消息
            socket.broadcast.emit('message', obj);
        }

    });

    // 监听退出事件
    socket.on('disconnect', function(){
      var obj = {
        time : getTime(),
        color : client.color,
        author : 'System',
        text : client.name,
        type : 'disconnect'
      }

      // 广播用户已退出
      socket.broadcast.emit('system', obj);
      console.log(client.name + 'disconnect');
    });
}); // 监听connection事件结束

// express基本配置，不带参数为全局环境
app.configure(function(){
    app.set('port', process.env.PORT || 3000); // 环境端口或3000端口
    app.set('views', __dirname + '/views'); // 视图存放的目录
    // 通过app.use()来使用中间件（middleware），use的先后顺序决定了中间件的优先级
    app.use(express.favicon());
    app.use(express.logger('dev')); // express.logger() 通常是最先使用的一个组件，纪录之后的每一个请求
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public'))); // 制定静态资源的根目录
});

// 生产环境中抛出异常
app.configure('development', function(){
    app.use(express.errorHandler());
});

// 指定websocket客户端的html文件
app.get('/', function(req, res){
    res.sendfile('views/index.html');
});

server.listen(app.get('port'), function(){
    console.log("express server listening on port " + app.get('port'));
});

var getTime = function(){
    var date = new Date();
    return date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
};

var getColor = function(){
    var colors = ['#376956','#495A80','#DEA681','#da765b','#7bbfea',
                  '#b7ba6b','#70a19f','#ca8687','#4C556E','#B05B5C',
                  '#99758D','#90A691','#7E8282','#5F7896'],
        randomColor = parseInt(Math.random() * colors.length);
    return colors[randomColor];
};
