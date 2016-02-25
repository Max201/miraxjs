/**
 * Main class for @mirax.js
 * @constructor
 */
var Mirax = function () {
    var mx = this;

    // Plugin manager
    this.PluginManager = function (parent) {
        this.mx = parent;
        this.load = function (name, callback) {
            callback.constructor.name = name;
            this.mx.__defineGetter__(name, callback);
        };
    };

    this.plugin = new this.PluginManager(this);

    // Done event manager
    this.done = function (callback) {
        this.evt('domloaded').handle(callback);
    };

    document.addEventListener('DOMContentLoaded', function (e) {
        mx.evt('domloaded').trigger(e);
    });

    // Request parameters defination
    (window.onpopstate = function () {
        var match,
            pl     = /\+/g,  // Regex for replacing addition symbol with a space
            search = /([^&=]+)=?([^&]*)/g,
            decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
            query  = window.location.search.substring(1);

        mx._request_parameters = {};
        while (match = search.exec(query))
            mx._request_parameters[decode(match[1])] = decode(match[2]);
    })();
};
window.mx = new Mirax();

/**
 * Random string generator
 */
mx.plugin.load('rstr', function(){
    var random = function(length, abc) {
        var chars = abc || "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz~!@#$%^&*()-+|;:";
        var string_length = length || 8;
        var randomstring = '';
        for (var i = 0; i < string_length; i++) {
            var rnum = Math.floor(Math.random() * chars.length);
            randomstring += chars.substring(rnum, rnum+1);
        }

        return randomstring;
    };

    return function (length, abc) {
        return random(length, abc);
    };
});


/**
 * Request parameters getter
 */
mx.plugin.load('req', function(){
    var load = function (key, valdefault) {
        if ( typeof key == 'undefined' || !key ) {
            return mx._request_parameters;
        }

        if ( typeof mx._request_parameters[key] == 'undefined' || !mx._request_parameters[key] ) {
            return valdefault || null;
        }

        return mx._request_parameters[key];
    };

    return function (key, vdefault) {
        return load(key, vdefault);
    };
});


/**
 * Request query extends from exists parameters
 */
mx.plugin.load('query', function(){
    var build = function (query) {
        query = mx.set(query, mx.req());
        var string = [], key;
        for ( key in query ) {
            string.push(key + '=' + encodeURIComponent(query[key]));
        }

        return string.join('&');
    };

    return function (query) {
        return build(query);
    };
});


mx.plugin.load('go', function(){
    var relocate = function(to, timeout) {
        var url = to || document.location.href;
        timeout = timeout || 0;
        if ( timeout > 0 ) {
            setTimeout(function(){ document.location.href = url; }, timeout * 1000)
        } else {
            document.location.href = url;
        }
    };

    return function (to, timeout) {
        return relocate(to, timeout);
    };
});


/**
 * Transliteration plugin
 */
