mirax.js
==
Simple and fast microframework on JavaScript.

**Demo usage:** http://max201.github.io/miraxjs/

API Documentation
==

**mx.done(callback)** - Document loaded 
--
When document has been loaded, we need to do some operations. To make it easy, we can use **mx.done** method.

	mx.done(function(){
		alert('Document loaded');
	})

**mx.req(key [, default])** - request query string parameters getter
--
You can get access to all GET-Parameters via javascript mirax method **mx.req()**

- **key**: Request variable key
- **default**: Default value if variable is empty

**GET http://example.com/?hello=world**

	alert(mx.req('hello')) // world
	alert(mx.req('empty_var', 'Default value')) // Default value

Default plugins
==

**mx.rstr(length [, abc])** - Random string
--
If you wants to generate random string, you can use **mx.rstr()** method to do it. 

 - **length**: Length of the random string you need
 - **abc**: Optional string parameter that specify which chars can be used for string generation. By default it's equals to: 0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz~!@#$%^&*()-+|;:

**Example**:

	mx.rstr(5) // I%t3A
	mx.rstr(20, "01") // 00001001000101101111


**mx.query(query)** - Extending request GET parameters and get query string
--
To make URL managing easier, we can use **mx.query()** method that provides ability to extend/update current query string. For example, we need to get URL with updated page number:

**GET http://example.com/?page=1**

	mx.query({page: 2}) // "page=2"

**GET http://example.com/**

	mx.query({page: 99}) // "page=99"

**GET http://example.com/?page=12&hello=world&abc=123**

	mx.query({page: 1, abc: 'cba'}) // "page=1&hello=world&abc=cba"

**mx.go(url [, timeout])** - Will redirect user to **url** with timeout for **timeout** seconds.
--
For example we need to move user to homepage "http://example.com/" after 3 seconds.

	mx.go('/', 3); // will redirect on http://example.com/ after 3 seconds

**mx.translit(str)** - will transliterate string.
--

	mx.translit('привет world!!!') // "privet world!!!"

**mx.slug(str)** - will slugify string.
--

	mx.slug('привет world!!!') // "privet_world"

**mx.route(route)** - mirax ajax router
--
This tool can help you make ajax page loading on hash changed.
For example, we have page "/login-form" and need to download it to "#container" when we move to address "/home#login":

	mx.route("login").src("/login-form").final("#container");

Or you need to load page with post request:

	mx.route("login").srcPost("/login-form", {"user": "men"}).final("#container");


**Methods of mx.route**

- **mx.route("hash")** - defining route
- **src(url [,data])** - Source URL that might be loaded when hash was changed for defined route
- **srcPost(url [,data])** - Same as **src** but requests via POST
- **final(container [,templator])** - Container that must obtain requested response. Templator can be specified as response preprocessor.

**mx.evt(event)** - Custom event manager
--
If you wants to make custom events and manually trigger it, you can use **mx.evt()** plugin.

**Event triggering**:
	
	mx.evt('hello').trigger({world: 'world'});

**Event handling**:

	mx.evt('hello').handle(function(e) {
		alert('Hello ' + e.world);
	});

**mx.set(to, from)** - Util to extend objects
--

**Example**:
	
	mx.set({b: '123'}, {a: 'a', b: 'c'}) // {a: 'a', b: '123')

**mx.func(callback)** - Util that always returns function object. If callback is not a function, util will return empty function, if no - it will return callback.
--

**Why?**
		
	var callback = ?;
	// Bad
	if ( typeof callback != 'function' ) {
		return;
	}

	// Good
	var callback = mx.func('may be not a function');
	typeof callback == 'function' // true

**mx.http(request, callback)** - \$.get and \$.post and \$.ajax analog.
--

Example:

	// Get "/login"
	mx.http('/login', function(response){ });
	
	// Post "/login"
	mx.http({url: "/login", method: "post"}, function(response){ });


**mx.dom(selector)** - tool to trigger and handle DOM-Elements events and manage elements.
--

Example:

	mx.dom('a').text() // Array object of all links on the page
	mx.dom('form#login').form() // Object of form data
	...


**mx.storage** - object that can help you to manage any javascript storage.
--
**mx.storage** can manage localStorage, sessionStorage and Cookies. All of the storages has following methods:

 - **mx.storage.[STORAGE_TYPE].set(key, value)** - Sets item into storage
 - **mx.storage.[STORAGE_TYPE].get(key, defaultValue)** - Gets an item from storage
 - **mx.storage.[STORAGE_TYPE].contains(key)** - Returns true if key is exists in current storage
 - **mx.storage.[STORAGE_TYPE].keys()** - Returns list of all available keys
 - **mx.storage.[STORAGE_TYPE].remove(key)** - Will remove item from storage
 
Only in **mx.storage.local**:

 - **mx.storage.local.available()** - returns true if localStorage is available
 
Only in **mx.storage.session**:

 - **mx.storage.session.available()** - returns true if sessionStorage is available
 
Only in **mx.storage.cookie**:

 - **mx.storage.cookie.set(key, value [, expdays, path])** - has four parameters instead of two.
 
Supported storage types:

 - cookie
 - session
 - local
 
Examples:

    // Local storage
    
    mx.storage.local.set('hello', 'world');
    mx.storage.local.get('hello'); // 'world'
    
    mx.storage.local.contains('hello'); // true
    
    mx.storage.local.remove('hello');
    mx.storage.local.contains('hello'); // false
    
    // Cookies
    mx.storage.cookie.set('hello', 'world');
    mx.storage.cookie.keys(); // ['hello']
    
    mx.storage.cookie.get('hello'); // 'world' 