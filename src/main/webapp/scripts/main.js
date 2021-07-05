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
    // ajax
    // This helper function actually made an ajax request, all ajax must be implemented through this helper function
    // The purpose of this helper function：Implement all Request and Response requests
    // Why need this helper function？
    // 1st: The front-end and back-end communication will generate many Request and Response requests. To avoid code duplication and keep concise, I wrote these same operations that require many times in the helper function.
    // 2nd: For JS code, because typically a function only does one thing, this helper function only implements one function， "data communication".
    function ajax(opt) {   // opt as an input parameter itself is an object/instance
        var opt = opt || {},   // opt is a configuration item (if the opt exists, it is opt, otherwise it will default to an empty object {} ). This configuration item can avoid "the failure of the entire callback function being called due to the change of the order of the incoming parameters"
            method = (opt.method || 'GET').toUpperCase(),   // Pass in a methods, where get method ? Either from the method in the opt configuration item，or method is a default GET method/request
            url = opt.url,   // Pass in a url, it is an attribute of the object
            data = opt.data || null,  // How to obtain data? Same. if data exists, I will get data, otherwise it will be null
            success = opt.success || function () {    // A success callback function tells whether succeeds, what to do if it succeeds, and what needs to be done after success is known through the callback function.
            },
            error = opt.error || function () {    // Give a failed callback function, that is, what need to do if failed, and what need to do after the failure is through the failed callback function.
            },
            xhr = new XMLHttpRequest();   // Step1: Create a xhr instance of httpRequest

        if (!url) {
            throw new Error('missing url');
        }

        xhr.open(method, url, true);    // Step2: Configuration => method and url
        // send 这里分两种情况
        if (!data) {   // case2.1: if no data, send directly
            xhr.send();
        } else {   // case2.2: if has data，set the content type
            xhr.setRequestHeader('Content-type', 'application/json;charset=utf-8');     //  data type id JSON
            // then, send data in string mode
            xhr.send(JSON.stringify(data));
        }

        // Step4: listen request and response => monitor
            // Case4.1: The front-end and back-end data is successfully transmitted/paired => got the data returned from the back-end
        xhr.onload = function () {
            if (xhr.status === 200) {  // 4.1.1 status === 200
                success(JSON.parse(xhr.responseText))   // After obtaining the data, I need to parse the data into the format of the object xhr, then pass it to "successful callback function"
            } else {  // 4.1.2 status !== 200，execute error() function
                error()
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