mx.plugin.load('translit', function(){
    var translit = function (str) {
        var func = function () {
            var typ = 1;
            var abs = Math.abs(typ);
            if (typ === abs) {
                str = str.replace(/(\u0456(?=.[^\u0430\u0435\u0438\u043E\u0443\u044A\s]+))/ig, "$1`");
                return [
                    function (col, row) {
                        var chr;
                        if (chr = col[0] || col[abs]) {
                            trantab[row] = chr;
                            regarr.push(row);
                        }
                    },
                    function (str) {
                        return str.replace(/i``/ig, "i`").replace(/((c)z)(?=[ieyj])/ig, "$2");
                    }
                ];
            } else {
                str = str.replace(/(c)(?=[ieyj])/ig, "$1z");
                return [
                    function (col, row) {
                        var chr;
                        if (chr = col[0] || col[abs]) {
                            trantab[chr] = row;
                            regarr.push(chr);
                        }
                    },
                    function (str) {
                        return str;
                    }
                ];
            }
        }();


        var iso9 = {
            "\u0449": ["", "\u015D", "", "sth", "", "shh", "shh"], // "щ"
            "\u044F": ["", "\u00E2", "ya", "ya", "", "ya", "ya"], // "я"
            "\u0454": ["", "\u00EA", "", "", "", "", "ye"], // "є"
            "\u0463": ["", "\u011B", "", "ye", "", "ye", ""], //  ять
            "\u0456": ["", "\u00EC", "i", "i", "", "i", "i"], // "і" йота
            "\u0457": ["", "\u00EF", "", "", "", "", "yi"], // "ї"
            "\u0451": ["", "\u00EB", "yo", "", "", "yo", ""], // "ё"
            "\u044E": ["", "\u00FB", "yu", "yu", "", "yu", "yu"], // "ю"
            "\u0436": ["zh", "\u017E"],                                // "ж"
            "\u0447": ["ch", "\u010D"],                                // "ч"
            "\u0448": ["sh", "\u0161"],                                // "ш"
            "\u0473": ["", "f\u0300", "", "fh", "", "fh", ""], //  фита
            "\u045F": ["", "d\u0302", "", "", "dh", "", ""], // "џ"
            "\u0491": ["", "g\u0300", "", "", "", "", "g"], // "ґ"
            "\u0453": ["", "g", "", "", "g", "", ""], // "ѓ"
            "\u0455": ["", "s", "", "", "z", "", ""], // "ѕ"
            "\u045C": ["", "k", "", "", "k", "", ""], // "ќ"
            "\u0459": ["", "l", "", "", "l", "", ""], // "љ"
            "\u045A": ["", "n", "", "", "n", "", ""], // "њ"
            "\u044D": ["", "\u00E8", "e", "", "", "e", ""], // "э"
            "\u044A": ["", "\u02BA", "", "", "", "", ""], // "ъ"
            "\u044B": ["", "y", "y", "", "", "y", ""], // "ы"
            "\u045E": ["", "\u01D4", "u", "", "", "", ""], // "ў"
            "\u046B": ["", "\u01CE", "", "o", "", "", ""], //  юс
            "\u0475": ["", "\u1EF3", "", "yh", "", "yh", ""], //  ижица
            "\u0446": ["cz", "c"],                                // "ц"
            "\u0430": ["a"],                                          // "а"
            "\u0431": ["b"],                                          // "б"
            "\u0432": ["v"],                                          // "в"
            "\u0433": ["g"],                                          // "г"
            "\u0434": ["d"],                                          // "д"
            "\u0435": ["e"],                                          // "е"
            "\u0437": ["z"],                                          // "з"
            "\u0438": ["", "i", "", "i", "i", "i", "y"],              // "и"
            "\u0439": ["", "j", "j", "j", "", "j", "j"],              // "й"
            "\u043A": ["k"],                                          // "к"
            "\u043B": ["l"],                                          // "л"
            "\u043C": ["m"],                                          // "м"
            "\u043D": ["n"],                                          // "н"
            "\u043E": ["o"],                                          // "о"
            "\u043F": ["p"],                                          // "п"
            "\u0440": ["r"],                                          // "р"
            "\u0441": ["s"],                                          // "с"
            "\u0442": ["t"],                                          // "т"
            "\u0443": ["u"],                                          // "у"
            "\u0444": ["f"],                                          // "ф"
            "\u0445": ["x", "h"],                                     // "х"
            "\u044C": ["'", "", "", "", "", "", ""],                   // "ь"
            "\u0458": ["", "j", "", "", "j", "", ""],                 // "ј"
            "\u2019": ["", ""],                                       // "’"
            "\u2116": ["#"]                                           // "№"
        }, regarr = [], trantab = {};
        for (var row in iso9) {
            func[0](iso9[row], row);
        }

        return func[1](
            str.replace(
                new RegExp(regarr.join("|"), "gi"),
                function (R) {
                    if ( R.toLowerCase() === R) {
                        return trantab[R];
                    } else {
                        return trantab[R.toLowerCase()].toUpperCase();
                    }
                }
            )
        );
    };

    return function (string) {
        return translit(string);
    };
});


/**
 * Urlize plugin
 */
mx.plugin.load('slug', function(){
    var urlize = function (str) {
        var input = str.toLowerCase().trim();
        return mx.translit(input).replace(/\s+/g, '_').replace(/[^a-z0-9\-_]+/g, '');
    };

    return function (string) {
        return urlize(string);
    };
});


/**
 * Type Checker util
 */
