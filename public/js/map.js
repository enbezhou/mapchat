// 1. every request will generate a uuid store it in cookie(expireDate=1day). and register this uuid info to a list.
// 2. get All online user uuid.
// 3. show all user in map.
// 4. click the title image, video chat send.
// 5. another user click agree. connected.
// 6. video talking.

var currentLocation = null;
var onlineUsers = null;
AMap.plugin('AMap.Geolocation', function() {
    var geolocation = new AMap.Geolocation({
        // 是否使用高精度定位，默认：true
        enableHighAccuracy: true,
        // 设置定位超时时间，默认：无穷大
        timeout: 10000,
        // 定位按钮的停靠位置的偏移量，默认：Pixel(10, 20)
        buttonOffset: new AMap.Pixel(10, 20),
        //  定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
        zoomToAccuracy: true,
        //  定位按钮的排放位置,  RB表示右下
        buttonPosition: 'RB'
    })

    geolocation.getCurrentPosition()
    AMap.event.addListener(geolocation, 'complete', onComplete)
    AMap.event.addListener(geolocation, 'error', onError)

    function onComplete (data) {
        // data是具体的定位信息
        currentLocation = data;
        console.log(data);
        var localUserInfo = getLocalUserInfo(data);
        registUserinfo(localUserInfo);
        registerUserSocket(localUserInfo.uuid);
    }

    function onError (data) {
        // 定位出错
    }
})

function loadOnlineUsers() {
    getOnlineUsers(loadOnlineUsersSuccess);
}

function loadOnlineUsersSuccess(userInfoList) {
    // hidden init image
    initImageDiv.style.visibility="hidden";
    mapContainer.style.visibility = "visible";
    // show user in map.
    showUsersInMap(userInfoList);
}

function showUsersInMap(userListStr) {
    var userList = JSON.parse(userListStr);
    var map = new AMap.Map('map-container', {
        resizeEnable: true,
        center:[userList[0].lng, userList[0].lat],
        zoom: 15
    });
    var currentUuid = getAndSaveUuid();
    for (let i=0; i < userList.length; i++) {
        //经纬度获取失败，加载高德地图获取
        var iconImg = "/image/title/" + userList[i].userIcon + ".jpg"
        console.log("test" + iconImg);

        var marker = new AMap.Marker({
            map: map,
            icon: new AMap.Icon({
                image: iconImg,
                size: new AMap.Size(50, 50),  //图标所处区域大小
                imageSize: new AMap.Size(50, 50) //图标大小
            }),
            position: [userList[i].lng, userList[i].lat],
            // position: [116.405467, 39.907761]
        });
        if (userList[i].uuid != currentUuid) {
            marker.on('click', function () {
                var roomNum = generateRoom(currentUuid, userList[i].uuid);
                var inviteInfo = {
                    currentUuid: currentUuid,
                    friendUuid: userList[i].uuid
                }
                console.log(userList[i].uuid);
                inviteFriend(inviteInfo);
                startVideoChat(roomNum);
                map && map.destroy();
            });
        }
    }
    map.setFitView();
    AMap.plugin([
        'AMap.ToolBar',
    ], function(){
        map.addControl(new AMap.ToolBar({
            liteStyle: true
        }));
    });
}

function generateRoom(currentUuid, secondUuid) {
    var roomNum = null;
    if(currentUuid.substr(0, 1) > secondUuid.substr(0, 1)) {
        roomNum = currentUuid + '-' + secondUuid;
    } else if (currentUuid.substr(0, 1) < secondUuid.substr(0, 1)) {
        roomNum = secondUuid + '-' + currentUuid;
    } else {
        if(currentUuid.substr(1, 2) > secondUuid.substr(1, 2)) {
            roomNum = currentUuid + '-' + secondUuid;
        } else if (currentUuid.substr(1, 2) < secondUuid.substr(1, 2)) {
            roomNum = secondUuid + '-' + currentUuid;
        } else {
            if(currentUuid.substr(2, 3) > secondUuid.substr(2, 3)) {
                roomNum = currentUuid + '-' + secondUuid;
            } else if (currentUuid.substr(2, 3) < secondUuid.substr(2, 3)) {
                roomNum = secondUuid + '-' + currentUuid;
            } else {
                roomNum = currentUuid + '-' + secondUuid;
            }
        }
    }
    return roomNum;
}

function registUserinfo(userInfo) {
    Ajax.post("/user/register", JSON.stringify(userInfo), function () {
        console.log("Register user success");
    })
}

function getOnlineUsers(callback) {
    Ajax.get("/user/list", callback);
}

function getLocalUserInfo(curLocation) {
    if (curLocation) {
        return {
            uuid: getAndSaveUuid(),
            userIcon: randomNum(1, 10),
            lng: curLocation.position.lng,
            lat: curLocation.position.lat
        }
    }
    return null;
}

function getAndSaveUuid() {
    var videochat_uuid;
    if (getCookie("videochat_ticket") && getCookie("videochat_ticket").length > 5) {
        videochat_uuid = getCookie("videochat_ticket");
    } else {
        videochat_uuid = generateUuid();
        setCookie("videochat_ticket", generateUuid(), 1);
    }
    return videochat_uuid;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++)
    {
        var c = ca[i].trim();
        if (c.indexOf(name)==0) return c.substring(name.length,c.length);
    }
    return "";
}

function setCookie(cname,cvalue,exdays) {
    var d = new Date();
    d.setTime(d.getTime()+(exdays*24*60*60*1000));
    var expires = "expires="+d.toGMTString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function randomNum(minNum, maxNum) {
    switch (arguments.length) {
        case 1:
            return parseInt(Math.random() * minNum + 1, 10);
            break;
        case 2:
            return parseInt(Math.random() * ( maxNum - minNum + 1 ) + minNum, 10);
            //或者 Math.floor(Math.random()*( maxNum - minNum + 1 ) + minNum );
            break;
        default:
            return 0;
            break;
    }
}

function generateUuid() {
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 10; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    var uuid = s.join("");
    return uuid;
}
// https://www.cnblogs.com/yeminglong/p/6249077.html
function generateUuidV2() {
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "-";

    var uuid = s.join("");
    return uuid;
}
