var peer_id;
var peer_name;
var username;
var conn;
var customConfig;
var peer = new Peer({key: 'peerjs',
                    host: 'peerjs-stc.herokuapp.com',
                    secure: true,
                    port: 443,
                    config: {'iceServers':  [   {  url: 'stun:s3.xirsys.com'},
                                                {
                                                    username: "c21e0412-5a9c-11e8-bcdf-4bff8ef678a9",
                                                    url: "turn:s3.xirsys.com:80?transport=udp",
                                                    credential: "c21e06b0-5a9c-11e8-82e4-039ee05c0ab6"
                                                },
                                                {
                                                    username: "c21e0412-5a9c-11e8-bcdf-4bff8ef678a9",
                                                    url: "turn:s3.xirsys.com:3478?transport=udp",
                                                    credential: "c21e06b0-5a9c-11e8-82e4-039ee05c0ab6"
                                                },
                                                {
                                                    username: "c21e0412-5a9c-11e8-bcdf-4bff8ef678a9",
                                                    url: "turn:s3.xirsys.com:80?transport=tcp",
                                                    credential: "c21e06b0-5a9c-11e8-82e4-039ee05c0ab6"
                                                },
                                                {
                                                    username: "c21e0412-5a9c-11e8-bcdf-4bff8ef678a9",
                                                    url: "turn:s3.xirsys.com:3478?transport=tcp",
                                                    credential: "c21e06b0-5a9c-11e8-82e4-039ee05c0ab6"
                                                },
                                                {
                                                    username: "c21e0412-5a9c-11e8-bcdf-4bff8ef678a9",
                                                    url: "turns:s3.xirsys.com:443?transport=tcp",
                                                    credential: "c21e06b0-5a9c-11e8-82e4-039ee05c0ab6"
                                                },
                                                {
                                                    username: "c21e0412-5a9c-11e8-bcdf-4bff8ef678a9",
                                                    url: "turns:s3.xirsys.com:5349?transport=tcp",
                                                    credential: "c21e06b0-5a9c-11e8-82e4-039ee05c0ab6"
                                                },
                                            ]
                            }
                    });
var socket = io();

socket.on('new_user', function (user) {
    document.getElementById("list-online").innerHTML += `<button id="${user.peerid}" type="button" class="list-group-item list-group-item-action" onclick="connectPeer('${user.peerid}');">${user.username}</button>`;
});

socket.on('user_disconnect', function (peerid) {
    var x = document.getElementById(peerid);
    if(x) x.remove();
});

socket.on('list_online', function (listUser) {
    var x = document.getElementById("list-online");
    document.getElementById("username").innerText = username;
    document.getElementById("show-camera").className = "row";
    document.getElementById("connection-form").className += " hidden";
    x.innerHTML = `<div class="list-group-item list-group-item-action active">Danh sách online</div>`;
    for (user of listUser) {
        if(user.peerid !== peer.id)
            x.innerHTML += `<button id="${user.peerid}" type="button" class="list-group-item list-group-item-action" onclick="connectPeer('${user.peerid}');">${user.username}</button>`;
    }
});

socket.on('register_fail', function () {
    alert("Người dùng này đã tồn tại, vui lòng chọn tên khác!");
});

peer.on('open', function () {

});

//Khi có người kết nối đến
peer.on('connection', function (connection) {
    conn = connection;
    peer_id = connection.peer;
    peer_name = connection.metadata.username;
    //Sử dụng handleMessage để callback khi có tin nhắn đến
    conn.on('data', handleMessage);
    document.getElementById("connected_peer").innerText = peer_name;
    document.getElementById("chat").className = "";
});


peer.on('disconnected', function() {
    peer.reconnect();
});