mx.plugin.load('type', function(){
    var TypeChecker = function(variable) {
        this.var = variable;
        this.type = typeof variable;
        if ( this.type == 'undefined' ) {
            this.class = "undefined";
        } else if ( this.var == null ) {
            this.class = "null";
        } else {
            this.class = typeof variable.constructor != 'undefined' ? variable.constructor.name : this.type;
        }
    };

    TypeChecker.prototype.isDict = function () {
        return this.type == 'object' && typeof this.type.pop == 'undefined';
    };

    TypeChecker.prototype.isList = function () {
        return this.type == 'object' && typeof this.type.pop != 'undefined';
    };

    TypeChecker.prototype.isString = function () {
        return this.type == 'string';
    };

    TypeChecker.prototype.isFunction = function () {
        return this.type == 'function';
    };

    TypeChecker.prototype.isDom = function () {
        return this.class.indexOf('HTML') > -1 && this.class.indexOf('Element') > -1 || this.class == "Window" || this.class == "HTMLDocument";
    };

    TypeChecker.prototype.isDomList = function () {
        return this.isList() && mx.type(this.var[0]).isDom();
    };

    return function (obj) {
        return new TypeChecker(obj);
    };
});

/**
 * ONE-Page App Routing
 */
mx.plugin.load('route', function(){
    var mx = this;
    var Router = function(route) {
        this.route = route;
        var router = this;
        if ( typeof mx._routing_init == 'undefined' ) {
            mx._routing_init = true;
            mx._route_map = {};
            mx.dom(window).on('hashchange', function(){
                var route, loc = router.location(), request;
                for ( route in mx._route_map ) {
                    if ( route == loc ) {
                        request = mx._route_map[route];
                        break;
                    }
                }

                mx.http(request);
            });
        }

        // Init request data
        this.request = {
            'url': '',
            'method': 'GET',
            'data': {}
        };
    };

    Router.prototype.location = function() {
        var hash = window.location.hash;
        if ( hash.indexOf('#!') > -1 ) {
            hash = hash.substr(2);
        }
        if ( hash.indexOf('#') > -1 ) {
            hash = hash.substr(1);
        }

        return hash;
    };

    Router.prototype.src = function(url, data) {
        this.request.url = url;
        this.request.data = data || {};
        return this;
    };

    Router.prototype.srcPost = function(url, data) {
        this.src(url, data);
        this.request.method = 'POST';
        return this;
    };

    Router.prototype.final = function(container, templator) {
        var router = this;
        this.request.callback = function (response) {
            var html = response, result = mx.dom(container);
            if ( mx.type(templator).isFunction() ) {
                html = templator(response, router.request);
            }

            result.content(html);
        };

        mx._route_map[this.route] = this.request;
    };

    return function (route) {
        return new Router(route);
    };
});

/**
 * Custom Event manager
 */
mx.plugin.load('evt', function(){
    var mx = this;
    var CustomEvent = function (event) {
        event = event ? event.trim().toLowerCase() : '';
        if ( typeof mx._evt == 'undefined' ) {
            mx._evt = {};
        }

        if ( typeof mx._evt[event] == 'undefined') {
            mx._evt[event] = [];
        }

        this.event = event;
    };

    CustomEvent.prototype.handle = function(callback) {
        if ( typeof callback != 'function') {
            return;
        }

        mx._evt[this.event].push(callback);
    };

    CustomEvent.prototype.trigger = function(data) {
        var i;
        for ( i = 0; i < mx._evt[this.event].length; i++ ) {
            var callback = mx._evt[this.event][i];
            callback(data)
        }
    };

    return function (evt) {
        return new CustomEvent(evt);
    }
});


/**
 * Settings extending plugin
 */
mx.plugin.load('set', function(){
    return function(to, from) {
        var key;
        from = from || {};
        if ( typeof to != 'undefined' ) {
            for ( key in from ) {
                if ( !to.hasOwnProperty(key) ) {
                    to[key] = from[key];
                }
            }

            return to
        }

        return from;
    };
});

/**
 * Settings extending plugin
 */
mx.plugin.load('func', function(){
    return function (call, or) {
        if ( typeof call == 'function' ) {
            return call;
        }

        if ( typeof or != 'function' ) {
            or = function () {};
        }

        return or;
    }
});

/**
 * HTTP Library plugin
 */
