;(function () {
    // get all elements 先把信息全都找出来
    var oAvatar = document.getElementById('avatar'),
        oWelcomeMsg = document.getElementById('welcome-msg'),
        oLogoutBtn = document.getElementById('logout-link'),
        oLoginBtn = document.getElementById('login-btn'),    // 拿到整个的Login注册表单的Button
        oLoginForm = document.getElementById('login-form'),
        oLoginUsername = document.getElementById('username'),
        oLoginPwd = document.getElementById('password'),
        oLoginFormBtn = document.getElementById('login-form-btn'),
        oLoginErrorField = document.getElementById('login-error'),
        oRegisterBtn = document.getElementById('register-btn'),    // 拿到整个的Register注册表单的信息
        oRegisterForm = document.getElementById('register-form'),
        oRegisterUsername = document.getElementById('register-username'),
        oRegisterPwd = document.getElementById('register-password'),
        oRegisterFirstName = document.getElementById('register-first-name'),
        oRegisterLastName = document.getElementById('register-last-name'),
        oRegisterFormBtn = document.getElementById('register-form-btn'),
        oRegisterResultField = document.getElementById('register-result'),
        oNearbyBtn = document.getElementById('nearby-btn'),    // 拿到NearbyButton后进行隐藏
        oFavBtn = document.getElementById('fav-btn'),
        oRecommendBtn = document.getElementById('recommend-btn'),  // 拿到RecommendButton后进行隐藏
        oNavBtnBox = document.getElementsByClassName('main-nav')[0],
        oNavBtnList = document.getElementsByClassName('main-nav-btn'), // 拿到Main-nav Button后进行隐藏
        oItemNav = document.getElementById('item-nav'),    // 左边的nav 拿到后进行隐藏
        oItemList = document.getElementById('item-list'),   // 右边的list 拿到后进行隐藏
        oTpl = document.getElementById('tpl').innerHTML,

        // 我们还提供了default data：id, password, lat, lng
        userId = '1111',
        userFullName = 'John',
        // lng = -100,
        // lat = 31,
        // lng = -42.36,
        // lat = -71.05,
        //  lng = -122.08,
        //  lat = 37.38,
       lng = -122,
       lat = 47,
        itemArr;

    // init - IIFE init() 运用立即执行函数，进行作用域的隔离（因为实际的开发环境中，可能会有大量的JS代码，为了每个JS代码之间的变量不会有冲突，需要用到IIFE进行作用域的隔离，因为目前还没有学习router）
    function init() {   // init() 这里是整个project的入口
        // 本函数中，为了达到的目的：显示该显示的 =》 显示login信息，把不需要的隐藏起来 =》 隐藏其他信息。
        // 在本函数中，我一共做两件事情：1. 逻辑结构； 2.事件绑定
        validateSession();  // （1. 逻辑结构）
        bindEvent();  // （2.事件绑定=》将所有的事件绑定全部写入此函数中）
    }

    function validateSession() {
        // （1. 逻辑结构）
        //在本函数中，我要做的事情是switch,login 和 register，如下：
        switchLoginRegister('login');
    }

    function bindEvent() {
        // （2.事件绑定)
        oRegisterFormBtn.addEventListener('click', function () {  // 绑定oRegisterFormBtn注册表单按钮的事件处理函数，让它添加事件监听函数来监听“点击”事件，then,点击后，事件handler函数要进行切换，切换成注册，否则，登陆表单按钮被点击之后，就回到登陆界面
            switchLoginRegister('register')
        }, false);
        oLoginFormBtn.addEventListener('click', function () {  // 绑定oLoginFormBtn登陆表单按钮事件的处理函数
            switchLoginRegister('login')
        }, false);
        oLoginBtn.addEventListener('click', loginExecutor, false); // 绑定oLoginBtn登录按钮事件的处理函数
        oRegisterBtn.addEventListener('click', registerExecutor, false); // 绑定oRegisterBtn注册按钮的事件处理函数
        oNearbyBtn.addEventListener('click', loadNearbyData, false);
        oFavBtn.addEventListener('click', loadFavoriteItems, false);     // loadFavoriteItems该函数是 event handler function
        oRecommendBtn.addEventListener('click', loadRecommendedItems, false);
        oItemList.addEventListener('click', changeFavoriteItem, false);  // changeFavoriteItem是oItemList的event handler function
    }

    function switchLoginRegister(name) {
        // 在本函数中，我要做的是：进行注册和登录的切换，所以，我需要知道我将要切换成什么内容、界面：Login? Register?
        // 内容切换的本质是：将需要隐藏的隐藏起来，需要显示的内容显示出来
        showOrHideElement(oAvatar, 'none'); // style是oAvatar的一个属性，none表示不显示css样式
        showOrHideElement(oWelcomeMsg, 'none');  // 隐藏oWelcomeMsg信息
        showOrHideElement(oLogoutBtn, 'none');   // 隐藏oLogoutBtn信息
        showOrHideElement(oItemNav, 'none');   // 隐藏oItemNav信息
        showOrHideElement(oItemList, 'none');  // 隐藏oItemList信息

        //判断一下我是要显示Login界面 还是要显示SignUp界面
        if (name === 'login') {  // 判断条件：如果是要显示Login界面，我就需要隐藏oRegisterForm信息，保留oLoginForm信息
            showOrHideElement(oRegisterForm, 'none');
            oRegisterResultField.innerHTML = '';     // 报警区域oRegisterResultField也要隐藏掉
            showOrHideElement(oLoginForm, 'block');  // block表示 显示css样式

        } else {  // 如果是要切换到Register界面（就需要对注册时间进行事件绑定），即当我点击注册按钮时，我就需要隐藏oLogin信息，显示oRegisterForm信息
            showOrHideElement(oLoginForm, 'none');
            oLoginErrorField.innerHTML = '';
            showOrHideElement(oRegisterForm, 'block');
        }
    }

    function showOrHideElement(ele, style) {
        ele.style.display = style;
    }

    /**
     * API Login
     */
    function loginExecutor() {   // oLoginBtn登录按钮事件的处理函数
        var username = oLoginUsername.value,  // username输入栏里的信息是通过 .value 属性拿到的
            password = oLoginPwd.value;
        // 拿到username和password信息后，进行一个error判断，若其中一个为空，就显示一个error/warning信息，如下：
        if (username === "" || password == "") {
            oLoginErrorField.innerHTML = 'Please fill in all fields';
            return;
        }
        // 拿到非空的username和password信息后，我需要做一个加密操作by using md5 library, 该md5 library是在index.html下面通过script标签被引入的，该种引入md5的方式把md5存在了window下面作为一个全局变量
        // 也就是说，我会得到一个 window.md5 函数，这个函数就是我的md5 library, 所以这里我可以用md5进行加密
        password = md5(username + md5(password));  // encode password => 加密后，我就得到了password,它就是我要向后端传入的值
        // 这里采用的是多层加密方式，具体加密基层由自己、团队决定

        // then, 我就要进行前后端的数据通信了，即 我将要把前端拿到的用户名和密码等信息发送给后端
        ajax({
            method: 'POST',
            url: './login',
            data: {
                user_id: username,
                password: password,
            },
            success: function (res) {
                if (res.status === 'OK') {
                    welcomeMsg(res);
                    fetchData();
                } else {
                    oLoginErrorField.innerHTML = 'Invalid username or password';
                }
            },
            error: function () {
                throw new Error('Invalid username or password');
            }
        })
    }

    /**
     * API Change Favorite Item
     * @param evt
     */
    // 该函数是oItemList element的 event handler function
    function changeFavoriteItem(evt) {
        var tar = evt.target,    // evt.target 可任意帮我拿到小桃心这个点击事件源
            oParent = tar.parentElement;   // 我还需要知道这个点击事件源的parent是谁，以好后续更改讨薪状态，桃心上有个parentElement属性，

        // 若oParent存在并且 其className是 'fav-link'
        if (oParent && oParent.className === 'fav-link') {
            console.log('change ...')
            var oCurLi = oParent.parentElement,   // oCurLi就是li
                classname = tar.className,
                isFavorite = classname === 'fa fa-heart' ? true : false,
                oItems = oItemList.getElementsByClassName('item'),    // 在子树oItemList下面去找item
                index = Array.prototype.indexOf.call(oItems, oCurLi),      // .call 表示 Array.prototype.indexOf 该方法要用 oItems 身上，该操作等于是 把 oItems这个集合转化成了array，通过对应的index来找到其下面的对应的是第几个元素，找到后把index返回给我， 这里的index = 0， 即第一个元素
                url = './history',
                req = {
                    user_id: userId,
                    favorite: itemArr[index]
                };
            var method = !isFavorite ? 'POST' : 'DELETE';

            ajax({
                method: method,
                url: url,
                data: req,
                success: function (res) {
                    if (res.status === 'OK' || res.result === 'SUCCESS') {
                        tar.className = !isFavorite ? 'fa fa-heart' : 'fa fa-heart-o';
                    } else {
                        throw new Error('Change Favorite failed!')
                    }
                },
                error: function () {
                    throw new Error('Change Favorite failed!')
                }
            })
        }
    }

    /**
     * API Register
     */
    function registerExecutor() {   // oRegisterBtn注册按钮的事件处理函数
        // 首先，收集用户输入的信息：username，password，firstName，lastName
        var username = oRegisterUsername.value,
            password = oRegisterPwd.value,
            firstName = oRegisterFirstName.value,
            lastName = oRegisterLastName.value;
        // 然后，对收集到的信息进行一下validation的判断，看看是否合法存在，是否为空
        if (username === "" || password == "" || firstName === ""
            || lastName === "") {
            oRegisterResultField.innerHTML = 'Please fill in all fields';
            return;
        }
        // 判断下用户名是否匹配数字和字母，一个或多个
        if (username.match(/^[a-z0-9_]+$/) === null) {    // 这里用的是regular expression
            oRegisterResultField.innerHTML = 'Invalid username'; // 若不匹配，会输入无效的用户名提示
            return;
        }
        password = md5(username + md5(password));   // 同样的操作=》对密码进行双重加密

        // 调用ajax
        ajax({
            method: 'POST',
            url: './register',
            data: {
                user_id : username,
                password : password,
                first_name : firstName,
                last_name : lastName,
            },
            success: function (res) {
                if (res.status === 'OK' || res.result === 'OK') {
                    oRegisterResultField.innerHTML = 'Successfully registered!'
                } else {
                    oRegisterResultField.innerHTML = 'User already existed!'
                }
            },
            error: function () {
                //show login error
                throw new Error('Failed to register');
            }
        })
    }

    /**
     * API Load Nearby Items
     */
    function loadNearbyData() {
        // active side bar buttons先激活按钮
        activeBtn('nearby-btn');

        var opt = {
            method: 'GET',
            url: './search?user_id=' + userId + '&lat=' + lat + '&lon=' + lng,
            data: null,
            message: 'nearby'
        }
        serverExecutor(opt);
    }

    /**
     * API Load Favorite Items
     */
    // 该函数是 oFavBtn element 的 Event handler function
    function loadFavoriteItems() {
        activeBtn('fav-btn');
        var opt = {
            method: 'GET',
            url: './history?user_id=' + userId,
            data: null,
            message: 'favorite'
        }
        serverExecutor(opt);
    }

    /**
     * API Load Recommended Items
     */
    function loadRecommendedItems() {
        activeBtn('recommend-btn');
        var opt = {
            method: 'GET',
            url: './recommendation?user_id=' + userId + '&lat=' + lat + '&lon=' + lng,
            data: null,
            message: 'recommended'
        }
        serverExecutor(opt);
    }

    /**
     * Render Data
     * @param data
     */
    // 我们这里的render的目的是为了把后端传来的数据注入到DOM当中去（俗称挂树），DOM当中，由于我们的拿到数据结构比较复杂，所以用了template的方式，把需要注入的数据用类似于变量的形式呈现出来，类似于变量的形式体现在index.html代码中（即采用了“加括号的方式”）
    function render(data) {
        var len = data.length,
            list = '',
            item;
        for (var i = 0; i < len; i++) {
            item = data[i];
            // 采用了template的方式来实现数据的转换显示（通过replace函数）; regular expression方法
            list += oTpl.replace(/{{(.*?)}}/gmi, function (node, key) {
                                  //  找到第一个花括号/ gmi表示所有内容，进行替换； 第二个参数是使用了function(){}回调函数来实现复杂的替换逻辑 => node指的是(.*？)里面找到的内容，node可以找到我的opt下面的id，key是（）里面将要被替换成的内容，这里的node和key是replace这个方法传给它的
                console.log(key)
                if(key === 'company_logo') {
                    return item[key] || 'https://via.placeholder.com/100';
                }
                if (key === 'location') {
                    return item[key].replace(/,/g, '<br/>').replace(/\"/g, '');
                }
                if (key === 'favorite') {
                    return item[key] ? "fa fa-heart" : "fa fa-heart-o";
                }
                return item[key];
            })
        }
        oItemList.innerHTML = list;
    }

    function activeBtn(btnId) {
        var len = oNavBtnList.length;
        for (var i = 0; i < len; i++) {
            oNavBtnList[i].className = 'main-nav-btn';
        }
        var btn = document.getElementById(btnId);
        btn.className += ' active';
    }

    /**
     * Fetch Geolocation
     * @param cb
     */
    function initGeo(cb) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                    // lat = position.coords.latitude || lat;  // comment out
                    // lng = position.coords.longitude || lng;  // comment out
                    cb();
                },
                function () {
                    throw new Error('Geo location fetch failed!!')
                }, {
                    maximumAge: 60000
                });
            oItemList.innerHTML = '<p class="notice"><i class="fa fa-spinner fa-spin"></i>Retrieving your location...</p>';
        } else {
            throw new Error('Your browser does not support navigator!!')
        }
    }

    // function showOrHideElement(ele, style) {
    //     ele.style.display = style;
    // }

    function welcomeMsg(info) {
        userId = info.user_id || userId;
        userFullName = info.name || userFullName;
        oWelcomeMsg.innerHTML = 'Welcome ' + userFullName;

        // show welcome, avatar, item area, logout btn
        showOrHideElement(oWelcomeMsg, 'block');     // 显示图标
        showOrHideElement(oAvatar, 'block');
        showOrHideElement(oItemNav, 'block');
        showOrHideElement(oItemList, 'block');
        showOrHideElement(oLogoutBtn, 'block');

        // hide login form
        showOrHideElement(oLoginForm, 'none');     // 隐藏登录图标信息
    }

    // 拿地理数据
    function fetchData() {
        // get geo-location info
        initGeo(loadNearbyData);
    }

    /**
     * Helper function - AJAX
     * @param opt
     */
    // ajax的定义
    // 这个 helper function 实际上是做了一个ajax请求，所有的ajax都要通过这个helper function来实现
    // 该 helper function 目的：实现所有的 Request 和 Response 的请求
    // 为何要写这个 helper function？ 第一：本项目中的前后端通信会产生很多的 Request 和 Response 的请求，为了避免代码的重复性，实现代码的整洁，我就把这些需要很多次的相同的操作写在了 helper function里
    //                             第二：在JS代码中，一般情况下，由于一个函数只做一件事情，故我这个helper function函数只实现了一个功能，即“数据通信”这件事情。
    function ajax(opt) {   // opt 在这里作为了 传入项， opt本身是一个object/instance
        var opt = opt || {},   // opt 是配置项(若该opt存在，他就是opt,否则就默认为空对象 {} )，该配置项可以避免 "由于传入的参数的顺序的变化导致整个回调函数被调用的的失败问题" the order/sequence change of called parameter may generate failure of callback function 带来的弊端
            method = (opt.method || 'GET').toUpperCase(),   // 传个method，这是opt对象的属性attribute， method在这里也是 传入项; method方法从哪里获取？要么从opt配置项中的method获得，或者method它是一个默认的GET方法/请求
            url = opt.url,   // 传进来个url， 它是对象的属性
            data = opt.data || null,  // data如何获得？一样的，如果data存在我就获得data,否则为空null
            success = opt.success || function () {    // 要给我一个成功的回调函数，告诉我是否成功了，成功了的话要做什么事情， 对于成功了以后需要做什么就要通过回调函数才知道
            },
            error = opt.error || function () {    // 再给我一个失败的回调函数， 即 失败了我要做什么，失败了以后需要做什么就通过失败的回调函数
            },
            xhr = new XMLHttpRequest();   // then, 创建一个httpRequest的实例instance xhr => Step1: Create a xhr instance

        if (!url) {   // 如果url不存在，及要扔一个提醒说missing url
            throw new Error('missing url');
        }

        xhr.open(method, url, true);    // Step2: Configuration => 配置method and url
        // send 这里分两种情况
        if (!data) {   // case2.1: 没有数据的话，就直接发送
            xhr.send();
        } else {   // case2.2: 若有数据的话，我就需要设置一下我的content type
            xhr.setRequestHeader('Content-type', 'application/json;charset=utf-8');     //  本项目中的数据类型是JSON,并且解放方式是utf-8
            // 然后，我以 string 的方式进行数据的发送
            xhr.send(JSON.stringify(data));
        }

        // Step4: listen request and response =》监听
            // Case4.1: 前后端数据传递成功/配对成功 => 我拿到了后端返回来的data
        xhr.onload = function () {
            if (xhr.status === 200) {  // 4.1.1 如果status === 200 的话：
                success(JSON.parse(xhr.responseText))   // 拿到数据后，我需要把data进行解析，变成对象xhr的格式，然后把它传给我的“成功的回调函数”，至于拿到数据后的成功回调函数具体要做什么，需要另外在回调函数success里进行具体定义
            } else {  // 4.1.2 否则，若status !== 200 的话，执行error（）函数
                error()
                // else 语句这里，传入的是 “失败的回调函数”，即失败了之后要做什么事，是我自己传入的函数，我自己定义的
            }
        }
            // Case4.2: 如果前后端数据通信、配对环节失败的话/有任何错误，throw error warning info
        xhr.onerror = function () {    // 这里的 .onerror 是Ajax的实例xhr的一个属性，这里的函数是xhr去调用的，故xhr决定了什么时候去调用它，它是xhr帮我定义好的函数，别人写好的
            throw new Error('The request could not be completed.')
        }
    }

    /**
     * Helper - Get Data from Server
     */
    function serverExecutor(opt) {
        oItemList.innerHTML = '<p class="notice"><i class="fa fa-exclamation-triangle"></i>Loading ' + opt.message + ' item...</p>';
        ajax({
            method: opt.method,
            url: opt.url,
            data: opt.data,
            success: function (res) {
                if (!res || res.length === 0) {
                    oItemList.innerHTML = '<p class="notice"><i class="fa fa-exclamation-triangle"></i>No ' + opt.message + ' item!</p>';
                } else {
                    render(res);
                    itemArr = res;
                }
            },
            error: function () {
                throw new Error('No ' + opt.message + ' items!');
            }
        })
    }

    init();
})()