//Khi nhận được cuộc gọi
peer.on('call', function (call) {
    var acceptsCall = confirm(peer_name+" muốn gọi video cho bạn, bạn có đồng ý không?");
    if(acceptsCall){
        requestLocalVideo({
            success: function(localstream){
                window.localStream = localstream;
                onReceiveStream(localstream, 'my-camera');
                //Trả lời cuộc gọi bằng stream video của mình
                call.answer(localstream);

                // Nhận stream của người khác
                call.on('stream', function (stream) {
                    // Lưu stream vào cục bộ
                    window.peer_stream = stream;
                    // Hiện thị stream của người khác ở peer-camera!
                    onReceiveStream(stream, 'peer-camera');
                });

                // Khi kết thúc gọi
                call.on('close', function(){
                    alert("Cuộc gọi đã kết thúc");
                });

                // Để ngắt cuộc gọi dùng call.close()
            },
            error: function(err){
                alert("Không thể truy cập camera!");
                console.error(err);
            }
        });
    }
});

//Yêu cầu 1 cuộc gọi cho người khác
document.getElementById("call").addEventListener("click", function(){
    requestLocalVideo({
        success: function(localstream){
            window.localStream = localstream;
            onReceiveStream(localstream, 'my-camera');
            var call = peer.call(peer_id, localstream);
            
            // Nhận stream của người khác
            call.on('stream', function (stream) {
                window.peer_stream = stream;
                onReceiveStream(stream, 'peer-camera');
            });
            
            // Khi kết thúc gọi
            call.on('close', function(){
                alert("Cuộc gọi đã kết thúc");
            });
        },
        error: function(err){
            alert("Không thể truy cập camera!");
            console.error(err);
        }
    });
});

function requestLocalVideo(callbacks) {
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    navigator.getUserMedia({ audio: true, video: true }, callbacks.success , callbacks.error);
}

function onReceiveStream(stream, element_id) {
    //Hiển thị video
    var video = document.getElementById(element_id);
    // video.src = window.URL.createObjectURL(stream);
    video.srcObject = stream;
    // Lưu thành toàn cục
    //window.peer_stream = stream;
    console.log(stream,element_id);
}

function handleMessage(data) {
    //Vị trí tin nhắn trái hoặc phải
    var orientation = " text-left";
    if(data.from == username){
        orientation = " text-right"
    }

    var messageHTML =  '<a href="javascript:void(0);" class="list-group-item' + orientation + '">';
        messageHTML += '<h4 class="list-group-item-heading">'+ data.from +'</h4>';
        messageHTML += '<p class="list-group-item-text">'+ data.text +'</p>';
        messageHTML += '</a>';

    document.getElementById("messages").innerHTML += messageHTML;
}

function sendMessenger(){
    var text = document.getElementById("message");
    // Thông tin của tin nhắn
    var data = {
        from: username,
        text: text.value
    };
    text.value = "";
    // Gửi tin nhắn
    conn.send(data);
    //Hiển thị tin nhắn
    handleMessage(data);
};

document.getElementById("send-message").onclick = sendMessenger;

var x = document.getElementById("message");

x.onkeyup = (e) => {
    if((e.keyCode == 13 || e.which == 13) && !e.shiftKey) {
        sendMessenger();
        x.setAttribute('style', 'min-height:38px; height: auto;');
    }
};

x.oninput = () =>{
    x.setAttribute('style', 'min-height:38px; height: auto;');
    x.setAttribute('style', 'min-height:38px; height: ' + x.scrollHeight + 'px; overflow-y:hidden;');
}

//Bắt đầu kết nối sau khi click button
document.getElementById("connect-to-peer-btn").addEventListener("click", function(){
    username = document.getElementById("name").value;
    if (username) {
        socket.emit('new_user',{"username" : username, "peerid": peer.id});
    }else{
        alert("Bạn phải nhập tên của mình");
    }    
});

function connectPeer(id){
    peer_id = id;
    conn = peer.connect(id, {
        metadata: {
            'username': username
        }
    });
	peer_name = document.getElementById(id).innerHTML;
	document.getElementById("connected_peer").innerText = peer_name;
    conn.on('data', handleMessage);
    document.getElementById("chat").className = "";
}
