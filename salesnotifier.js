//CDN Version 1.0.2

function scriptInjection(src, callback) {
    var script = document.createElement('script');
    script.type = "text/javascript";

    script.src = src;
    if (typeof  callback == 'function') {
        script.addEventListener('load', callback);
    }

    document.getElementsByTagName('head')[0].appendChild(script);


}

scriptInjection("https://code.jquery.com/jquery-3.2.1.min.js", function () {
    window.salesNotifierAdminJquery = jQuery.noConflict(true);

    function notifyPopup() {
    /* Notify.js - http://notifyjs.com/ Copyright (c) 2015 MIT */
        (function (factory) {
        // UMD start
        // https://github.com/umdjs/umd/blob/master/jqueryPluginCommonjs.js
        if (typeof define === 'function' && define.amd) {
            // AMD. Register as an anonymous module.
            define(['jquery'], factory);
        } else if (typeof module === 'object' && module.exports) {
            // Node/CommonJS
            module.exports = function( root, jQuery ) {
                if ( jQuery === undefined ) {
                    // require('jQuery') returns a factory that requires window to
                    // build a jQuery instance, we normalize how we use modules
                    // that require this pattern but the window provided is a noop
                    // if it's defined (how jquery works)
                    if ( typeof window !== 'undefined' ) {
                        jQuery = require('jquery');
                    }
                    else {
                        jQuery = require('jquery')(root);
                    }
                }
                factory(jQuery);
                return jQuery;
            };
        } else {
            // Browser globals
            factory(jQuery);
        }
    }(function ($) {
        //IE8 indexOf polyfill
        var indexOf = [].indexOf || function(item) {
            for (var i = 0, l = this.length; i < l; i++) {
                if (i in this && this[i] === item) {
                    return i;
                }
            }
            return -1;
        };

        var pluginName = "notify";
        var pluginClassName = pluginName + "js";
        var blankFieldName = pluginName + "!blank";

        var positions = {
            t: "top",
            m: "middle",
            b: "bottom",
            l: "left",
            c: "center",
            r: "right"
        };
        var hAligns = ["l", "c", "r"];
        var vAligns = ["t", "m", "b"];
        var mainPositions = ["t", "b", "l", "r"];
        var opposites = {
            t: "b",
            m: null,
            b: "t",
            l: "r",
            c: null,
            r: "l"
        };

        var parsePosition = function(str) {
            var pos;
            pos = [];
            $.each(str.split(/\W+/), function(i, word) {
                var w;
                w = word.toLowerCase().charAt(0);
                if (positions[w]) {
                    return pos.push(w);
                }
            });
            return pos;
        };

        var styles = {};

        var coreStyle = {
            name: "core",
            html: "<div class=\"" + pluginClassName + "-wrapper\">\n	<div class=\"" + pluginClassName + "-arrow\"></div>\n	<div class=\"" + pluginClassName + "-container\"></div>\n</div>",
            css: "." + pluginClassName + "-corner {\n	position: fixed;\n	margin: 30px;\n	z-index: 999999999999;\n}\n\n." + pluginClassName + "-corner ." + pluginClassName + "-wrapper,\n." + pluginClassName + "-corner ." + pluginClassName + "-container {\n	position: relative;\n	display: block;\n	height: inherit;\n	width: inherit;\n	margin: 3px;\n}\n\n." + pluginClassName + "-wrapper {\n	z-index: 1;\n	position: absolute;\n	display: inline-block;\n	height: 0;\n	width: 0;\n}\n\n." + pluginClassName + "-container {\n	display: none;\n	z-index: 1;\n	position: absolute;\n}\n\n." + pluginClassName + "-hidable {\n	cursor: pointer;\n}\n\n[data-notify-text],[data-notify-html] {\n	position: relative;\n}\n\n." + pluginClassName + "-arrow {\n	position: absolute;\n	z-index: 2;\n	width: 0;\n	height: 0;\n}"
        };

        var stylePrefixes = {
            "border-radius": ["-webkit-", "-moz-"]
        };

        var getStyle = function(name) {
            return styles[name];
        };

        var removeStyle = function(name) {
            if (!name) {
                throw "Missing Style name";
            }
            if (styles[name]) {
                delete styles[name];
            }
        };

        var addStyle = function(name, def) {
            if (!name) {
                throw "Missing Style name";
            }
            if (!def) {
                throw "Missing Style definition";
            }
            if (!def.html) {
                throw "Missing Style HTML";
            }
            //remove existing style
            var existing = styles[name];
            if (existing && existing.cssElem) {
                if (window.console) {
                    console.warn(pluginName + ": overwriting style '" + name + "'");
                }
                styles[name].cssElem.remove();
            }
            def.name = name;
            styles[name] = def;
            var cssText = "";
            if (def.classes) {
                $.each(def.classes, function(className, props) {
                    cssText += "." + pluginClassName + "-" + def.name + "-" + className + " {\n";
                    $.each(props, function(name, val) {
                        if (stylePrefixes[name]) {
                            $.each(stylePrefixes[name], function(i, prefix) {
                                return cssText += "	" + prefix + name + ": " + val + ";\n";
                            });
                        }
                        return cssText += "	" + name + ": " + val + ";\n";
                    });
                    return cssText += "}\n";
                });
            }
            if (def.css) {
                cssText += "/* styles for " + def.name + " */\n" + def.css;
            }
            if (cssText) {
                def.cssElem = insertCSS(cssText);
                def.cssElem.attr("id", "notify-" + def.name);
            }
            var fields = {};
            var elem = $(def.html);
            findFields("html", elem, fields);
            findFields("text", elem, fields);
            def.fields = fields;
        };

        var insertCSS = function(cssText) {
            var e, elem, error;
            elem = createElem("style");
            elem.attr("type", 'text/css');
            $("head").append(elem);
            try {
                elem.html(cssText);
            } catch (_) {
                elem[0].styleSheet.cssText = cssText;
            }
            return elem;
        };

        var findFields = function(type, elem, fields) {
            var attr;
            if (type !== "html") {
                type = "text";
            }
            attr = "data-notify-" + type;
            return find(elem, "[" + attr + "]").each(function() {
                var name;
                name = $(this).attr(attr);
                if (!name) {
                    name = blankFieldName;
                }
                fields[name] = type;
            });
        };

        var find = function(elem, selector) {
            if (elem.is(selector)) {
                return elem;
            } else {
                return elem.find(selector);
            }
        };

        var pluginOptions = {
            clickToHide: true,
            autoHide: true,
            autoHideDelay: 5000,
            arrowShow: true,
            arrowSize: 5,
            breakNewLines: true,
            elementPosition: "bottom",
            globalPosition: "top right",
            style: "bootstrap",
            className: "error",
            showAnimation: "slideDown",
            showDuration: 400,
            hideAnimation: "slideUp",
            hideDuration: 200,
            gap: 5
        };

        var inherit = function(a, b) {
            var F;
            F = function() {};
            F.prototype = a;
            return $.extend(true, new F(), b);
        };

        var defaults = function(opts) {
            return $.extend(pluginOptions, opts);
        };

        var createElem = function(tag) {
            return $("<" + tag + "></" + tag + ">");
        };

        var globalAnchors = {};

        var getAnchorElement = function(element) {
            var radios;
            if (element.is('[type=radio]')) {
                radios = element.parents('form:first').find('[type=radio]').filter(function(i, e) {
                    return $(e).attr("name") === element.attr("name");
                });
                element = radios.first();
            }
            return element;
        };

        var incr = function(obj, pos, val) {
            var opp, temp;
            if (typeof val === "string") {
                val = parseInt(val, 10);
            } else if (typeof val !== "number") {
                return;
            }
            if (isNaN(val)) {
                return;
            }
            opp = positions[opposites[pos.charAt(0)]];
            temp = pos;
            if (obj[opp] !== undefined) {
                pos = positions[opp.charAt(0)];
                val = -val;
            }
            if (obj[pos] === undefined) {
                obj[pos] = val;
            } else {
                obj[pos] += val;
            }
            return null;
        };

        var realign = function(alignment, inner, outer) {
            if (alignment === "l" || alignment === "t") {
                return 0;
            } else if (alignment === "c" || alignment === "m") {
                return outer / 2 - inner / 2;
            } else if (alignment === "r" || alignment === "b") {
                return outer - inner;
            }
            throw "Invalid alignment";
        };

        var encode = function(text) {
            encode.e = encode.e || createElem("div");
            return encode.e.text(text).html();
        };

        function Notification(elem, data, options) {
            if (typeof options === "string") {
                options = {
                    className: options
                };
            }
            this.options = inherit(pluginOptions, $.isPlainObject(options) ? options : {});
            this.loadHTML();
            this.wrapper = $(coreStyle.html);
            if (this.options.clickToHide) {
                this.wrapper.addClass(pluginClassName + "-hidable");
            }
            this.wrapper.data(pluginClassName, this);
            this.arrow = this.wrapper.find("." + pluginClassName + "-arrow");
            this.container = this.wrapper.find("." + pluginClassName + "-container");
            this.container.append(this.userContainer);
            if (elem && elem.length) {
                this.elementType = elem.attr("type");
                this.originalElement = elem;
                this.elem = getAnchorElement(elem);
                this.elem.data(pluginClassName, this);
                this.elem.before(this.wrapper);
            }
            this.container.hide();
            this.run(data);
        }

        Notification.prototype.loadHTML = function() {
            var style;
            style = this.getStyle();
            this.userContainer = $(style.html);
            this.userFields = style.fields;
        };

        Notification.prototype.show = function(show, userCallback) {
            var args, callback, elems, fn, hidden;
            callback = (function(_this) {
                return function() {
                    if (!show && !_this.elem) {
                        _this.destroy();
                    }
                    if (userCallback) {
                        return userCallback();
                    }
                };
            })(this);
            hidden = this.container.parent().parents(':hidden').length > 0;
            elems = this.container.add(this.arrow);
            args = [];
            if (hidden && show) {
                fn = "show";
            } else if (hidden && !show) {
                fn = "hide";
            } else if (!hidden && show) {
                fn = this.options.showAnimation;
                args.push(this.options.showDuration);
            } else if (!hidden && !show) {
                fn = this.options.hideAnimation;
                args.push(this.options.hideDuration);
            } else {
                return callback();
            }
            args.push(callback);
            return elems[fn].apply(elems, args);
        };

        Notification.prototype.setGlobalPosition = function() {
            var p = this.getPosition();
            var pMain = p[0];
            var pAlign = p[1];
            var main = positions[pMain];
            var align = positions[pAlign];
            var key = pMain + "|" + pAlign;
            var anchor = globalAnchors[key];
            if (!anchor || !document.body.contains(anchor[0])) {
                anchor = globalAnchors[key] = createElem("div");
                var css = {};
                css[main] = 0;
                if (align === "middle") {
                    css.top = '45%';
                } else if (align === "center") {
                    css.left = '45%';
                } else {
                    css[align] = 0;
                }
                anchor.css(css).addClass(pluginClassName + "-corner");
                $("body").append(anchor);
            }
            return anchor.prepend(this.wrapper);
        };

        Notification.prototype.setElementPosition = function() {
            var arrowColor, arrowCss, arrowSize, color, contH, contW, css, elemH, elemIH, elemIW, elemPos, elemW, gap, j, k, len, len1, mainFull, margin, opp, oppFull, pAlign, pArrow, pMain, pos, posFull, position, ref, wrapPos;
            position = this.getPosition();
            pMain = position[0];
            pAlign = position[1];
            pArrow = position[2];
            elemPos = this.elem.position();
            elemH = this.elem.outerHeight();
            elemW = this.elem.outerWidth();
            elemIH = this.elem.innerHeight();
            elemIW = this.elem.innerWidth();
            wrapPos = this.wrapper.position();
            contH = this.container.height();
            contW = this.container.width();
            mainFull = positions[pMain];
            opp = opposites[pMain];
            oppFull = positions[opp];
            css = {};
            css[oppFull] = pMain === "b" ? elemH : pMain === "r" ? elemW : 0;
            incr(css, "top", elemPos.top - wrapPos.top);
            incr(css, "left", elemPos.left - wrapPos.left);
            ref = ["top", "left"];
            for (j = 0, len = ref.length; j < len; j++) {
                pos = ref[j];
                margin = parseInt(this.elem.css("margin-" + pos), 10);
                if (margin) {
                    incr(css, pos, margin);
                }
            }
            gap = Math.max(0, this.options.gap - (this.options.arrowShow ? arrowSize : 0));
            incr(css, oppFull, gap);
            if (!this.options.arrowShow) {
                this.arrow.hide();
            } else {
                arrowSize = this.options.arrowSize;
                arrowCss = $.extend({}, css);
                arrowColor = this.userContainer.css("border-color") || this.userContainer.css("border-top-color") || this.userContainer.css("background-color") || "white";
                for (k = 0, len1 = mainPositions.length; k < len1; k++) {
                    pos = mainPositions[k];
                    posFull = positions[pos];
                    if (pos === opp) {
                        continue;
                    }
                    color = posFull === mainFull ? arrowColor : "transparent";
                    arrowCss["border-" + posFull] = arrowSize + "px solid " + color;
                }
                incr(css, positions[opp], arrowSize);
                if (indexOf.call(mainPositions, pAlign) >= 0) {
                    incr(arrowCss, positions[pAlign], arrowSize * 2);
                }
            }
            if (indexOf.call(vAligns, pMain) >= 0) {
                incr(css, "left", realign(pAlign, contW, elemW));
                if (arrowCss) {
                    incr(arrowCss, "left", realign(pAlign, arrowSize, elemIW));
                }
            } else if (indexOf.call(hAligns, pMain) >= 0) {
                incr(css, "top", realign(pAlign, contH, elemH));
                if (arrowCss) {
                    incr(arrowCss, "top", realign(pAlign, arrowSize, elemIH));
                }
            }
            if (this.container.is(":visible")) {
                css.display = "block";
            }
            this.container.removeAttr("style").css(css);
            if (arrowCss) {
                return this.arrow.removeAttr("style").css(arrowCss);
            }
        };

        Notification.prototype.getPosition = function() {
            var pos, ref, ref1, ref2, ref3, ref4, ref5, text;
            text = this.options.position || (this.elem ? this.options.elementPosition : this.options.globalPosition);
            pos = parsePosition(text);
            if (pos.length === 0) {
                pos[0] = "b";
            }
            if (ref = pos[0], indexOf.call(mainPositions, ref) < 0) {
                throw "Must be one of [" + mainPositions + "]";
            }
            if (pos.length === 1 || ((ref1 = pos[0], indexOf.call(vAligns, ref1) >= 0) && (ref2 = pos[1], indexOf.call(hAligns, ref2) < 0)) || ((ref3 = pos[0], indexOf.call(hAligns, ref3) >= 0) && (ref4 = pos[1], indexOf.call(vAligns, ref4) < 0))) {
                pos[1] = (ref5 = pos[0], indexOf.call(hAligns, ref5) >= 0) ? "m" : "l";
            }
            if (pos.length === 2) {
                pos[2] = pos[1];
            }
            return pos;
        };

        Notification.prototype.getStyle = function(name) {
            var style;
            if (!name) {
                name = this.options.style;
            }
            if (!name) {
                name = "default";
            }
            style = styles[name];
            if (!style) {
                throw "Missing style: " + name;
            }
            return style;
        };

        Notification.prototype.updateClasses = function() {
            var classes, style;
            classes = ["base"];
            if ($.isArray(this.options.className)) {
                classes = classes.concat(this.options.className);
            } else if (this.options.className) {
                classes.push(this.options.className);
            }
            style = this.getStyle();
            classes = $.map(classes, function(n) {
                return pluginClassName + "-" + style.name + "-" + n;
            }).join(" ");
            return this.userContainer.attr("class", classes);
        };

        Notification.prototype.run = function(data, options) {
            var d, datas, name, type, value;
            if ($.isPlainObject(options)) {
                $.extend(this.options, options);
            } else if ($.type(options) === "string") {
                this.options.className = options;
            }
            if (this.container && !data) {
                this.show(false);
                return;
            } else if (!this.container && !data) {
                return;
            }
            datas = {};
            if ($.isPlainObject(data)) {
                datas = data;
            } else {
                datas[blankFieldName] = data;
            }
            for (name in datas) {
                d = datas[name];
                type = this.userFields[name];
                if (!type) {
                    continue;
                }
                if (type === "text") {
                    d = encode(d);
                    if (this.options.breakNewLines) {
                        d = d.replace(/\n/g, '<br/>');
                    }
                }
                value = name === blankFieldName ? '' : '=' + name;
                find(this.userContainer, "[data-notify-" + type + value + "]").html(d);
            }
            this.updateClasses();
            if (this.elem) {
                this.setElementPosition();
            } else {
                this.setGlobalPosition();
            }
            this.show(true);
            if (this.options.autoHide) {
                clearTimeout(this.autohideTimer);
                this.autohideTimer = setTimeout(this.show.bind(this, false), this.options.autoHideDelay);
            }
        };

        Notification.prototype.destroy = function() {
            this.wrapper.data(pluginClassName, null);
            this.wrapper.remove();
        };

        $[pluginName] = function(elem, data, options) {
            if ((elem && elem.nodeName) || elem.jquery) {
                $(elem)[pluginName](data, options);
            } else {
                options = data;
                data = elem;
                new Notification(null, data, options);
            }
            return elem;
        };

        $.fn[pluginName] = function(data, options) {
            $(this).each(function() {
                var prev = getAnchorElement($(this)).data(pluginClassName);
                if (prev) {
                    prev.destroy();
                }
                var curr = new Notification($(this), data, options);
            });
            return this;
        };

        $.extend($[pluginName], {
            defaults: defaults,
            addStyle: addStyle,
            removeStyle: removeStyle,
            pluginOptions: pluginOptions,
            getStyle: getStyle,
            insertCSS: insertCSS
        });

        //always include the default bootstrap style
        addStyle("bootstrap", {
            html: "<div>\n<span data-notify-text></span>\n</div>",
            classes: {
                base: {
                    "font-weight": "bold",
                    "padding": "8px 15px 8px 14px",
                    "text-shadow": "0 1px 0 rgba(255, 255, 255, 0.5)",
                    "background-color": "#fcf8e3",
                    "border": "1px solid #fbeed5",
                    "border-radius": "4px",
                    "white-space": "nowrap",
                    "padding-left": "25px",
                    "background-repeat": "no-repeat",
                    "background-position": "3px 7px"
                },
                error: {
                    "color": "#B94A48",
                    "background-color": "#F2DEDE",
                    "border-color": "#EED3D7",
                    "background-image": "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAtRJREFUeNqkVc1u00AQHq+dOD+0poIQfkIjalW0SEGqRMuRnHos3DjwAH0ArlyQeANOOSMeAA5VjyBxKBQhgSpVUKKQNGloFdw4cWw2jtfMOna6JOUArDTazXi/b3dm55socPqQhFka++aHBsI8GsopRJERNFlY88FCEk9Yiwf8RhgRyaHFQpPHCDmZG5oX2ui2yilkcTT1AcDsbYC1NMAyOi7zTX2Agx7A9luAl88BauiiQ/cJaZQfIpAlngDcvZZMrl8vFPK5+XktrWlx3/ehZ5r9+t6e+WVnp1pxnNIjgBe4/6dAysQc8dsmHwPcW9C0h3fW1hans1ltwJhy0GxK7XZbUlMp5Ww2eyan6+ft/f2FAqXGK4CvQk5HueFz7D6GOZtIrK+srupdx1GRBBqNBtzc2AiMr7nPplRdKhb1q6q6zjFhrklEFOUutoQ50xcX86ZlqaZpQrfbBdu2R6/G19zX6XSgh6RX5ubyHCM8nqSID6ICrGiZjGYYxojEsiw4PDwMSL5VKsC8Yf4VRYFzMzMaxwjlJSlCyAQ9l0CW44PBADzXhe7xMdi9HtTrdYjFYkDQL0cn4Xdq2/EAE+InCnvADTf2eah4Sx9vExQjkqXT6aAERICMewd/UAp/IeYANM2joxt+q5VI+ieq2i0Wg3l6DNzHwTERPgo1ko7XBXj3vdlsT2F+UuhIhYkp7u7CarkcrFOCtR3H5JiwbAIeImjT/YQKKBtGjRFCU5IUgFRe7fF4cCNVIPMYo3VKqxwjyNAXNepuopyqnld602qVsfRpEkkz+GFL1wPj6ySXBpJtWVa5xlhpcyhBNwpZHmtX8AGgfIExo0ZpzkWVTBGiXCSEaHh62/PoR0p/vHaczxXGnj4bSo+G78lELU80h1uogBwWLf5YlsPmgDEd4M236xjm+8nm4IuE/9u+/PH2JXZfbwz4zw1WbO+SQPpXfwG/BBgAhCNZiSb/pOQAAAAASUVORK5CYII=)"
                },
                success: {
                    "color": "#468847",
                    "background-color": "#DFF0D8",
                    "border-color": "#D6E9C6",
                    "background-image": "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAutJREFUeNq0lctPE0Ecx38zu/RFS1EryqtgJFA08YCiMZIAQQ4eRG8eDGdPJiYeTIwHTfwPiAcvXIwXLwoXPaDxkWgQ6islKlJLSQWLUraPLTv7Gme32zoF9KSTfLO7v53vZ3d/M7/fIth+IO6INt2jjoA7bjHCJoAlzCRw59YwHYjBnfMPqAKWQYKjGkfCJqAF0xwZjipQtA3MxeSG87VhOOYegVrUCy7UZM9S6TLIdAamySTclZdYhFhRHloGYg7mgZv1Zzztvgud7V1tbQ2twYA34LJmF4p5dXF1KTufnE+SxeJtuCZNsLDCQU0+RyKTF27Unw101l8e6hns3u0PBalORVVVkcaEKBJDgV3+cGM4tKKmI+ohlIGnygKX00rSBfszz/n2uXv81wd6+rt1orsZCHRdr1Imk2F2Kob3hutSxW8thsd8AXNaln9D7CTfA6O+0UgkMuwVvEFFUbbAcrkcTA8+AtOk8E6KiQiDmMFSDqZItAzEVQviRkdDdaFgPp8HSZKAEAL5Qh7Sq2lIJBJwv2scUqkUnKoZgNhcDKhKg5aH+1IkcouCAdFGAQsuWZYhOjwFHQ96oagWgRoUov1T9kRBEODAwxM2QtEUl+Wp+Ln9VRo6BcMw4ErHRYjH4/B26AlQoQQTRdHWwcd9AH57+UAXddvDD37DmrBBV34WfqiXPl61g+vr6xA9zsGeM9gOdsNXkgpEtTwVvwOklXLKm6+/p5ezwk4B+j6droBs2CsGa/gNs6RIxazl4Tc25mpTgw/apPR1LYlNRFAzgsOxkyXYLIM1V8NMwyAkJSctD1eGVKiq5wWjSPdjmeTkiKvVW4f2YPHWl3GAVq6ymcyCTgovM3FzyRiDe2TaKcEKsLpJvNHjZgPNqEtyi6mZIm4SRFyLMUsONSSdkPeFtY1n0mczoY3BHTLhwPRy9/lzcziCw9ACI+yql0VLzcGAZbYSM5CCSZg1/9oc/nn7+i8N9p/8An4JMADxhH+xHfuiKwAAAABJRU5ErkJggg==)"
                },
                info: {
                    "color": "#3A87AD",
                    "background-color": "#D9EDF7",
                    "border-color": "#BCE8F1",
                    "background-image": "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3QYFAhkSsdes/QAAA8dJREFUOMvVlGtMW2UYx//POaWHXg6lLaW0ypAtw1UCgbniNOLcVOLmAjHZolOYlxmTGXVZdAnRfXQm+7SoU4mXaOaiZsEpC9FkiQs6Z6bdCnNYruM6KNBw6YWewzl9z+sHImEWv+vz7XmT95f/+3/+7wP814v+efDOV3/SoX3lHAA+6ODeUFfMfjOWMADgdk+eEKz0pF7aQdMAcOKLLjrcVMVX3xdWN29/GhYP7SvnP0cWfS8caSkfHZsPE9Fgnt02JNutQ0QYHB2dDz9/pKX8QjjuO9xUxd/66HdxTeCHZ3rojQObGQBcuNjfplkD3b19Y/6MrimSaKgSMmpGU5WevmE/swa6Oy73tQHA0Rdr2Mmv/6A1n9w9suQ7097Z9lM4FlTgTDrzZTu4StXVfpiI48rVcUDM5cmEksrFnHxfpTtU/3BFQzCQF/2bYVoNbH7zmItbSoMj40JSzmMyX5qDvriA7QdrIIpA+3cdsMpu0nXI8cV0MtKXCPZev+gCEM1S2NHPvWfP/hL+7FSr3+0p5RBEyhEN5JCKYr8XnASMT0xBNyzQGQeI8fjsGD39RMPk7se2bd5ZtTyoFYXftF6y37gx7NeUtJJOTFlAHDZLDuILU3j3+H5oOrD3yWbIztugaAzgnBKJuBLpGfQrS8wO4FZgV+c1IxaLgWVU0tMLEETCos4xMzEIv9cJXQcyagIwigDGwJgOAtHAwAhisQUjy0ORGERiELgG4iakkzo4MYAxcM5hAMi1WWG1yYCJIcMUaBkVRLdGeSU2995TLWzcUAzONJ7J6FBVBYIggMzmFbvdBV44Corg8vjhzC+EJEl8U1kJtgYrhCzgc/vvTwXKSib1paRFVRVORDAJAsw5FuTaJEhWM2SHB3mOAlhkNxwuLzeJsGwqWzf5TFNdKgtY5qHp6ZFf67Y/sAVadCaVY5YACDDb3Oi4NIjLnWMw2QthCBIsVhsUTU9tvXsjeq9+X1d75/KEs4LNOfcdf/+HthMnvwxOD0wmHaXr7ZItn2wuH2SnBzbZAbPJwpPx+VQuzcm7dgRCB57a1uBzUDRL4bfnI0RE0eaXd9W89mpjqHZnUI5Hh2l2dkZZUhOqpi2qSmpOmZ64Tuu9qlz/SEXo6MEHa3wOip46F1n7633eekV8ds8Wxjn37Wl63VVa+ej5oeEZ/82ZBETJjpJ1Rbij2D3Z/1trXUvLsblCK0XfOx0SX2kMsn9dX+d+7Kf6h8o4AIykuffjT8L20LU+w4AZd5VvEPY+XpWqLV327HR7DzXuDnD8r+ovkBehJ8i+y8YAAAAASUVORK5CYII=)"
                },
                warn: {
                    "color": "#C09853",
                    "background-color": "#FCF8E3",
                    "border-color": "#FBEED5",
                    "background-image": "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAMAAAC6V+0/AAABJlBMVEXr6eb/2oD/wi7/xjr/0mP/ykf/tQD/vBj/3o7/uQ//vyL/twebhgD/4pzX1K3z8e349vK6tHCilCWbiQymn0jGworr6dXQza3HxcKkn1vWvV/5uRfk4dXZ1bD18+/52YebiAmyr5S9mhCzrWq5t6ufjRH54aLs0oS+qD751XqPhAybhwXsujG3sm+Zk0PTwG6Shg+PhhObhwOPgQL4zV2nlyrf27uLfgCPhRHu7OmLgAafkyiWkD3l49ibiAfTs0C+lgCniwD4sgDJxqOilzDWowWFfAH08uebig6qpFHBvH/aw26FfQTQzsvy8OyEfz20r3jAvaKbhgG9q0nc2LbZxXanoUu/u5WSggCtp1anpJKdmFz/zlX/1nGJiYmuq5Dx7+sAAADoPUZSAAAAAXRSTlMAQObYZgAAAAFiS0dEAIgFHUgAAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQfdBgUBGhh4aah5AAAAlklEQVQY02NgoBIIE8EUcwn1FkIXM1Tj5dDUQhPU502Mi7XXQxGz5uVIjGOJUUUW81HnYEyMi2HVcUOICQZzMMYmxrEyMylJwgUt5BljWRLjmJm4pI1hYp5SQLGYxDgmLnZOVxuooClIDKgXKMbN5ggV1ACLJcaBxNgcoiGCBiZwdWxOETBDrTyEFey0jYJ4eHjMGWgEAIpRFRCUt08qAAAAAElFTkSuQmCC)"
                }
            }
        });

        $(function() {
            insertCSS(coreStyle.css).attr("id", "core-notify");
            $(document).on("click", "." + pluginClassName + "-hidable", function(e) {
                $(this).trigger("notify-hide");
            });
            $(document).on("notify-hide", "." + pluginClassName + "-wrapper", function(e) {
                var elem = $(this).data(pluginClassName);
                if(elem) {
                    elem.show(false);
                }
            });
        });

    }));

    }
// Check For desktop/Mobile
    (function(a){(jQuery.browser=jQuery.browser||{}).mobile=/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))})(navigator.userAgent||navigator.vendor||window.opera);











    var salespoplib_active_url = String(location.href).replace('http://', '').replace('https://', '').replace('www.', '');