mx.plugin.load('http', function(){
    var mx = this;
    var Http = function(request, callback) {
        this.conf = {
            'url': null,
            'method': 'GET',
            'type': 'html',
            'headers': {
                'Content-Type': this.type('html')
            },
            'callback': function(response, xhr) {},
            'change': function(response, xhr) {},
            'before': function(xhr) {},
            'after': function(response, xhr) {},
            'update': function(response, xhr) {}
        };

        if ( typeof request == 'string' ) {
            this.conf = mx.set({
                'url': request,
                'callback': mx.func(callback)
            }, this.conf);

            this.request();
            return;
        }

        if ( typeof request == 'object' ) {
            this.conf = mx.set(request, this.conf);
            this.request();
        }
    };

    Http.prototype.query = function(data) {
        var query = [], key;
        for ( key in data ) {
            query.push(key + '=' + encodeURIComponent(data[key]));
        }

        return query.join('&')
    };

    Http.prototype.form = function(data) {
        var key, form = new FormData();
        for ( key in data ) {
            form.append(key, data[key]);
        }

        return form;
    };

    Http.prototype.process_data = function(data) {
        if ( typeof data == 'string' ) {
            return mx.dom(data).form();
        }

        return data;
    };

    Http.prototype.type = function(type) {
        var types = {
            'json': 'application/json',
            'html': 'text/html',
            'text': 'text/plain',
            'css': 'text/stylesheet',
            'js': 'text/javascript'
        };

        return types[type.toLowerCase()];
    };

    Http.prototype.decode = function(response, type) {
        var types = {
            'json': JSON.parse
        };

        if ( !type.hasOwnProperty(type.toLowerCase()) ) {
            return response;
        }

        return types[type.toLowerCase()](response);
    };

    Http.prototype.extends_get = function(url, from) {
        var data = {}, i, item;
        if ( !url ) {
            return from || {};
        }

        url = url.split('?');
        if ( url.length == 1 ) {
            return from;
        }

        url = url[1].split('&');
        for ( i = 0; i < url.length; i++ ) {
            item = url[i].split('=');
            data[item[0]] = null;
            if ( item.length > 1 ) {
                data[item[0]] = item[1];
            }
        }

        return mx.set(from, data)
    };

    Http.prototype.request = function() {
        var xhr = new XMLHttpRequest(), header, http = this;
        this.conf.data = this.process_data(this.conf.data);

        // Callbacks
        xhr.onreadystatechange = function () {
            var response = typeof xhr.responseText != 'undefined' ? http.decode(xhr.responseText, xhr.responseType) : null;
            if ( xhr.readyState == 4 && xhr.status == 200 ) {
                mx.func(http.conf.after)(response, xhr);
            } else {
                mx.func(http.conf.update)(response, xhr);
            }
        };

        // Success
        xhr.onload = function () {
            var response = typeof this.responseText != 'undefined' ? http.decode(this.responseText, this.responseType) : null;
            mx.func(http.conf.callback)(response, xhr);
        };

        // Request method
        this.conf.method = this.conf.method.trim().toUpperCase();

        // Format & open request
        if ( this.conf.method == 'GET' ) {
            var query = this.query(this.extends_get(this.conf.url, this.conf.data));
            this.conf.url = this.conf.url.split('?')[0];
            xhr.open(this.conf.method, this.conf.url + (query.length ? '?' + query : ''));
        } else {
            xhr.open(this.conf.method, this.conf.url, true);
        }

        // Headers
        for ( header in this.conf.headers ) {
            xhr.setRequestHeader(header, this.conf.headers[header]);
        }

        mx.func(this.conf.before)(xhr);

        // Send request
        if ( this.conf.method == 'GET' ) {
            xhr.send();
        } else {
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhr.send(this.form(this.conf.data));
        }
    };

    return function (request, callback) {
        return new Http(request, callback);
    };
});

/**
 * DOM Plugin to trigger & listen events and manage HTML
 */
