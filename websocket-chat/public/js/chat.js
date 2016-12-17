$(function(){
    var $content = $('.content'),
        $status = $('.status'),
        $input = $('.input'),
        myName = false;

    // 建立websocket连接
    socket = io.connect('http://localhost:3000');
    // 收到服务器的连接确认（from app.js）
    socket.on('open', function(){
        $status.text('your name: ');
    });

    socket.on('system', function(obj){
        var p = '', say = '';
        if(obj.type === 'welcome'){
            if(myName === obj.text){
                $status.text(myName + ": ").css('color', obj.color);
            }
            say = " : Welcome ";
        }else if (obj.type === 'disconnect') {
            say = " : Bye ";
        }
        p = "<p style='background-color: "+ obj.color + "'>System @" + obj.time + say + obj.text + "</p>";
        $content.prepend(p);
    });

    socket.on('message', function(obj){
        var p = "<p><span style='color:" + obj.color +"'>" + obj.author + "</span> @" + obj.time + " : " + obj.text + "</p>";
        $content.prepend(p);
    });

    // 回车提交聊天信息
    $input.keydown(function(e){
      if(e.keyCode === 13){
        var msg = $(this).val();
        if(!msg){
          return false;
        }
        $content.show();
        socket.send(msg);
        $(this).val('');
        if(!myName){
          myName = msg;
        }
      }
    });
});
