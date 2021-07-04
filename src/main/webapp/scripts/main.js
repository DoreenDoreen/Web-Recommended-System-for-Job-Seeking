;(function () {
    // get all elements 先把信息全都找出来
    var oAvatar = document.getElementById('avatar'),
        oWelcomeMsg = document.getElementById('welcome-msg'),
        oLogoutBtn = document.getElementById('logout-link'),
        oLoginBtn = document.getElementById('login-btn'),    // get button of login form
        oLoginForm = document.getElementById('login-form'),
        oLoginUsername = document.getElementById('username'),
        oLoginPwd = document.getElementById('password'),
        oLoginFormBtn = document.getElementById('login-form-btn'),
        oLoginErrorField = document.getElementById('login-error'),
        oRegisterBtn = document.getElementById('register-btn'),    // get info from whole Registration form
        oRegisterForm = document.getElementById('register-form'),
        oRegisterUsername = document.getElementById('register-username'),
        oRegisterPwd = document.getElementById('register-password'),
        oRegisterFirstName = document.getElementById('register-first-name'),
        oRegisterLastName = document.getElementById('register-last-name'),
        oRegisterFormBtn = document.getElementById('register-form-btn'),
        oRegisterResultField = document.getElementById('register-result'),
        oNearbyBtn = document.getElementById('nearby-btn'),    // get NearbyButton, then hiding
        oFavBtn = document.getElementById('fav-btn'),
        oRecommendBtn = document.getElementById('recommend-btn'),  // get RecommendButton, then hiding
        oNavBtnBox = document.getElementsByClassName('main-nav')[0],
        oNavBtnList = document.getElementsByClassName('main-nav-btn'), // get Main-nav Button, then hiding
        oItemNav = document.getElementById('item-nav'),    // get left nav, then hiding
        oItemList = document.getElementById('item-list'),   // get right list, then hiding
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

    // init - IIFE init() Use immediate execution functions to isolate the scope
    // (because there may be a lot of JS code in the actual development environment,
    // in order to avoid conflicts between the variables between each JS code, IIFE needs to be used to isolate the scope.
    // could use router later
    function init() {   // init() Here is the entrance of the entire project
        // Function purpose:  display that should be displayed => display the login information, hide the unnecessary information => hide other information
        validateSession();  // 1. Logical structure
        bindEvent();  // 2.Event binding => Write all event bindings into this function
    }

    function validateSession() {
        // 1. Logical structure
        //Things to do in this function: switch, log in and register.
        switchLoginRegister('login');
    }

    function bindEvent() {
        // 2.Event binding
        oRegisterFormBtn.addEventListener('click', function () {  // 绑定oRegisterFormBtn注册表单按钮的事件处理函数，让它添加事件监听函数来监听“点击”事件，then,点击后，事件handler函数要进行切换，切换成注册，否则，登陆表单按钮被点击之后，就回到登陆界面
            switchLoginRegister('register')
        }, false);
        oLoginFormBtn.addEventListener('click', function () {  // Bind oLoginFormBtn event
            switchLoginRegister('login')
        }, false);
        oLoginBtn.addEventListener('click', loginExecutor, false); // Bind oLoginBtn event
        oRegisterBtn.addEventListener('click', registerExecutor, false); // Bind oRegisterBtn event
        oNearbyBtn.addEventListener('click', loadNearbyData, false);
        oFavBtn.addEventListener('click', loadFavoriteItems, false);     // loadFavoriteItems => event handler function
        oRecommendBtn.addEventListener('click', loadRecommendedItems, false);
        oItemList.addEventListener('click', changeFavoriteItem, false);  // changeFavoriteItem is oItemList的event handler function
    }

    function switchLoginRegister(name) {
        // In this function, I need to switch between registration and login,
        // so I need to know what content and interface I will switch to either Login or Register.
        // The essence of content switching is: hiding what needs to be hidden, and displaying what needs to be displayed
        showOrHideElement(oAvatar, 'none'); // 2nd parameter, style is oAvatar's attribute，none means not show css layout
        showOrHideElement(oWelcomeMsg, 'none');  // hide oWelcomeMsg info
        showOrHideElement(oLogoutBtn, 'none');   // hide oLogoutBtn info
        showOrHideElement(oItemNav, 'none');   // hide oItemNav
        showOrHideElement(oItemList, 'none');  // hide oItemList

        //Determine whether to show Login interface or SignUp interface
        if (name === 'login') {  // If displaying login interface, then need to hide oRegisterForm information and keep oLoginForm information
            showOrHideElement(oRegisterForm, 'none');
            oRegisterResultField.innerHTML = '';
            showOrHideElement(oLoginForm, 'block');  // block means displaying css layout

        } else {  //If need to switch to Register interface, then need to bind the registration time event.
            // That is, when clicking the registration button, I need to hide the oLogin information and display the oRegisterForm information
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
    function loginExecutor() {   // oLoginBtn login button event handler
        var username = oLoginUsername.value,  // username information as input is obtained through .value attribute
            password = oLoginPwd.value;
        // After getting the username and password info, do an error judgment. If either is empty, an warning message will be displayed, as follows:
        if (username === "" || password == "") {
            oLoginErrorField.innerHTML = 'Please fill in all fields';
            return;
        }
        // If neither username or password is empty, perform an encryption operation by using md5 library.
        // The md5 library is imported through the script tag under index.html. This way of introducing md5 saves md5 under the window as a global variable.
        // Once get a window.md5 function (it is md5 library), I can use md5 for encryption
        password = md5(username + md5(password));  // encode password => After encryption, I get the password, it is the value I want to pass to the backend
        // The multi-layer encryption method is applied here. Particular encryption approach is determined by the team  manager

        // then, perform data communication between front and back ends => send username and password received from the front end to the back end
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
    // below is oItemList element's event handler function
    function changeFavoriteItem(evt) {
        var tar = evt.target,    // evt.target can get the click event source of Little Peach Heart
            oParent = tar.parentElement;   // I also need to know who the parent of the click event source is, so that I can change the state of the heart. There is a parentElement property on the heart.

        if (oParent && oParent.className === 'fav-link') { // if oParent existing and className is 'fav-link'
            console.log('change ...')
            var oCurLi = oParent.parentElement,
                classname = tar.className,
                isFavorite = classname === 'fa fa-heart' ? true : false,
                oItems = oItemList.getElementsByClassName('item'),    // find item under subtree oItemList
                index = Array.prototype.indexOf.call(oItems, oCurLi),      //convert the collection of oItems into an array. Find the corresponding element below it through the corresponding index, and return the index
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
    function registerExecutor() {   // oRegisterBtn event handler function
        // first, collect input info：username，password，firstName，lastName
        var username = oRegisterUsername.value,
            password = oRegisterPwd.value,
            firstName = oRegisterFirstName.value,
            lastName = oRegisterLastName.value;
        // then, do validation for those collected info
        if (username === "" || password == "" || firstName === ""
            || lastName === "") {
            oRegisterResultField.innerHTML = 'Please fill in all fields';
            return;
        }
        // determine if username match up using regular expression below
        if (username.match(/^[a-z0-9_]+$/) === null) {
            oRegisterResultField.innerHTML = 'Invalid username';
            return;
        }
        password = md5(username + md5(password));   // double-encrypt the password

        // ajax part
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
        // active side bar buttons firstly
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
    // oFavBtn element's Event handler function below
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
    // The purpose of our render here is to inject the data from the backend into the DOM.
    // Because the data structure we got is more complicated, we used the template method to present the data that needs to be injected in a form.
    function render(data) {
        var len = data.length,
            list = '',
            item;
        for (var i = 0; i < len; i++) {
            item = data[i];
            // Template method was used to convert and display the data (through the replace function); regular expression method
            // 采用了template的方式来实现数据的转换显示（通过replace函数）; regular expression方法
            list += oTpl.replace(/{{(.*?)}}/gmi, function (node, key) {
                                  // find first { } /gmi represents all contents to replace;
                // function(){} use callback fn to implement the replace logic => node means content found in (.*？)
                // node could find id under opt，key is content in（）that will be replaced
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
        showOrHideElement(oWelcomeMsg, 'block');
        showOrHideElement(oAvatar, 'block');
        showOrHideElement(oItemNav, 'block');
        showOrHideElement(oItemList, 'block');
        showOrHideElement(oLogoutBtn, 'block');

        // hide login form
        showOrHideElement(oLoginForm, 'none');
    }

    // get geographic data
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