//salespoplib_active_url = (salespoplib_active_url.substring(0, 4)=="www.")? salespoplib_active_url.substr(4) : salespoplib_active_url;	// minus www. if exists
    salespoplib_active_url = (salespoplib_active_url.substr(-1) == "/") ? salespoplib_active_url.substr(0, salespoplib_active_url.length - 1) : salespoplib_active_url;
// trim / from the end


    var domain_grabber = window.location.hostname;	// domain.com
    domain_grabber = (domain_grabber.substring(0, 4) == "www.") ? domain_grabber.substr(4) : domain_grabber;	// minus www. if exists
    domain_grabber = (domain_grabber.substr(-1) == "/") ? domain_grabber.substr(0, domain_grabber.length - 1) : domain_grabber;

    var salespoplib_vars_obj = {
        is_again: false,
        is_takeover_again: false,
        exit_limit: 1,
        exit_takeover_limit: 1,
        restore_time: 0,
        restore_takeover_time: 0,
        is_triggered: false,
        is_takeover_triggered: false,
        last_exit: null,
        last_takeover_exit: null,
        exit_count: 0,
        exit_takeover_count: 0,
        mouse_lower_limit: -50,
        mouse_upper_limit: 0,
        active_url: salespoplib_active_url,
        modal_id: "salesPopup",
        modal_response_html: "",
        is_allowed: false,
        backend_url: "https://sales-pop.carecart.io/FrontController/",
        do_fire: true,
        do_takeover_fire: true,
        aw_list: '',
        thank_you_url: '',
        convert_url: '',
        span: '',
        takeover_span: '',
        frequency: '',
        takeoverFrequency: '',
        popup_type: 0,
        triggered_count: 0,
        debugBB: 0,
        checkDevice: '',
        conversionformSubmitted: false
    };

    /* Check if Mobile */
    if(jQuery.browser.mobile)
    {
        salespoplib_vars_obj.checkDevice = 'mobile';
    }else {
        salespoplib_vars_obj.checkDevice = 'desktop';
    }
    salesNotifierAdminJquery("head").append(salesNotifierAdminJquery("<link/>", {rel: "stylesheet", href: "https://sales-pop.carecart.io/lib/salesnotifier.css"}));
    function extractHostname(url) {
        var hostname;
        //find & remove protocol (http, ftp, etc.) and get hostname

        if (url.indexOf("//") > -1) {
            hostname = url.split('/')[2];
        }
        else {
            hostname = url.split('/')[0];
        }

        //find & remove port number
        hostname = hostname.split(':')[0];
        //find & remove "?"
        hostname = hostname.split('?')[0];

        return hostname;
    }
    function extractRootDomain(url) {
        var domain = extractHostname(url),
            splitArr = domain.split('.'),
            arrLen = splitArr.length;

        //extracting the root domain here
        //if there is a subdomain
        if (arrLen > 2) {
            domain = splitArr[arrLen - 2] + '.' + splitArr[arrLen - 1];
            //check to see if it's using a Country Code Top Level Domain (ccTLD) (i.e. ".me.uk")
            if (splitArr[arrLen - 2].length == 2 && splitArr[arrLen - 1].length == 2) {
                //this is using a ccTLD
                domain = splitArr[arrLen - 3] + '.' + domain;
            }
        }
        return domain;
    }
    //var store_domain_grabber = extractHostname(location.ancestorOrigins[0]);

    var store_domain_grabber = extractHostname(window.location.hostname);
    //console.log(store_domain_grabber);

    //Check Browser
    navigator.sayswho= (function(){
        var ua= navigator.userAgent, tem,
            M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
        if(/trident/i.test(M[1])){
            tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
            return 'IE '+(tem[1] || '');
        }
        if(M[1]=== 'Chrome'){
            tem= ua.match(/\b(OPR|Edge)\/(\d+)/);
            if(tem!= null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
        }
        M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
        if((tem= ua.match(/version\/(\d+)/i))!= null) M.splice(1, 1, tem[1]);
        return M.join(' ');
    })();



    window.checkmodule_popup = function(result) {
        //console.log(result.string);
        notifyPopup();
        //console.log(store_domain_grabber);
       // console.log(result.nextPopup);
        var regex = "/^([0-9a-zA-Z]([-_\\.]*[0-9a-zA-Z]+)*)@([0-9a-zA-Z]([-_\\.]*[0-9a-zA-Z]+)*)[\\.]([a-zA-Z]{2,9})$/";
        var chr = result.string;
        // Check If Store is exist OR Active
        if (chr.indexOf('store_exists') != -1) {
            setTimeout(function() {    ///code  
            fetchStorePopupWidget();
            setInterval(function(){
              
                if(salespoplib_vars_obj.triggered_count<=result.max_noti){
                    fetchStorePopupWidget();
                    salespoplib_vars_obj.triggered_count++;
                }

            }, parseInt(result.nextPopup*1000));
                }, parseInt(result.first_noti_delay*1000));
            //}, parseInt(5000000));
           // fetchStorePopupWidget();
        }

    }
    //fetch Store PopUps
    function fetchStorePopupWidget() {
        salesNotifierAdminJquery.ajax({
            type: "GET",
            url: salespoplib_vars_obj.backend_url + 'getSalePopup',
            dataType: "jsonp",
            jsonpCallback: "showSalesPopup",
            crossDomain: true,
            data: {
                "webpage": encodeURIComponent(salespoplib_active_url),
                "checkDevice": salespoplib_vars_obj.checkDevice,
                "domain_url": encodeURIComponent(store_domain_grabber)
            },
            beforeSend: function () {
                if (salespoplib_vars_obj.debugBB != 0)
                    console.log('[fetchModalData] beforeSend');
            },
            success: function (result) {
                //console.log(result.locationData);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus);
                console.log(errorThrown);
            },
            complete: function () {
            }
        });
    }


    /*Show Data From DataBase*/
    window.showSalesPopup = function(result) {
        //console.log(result.dataN);
        if(result.string=='no_data'){
            return false;
        }
        var dataNotification = result.dataNotification;
        $.notify.addStyle('happyblue', {
            html: dataNotification
        });
        $.notify(
            "hello world",
            {

                globalPosition: result.dPosition,
                style: 'happyblue',
                autoHideDelay: parseInt(result.dDisplayTime*1000),
                //autoHideDelay: 500000,
                showDuration: 600,
                hideAnimation: 'slideUp',
                hideDuration: 600,
            }
        );
  }

  salesNotifierAdminJquery.ajax({
            type: "GET",
            url: salespoplib_vars_obj.backend_url + 'checkStore/',
            dataType: "jsonp",
            jsonpCallback: "checkmodule_popup",
            crossDomain: true,
            data: {
                "webpage": encodeURIComponent(salespoplib_active_url),
                "checkDevice": salespoplib_vars_obj.checkDevice,
                "domain_url": encodeURIComponent(store_domain_grabber),
            },
            beforeSend: function () {
            },
            success: function () {
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(jqXHR);
                console.log("status: " + textStatus);
                console.log("err: " + errorThrown);
            },
            complete: function () {
            }
        });



    //Click CallBack
    window.clickSaveDataResult = function(result) {
       // console.log(result);

    }

    salesNotifierAdminJquery("body").on('click', '#noti-rsn-id', function (e) {
        e.preventDefault();
        var refIDValue = $(this).attr("data-dateVal");
        var hrefVal = $(this).attr("href");
        var GetURL = 'https://'+encodeURIComponent(store_domain_grabber)+'/cart.json';
        var cartToken='';
        $.getJSON(GetURL, function(data) {
           cartToken  = data.token;
            salesNotifierAdminJquery.ajax({
                type: "GET",
                url: salespoplib_vars_obj.backend_url + 'postClickInformation/',
                dataType: "jsonp",
                jsonpCallback: "clickSaveDataResult",
                crossDomain: true,
                async: false,
                data: {
                    "webpage": encodeURIComponent(salespoplib_active_url),
                    "noti_refID": refIDValue,
                    "cart_token": cartToken,
                    "browserInformation": navigator.sayswho,
                    "domain_url": encodeURIComponent(store_domain_grabber),
                },
                beforeSend: function () {
                },
                success: function () {
                    window.location = hrefVal; 

                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log(jqXHR);
                    console.log("status: " + textStatus);
                    console.log("err: " + errorThrown);
                },
                complete: function () {
                }
            });
        });


    });

    //Click CallBack
    window.clickUpdateDataResult = function(result) {
        console.log(result);
    }
    salesNotifierAdminJquery("body").on("click", "button[type='submit'][name='checkout']", function (e) {
        var GetURL = 'https://'+encodeURIComponent(store_domain_grabber)+'/cart.json';
        var cartToken='';
        $.getJSON(GetURL, function(data) {
            cartToken  = data.token;
            salesNotifierAdminJquery.ajax({
                type: "GET",
                url: salespoplib_vars_obj.backend_url + 'postUpdateClickInformation/',
                dataType: "jsonp",
                jsonpCallback: "clickUpdateDataResult",
                crossDomain: true,
                async: false,
                data: {
                    "webpage": encodeURIComponent(salespoplib_active_url),
                    "cart_token": cartToken,
                    "browserInformation": navigator.sayswho,
                    "domain_url": encodeURIComponent(store_domain_grabber),
                },
                beforeSend: function () {
                },
                success: function () {

                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log(jqXHR);
                    console.log("status: " + textStatus);
                    console.log("err: " + errorThrown);
                },
                complete: function () {
                }
            });
        });

    });




});