mx.plugin.load('dom', function() {
    var InputValue = function (element) {
        if ( !mx.type(element).isDom() ) {
            throw new TypeError('Wrong input type');
        }

        this.element = element;
        this.value = null;
        this.name = element && typeof this.element['getAttribute'] != 'undefined' ? element.getAttribute('name') : null;
        this.method = method = this.element.tagName.toLowerCase();
        if ( typeof this[this.method] != 'undefined' ) {
            this.value = this[this.method]();
        }
    };

    InputValue.prototype.set = function (value) {
        if ( typeof this[this.method] != 'undefined' ) {
            this[this.method](value);
        }

        return this;
    };

    InputValue.prototype.select = function (val) {
        var it, els = this.element.querySelectorAll('option'), value = null;
        if ( val == 'undefined' ) {
            for ( it = 0; it < els.length; it++ ) {
                if ( els[it].selected ) {
                    value = els[it].value;
                }
            }

            return value;
        } else {
            for ( it = 0; it < els.length; it++ ) {
                if ( els[it].value == val ) {
                    els[it].selected = true;
                    els[it].setAttribute('selected', 'selected');
                } else {
                    els[it].selected = false;
                    els[it].removeAttribute('selected');
                }
            }
        }

        return this;
    };

    InputValue.prototype.button = function (val) {
        if ( typeof val == 'undefined') {
            return this.element.value;
        }

        this.element.value = val;
        return this;
    };

    InputValue.prototype.input = function (val) {
        var defval, value;
        if ( typeof val == 'undefined' ) {
            // Get
            switch ( this.element.type ) {
                case 'checkbox':
                    defval = this.element.hasAttribute('data-default') ? this.element.getAttribute('data-default') : '';
                    return this.element.checked ? this.element.value : defval;
                    break;

                case 'radio':
                    value = null;
                    if ( this.name ) {
                        mx.dom('[name="' + this.name + '"][type="radio"]').each(function(e){
                            if ( e.checked ) {
                                value = e.value;
                            }
                        });
                    } else {
                        value = this.element.value;
                    }

                    return value;
                    break;

                default:
                    return this.element.value;
            }
        } else {
            // Update
            switch ( this.element.type ) {
                case 'checkbox':
                    if ( typeof val != 'undefined' && val ) {
                        this.element.checked = true;
                        this.element.setAttribute('checked', 'checked');
                    } else {
                        this.element.checked = false;
                        this.element.removeAttribute('checked');
                    }
                    break;

                case 'radio':
                    var radios = mx.dom('[type="radio"][name="' + this.name + '"]');
                    radios.each(function(item){
                        if ( item.value == val ) {
                            item.checked = true;
                            item.setAttribute('checked', 'checked');
                        } else {
                            item.checked = false;
                            item.removeAttribute('checked');
                        }

                        console.log(item.value);
                        return item;
                    });
                    break;

                default:
                    this.element.value = val;
            }
        }

        return this;
    };

    InputValue.prototype.textarea = function (val) {
        if ( typeof val == 'undefined' ) {
            return this.element.textContent;
        }

        this.element.textContent = val;
        return this;
    };

    var Dom = function (selector) {
        var type = mx.type(selector);
        if ( type.isDom() ) {
            this.elements = [selector];
        } else {
            if ( type.isString() ) {
                this.elements = document.querySelectorAll(selector);
            } else if ( type.isList() || type.isDict() ) {
                this.elements = selector;
            } else {
                throw new TypeError('Wrong DOM-Selection');
            }
        }
    };

    Dom.prototype.each = function(processor) {
        var i;
        for ( i = 0; i < this.elements.length; i++ ) {
            this.elements[i] = mx.func(processor)(this.elements[i]);
        }

        return this;
    };

    Dom.prototype.remove = function() {
        this.each(function(e){
            e.parentNode.removeChild(e);
        });

        return this;
    };

    Dom.prototype.css = function(css, property) {
        var stylesheet = {};
        if ( typeof property != 'undefined' ) {
            stylesheet[css] = property;
        } else {
            stylesheet = css;
        }

        this.each(function(e){
            var key;
            for ( key in stylesheet ) {
                if ( e.style.hasOwnProperty(key) ) {
                    e.style[key] = stylesheet[key];
                }
            }

            return e;
        });

        return this;
    };

    Dom.prototype.content = function(html) {
        if ( typeof html == 'undefined' || !html ) {
            var html = new Array();
            this.each(function(e){
                html.push(e.innerHTML);
                return e;
            });

            return html;
        } else {
            this.each(function(e){
                e.innerHTML = html;
                return e;
            });
        }

        return this;
    };

    Dom.prototype.html = function(html) {
        if ( typeof html == 'undefined' || !html ) {
            var html = new Array();
            this.each(function(e){
                html.push(e.outerHTML);
                return e;
            });

            return html;
        } else {
            this.each(function(e){
                e.outerHTML = html;
                return e;
            });
        }

        return this;
    };

    Dom.prototype.text = function(text) {
        if ( typeof text == 'undefined' || !text ) {
            var text = new Array();
            this.each(function(e){
                text.push(e.textContent);
                return e;
            });

            return text;
        } else {
            this.each(function(e){
                e.textContent = text;
                return e;
            });
        }

        return this;
    };

    Dom.prototype.child = function(selector) {
        var list = [];
        this.each(function(item){
            var it, els = item.querySelectorAll(selector);
            for ( it = 0; it < els.length; it++ ) {
                list.push(els[it]);
            }

            return item;
        });

        return mx.dom(list);
    };

    Dom.prototype.attr = function (key, newval) {
        if ( typeof newval == 'undefined' ) {
            var list = [];
            this.each(function(e){
                if ( e.hasAttribute(key) ) {
                    list.push(e.getAttribute(key));
                } else {
                    list.push(null);
                }

                return e;
            });

            return list.length == 1 ? list[0] : list;
        }

        this.each(function(e){
            if ( e.hasAttribute(key) ) {
                e.setAttribute(key, newval);
            }

            return e;
        });
    };

    Dom.prototype.val = function(newval) {
        if ( typeof this.elements[0] != 'undefined' && this.elements[0].tagName == "FORM" ) {
            return mx.dom(this.elements[0].querySelectorAll('input, select, button, textarea')).val(newval)
        }

        var list = [];
        this.each(function(item){
            var dat = new InputValue(item);
            if ( typeof newval == 'undefined' ) {
                list.push(dat.value);
            } else {
                dat.set(newval);
            }
            return item;
        });

        if ( typeof newval != 'undefined' ) {
            this.trigger('input');
            this.trigger('change');
            return this;
        }

        return list.length == 1 ? list[0] : list;
    };

    Dom.prototype.form = function(data) {
        if ( typeof this.elements[0] != 'undefined' && this.elements[0].tagName == "FORM" ) {
            return mx.dom(this.elements[0].querySelectorAll('input, select, button, textarea')).form(data)
        }

        var form = {};
        this.each(function(item){
            var dat = new InputValue(item);
            if ( dat.name ) {
                if ( typeof data != 'undefined' && typeof data[dat.name] != 'undefined' ) {
                    dat.set(data[dat.name])
                } else {
                    form[dat.name] = dat.value;
                }
            }
        });

        return typeof data == 'undefined' ? form : this;
    };

    Dom.prototype.hide = function () {
        this.css('display', 'none');

        return this;
    };

    Dom.prototype.show = function (display) {
        this.css('display', display || 'block');

        return this;
    };

    Dom.prototype.on = function(evt, callback) {
        this.each(function(e){
            e.addEventListener(evt, callback);
        });

        return this;
    };

    Dom.prototype.trigger = function(evt) {
        var mx = this;
        this.each(function(e){
            mx.triggerEvent(evt, e);
        });

        return this;
    };

    Dom.prototype.triggerEvent = function(evt, element) {
        var doc;
        if (element.ownerDocument) {
            doc = element.ownerDocument;
        } else if (element.nodeType == 9){
            doc = element;
        } else {
            throw new Error("Invalid node passed to fireEvent: " + element.id);
        }

        var event;
        if (element.dispatchEvent) {
            var eventClass = "";
            switch (evt) {
                case "hashchange":
                    eventClass = "HashChangeEvent";
                    break;
                case "click":
                case "mousedown":
                case "mouseup":
                case "mouseenter":
                case "mouseover":
                case "mouseleave":
                case "mousemove":
                    eventClass = "MouseEvents";
                    break;
                case "focus":
                case "change":
                case "blur":
                case "select":
                    eventClass = "HTMLEvents";
                    break;
                default:
                    eventClass = "UIEvent";
                    break;
            }

            event = doc.createEvent(eventClass);
            event.initEvent(evt, true, true);
            event.synthetic = true;
            element.dispatchEvent(event, true);
        } else if (element.fireEvent) {
            event = doc.createEventObject();
            event.synthetic = true;
            element.dispatchEvent('on' + evt, true);
        }

        return this;
    };

    return function(selector){
        return new Dom(selector);
    };
});