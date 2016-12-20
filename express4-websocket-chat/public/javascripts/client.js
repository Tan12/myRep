$(function(){
  var $chooseName = $('.chooseName'),
      $inpuName = $('.inputName'),
      $getName = $('.getName'),
      $submit = $('.submit'),
      $chatBox = $('.chatBox'),
      $onlinePeople = $('.onlinePeople'),
      $chatWindow = $('.chatWindow'),
      $userName = $('#userName'),
      $bottomForm = $('.bottomForm'),
      $chatForm = $('.chatForm'),
      $message = $('.message'),
      $send = $('send'),
      obj = {};

  //var socket = io.connect('http://localhost:3000');
  var socket = io();

  $chooseName.submit(function(){
    if($getName.val() === ''){
      $chooseName.children('span').text('请输入内容!').show();
      return false;
    }
    obj.name = $getName.val();
    socket.emit('login', obj.name);

    // 向服务端查询用户名是否存在
    socket.on('errorMsg', function(data){
      if(data === 'false'){
        $chooseName.children('span').text('该用户已存在！').show();
      }else{
        $userName.text(obj.name + ' | ');
        $chooseName.hide();
        $chatBox.show();
        $getName.val('');
      }
    });
    return false;
  });

  // 监听input值，当有内容输入时，移除下面的提示span
  $getName.on('input propertychange', function(){
    if($getName.val() !== ''){
      $chooseName.children('span').hide();
    }
  });

  socket.on('online', function(online) {
    $onlinePeople.text('当前一共'+ online.onlineCount + '人在线： ' + online.onlineUsers.join('、'));
  });

  // 提交消息
  $chatForm.submit(function(){
    if($message.val() === ''){
      $bottomForm.children('span').show();
      return false;
    }
    obj.msg = $message.val();
    socket.emit('message', obj);
    var $section = $('<section>');
    var $span = $('<span>').text(obj.name);
    var $p = $('<p>').text(obj.msg);
    $section.addClass('user');
    $section.append($p).append($span);
    $chatWindow.append($section);
    $message.val('');
    return false;
  });

  $message.on('input propertychange', function(){
    if($message.val() !== ''){
      $bottomForm.children('span').hide();
    }
  });

  socket.on('msg', function (msg) {
   //console.log(msg);
   var $section = $('<section>');
   var $span = $('<span>').text(msg.name);
   var $p = $('<p>').text(msg.msg);
   $section.addClass('others');
   $section.append($span).append($p);
   $chatWindow.append($section);
  });

  // 退出
  $userName.siblings('a').click(function(){
    location.reload();
  });
});
