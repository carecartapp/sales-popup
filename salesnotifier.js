/**
 * @package Sales Pop up ‑ Social Proof
 * @author CareCart
 * @link https://apps.shopify.com/partners/care-cart
 * @link https://carecart.io/
 * @version 5.0.1
 * Date 14-10-2022 07:52PM
 *
 * Any unauthorized use and distribution of this and related files, is strictly forbidden.
 * In case of any inquiries, please contact here: https://carecart.io/contact-us/
 */

//Create the element using the createElement method.
var myDiv = document.createElement("ji");

//Set its class.
myDiv.className = 'doubleCheck';

//Finally, append the element to the HTML body
document.body.appendChild(myDiv);

var doubleCheck = document.getElementsByClassName("doubleCheck");
var ndoubleCheck = doubleCheck.length;
if (ndoubleCheck == 2) {
    //window.stop();
    throw new Error("DOUBLE APP JS");
}

function scriptInjection(src, callback) {
    var script = document.createElement('script');
    script.type = "text/javascript";

    script.src = src;
    if (typeof callback == 'function') {
        script.addEventListener('load', callback);
    }

    document.getElementsByTagName('head')[0].appendChild(script);
}

scriptInjection("https://code.jquery.com/jquery-3.2.1.min.js", function () {
    window.$jq321 = jQuery.noConflict(true);
    //variable for impressionsID
    let impressionsID = null;
    let timeCountdownForImpression = 0;

    scriptInjection("https://cdnjs.cloudflare.com/ajax/libs/Swiper/5.4.5/js/swiper.min.js");

    var version = "5.0.0";

    function notifyPopup($) {
        //IE8 indexOf polyfill
        var indexOf = [].indexOf || function (item) {
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

        var parsePosition = function (str) {
            var pos;
            pos = [];
            $.each(str.split(/\W+/), function (i, word) {
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

        var getStyle = function (name) {
            return styles[name];
        };

        var removeStyle = function (name) {
            if (!name) {
                throw "Missing Style name";
            }
            if (styles[name]) {
                delete styles[name];
            }
        };

        var addStyle = function (name, def) {
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
                $.each(def.classes, function (className, props) {
                    cssText += "." + pluginClassName + "-" + def.name + "-" + className + " {\n";
                    $.each(props, function (name, val) {
                        if (stylePrefixes[name]) {
                            $.each(stylePrefixes[name], function (i, prefix) {
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

        var insertCSS = function (cssText) {
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

        var findFields = function (type, elem, fields) {
            var attr;
            if (type !== "html") {
                type = "text";
            }
            attr = "data-notify-" + type;
            return find(elem, "[" + attr + "]").each(function () {
                var name;
                name = $(this).attr(attr);
                if (!name) {
                    name = blankFieldName;
                }
                fields[name] = type;
            });
        };

        var find = function (elem, selector) {
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

        var inherit = function (a, b) {
            var F;
            F = function () {
            };
            F.prototype = a;
            return $.extend(true, new F(), b);
        };

        var defaults = function (opts) {
            return $.extend(pluginOptions, opts);
        };

        var createElem = function (tag) {
            return $("<" + tag + "></" + tag + ">");
        };

        var globalAnchors = {};

        var getAnchorElement = function (element) {
            var radios;
            if (element.is('[type=radio]')) {
                radios = element.parents('form:first').find('[type=radio]').filter(function (i, e) {
                    return $(e).attr("name") === element.attr("name");
                });
                element = radios.first();
            }
            return element;
        };

        var incr = function (obj, pos, val) {
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

        var realign = function (alignment, inner, outer) {
            if (alignment === "l" || alignment === "t") {
                return 0;
            } else if (alignment === "c" || alignment === "m") {
                return outer / 2 - inner / 2;
            } else if (alignment === "r" || alignment === "b") {
                return outer - inner;
            }
            throw "Invalid alignment";
        };

        var encode = function (text) {
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

        Notification.prototype.loadHTML = function () {
            var style;
            style = this.getStyle();
            this.userContainer = $(style.html);
            this.userFields = style.fields;
        };

        Notification.prototype.show = function (show, userCallback) {
            var args, callback, elems, fn, hidden;
            callback = (function (_this) {
                return function () {
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

        Notification.prototype.setGlobalPosition = function () {
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

        Notification.prototype.setElementPosition = function () {
            var arrowColor, arrowCss, arrowSize, color, contH, contW, css, elemH, elemIH, elemIW, elemPos, elemW,
                gap, j, k, len, len1, mainFull, margin, opp, oppFull, pAlign, pArrow, pMain, pos, posFull, position,
                ref, wrapPos;
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

        Notification.prototype.getPosition = function () {
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

        Notification.prototype.getStyle = function (name) {
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

        Notification.prototype.updateClasses = function () {
            var classes, style;
            classes = ["base"];
            if ($.isArray(this.options.className)) {
                classes = classes.concat(this.options.className);
            } else if (this.options.className) {
                classes.push(this.options.className);
            }
            style = this.getStyle();
            classes = $.map(classes, function (n) {
                return pluginClassName + "-" + style.name + "-" + n;
            }).join(" ");
            return this.userContainer.attr("class", classes);
        };

        Notification.prototype.run = function (data, options) {
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

        Notification.prototype.destroy = function () {
            this.wrapper.data(pluginClassName, null);
            this.wrapper.remove();
        };

        $[pluginName] = function (elem, data, options) {
            if ((elem && elem.nodeName) || elem.jquery) {
                $(elem)[pluginName](data, options);
            } else {
                options = data;
                data = elem;
                new Notification(null, data, options);
            }
            return elem;
        };

        $.fn[pluginName] = function (data, options) {
            $(this).each(function () {
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

        $(function () {
            insertCSS(coreStyle.css).attr("id", "core-notify");
            $(document).on("click", "." + pluginClassName + "-hidable", function (e) {
                $(this).trigger("notify-hide");
            });
            $(document).on("notify-hide", "." + pluginClassName + "-wrapper", function (e) {
                var elem = $(this).data(pluginClassName);
                if (elem) {
                    elem.show(false);
                }
            });
        });

    }

    // Check For desktop/Mobile
    (function (a) {
        ($jq321.browser = $jq321.browser || {}).mobile = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))
    })(navigator.userAgent || navigator.vendor || window.opera);

    var salespoplib_active_url = window.location.hostname;
    salespoplib_active_url += (window.location.pathname.substr(-1) !== "/") ? window.location.pathname : window.location.pathname.substr(0, window.location.pathname.length - 1);

    function getServerUrls() {
        // Finding the URL of this library among all the script tags
        var allScripts = document.getElementsByTagName('script');
        allScripts = Array.prototype.slice.call(allScripts);

        var thisLibUrl = "";
        allScripts.forEach(function (script) {
            if (script.src && script.src.indexOf('lib/salesnotifier') !== -1) {
                thisLibUrl = script.src;
            }
        });

        // return with production URLs
        if (thisLibUrl === "") {
            return {
                "backend": "https://tracking-sales-pop.carecart.io/index.php/FrontController/",
                "css": "https://sales-pop.carecart.io/public/front_assets/new-ui/css/notif-box.css",
                "cssStock": "https://sales-pop.carecart.io/lib/stock-box.css",
                "cssTimer": "https://sales-pop.carecart.io/lib/timer-box.css",
                "cssVisitor": "https://sales-pop.carecart.io/lib/visitor-box.css",
                "cssSold": "https://sales-pop.carecart.io/lib/sold-box.css",
                "cssQuick": "https://sales-pop.carecart.io/lib/quick-box.css",
                "cssTrustBadges": "https://sales-pop.carecart.io/lib/badges-box.css",
                "cssAnnouncement": "https://sales-pop.carecart.io/lib/announcement.css",
                "legacyCss": "https://sales-pop.carecart.io/lib/salesnotifier.css",
                "cssShareCart": "https://sales-pop.carecart.io/lib/sales-pop-share-cart.css",
                "cssStickyCart": "https://sales-pop.carecart.io/lib/sales-pop-sticky-cart.css"
            };
        }

        var tempAnchorTag = document.createElement('a');
        tempAnchorTag.href = thisLibUrl;

        var backend = "https://" + tempAnchorTag.hostname + "/index.php/FrontController/";
        if ("sales-pop.carecart.io" === tempAnchorTag.hostname) {
            backend = "https://tracking-" + tempAnchorTag.hostname + "/index.php/FrontController/";
            impressionURL = "https://tracking-" + tempAnchorTag.hostname + "/index.php/ImpressionsCount/";
        }
        else if ("lazy-cow-13.telebit.io" === tempAnchorTag.hostname) {
            backend = "http://localhost:8501/index.php/FrontController/";
            impressionURL = "http://localhost:8501/index.php/ImpressionsCount/";
        }
        else if ("uat-salespop.carecart.io" === tempAnchorTag.hostname) {
            backend = "https://uat-tracking-sales-pop.carecart.io/index.php/FrontController/";
            impressionURL = "https://uat-tracking-sales-pop.carecart.io/index.php/ImpressionsCount/";
        }
        else if ("dev-sales-pop.carecart.io" === tempAnchorTag.hostname) {
            backend = "https://dev-tracking-sales-pop.carecart.io/index.php/FrontController/";
            impressionURL = "https://dev-tracking-sales-pop.carecart.io/index.php/ImpressionsCount/";
        }
        else if ("odd-earwig-64.telebit.io" === tempAnchorTag.hostname) {
            backend = "http://localhost:8500/index.php/FrontController/";
            impressionURL = "http://localhost:8501/index.php/ImpressionsCount/";
        }
        else if ("helpless-insect-91.telebit.io" === tempAnchorTag.hostname) {
            backend = "http://localhost:8500/index.php/FrontController/";
            impressionURL = "http://localhost:8501/index.php/ImpressionsCount/";
        }

        return {
            "backend": backend,
            "impressionURL": impressionURL,
            "css": "https://" + tempAnchorTag.hostname + "/public/front_assets/new-ui/css/notif-box.css?v" + version,
            "cssStock": "https://" + tempAnchorTag.hostname + "/lib/stock-box.css?v" + version,
            "cssTimer": "https://" + tempAnchorTag.hostname + "/lib/timer-box.css?v" + version,
            "cssVisitor": "https://" + tempAnchorTag.hostname + "/lib/visitor-box.css?v" + version,
            "cssSold": "https://" + tempAnchorTag.hostname + "/lib/sold-box.css?v" + version,
            "cssQuick": "https://" + tempAnchorTag.hostname + "/lib/quick-box.css?v" + version,
            "cssTrustBadges": "https://" + tempAnchorTag.hostname + "/lib/badges-box.css?v" + version,
            "cssAnnouncement": "https://" + tempAnchorTag.hostname + "/lib/announcement.css?v" + version,
            "legacyCss": "https://" + tempAnchorTag.hostname + "/lib/salesnotifier.css",
            "cssShareCart": "https://" + tempAnchorTag.hostname + "/lib/sales-pop-share-cart.css?v" + version,
            "cssStickyCart": "https://" + tempAnchorTag.hostname + "/lib/sales-pop-sticky-cart.css?v=" + version
        };
    }

    var serverUrl = getServerUrls();

    function salesPopDebugger() {
        var spDebugger = {
            log: [],
            storeLog: function (logMsg) {
                this.log.push(logMsg);
            },
            getLog: function () {
                return this.log;
            },
            printLog: function () {
                console.log(">>>>>>>>>>>>>>>>>>>>>>>> SP DEBUGGER STARTS <<<<<<<<<<<<<<<<<<<<<<<<<");
                Array.prototype.forEach.call(this.log, function (entry) {
                    console.log(entry);
                });
                console.log(">>>>>>>>>>>>>>>>>>>>>>>> SP DEBUGGER ENDS <<<<<<<<<<<<<<<<<<<<<<<<<<<");
            }
        };
        return spDebugger;
    }

    window.spDebuger = salesPopDebugger();

    window.printLog = function () {
        spDebuger.printLog();
    };

    // @todo cleanup unused extra properties
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
        backend_url: serverUrl.backend,
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
        conversionformSubmitted: false,
        impressionURL: impressionURL
    };

    /**
     * Expected API Response
     * @type {{max_noti: number, first_noti_delay: number, do_restrict: number, string: string, allCollectionsWithProducts: [], allProductsWithCollections: [], show_relevant: number, allNotifications: [], display_time: number, nextPopup: number, desktop_position: string}}
     */
    var apiResponse = {
        string: "",
        max_noti: 0,
        nextPopup: 0,
        first_noti_delay: 0,
        show_relevant: 0,
        do_restrict: 0,
        display_time: 0,
        isLegacyStore: 0,
        desktop_position: "bottom left",
        allNotifications: [],
        allCollectionsWithProducts: [],
        allProductsWithCollections: [],
        restrictionSettings: []
    };

    /* Check if Mobile */
    if ($jq321.browser.mobile) {
        salespoplib_vars_obj.checkDevice = 'mobile';
    } else {
        salespoplib_vars_obj.checkDevice = 'desktop';
    }

    var store_domain_grabber = window.location.hostname;

    //Check Browser
    navigator.sayswho = (function () {
        var ua = navigator.userAgent, tem,
            M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
        if (/trident/i.test(M[1])) {
            tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
            return 'IE ' + (tem[1] || '');
        }
        if (M[1] === 'Chrome') {
            tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
            if (tem != null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
        }
        M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
        if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
        return M.join(' ');
    })();

    Array.prototype.filterRelevantNotifications = function (a) {
        return this.filter(function (i) {
            return a.indexOf(i) === -1;
        });
    };

    var getNotificationsByCollectionHandles = function (collectionHandles) {
        spDebuger.storeLog("getNotificationsByCollectionHandles called");

        var relevantProductHandles = getProductHandlesByCollectionHandles(collectionHandles);
        spDebuger.storeLog("relevantProductHandles count: " + relevantProductHandles.length);
        spDebuger.storeLog("relevantProductHandles:");
        spDebuger.storeLog(relevantProductHandles);

        // if the product handle is not found
        // or the product doesn't belong to any collection
        // then return all notifications
        if (relevantProductHandles == null || relevantProductHandles.length === 0) {
            spDebuger.storeLog("No relevant product found for this collection: " + collectionHandles);
            return apiResponse.allNotifications;
        }

        var relevantNotifications = [];
        Array.prototype.forEach.call(apiResponse.allNotifications, function (notification) {
            Array.prototype.forEach.call(relevantProductHandles, function (product) {
                if (notification.product == product) {
                    relevantNotifications.push(notification);
                }
            });
        });

        spDebuger.storeLog("relevantNotifications count: " + relevantNotifications.length);
        spDebuger.storeLog("relevantNotifications:");
        spDebuger.storeLog(relevantNotifications);

        if (relevantNotifications == null || relevantNotifications.length === 0) {
            return apiResponse.allNotifications;
        }

        return relevantNotifications;
    };

    var getNotificationsByProduct = function (currentProductHandle) {
        spDebuger.storeLog("getNotificationsByProduct called");
        spDebuger.storeLog("currentProductHandle: " + currentProductHandle);

        var collectionHandles = getCollectionHandlesByProductHandle(currentProductHandle);

        // if the product handle is not found
        // or the product doesn't belong to any collection
        // then show all Notifications
        if (collectionHandles == null || collectionHandles.length === 0) {
            return apiResponse.allNotifications;
        }

        var notificationsByCollectionHandles = getNotificationsByCollectionHandles(collectionHandles);

        spDebuger.storeLog("notificationsByCollectionHandles count: " + notificationsByCollectionHandles.length);
        spDebuger.storeLog("notificationsByCollectionHandles:");
        spDebuger.storeLog(notificationsByCollectionHandles);

        return notificationsByCollectionHandles;
    };

    var getNotificationsByCollection = function (collectionHandle) {
        spDebuger.storeLog("getNotificationsByCollection called.");

        if (collectionHandle === "all") {
            return apiResponse.allNotifications;
        }

        return getNotificationsByCollectionHandles(collectionHandle);
    };

    var getProductHandlesByCollectionHandles = function (collectionHandles) {
        spDebuger.storeLog("getProductHandlesByCollectionHandles called.");

        var collectionHandleArray = collectionHandles.split(",");
        var relevantProducts = [];
        Array.prototype.forEach.call(apiResponse.allCollectionsWithProducts, function (collection) {
            Array.prototype.forEach.call(collectionHandleArray, function (handle) {
                if (collection.collection === handle) {
                    relevantProducts = relevantProducts.concat(collection.products.split(","));
                }
            });
        });

        spDebuger.storeLog("relevantProducts count: " + relevantProducts.length);

        if (relevantProducts.length === 0) {
            return [];
        }

        var uniqueRelevantProducts = getUniqueProducts(relevantProducts);

        spDebuger.storeLog("uniqueRelevantProducts count: " + uniqueRelevantProducts.length);

        return uniqueRelevantProducts;
    };

    var getUniqueProducts = function (products) {
        return products.filter(function (item, index) {
            return products.indexOf(item) >= index;
        });
    };

    var getRelevantNotifications = function () {
        spDebuger.storeLog("getRelevantNotifications called");

        // if it's a homepage then return with all
        if (window.location.pathname === "/") {
            spDebuger.storeLog("It's a homepage, so all notifications will run");
            return apiResponse.allNotifications
        }

        var pathNameTokens = window.location.pathname.split("/");
        var filteredNotifications = [];

        switch (pathNameTokens[1]) {
            case "products":
                filteredNotifications = getNotificationsByProduct(pathNameTokens[2]);
                break;

            case "collections":
                filteredNotifications = getNotificationsByCollection(pathNameTokens[2]);
                break;

            default:
                filteredNotifications = apiResponse.allNotifications;
        }

        spDebuger.storeLog("filteredNotifications Count: " + filteredNotifications.length);
        spDebuger.storeLog("filteredNotifications: ");
        spDebuger.storeLog(filteredNotifications);

        return filteredNotifications;
    };

    var getCollectionHandlesByProductHandle = function (currentProductHandle) {
        spDebuger.storeLog("getCollectionHandlesByProductHandle called");

        var collectionHandles = "";
        Array.prototype.forEach.call(apiResponse.allProductsWithCollections, function (obj) {
            if (obj.product === currentProductHandle) {
                collectionHandles = obj.collections;
            }
        });
        spDebuger.storeLog("collectionHandles: " + collectionHandles);

        return collectionHandles;
    };

    /**
     * @todo this function needs to be cleaned up.
     * @returns {boolean}
     */
    var isNotificationAllowedOnCurrentPage = function () {

        spDebuger.storeLog("isNotificationAllowedOnCurrentPage called.");

        // @todo what to do in this case
        if (apiResponse.restrictionSettings.length === 0) {
            spDebuger.storeLog("No product, collection or static pag(e) selected");
            return true;
        }
        var currentPageUrl = window.location.href;
        var currentPageHandle = window.location.pathname;
        var is_notification_allowed = false;
        var entryFound = false;
        var currentPageType = "";

        // If not then do further processing to get the current page handle
        currentPageHandle = window.location.pathname.split("/");

        if (($jq321.inArray("products", currentPageHandle) != -1) && ($jq321.inArray("collections", currentPageHandle) != -1)) {
            var currentPageTypec = currentPageHandle[1];
            var currentPageTypep = currentPageHandle[3];
            var currentPageHandlec = currentPageHandle[2];
            var currentPageHandlep = currentPageHandle[4];
        }
        else if ($jq321.inArray("products", currentPageHandle) != -1) {
            currentPageType = "products";
            currentPageHandle = currentPageHandle.pop();
        }
        else if ($jq321.inArray("all", currentPageHandle) != -1) {
            console.log("collections all in array");
        }
        else if ($jq321.inArray("collections", currentPageHandle) != -1) {
            currentPageType = "collections";
            currentPageHandle = currentPageHandle.pop();
        }
        else {
            console.log("products and collections NOT in array");
        }

        if ("products" === currentPageTypep && "collections" === currentPageTypec) {
            // Two things can happen here:
            // a. Check by product
            // b. Check by collection

            // a. Checking by Product
            Array.prototype.forEach.call(apiResponse.restrictionSettings, function (page) {
                if ((page.product_id == null && page.collection_id != null) && !entryFound) {
                    if (page.handle === currentPageHandlec) {
                        is_notification_allowed = entryFound = true;
                    }
                }
                else if (page.product_id == null && page.collection_id == null && page.handle == currentPageUrl) {
                    is_notification_allowed = entryFound = true;
                }
            });

            if (entryFound === true) {
                return true;
            }

            // b. Check by Collection
            Array.prototype.forEach.call(apiResponse.restrictionSettings, function (page) {
                if ((page.product_id != null && page.collection_id == null) && !entryFound) {
                    if (page.handle === currentPageHandlep) {
                        is_notification_allowed = entryFound = true;
                    }
                }
            });
        }
        else if ("products" === currentPageType) {
            // Two things can happen here:
            // a. Check by product
            // b. Check by collection

            // a. Checking by Product
            Array.prototype.forEach.call(apiResponse.restrictionSettings, function (page) {
                if ((page.product_id != null && page.collection_id == null) && !entryFound) {
                    if (page.handle === currentPageHandle) {
                        is_notification_allowed = entryFound = true;
                    }
                }
                else if (page.product_id == null && page.collection_id == null && page.handle == currentPageUrl) {
                    is_notification_allowed = entryFound = true;
                }
            });

            if (entryFound === true) {
                return true;
            }

            // b. Check by Collection
            Array.prototype.forEach.call(apiResponse.restrictionProducts, function (obj) {
                if (obj.handle === currentPageHandle) {
                    is_notification_allowed = entryFound = true;
                }
            });
        }
        else if ("collections" === currentPageType) {
            Array.prototype.forEach.call(apiResponse.restrictionSettings, function (page) {
                if ((page.product_id == null && page.collection_id != null) && !entryFound) {
                    if (page.handle === currentPageHandle) {
                        is_notification_allowed = entryFound = true;
                    }
                }
                else if (page.product_id == null && page.collection_id == null && page.handle == currentPageUrl) {
                    is_notification_allowed = entryFound = true;
                }
            });
        }
        else {
            Array.prototype.forEach.call(apiResponse.restrictionSettings, function (page) {
                if (page.handle == currentPageUrl) {
                    is_notification_allowed = entryFound = true;
                }
                else if (page.handle + '/' == currentPageUrl) {
                    is_notification_allowed = entryFound = true;
                }
            });
        }

        return is_notification_allowed;
    };

    var shouldStatsBeShown = function () {
        return (typeof URLSearchParams === "undefined") ? false : (new URLSearchParams(window.location.search)).has('show-sp-config');
    };

    var printConfigForNerds = function () {
        var statsHtml = "<div id='sp-stats-container'><span>::Sales Popup Configuration::</span><ol>";
        Array.prototype.forEach.call(Object.keys(apiResponse), function (key) {
            if ($jq321.inArray(key, ["allCollectionsWithProducts", "allNotifications", "allProductsWithCollections", "restrictionSettings"]) === -1) {
                statsHtml += "<li>" + key + ": <b>" + apiResponse[key] + "</b></li>";
            }
        });
        statsHtml += "<li>Hidden By Cookie: <b>" + (isHidePopupCookieSet() ? "Yes" : "No") + "</b></li>";
        statsHtml += "</ol>";

        var queryStringData = {
            "webpage": encodeURIComponent(salespoplib_active_url),
            "checkDevice": salespoplib_vars_obj.checkDevice,
            "domain_url": Shopify.shop,
            "callback": "checkmodule_popup"
        };

        var api_url = salespoplib_vars_obj.backend_url + "checkStore/?" + $jq321.param(queryStringData);

        statsHtml += "<a target='_blank' href='" + api_url + "'>See all generated notifications</a></div>";

        $jq321("body").append(statsHtml);
    };

    window.checkmodule_popup = function (response) {
        spDebuger.storeLog("BACKEND-URL: ", salespoplib_vars_obj.backend_url);

        apiResponse = response;
        impressionsID = apiResponse.impressionsID;

        /////////////////////////////////// start local storage check
        //use notifications from response data if available and update time stamp, if notifications not found in response then get from local storage if available
        try {
            if (typeof (Storage) !== "undefined") {
                var dataReceived = false;
                if (typeof apiResponse.allCollectionsWithProducts !== 'undefined' && typeof apiResponse.allNotifications !== 'undefined' && typeof apiResponse.allProductsWithCollections !== 'undefined') {
                    //if(apiResponse.allCollectionsWithProducts.length > 0 || apiResponse.allNotifications.length > 1 || apiResponse.allProductsWithCollections.length > 0){
                    var notificationsExistingData = window.localStorage.getItem('NotificationsData');
                    var updateStorage = false;
                    if (notificationsExistingData === null) {
                        updateStorage = true;
                    } else {
                        notificationsExistingData = JSON.parse(notificationsExistingData);
                        var tStamp = notificationsExistingData.timeStamp;
                        if ((Math.round(new Date().getTime() / 1000) - tStamp) > 300) {
                            updateStorage = true;
                        }
                    }

                    if (updateStorage === true) {
                        var notificationsDataObj = {
                            timeStamp: Math.round(new Date().getTime() / 1000),
                            allCollectionsWithProducts: apiResponse.allCollectionsWithProducts,
                            allNotifications: apiResponse.allNotifications,
                            allProductsWithCollections: apiResponse.allProductsWithCollections
                        };
                        notificationsDataObjJson = JSON.stringify(notificationsDataObj);
                        window.localStorage.setItem('NotificationsData', notificationsDataObjJson);
                        dataReceived = true;
                    }
                }
                if (dataReceived === false) {
                    var notificationsData = window.localStorage.getItem('NotificationsData');
                    if (notificationsData !== null) {
                        notificationsData = JSON.parse(notificationsData);
                        apiResponse.allCollectionsWithProducts = notificationsData.allCollectionsWithProducts;
                        apiResponse.allNotifications = notificationsData.allNotifications;
                        apiResponse.allProductsWithCollections = notificationsData.allProductsWithCollections;
                    }
                }
            }
        } catch (msg) {
            console.log(msg);
        }
        //////////////////////////////// .end local storage check

        // STOCK COUNTDOWN CALL
        if (apiResponse && apiResponse.stock && apiResponse.stock !== null) {
            if (apiResponse.stock.on_off == 1) {
                if (apiResponse.stock.stock_restriction_settings !== null && apiResponse.stock.variantCheck == 0) {
                    let stock_restriction_setting = JSON.parse(apiResponse.stock.stock_restriction_settings);
                    if (stock_restriction_setting.stock_restriction_check == "on" && parseInt(stock_restriction_setting.stock_restriction_value) !== parseInt(apiResponse.stock.left_stock) && parseInt(apiResponse.stock.left_stock) > parseInt(stock_restriction_setting.stock_restriction_value)) {
                        console.log("SP: Stock restricted to display");
                    } else {
                        $jq321("head").append($jq321("<link/>", {
                            rel: "stylesheet",
                            href: serverUrl.cssStock + "?v" + version
                        }));
                        stockCountdown(apiResponse.stock);
                        if (apiResponse.stock.variantCheck && apiResponse.stock.variantCheck == 1 && apiResponse.stock.variantsData !== null && apiResponse.stock.variantsData.length > 1) {
                            enableStockForVariants(apiResponse.stock.variantsData, apiResponse.stock.variantHeading, apiResponse.stock);
                        }
                    }
                } else {
                    $jq321("head").append($jq321("<link/>", {
                        rel: "stylesheet",
                        href: serverUrl.cssStock + "?v" + version
                    }));
                    stockCountdown(apiResponse.stock);
                    if (apiResponse.stock.variantCheck && apiResponse.stock.variantCheck == 1 && apiResponse.stock.variantsData !== null && apiResponse.stock.variantsData.length > 1) {
                        enableStockForVariants(apiResponse.stock.variantsData, apiResponse.stock.variantHeading, apiResponse.stock);
                    }
                }
            }
        }

        // Time COUNTDOWN CALL
        if (apiResponse && apiResponse.timer && apiResponse.timer !== null) {
            
            timeCountdownForImpression = 1;
            setTimeout(function () {
                $jq321("head").append($jq321("<link/>", {
                    rel: "stylesheet",
                    href: serverUrl.cssTimer + "?v" + version
                }));
            }, 1000);
            setTimeout(function () { timeCountdown(apiResponse.timer); }, 2000);
        }

        // VISITOR COUNTER CALL
        if (apiResponse && apiResponse.visitor && apiResponse.visitor !== null) {

            $jq321("head").append($jq321("<link/>", {
                rel: "stylesheet",
                href: serverUrl.cssVisitor + "?v" + version
            }));

            if (apiResponse.visitor.start_visitor_counter != null && apiResponse.visitor.end_visitor_counter != null) {

                customVisitors(apiResponse.visitor.start_visitor_counter, apiResponse.visitor.end_visitor_counter);
            }

            visitorCounter(apiResponse.visitor);
        }

        // SOLD COUNTER CALL
        if (apiResponse && apiResponse.sold && apiResponse.sold !== null && apiResponse.sold.on_off == 1) {
            $jq321("head").append($jq321("<link/>", {
                rel: "stylesheet",
                href: serverUrl.cssSold + "?v" + version
            }));

            soldCounter(apiResponse.sold);
        }

        // PRODUCT QUICK VIEW FOR NOTIFICATION
        if (apiResponse && apiResponse.quickView && apiResponse.quickView !== null) {
            $jq321("head").append($jq321("<link/>", {
                rel: "stylesheet",
                href: serverUrl.cssQuick + "?v" + version
            }));

            productQuickView(apiResponse.quickView);

            if (apiResponse && apiResponse.quickViewCollection && apiResponse.quickViewCollection == 1) {
                setTimeout(function () {
                    // PRODUCT QUICK VIEW FOR COLLECTION PAGES
                    collectionQuickView(apiResponse.quickViewCollectionText, apiResponse.quickViewCollectionLayout, apiResponse.quickViewCollectionPosition);
                }, 3000);
            }
        }

        // TRUST BADGES CALL
        if (apiResponse && apiResponse.trustBadges && apiResponse.trustBadges != false) {
            $jq321("head").append($jq321("<link/>", {
                rel: "stylesheet",
                href: serverUrl.cssTrustBadges + "?v" + version
            }));

            trustBadges(apiResponse.trustBadges);
        }

        //Timer on collections
        if (apiResponse && apiResponse.timerCollection && apiResponse.timerCollectionPagesStatus == 1) {
            setTimeout(function () {
                $jq321("head").append($jq321("<link/>", {
                    rel: "stylesheet",
                    href: serverUrl.cssTimer + "?v" + version
                }));
            }, 1000);
            setTimeout(function () {
                collectionTimer(apiResponse.timerCollection, apiResponse.timerCollectionOff);
            }, 2000);
        }

        // ANNOUNCEMENT BAR CALL
        if (apiResponse && apiResponse.announcementBar && apiResponse.announcementBar != false) {
            if (!isHideAnnouncementCookieSet()) {
                var $allowed = 0;
                var currentPageHandle = window.location.pathname.split("/");

                if (apiResponse.announcementBar.pages_type == 2) {
                    if (($jq321.inArray("products", currentPageHandle) != -1) && (apiResponse.announcementBar.product_page == 1)) {
                        console.log('product page');
                        $allowed = 1;
                    }
                    else if (($jq321.inArray("collections", currentPageHandle) != -1) && (apiResponse.announcementBar.collection_page == 1)) {
                        console.log('collection page');
                        $allowed = 1;
                    }
                    else if (($jq321.inArray("cart", currentPageHandle) != -1) && (apiResponse.announcementBar.cart_page == 1)) {
                        console.log('cart page');
                        $allowed = 1;
                    }
                    else if ((currentPageHandle[1].length == 0) && (apiResponse.announcementBar.home_page == 1)) {
                        console.log("home page");
                        $allowed = 1;
                    }
                    else {
                        console.log('undefine page');
                        $allowed = 0;
                    }
                }
                else if (apiResponse.announcementBar.pages_type == 1) {
                    $allowed = 1;
                }

                if ($allowed == 1) {
                    $jq321("head").append($jq321("<link/>", {
                        rel: "stylesheet",
                        href: serverUrl.cssAnnouncement + "?v" + version
                    }));

                    setTimeout(function () { announcementBar(apiResponse.announcementBar); }, 2000);
                }
            }
        }
        //share cart
        if (apiResponse && apiResponse.shareCart && apiResponse.shareCart !== false) {
            shareCart(apiResponse.shareCart);
            $jq321("head").append($jq321("<link/>", {
                rel: "stylesheet",
                href: serverUrl.cssShareCart + "?v" + version
            }));
        }

        //STICKY CART CALL
        if (apiResponse && apiResponse.sticky && apiResponse.sticky !== false) {
            stickyCart(apiResponse.sticky);
            $jq321("head").append($jq321("<link/>", {
                rel: "stylesheet",
                href: serverUrl.cssStickyCart
            }));
        }

        if (shouldStatsBeShown()) {
            printConfigForNerds();
        }

        if (apiResponse.hasOwnProperty('string') &&
            (apiResponse.string === 'sales_notification_disabled' || apiResponse.string === 'no_data')
        ) {
            spDebuger.storeLog("apiResponse.string: " + apiResponse.string);
            return false;
        }

        // check if cart page is allowed and
        // that current page is a cart page
        if (apiResponse.hasOwnProperty('disable_on_cart_page') && parseInt(apiResponse.disable_on_cart_page) === 1) {
            if (window.location.pathname === "/cart") {
                spDebuger.storeLog("Notifications are not allowed on cart page");
                return false;
            }
        }

        // Check whether restrict notification option is checked
        // and that the notifications are allowed on current page
        if (parseInt(apiResponse.do_restrict) === 1) {
            var notificationsAllowed = isNotificationAllowedOnCurrentPage();
            spDebuger.storeLog("Notifications allowed: " + notificationsAllowed);
            if (!notificationsAllowed) {
                return false;
            }
        }

        // include the css file according to the store
        var cssTobeIncluded = serverUrl.css;
        if (apiResponse.hasOwnProperty('isLegacyStore') && parseInt(apiResponse.isLegacyStore) === 1) {
            cssTobeIncluded = serverUrl.legacyCss;
        }

        $jq321("head").append($jq321("<link/>", {
            rel: "stylesheet",
            href: cssTobeIncluded + "?v" + version
        }));

        // calling the notify js
        notifyPopup($jq321);

        // @todo cleanup starts
        var regex = "/^([0-9a-zA-Z]([-_\\.]*[0-9a-zA-Z]+)*)@([0-9a-zA-Z]([-_\\.]*[0-9a-zA-Z]+)*)[\\.]([a-zA-Z]{2,9})$/";
        var chr = apiResponse.string;

        // Check If Store exists OR is Active
        if (chr.indexOf('store_exists') === -1) {
            return false;
        }
        // cleanup ends

        var relevantNotifications = apiResponse.allNotifications;
        if (parseInt(apiResponse.show_relevant) === 1) {
            relevantNotifications = getRelevantNotifications();
        }

        spDebuger.storeLog("Total Relevant Notifications: " + relevantNotifications.length);

        var irrevantNotifications = apiResponse.allNotifications.filterRelevantNotifications(relevantNotifications);
        var notificationCount = relevantNotifications.length;

        window.notificationsToShow = relevantNotifications;

        if (notificationCount < apiResponse.max_noti) {
            var notificationDifference = apiResponse.max_noti - notificationCount;
            spDebuger.storeLog("Irrelevant Notifications to be included: " + notificationDifference);
            spDebuger.storeLog("Irrelevant Notifications:");

            for (var c = 0; (c < notificationDifference && c < irrevantNotifications.length); c++) {
                notificationsToShow.push(irrevantNotifications[c]);
                spDebuger.storeLog(irrevantNotifications[c]);
            }
        }

        notificationCount = notificationsToShow.length;

        spDebuger.storeLog("Total Notifications to be shown: " + notificationsToShow.length);
        spDebuger.storeLog("Total Notifications: ");
        spDebuger.storeLog(notificationsToShow);

        if (apiResponse.random_noti == 'yes') {
            var max = notificationCount - 1;
            var min = 0;
            var popUpHasDisplayedCounter = Math.floor(Math.random() * (max - min + 1)) + min;

            setTimeout(function () {

                showSalesPopup(popUpHasDisplayedCounter);

                var popUpIntervalHandle = setInterval(function () {

                    if (salespoplib_vars_obj.triggered_count >= apiResponse.max_noti - 1) {
                        clearInterval(popUpIntervalHandle);
                        return false;
                    }

                    popUpHasDisplayedCounter = Math.floor(Math.random() * (max - min + 1)) + min;

                    showSalesPopup(popUpHasDisplayedCounter);

                    salespoplib_vars_obj.triggered_count++;

                }, parseInt(apiResponse.nextPopup) * 1000); // set interval ends here

            }, parseInt(apiResponse.first_noti_delay) * 1000); // set timeout ends here
        }
        else {
            var popUpHasDisplayedCounter = 0;

            setTimeout(function () {

                showSalesPopup(popUpHasDisplayedCounter);
                popUpHasDisplayedCounter++;

                var popUpIntervalHandle = setInterval(function () {
                    if (popUpHasDisplayedCounter >= notificationCount) {
                        popUpHasDisplayedCounter = 0;
                    }

                    if (salespoplib_vars_obj.triggered_count >= apiResponse.max_noti - 1) {
                        clearInterval(popUpIntervalHandle);
                        return false;
                    }

                    showSalesPopup(popUpHasDisplayedCounter);

                    salespoplib_vars_obj.triggered_count++;
                    popUpHasDisplayedCounter++;


                }, parseInt(apiResponse.nextPopup) * 1000); // set interval ends here

            }, parseInt(apiResponse.first_noti_delay) * 1000); // set timeout ends here
        }

    };

    window.showSalesPopup = function (popUpIndexToDisplay) {
        if (apiResponse.allNotifications[popUpIndexToDisplay] == undefined) {
            return;
        }
        var now = new Date;
        var utc_timestamp = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
            now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());
        var s = apiResponse.allNotifications[popUpIndexToDisplay].order_generated_time;
        var a = s.split(/[^0-9]/);
        var endtime = new Date(a[0], a[1] - 1, a[2], a[3], a[4], a[5]);

        var timeDifference = utc_timestamp - endtime;
        timeDifference = Math.floor((timeDifference / 1000) / 60);

        /**
         * Translated words
         */
        let minuteAgo = " minute(s) ago";
        let hourAgo = " hour(s) ago";
        let daysAgo = " day(s) ago";
        if (apiResponse.timeAgoTranslatedData) {
            minuteAgo = (apiResponse.timeAgoTranslatedData.minutes_ago !== "") ? " " + apiResponse.timeAgoTranslatedData.minutes_ago : minuteAgo;
            hourAgo = (apiResponse.timeAgoTranslatedData.hours_ago !== "") ? " " + apiResponse.timeAgoTranslatedData.hours_ago : hourAgo;
            daysAgo = (apiResponse.timeAgoTranslatedData.days_ago !== "") ? " " + apiResponse.timeAgoTranslatedData.days_ago : daysAgo;
        }

        if (timeDifference >= 60) {
            timeDifference = Math.floor(timeDifference / 60);
            if (timeDifference >= 24) {
                timeDifference = Math.floor(timeDifference / 24);
                timeDifference = Math.abs(timeDifference) + daysAgo;
            }
            else {
                timeDifference = Math.abs(timeDifference) + hourAgo;
            }
        } else { timeDifference = Math.abs(timeDifference) + minuteAgo; }

        if (isHidePopupCookieSet()) {
            return false;
        }

        if (typeof $jq321.notify == "undefined") {
            notifyPopup($jq321);
        }

        if (!notificationsToShow[popUpIndexToDisplay].hasOwnProperty('notifications')) {
            return false;
        }

        var dataNotification = notificationsToShow[popUpIndexToDisplay].notifications;

        $jq321.notify.addStyle('salesPopStyle', {
            html: dataNotification
        });

        /*$jq321.notify("hello world", {
            globalPosition: apiResponse.desktop_position,
            style: 'salesPopStyle',
            autoHideDelay: parseInt(apiResponse.display_time) * 1000,
            showDuration: 600,
            hideAnimation: 'slideUp',
            hideDuration: 600,
            clickToHide: false
        });*/

        if (salespoplib_vars_obj.checkDevice == 'mobile') {
            if (apiResponse.mobile_display_option == 'undefined') {
                $jq321.notify("hello world", {
                    globalPosition: apiResponse.desktop_position,
                    style: 'salesPopStyle',
                    autoHideDelay: parseInt(apiResponse.display_time) * 1000,
                    showDuration: 600,
                    hideAnimation: 'slideUp',
                    hideDuration: 600,
                    clickToHide: false
                });
            }
            else {
                $jq321.notify("hello world", {
                    globalPosition: apiResponse.mobile_display_option,
                    style: 'salesPopStyle',
                    autoHideDelay: parseInt(apiResponse.display_time) * 1000,
                    showDuration: 600,
                    hideAnimation: 'slideUp',
                    hideDuration: 600,
                    clickToHide: false
                });
            }
        }
        else {
            $jq321.notify("hello world", {
                globalPosition: apiResponse.desktop_position,
                style: 'salesPopStyle',
                autoHideDelay: parseInt(apiResponse.display_time) * 1000,
                showDuration: 600,
                hideAnimation: 'slideUp',
                hideDuration: 600,
                clickToHide: false
            });
        }

        if (apiResponse.timeText == "{{time_ago}}") {
            $jq321(".pur-time").html(timeDifference);
        }

        let salesNotificationImpressions = {
            id: impressionsID,
            salesNotification : 1
        }
        postImpressions(salesNotificationImpressions, "sp_sales_notifications_impressions");
    };


    var aurl = salespoplib_active_url.split('/');
    var cc_product_id = null;
    if (aurl[1] == 'products') {
        cc_product_id = meta.product.id;
    }
    else {
        cc_product_id = null;
    }
    console.log(cc_product_id);

    /////////////////////// Set flag to get notifications data //////////////////////////
    var fetchNotifications = 1;
    try {
        if (typeof (Storage) !== "undefined") {
            var notificationsData = window.localStorage.getItem('NotificationsData');
            if (notificationsData !== null) {
                notificationsData = JSON.parse(notificationsData);
                var tStamp = notificationsData.timeStamp;
                if ((Math.round(new Date().getTime() / 1000) - tStamp) < 300) {
                    fetchNotifications = 0;
                }
            }
        }
    } catch (msg) {
        console.log(msg);
    };
    /////////////////////// Set flag to get notifications data //////////////////////////

    $jq321.ajax({
        type: "GET",
        url: salespoplib_vars_obj.backend_url + 'checkStore/',
        dataType: "jsonp",
        jsonpCallback: "checkmodule_popup",
        crossDomain: true,
        data: {
            "webpage": encodeURIComponent(salespoplib_active_url),
            "checkDevice": salespoplib_vars_obj.checkDevice,
            "domain_url": Shopify.shop,
            "product_id": (meta.product && meta.product.id) ? meta.product.id : '',
            "fetchNotifications": fetchNotifications
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
    window.clickSaveDataResult = function (result) {
    };

    function setCookie(cName, cValue, exMin) {
        var d = new Date();
        d.setTime(d.getTime() + (exMin * 60 * 1000));
        var expires = "expires=" + d.toUTCString();
        document.cookie = cName + "=" + cValue + ";" + expires + ";path=/";
    }

    function getCookie(cName) {
        var name = cName + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    function isHidePopupCookieSet() {
        var cookie = getCookie("sp-hide-popup");
        return (typeof cookie == "null" || typeof cookie == "undefined" || cookie === "") ? false : true;
    }

    $jq321("body").on('click', '#noti-rsn-id', function (e) {
        e.preventDefault();

        if (e.target && $jq321(e.target).is("#hide-sp")) {
            $jq321(this).fadeOut();
            setCookie("sp-hide-popup", 1, 15);

            return false
        }

        var refIDValue = $jq321(this).attr("data-dateVal");
        var hrefVal = $jq321("#sp-notification").attr("href");

        if (apiResponse.isLegacyStore === 1) {
            hrefVal = $jq321(this).attr("href");
        }

        var GetURL = 'https://' + encodeURIComponent(store_domain_grabber) + '/cart.json';
        var cartToken = '';

        $jq321.getJSON(GetURL, function (data) {
            cartToken = data.token;
            $jq321.ajax({
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
                    "domain_url": Shopify.shop,
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
    window.clickUpdateDataResult = function (result) {
        console.log(result);
    };

    $jq321("body").on("click", "button[type='submit'][name='checkout']", function (e) {
        var GetURL = 'https://' + encodeURIComponent(store_domain_grabber) + '/cart.json';
        var cartToken = '';

        $jq321.getJSON(GetURL, function (data) {
            cartToken = data.token;
            $jq321.ajax({
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
                    //"domain_url": encodeURIComponent(store_domain_grabber),
                    "domain_url": Shopify.shop,
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

    /** Stock for variants **/
    function makeSelectors(variantHeading) {

        let formSelector;
        let allForms = $jq321("form[action]");
        $jq321.each(allForms, function (key, value) {
            var formUrls = value.action;
            if (formUrls.indexOf('/cart/add') > -1) {
                formSelector = $jq321(value);
            }
        });

        if (formSelector.length > 0) {
            let variantSelector1 = $jq321(formSelector).find("select");
            let variantSelector2 = $jq321(':contains("' + variantHeading + '")').find("input[type='radio']");
            let variantSelector3 = $jq321(':contains("' + variantHeading + '")').find("select");

            /** Make the final selectors **/
            if (variantSelector2.length > 0) {
                return { "selector_number": 2, "selector_value": variantSelector2 };
            } else if (variantSelector1.length > 0) {
                return { "selector_number": 1, "selector_value": variantSelector1 };
            } else if (variantSelector3.length > 0) {
                return { "selector_number": 3, "selector_value": variantSelector3 };
            }
            return false;
        }
    }

    function stockForSelectedVariant(string, data, stockSettings) {
        let stockRestrictionSettings = JSON.parse(stockSettings.stock_restriction_settings);
        if (string !== "") {
            $jq321.each(data, function (key, value) {
                if (value.title == string) {
                    let stockCountSpan = $jq321("#carecart-salespop-sc-number");
                    if (stockCountSpan.length > 0) {
                        // if (stockRestrictionSettings.stock_restriction_check !== undefined && stockRestrictionSettings.stock_restriction_check == "on") {
                        //     if (value.inventory_quantity > stockRestrictionSettings.stock_restriction_value) {
                        //         $jq321(".cc-sp-sc-stock-div").hide();
                        //     } else {
                        //         $jq321(".cc-sp-sc-stock-div").show();
                        //     }
                        // } else {
                        //     $jq321(".cc-sp-sc-stock-div").show();
                        // }
                        if (stockSettings.soldOutSettings !== undefined && value.inventory_quantity < 1) {
                            $jq321(".cc-sp-sc-sold-div").show();
                        } else {
                            $jq321(".cc-sp-sc-sold-div").hide();
                        }

                        //Stock restrictions settings
                        if (stockRestrictionSettings.stock_restriction_check !== undefined && stockRestrictionSettings.stock_restriction_check == "on") {
                            if (value.inventory_quantity > stockRestrictionSettings.stock_restriction_value || value.inventory_quantity < 1) {
                                $jq321(".cc-sp-sc-stock-div").hide();
                            }
                            else {
                                $jq321(".cc-sp-sc-stock-div").show();
                            }
                        }
                        else {
                            //Sold out message
                            if (stockSettings.soldOutSettings !== undefined && value.inventory_quantity < 1) {
                                $jq321(".cc-sp-sc-stock-div").hide();
                            } else {
                                $jq321(".cc-sp-sc-stock-div").show();
                            }
                        }
                        $jq321(stockCountSpan).html(value.inventory_quantity);
                        let stockPercentage = Math.round((parseInt(value.inventory_quantity) / 100) * 100);
                        stockPercentage = stockPercentage + "%";
                        $jq321(".stock-progress-foreground").width(stockPercentage);
                        console.log("SP: Stock for selected variant");
                    }
                }
            });
        }
    }

    // CUSTOM VISITOR COUNTER

    function customVisitors(start_limit_number, end_limit_number) {

        let randomNumber = Math.floor(Math.random() * (end_limit_number - start_limit_number + 1) + parseInt(start_limit_number));

        setInterval(changeRandomNumber, 3000);

        function changeRandomNumber() {

            if (Math.floor((Math.random() * 2))) {

                randomNumberTen = Math.floor((Math.random() * 10) + 1);
                randomNumber = parseInt(randomNumber) + parseInt(randomNumberTen);

                if (randomNumber > end_limit_number) {
                    randomNumber = end_limit_number;
                }

            }

            else {

                randomNumberTen = Math.floor((Math.random() * 10) + 1);
                randomNumber = parseInt(randomNumber) - parseInt(randomNumberTen);;

                if (randomNumber < start_limit_number) {
                    randomNumber = start_limit_number;
                }
            }

            $jq321("#carecart-salespop-visitor-number").html(randomNumber);
        }

    }

    function enableStockForVariants(variantsData, variantHeading, stockSettings) {
        $jq321(document).ready(function () {

            let getSelectors = makeSelectors(variantHeading);
            if (getSelectors != false) {

                /** Let's define options here **/
                let availableOptions = 0;
                if (variantsData[0]["option1"] !== null && variantsData[0]["option2"] !== null && variantsData[0]["option3"] === null) {
                    availableOptions = 1;
                } else if (variantsData[0]["option1"] !== null && variantsData[0]["option2"] !== null && variantsData[0]["option3"] !== null) {
                    availableOptions = 2;
                }
                /** Let's define options here **/

                /** Make the final selectors **/
                if (getSelectors.selector_number == 2) {
                    let selectedVariantsValuesString = '';
                    $jq321.each(getSelectors.selector_value, function (key, value) {

                        attachEventOnOptions(value, variantsData, stockSettings);
                        var val = this.checked ? true : false;
                        if (val) {
                            selectedVariantsValuesString = selectedVariantsValuesString + $jq321(value).val() + " / ";
                        }
                    });
                    selectedVariantsValuesString = selectedVariantsValuesString.trim();
                    selectedVariantsValuesString = selectedVariantsValuesString.slice(0, -1);
                    selectedVariantsValuesString = selectedVariantsValuesString.trim();
                    stockForSelectedVariant(selectedVariantsValuesString, variantsData, stockSettings);
                } else if (getSelectors.selector_number == 1) {

                    let selectedVariantsValuesString = '';
                    for (let i = 0; i <= availableOptions; i++) {
                        attachEventOnOptions(getSelectors.selector_value[i], variantsData, stockSettings);
                        selectedVariantsValuesString = selectedVariantsValuesString + $jq321(getSelectors.selector_value[i]).find(":selected").val() + " / ";
                    }

                    selectedVariantsValuesString = selectedVariantsValuesString.trim();
                    selectedVariantsValuesString = selectedVariantsValuesString.slice(0, -1);
                    selectedVariantsValuesString = selectedVariantsValuesString.trim();
                    stockForSelectedVariant(selectedVariantsValuesString, variantsData, stockSettings);
                } else if (getSelectors.selector_number == 3) {
                    let selectedVariantsValuesString = '';
                    for (let i = 0; i <= availableOptions; i++) {
                        attachEventOnOptions(getSelectors.selector_value[i], variantsData, stockSettings);
                        selectedVariantsValuesString = selectedVariantsValuesString + $jq321(getSelectors.selector_value[i]).find(":selected").val() + " / ";
                    }
                    selectedVariantsValuesString = selectedVariantsValuesString.trim();
                    selectedVariantsValuesString = selectedVariantsValuesString.slice(0, -1);
                    selectedVariantsValuesString = selectedVariantsValuesString.trim();
                    stockForSelectedVariant(selectedVariantsValuesString, variantsData, stockSettings);
                }
            }
            /** Make the final selectors **/
        });
    }

    function attachEventOnOptions(variantSelector, variantsData, stockSettings) {
        let stockRestrictionSettings = JSON.parse(stockSettings.stock_restriction_settings);
        console.log("SP: variant selector found");
        $jq321(variantSelector).on("change", function () {
            setTimeout(function () {

                let urlParams = new URLSearchParams(window.location.search);
                let variantID = urlParams.get('variant');
                if (variantsData !== null && variantID !== null) {
                    $jq321.each(variantsData, function (key, value) {
                        if (value.id == variantID) {
                            let stockCountSpan = $jq321("#carecart-salespop-sc-number");
                            if (stockCountSpan.length > 0) {
                                //Sold out message
                                if (stockSettings.soldOutSettings !== undefined && value.inventory_quantity < 1) {
                                    $jq321(".cc-sp-sc-sold-div").show();
                                } else {
                                    $jq321(".cc-sp-sc-sold-div").hide();
                                }

                                //Stock restrictions settings
                                if (stockRestrictionSettings.stock_restriction_check !== undefined && stockRestrictionSettings.stock_restriction_check == "on") {
                                    if (value.inventory_quantity > stockRestrictionSettings.stock_restriction_value || value.inventory_quantity < 1) {
                                        $jq321(".cc-sp-sc-stock-div").hide();
                                    }
                                    else {
                                        $jq321(".cc-sp-sc-stock-div").show();
                                    }
                                }
                                else {
                                    //Sold out message
                                    if (stockSettings.soldOutSettings !== undefined && value.inventory_quantity < 1) {
                                        $jq321(".cc-sp-sc-stock-div").hide();
                                    } else {
                                        $jq321(".cc-sp-sc-stock-div").show();
                                    }
                                }

                                $jq321(stockCountSpan).html(value.inventory_quantity);
                                let stockPercentage = Math.round((parseInt(value.inventory_quantity) / 100) * 100);
                                stockPercentage = stockPercentage + "%";
                                $jq321(".stock-progress-foreground").width(stockPercentage);
                            }
                        }
                    });
                }
            }, 1000);
        });
    }
    /** Stock for variants ends **/

    function stockCountdown(responseStock) {
        var selectorStock1 = $jq321("form[action='/cart/add']").find("button[type='submit'],input[type='submit']").parent();
        var selectorStock2 = $jq321("form[action='/cart/add']");
        var selectorStock3 = $jq321("form[action='/cart/add']:first").find("button[type='submit'],input[type='submit']").parent();
        var selectorStock4 = $jq321("form[action='/cart/add']:first");
        var selectorStock5 = $jq321("#shopify-section-product-template").find("form[action='/cart/add']").find("button[type='submit'],input[type='submit']").parent();
        var selectorStock6 = $jq321("#shopify-section-product-template").find("form[action='/cart/add']");

        if (responseStock.above_cart == 1) {
            if (selectorStock1.length == 1) {
                selectorStock1.prepend(responseStock.view);
                if (responseStock.soldOutSettings !== undefined && responseStock.soldOutProduct === undefined) {
                    selectorStock1.prepend(responseStock.soldView);
                }
            } else if (selectorStock2.length == 1) {
                selectorStock2.prepend(responseStock.view);
                if (responseStock.soldOutSettings !== undefined && responseStock.soldOutProduct === undefined) {
                    selectorStock2.prepend(responseStock.soldView);
                }
            } else if (selectorStock3.length == 1) {
                $jq321(responseStock.view).insertBefore(selectorStock3);
                if (responseStock.soldOutSettings !== undefined && responseStock.soldOutProduct === undefined) {
                    $jq321(responseStock.soldView).insertBefore(selectorStock3);
                }
            } else if (selectorStock4.length == 1) {
                selectorStock4.prepend(responseStock.view);
                if (responseStock.soldOutSettings !== undefined && responseStock.soldOutProduct === undefined) {
                    selectorStock4.prepend(responseStock.soldView);
                }
            } else if (selectorStock5.length == 1) {
                $jq321(responseStock.view).insertBefore(selectorStock5);
                if (responseStock.soldOutSettings !== undefined && responseStock.soldOutProduct === undefined) {
                    $jq321(responseStock.soldView).insertBefore(selectorStock5);
                }
            } else if (selectorStock6.length == 1) {
                selectorStock6.prepend(responseStock.view);
                if (responseStock.soldOutSettings !== undefined && responseStock.soldOutProduct === undefined) {
                    selectorStock6.prepend(responseStock.soldView);
                }
            }
        } else {
            if (selectorStock1.length == 1) {
                selectorStock1.append(responseStock.view);
                if (responseStock.soldOutSettings !== undefined && responseStock.soldOutProduct === undefined) {
                    selectorStock1.append(responseStock.soldView);
                }
            } else if (selectorStock2.length == 1) {
                selectorStock2.append(responseStock.view);
                if (responseStock.soldOutSettings !== undefined && responseStock.soldOutProduct === undefined) {
                    selectorStock2.append(responseStock.soldView);
                }
            } else if (selectorStock3.length == 1) {
                $jq321(responseStock.view).insertAfter(selectorStock3);
                if (responseStock.soldOutSettings !== undefined && responseStock.soldOutProduct === undefined) {
                    $jq321(responseStock.soldView).insertAfter(selectorStock3);
                }
            } else if (selectorStock4.length == 1) {
                selectorStock4.append(responseStock.view);
                if (responseStock.soldOutSettings !== undefined && responseStock.soldOutProduct === undefined) {
                    selectorStock4.append(responseStock.soldView);
                }
            } else if (selectorStock5.length == 1) {
                $jq321(responseStock.view).insertAfter(selectorStock5);
                if (responseStock.soldOutSettings !== undefined && responseStock.soldOutProduct === undefined) {
                    $jq321(responseStock.soldView).insertAfter(selectorStock5);
                }
            } else if (selectorStock6.length == 1) {
                selectorStock6.append(responseStock.view);
                if (responseStock.soldOutSettings !== undefined && responseStock.soldOutProduct === undefined) {
                    selectorStock6.append(responseStock.soldView);
                }
            }
        }

        if (responseStock.variantCheck == 0 && responseStock.soldOutProduct == 1) {
            $jq321(".cc-sp-sc-sold-div").show();
        } else if (responseStock.variantCheck == 0 && responseStock.soldOutProduct === undefined) {
            $jq321(".cc-sp-sc-stock-div").show();
        } else if (responseStock.variantCheck == 1 && responseStock.soldOutProduct === undefined) {
            $jq321(".cc-sp-sc-stock-div").show();
        } else if (responseStock.variantCheck == 1 && responseStock.soldOutProduct == 1) {
            $jq321(".cc-sp-sc-sold-div").show();
        }
    }

    // ---------------------------------- <TIME MODULE> -----------------------------------------

    // timer function
    function getTimeRemaining(endtime) {
        var now = new Date;
        var utc_timestamp = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
            now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());

        //var t = Date.parse(endtime) - utc_timestamp;
        /* New Hack for Safari */
        var s = endtime;
        var a = s.split(/[^0-9]/);
        var endtime = new Date(a[0], a[1] - 1, a[2], a[3], a[4], a[5]);

        var t = endtime - utc_timestamp;
        /* END  New Hack for Safari */

        var seconds = Math.floor((t / 1000) % 60);
        var minutes = Math.floor((t / 1000 / 60) % 60);
        var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
        var days = Math.floor(t / (1000 * 60 * 60 * 24));
        return {
            'total': t,
            'days': days,
            'hours': hours,
            'minutes': minutes,
            'seconds': seconds
        };
    }

    function initializeClock(id, endtime) {
        var clock = document.getElementById(id);
        var daysSpan = clock.querySelector('.days');
        var hoursSpan = clock.querySelector('.hours');
        var minutesSpan = clock.querySelector('.minutes');
        var secondsSpan = clock.querySelector('.seconds');

        function updateClock() {
            var t = getTimeRemaining(endtime);

            daysSpan.innerHTML = t.days;
            hoursSpan.innerHTML = ('0' + t.hours).slice(-2);
            minutesSpan.innerHTML = ('0' + t.minutes).slice(-2);
            secondsSpan.innerHTML = ('0' + t.seconds).slice(-2);

            if (t.days == 0 && t.hours == 0 && t.minutes == 0 && t.seconds == 0) {
                clearInterval(timeinterval);
            }
        }

        updateClock();
        var timeinterval = setInterval(updateClock, 1000);
    }

    // CREATE LIVE TIME COUNTDOWN
    function timeCountdown(responseTimer) {
        var selectorTimer1 = $jq321("form[action='/cart/add']").find("button[type='submit'],input[type='submit']").parent();
        var selectorTimer2 = $jq321("form[action='/cart/add']");
        var selectorTimer3 = $jq321("form[action='/cart/add']:first").find("button[type='submit'],input[type='submit']").parent();
        var selectorTimer4 = $jq321("form[action='/cart/add']:first");
        var selectorTimer5 = $jq321("#shopify-section-product-template").find("form[action='/cart/add']").find("button[type='submit'],input[type='submit']").parent();
        var selectorTimer6 = $jq321("#shopify-section-product-template").find("form[action='/cart/add']");

        if (responseTimer.above_cart == 1) {
            if (selectorTimer1.length == 1) {
                selectorTimer1.prepend(responseTimer.view);
            } else if (selectorTimer2.length == 1) {
                selectorTimer2.prepend(responseTimer.view);
            } else if (selectorTimer3.length == 1) {
                $jq321(responseTimer.view).insertBefore(selectorTimer3);
            } else if (selectorTimer4.length == 1) {
                selectorTimer4.prepend(responseTimer.view);
            } else if (selectorTimer5.length == 1) {
                $jq321(responseTimer.view).insertBefore(selectorTimer5);
            } else if (selectorTimer6.length == 1) {
                selectorTimer6.prepend(responseTimer.view);
            }
        } else {
            if (selectorTimer1.length == 1) {
                selectorTimer1.append(responseTimer.view);
            } else if (selectorTimer2.length == 1) {
                selectorTimer2.append(responseTimer.view);
            } else if (selectorTimer3.length == 1) {
                $jq321(responseTimer.view).insertAfter(selectorTimer3);
            } else if (selectorTimer4.length == 1) {
                selectorTimer4.append(responseTimer.view);
            } else if (selectorTimer5.length == 1) {
                $jq321(responseTimer.view).insertAfter(selectorTimer5);
            } else if (selectorTimer6.length == 1) {
                selectorTimer6.append(responseTimer.view);
            }
        }

        var deadline = responseTimer.time;

        //initializeClock('clockdivpreview', deadline);
        initializeClock('clockdivpreviewSales', deadline);
    }

    // ---------------------------------- </TIME MODULE> -----------------------------------------

    // *****************************************************************************************
    // ---------------------------------- <VISITOR COUNTER MODULE> ------------------------------
    // ******************************************************************************************
    function visitorCounter(response) {
        var selectorVisitor1 = $jq321("form[action='/cart/add']").find("button[type='submit'],input[type='submit']").parent();
        var selectorVisitor2 = $jq321("form[action='/cart/add']");
        var selectorVisitor3 = $jq321("form[action='/cart/add']:first").find("button[type='submit'],input[type='submit']").parent();
        var selectorVisitor4 = $jq321("form[action='/cart/add']:first");

        if (response.above_cart == 1) {
            if (selectorVisitor1.length == 1) {
                selectorVisitor1.prepend(response.view);
            } else if (selectorVisitor2.length == 1) {
                selectorVisitor2.prepend(response.view);
            } else if (selectorVisitor3.length == 1) {
                $jq321(response.view).insertBefore(selectorVisitor3);
            } else if (selectorVisitor4.length == 1) {
                selectorVisitor4.prepend(response.view);
            }
        } else {
            if (selectorVisitor1.length == 1) {
                selectorVisitor1.append(response.view);
            } else if (selectorVisitor2.length == 1) {
                selectorVisitor2.append(response.view);
            } else if (selectorVisitor3.length == 1) {
                $jq321(response.view).insertAfter(selectorVisitor3);
            } else if (selectorVisitor4.length == 1) {
                selectorVisitor4.append(response.view);
            }
        }

        $jq321('m').html(function (i, v) {
            return v.replace(/(\d)/g, '<span ' + response.count + '>$1</span>');
        });
    }
    // ---------------------------------- <VISITOR COUNTER MODULE> --------------------------------

    // ---------------------------------- <SOLD COUNTER MODULE> --------------------------------
    function soldCounter(response) {
        var selectorSold1 = $jq321("form[action='/cart/add']").find("button[type='submit'],input[type='submit']").parent();
        var selectorSold2 = $jq321("form[action='/cart/add']");
        var selectorSold3 = $jq321("form[action='/cart/add']:first").find("button[type='submit'],input[type='submit']").parent();
        var selectorSold4 = $jq321("form[action='/cart/add']:first");

        if (response.above_cart == 1) {
            if (selectorSold1.length == 1) {
                selectorSold1.prepend(response.view);
            }
            else if (selectorSold2.length == 1) {
                selectorSold2.prepend(response.view);
            }
            else if (selectorSold3.length == 1) {
                selectorSold3.prepend(response.view);
            }
            else if (selectorSold2.length == 1) {
                selectorSold4.prepend(response.view);
            }
        }
        else {
            if (selectorSold1.length == 1) {
                selectorSold1.append(response.view);
            }
            else if (selectorSold2.length == 1) {
                selectorSold2.append(response.view);
            }
            else if (selectorSold3.length == 1) {
                selectorSold3.append(response.view);
            }
            else if (selectorSold4.length == 1) {
                selectorSold4.append(response.view);
            }
        }

        $jq321('ms').html(function (i, v) {
            return v.replace(/(\d)/g, '<span ' + response.count + '>$1</span>');
        });
    }
    // ---------------------------------- </SOLD COUNTER MODULE> --------------------------------

    // ******************************************************************************************
    // ---------------------------------- <PRODUCT QUICK VIEW FOR NOTIFICATION> -----------------
    // ******************************************************************************************
    // QUICK PRODUCT VIEW CLOSE
    $jq321('body').on('click', '.close-quickshop', function () {
        $jq321(".quick-shop-modal").hide();
    });

    function productQuickView(response) {
        var selector = $jq321("body");
        selector.append(response);
    }

    $jq321("body").on('click', '#sp-notification', function (e) {
        e.preventDefault();

        var url = $jq321(this).attr('data-product-link');
        var product_id = $jq321(this).attr('data-product-id');
        var store_id = $jq321(this).attr('data-store-id');
        var quick_view = $jq321(this).attr('data-quick-view');

        $jq321('#clockdivpreviewSales').attr('id', 'clockdivpreviewSalesQuick');

        if (quick_view == 1) {
            var selectorqpv = $jq321(".quick-shop-gallery");
            if (selectorqpv.length == 1) {
                $jq321(".quick-shop-gallery").remove();
                $jq321(".quick-shop-text-wrap").remove();
                $jq321(".close-quickshop").remove();
                $jq321(".quick-shop-modal").show();
                $jq321(".quick-shop-popup-container").addClass("loader-container");
                $jq321("#loader").show();
            }
            else {
                $jq321(".quick-shop-modal").show();
                $jq321(".quick-shop-popup-container").addClass("loader-container");
            }

            $jq321.ajax({
                type: "GET",
                url: serverUrl.backend + 'quickView',
                dataType: "jsonp",
                jsonpCallback: "callProductView",
                crossDomain: true,
                data: {
                    "url": url,
                    "product_id": product_id,
                    "store_id": store_id
                },
                success: function () {

                }
            });
        }
    });

    window.callProductView = function (response) {
        $jq321(".quick-shop-popup-container").removeClass("loader-container");
        $jq321("#loader").hide();
        var selector = $jq321(".quick-shop-popup-container");
        selector.append(response.quick);

        // STOCK COUNTDOWN CALL
        stockCountdownView(response.stock);
        if (response.timer != false) {
            // COUNTDOWN TIMER CALL
            timeCountdownView(response.timer);
        }

        //save the impressions
        let quickViewImpressions = {
            id: impressionsID,
            quickView : 1
        }
        postImpressions(quickViewImpressions, "sp_quick_view_impressions");
    };

    // GET QUICK PRODUCT VIEW STOCK COUNTDOWN
    function stockCountdownView(responseStock) {

        $jq321("head").append($jq321("<link/>", {
            rel: "stylesheet",
            href: serverUrl.cssStock
        }));

        var selectorStockView = $jq321(".quickshop-45");

        if (responseStock.above_cart == 1) {
            if (selectorStockView.length == 1) {
                $jq321(responseStock.view).insertBefore(selectorStockView);
                $jq321(".stock-top").addClass("stock-top-quick-view");
            }
        }
        else {
            if (selectorStockView.length == 1) {
                $jq321(responseStock.view).insertAfter(selectorStockView);
                $jq321(".stock-top").addClass("stock-bottom-quick-view");
            }
        }
    }

    // QUICK PRODUCT VIEW COUNTDOWN TIMER
    function timeCountdownView(responseTime) {

        $jq321("head").append($jq321("<link/>", {
            rel: "stylesheet",
            href: serverUrl.cssTimer
        }));

        var selectorTimeView = $jq321(".quickshop-footer");

        if (responseTime.above_cart == 1) {
            if (selectorTimeView.length == 1) {
                $jq321(responseTime.view).insertBefore(selectorTimeView);
                $jq321(".timer-store-front").addClass("timer-top-quick-view");
            }
        }
        else {
            if (selectorTimeView.length == 1) {
                $jq321(responseTime.view).insertAfter(selectorTimeView);
                $jq321(".timer-store-front").addClass("timer-bottom-quick-view");
            }
        }

        var deadline = responseTime.time;
        initializeClock('clockdivpreviewSales', deadline);
    }
    // ---------------------------------- </PRODUCT QUICK VIEW FOR NOTIFICATION> --------------------------------

    // ******************************************************************************************
    // ---------------------------------- <PRODUCT QUICK VIEW FOR COLLECTION PAGE> -----------------
    // ******************************************************************************************

    function collectionQuickView(quickViewCollectionText, quickViewCollectionLayout, quickViewCollectionPosition) 
    {    
        var allLinks = [];

        var product_id = (meta.product && meta.product.id) ? meta.product.id : '';

        var homepage = window.location.pathname;

        var currentPageHandle = window.location.pathname.split("/");

        if (product_id == '') 
        {
            if (($jq321.inArray("collections", currentPageHandle) != -1) || (homepage == '/')) 
            {
                $jq321("main a").each(function () 
                {
                    var href = $jq321(this).attr('href');
                        
                    if (href !== "/" && href !== undefined && href !== "#") 
                    {
                        var url = href.split("/");
                        
                        if ($jq321.inArray("products", url) != -1) 
                        {
                            allLinks.push(href);
                        }
                    }
                });

                $jq321.unique(allLinks);
            }
        }
        

        if (($jq321.inArray("collections", currentPageHandle) != -1) || (homepage == '/')) 
        {
            // PRODUCT QUICK VIEW COLLECTION CREATE BUTTON
            var divCount = 0;
            var linkCount = 0;
            var qvselector;

            var cardwrapper = $jq321("main").find('.card-wrapper');
            if (cardwrapper.length != 0)
            {
                qvselector = $jq321("main .card-wrapper").find("img:first");
            }
            else
            {
                qvselector = $jq321("main").find("img");
            }

            qvselector.each(function () {

                // GET IMAGE URL
                var href = $jq321(this).attr('data-srcset');
                var data_image = $jq321(this).attr('data-image');
                var srcset = $jq321(this).attr('srcset');

                if (((href !== undefined) && (data_image !== undefined)) || ((srcset !== undefined) && (product_id == ''))) 
                {
                    if (quickViewCollectionLayout == 2) 
                    {
                        // FOR QUICK VIEW BUTTON
                        var newButton = '<input type="button" class="quick-view collection-quick-view" value="' + quickViewCollectionText + '" data-product-url="' + allLinks[linkCount] + '" data-quick-view="1">';
                    }
                    else if (quickViewCollectionLayout == 1) 
                    {
                        // FOR QUICK VIEW EYE
                        var newButton = '<a id="positon-right" class="EyeViewBtn collection-quick-view ' + quickViewCollectionPosition + '" data-product-url="' + allLinks[linkCount] + '" data-quick-view="1" href="#"><svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="577.029px" height="577.029px" viewBox="0 0 577.029 577.029" style="enable-background:new 0 0 577.029 577.029;" xml:space="preserve"><path d="M288.514,148.629c73.746,0,136.162,33.616,175.539,61.821c46.652,33.415,70.66,65.737,76.885,78.065   c-6.232,12.327-30.232,44.649-76.885,78.065c-39.377,28.204-101.793,61.82-175.539,61.82c-73.746,0-136.161-33.616-175.539-61.82   c-46.661-33.416-70.66-65.738-76.894-78.065c6.234-12.328,30.233-44.65,76.885-78.065   C152.353,182.245,214.768,148.629,288.514,148.629 M288.514,113.657C129.176,113.657,0,253.543,0,288.515   s129.176,174.857,288.514,174.857c159.339,0,288.515-139.886,288.515-174.857S447.854,113.657,288.514,113.657L288.514,113.657z    M288.514,183.601c-57.939,0-104.914,46.975-104.914,104.914c0,57.938,46.975,104.914,104.914,104.914   s104.914-46.976,104.914-104.914C393.428,230.576,346.453,183.601,288.514,183.601z M260.266,288.515   c-24.515,0-44.388-19.873-44.388-44.388c0-24.515,19.873-44.387,44.388-44.387c24.515,0,44.388,19.873,44.388,44.387   C304.654,268.642,284.781,288.515,260.266,288.515z"/></svg></a>';

                    }

                    var check = $jq321(this).parent();

                    // CREATE DIV
                    var newDiv = '<div id="image-with-button' + divCount + '" class="button-on-hover"></div>';

                    // INSERT DIV
                    $jq321(newDiv).insertBefore(check);

                    // APPEND IMAGE IN DIV
                    $jq321(check).appendTo($jq321('#image-with-button' + divCount));

                    // INSERT BUTTON/EYE IN DIV
                    $jq321(newButton).insertBefore(this);
                    divCount++;
                    linkCount++;
                }
            });

        }
    }


    // PRODUCT QUICK VIEW COLLECTION CALL
    $jq321("body").on('click', '.collection-quick-view', function (e) {
        e.preventDefault();

        var quick_view = $jq321(this).attr('data-quick-view');
        var data_product_url = $jq321(this).attr('data-product-url');

        $jq321('#clockdivpreviewSales').attr('id', 'clockdivpreviewSalesQuick');

        if (quick_view == 1) {
            var selectorqpv = $jq321(".quick-shop-gallery");
            if (selectorqpv.length == 1) {
                $jq321(".quick-shop-gallery").remove();
                $jq321(".quick-shop-text-wrap").remove();
                $jq321(".close-quickshop").remove();
                $jq321(".quick-shop-modal").show();
                $jq321(".quick-shop-popup-container").addClass("loader-container");
                $jq321("#loader").show();
            }
            else {
                $jq321(".quick-shop-modal").show();
                $jq321(".quick-shop-popup-container").addClass("loader-container");
            }

            $jq321.ajax({
                type: "GET",
                url: serverUrl.backend + 'quickViewCollection',
                dataType: "jsonp",
                jsonpCallback: "callProductView",
                crossDomain: true,
                data: {
                    "data_product_url": data_product_url,
                    "domain_url": Shopify.shop
                },
                success: function () {

                }
            });
        }
    });



    // ---------------------------------- </PRODUCT QUICK VIEW FOR COLLECTION PAGE> --------------------------------

    // ---------------------------------- <TRUST BADGES MODULE> --------------------------------
    function trustBadges(trustBadgesResponse) {
        if (trustBadgesResponse.product_page_show_hide == 1) {
            /* var selectorTrustBadges = $jq321("form[action='/cart/add']:first");
            selectorTrustBadges.append(trustBadgesResponse.view); */

            var selectorTrustBadges1 = $jq321("form[action='/cart/add']").find("button[type='submit'],input[type='submit']").parent();
            var selectorTrustBadges2 = $jq321("form[action='/cart/add']");
            var selectorTrustBadges3 = $jq321("form[action='/cart/add']:first").find("button[type='submit'],input[type='submit']").parent();
            var selectorTrustBadges4 = $jq321("form[action='/cart/add']:first");

            if (selectorTrustBadges1.length == 1) {
                selectorTrustBadges1.append(trustBadgesResponse.view);
            }
            else if (selectorTrustBadges2.length == 1) {
                selectorTrustBadges2.append(trustBadgesResponse.view);
            }
            else if (selectorTrustBadges3.length == 1) {
                selectorTrustBadges3.append(trustBadgesResponse.view);
            }
            else if (selectorTrustBadges4.length == 1) {
                selectorTrustBadges4.append(trustBadgesResponse.view);
            }
        }

        $jq321('.trust-badges').replaceWith(trustBadgesResponse.view);

        var bgsize = 'width:' + trustBadgesResponse.badges_size + 'px';
        var selector = $jq321("#CloneBox").find(".LogoImg");
        selector.attr("style", bgsize);

        if ((trustBadgesResponse.badges_style == 1) || (trustBadgesResponse.badges_style == 3)) {
            $jq321("#CloneBox svg").find('path.ChangeColor-preview').css('fill', trustBadgesResponse.badges_color);
        }

        if ((trustBadgesResponse.badges_style == 1) || (trustBadgesResponse.badges_style == 2)) {
            $jq321("#CloneBox").find('div.BorderBox').addClass("badges-style-original");
        }

        if ((trustBadgesResponse.badges_style == 3) || (trustBadgesResponse.badges_style == 4)) {
            $jq321("#CloneBox").find('div.BorderBox').addClass("background-store-front");
        }
    }
    // ---------------------------------- </TRUST BADGES MODULE> --------------------------------

    // ---------------------------------- <PAYMENT PLAN> ----------------------------------------
    // ******************************************************************************************
    // function saveImpression(type) {
    //     $jq321.ajax({
    //         type: "GET",
    //         url: salespoplib_vars_obj.backend_url + 'saveImpression',
    //         dataType: "jsonp",
    //         jsonpCallback: "impressionSaved",
    //         crossDomain: true,
    //         async: false,
    //         data: {
    //             "domain_url": Shopify.shop,
    //             "type": type
    //         },
    //         success: function () {
    //         },
    //         error: function (jqXHR, textStatus, errorThrown) {
    //             console.log(jqXHR);
    //             console.log("status: " + textStatus);
    //             console.log("err: " + errorThrown);
    //         },
    //         complete: function () {
    //         }
    //     });
    // }

    // //Click CallBack
    // window.impressionSaved = function (result) {
    //     // console.log(result);
    // };
    // ---------------------------------- </PAYMENT PLAN> --------------------------------

    // ---------------------------------- <TIMER FOR COLLECTION PAGE> --------------------------
    // ******************************************************************************************
    function getTimeRemainingForCollection(endtime) {
        var now = new Date;
        var utc_timestamp = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
            now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());

        /* New Hack for Safari */
        var s = endtime;
        var a = s.split(/[^0-9]/);
        var endtime = new Date(a[0], a[1] - 1, a[2], a[3], a[4], a[5]);

        var t = endtime - utc_timestamp;
        /* END  New Hack for Safari */

        var seconds = Math.floor((t / 1000) % 60);
        var minutes = Math.floor((t / 1000 / 60) % 60);
        var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
        var days = Math.floor(t / (1000 * 60 * 60 * 24));
        return {
            'total': t,
            'days': days,
            'hours': hours,
            'minutes': minutes,
            'seconds': seconds
        };
    }

    function initializeClockCollection(id, endtime) {
        var daysSpan = document.getElementsByClassName('daysc');
        var hoursSpan = document.getElementsByClassName('hoursc');
        var minutesSpan = document.getElementsByClassName('minutesc');
        var secondsSpan = document.getElementsByClassName('secondsc');

        function updateClock() {
            var t = getTimeRemainingForCollection(endtime);

            daysSpan.innerHTML = t.days;
            hoursSpan.innerHTML = ('0' + t.hours).slice(-2);
            minutesSpan.innerHTML = ('0' + t.minutes).slice(-2);
            secondsSpan.innerHTML = ('0' + t.seconds).slice(-2);

            $jq321(".daysc").html(t.days);
            $jq321(".hoursc").html(t.hours);
            $jq321(".minutesc").html(t.minutes);
            $jq321(".secondsc").html(t.seconds);

            if (t.days == 0 && t.hours == 0 && t.minutes == 0 && t.seconds == 0) {
                clearInterval(timeinterval);
            }
        }

        updateClock();
        var timeinterval = setInterval(updateClock, 1000);
    }

    function collectionTimer(responseTimer, responseTimerCollection) {
        var allLinks = [];
        var product_id = (meta.product && meta.product.id) ? meta.product.id : '';
        if (product_id == '') {
            $jq321("a").each(function () {
                var href = $jq321(this).attr('href');
                var url = href.split("/");
                if (($jq321.inArray("products", url) != -1)) {
                    if ($jq321.inArray(href, allLinks) == -1) {
                        allLinks.push(href);
                    }
                }
            });
        }
        else {
            $jq321("a").each(function () {
                var href = $jq321(this).attr('href');

                var url = href.split("/");

                if ($jq321.inArray("products", url) != -1) {
                    var otherurl = href.split("=");

                    var res = otherurl[0].split("?");

                    if (res[1] == 'pr_prod_strat') {
                        allLinks.push(href);
                    }
                }
            });
        }

        function checkValue(value, arr) {
            var status = 'Not exist';
            if (arr === null) return status;
            for (var i = 0; i < arr.length; i++) {
                var name = arr[i];
                if (name == value) {
                    status = 'Exist';
                    break;
                }
            }
            return status;
        }

        if (product_id == '') {
            if (allLinks.length != 0) {
                for (var u = 0; u < allLinks.length; u++) {
                    if (checkValue(allLinks[u], responseTimerCollection) == 'Not exist') {
                        var selectorTimeView = $jq321("[href='" + allLinks[u] + "']");
                        selectorTimeView = selectorTimeView[0];
                        $jq321(responseTimer.view).insertBefore(selectorTimeView);
                    }
                }
            }
        }
        else {
            var allLinksC = [];
            var product = null;
            for (var q = 0; q < allLinks.length; q++) {
                product = allLinks[q].substring(0, allLinks[q].indexOf('?') + 1);
                product = product.replace(/\?/g, '');
                product = '/collections/all' + product;

                allLinksC.push(product);
            }

            for (var u = 0; u < allLinks.length; u++) {
                if (checkValue(allLinksC[u], responseTimerCollection) == 'Not exist') {
                    var selectorTimeView = $jq321("[href='" + allLinks[u] + "']");
                    $jq321(responseTimer.view).insertBefore(selectorTimeView);
                }
            }
        }

        var deadline = responseTimer.time;
        initializeClockCollection('clockdivpreviewSalesCollection', deadline);
    }
    // ---------------------------------- </TIMER FOR COLLECTION PAGE> --------------------------------

    // ---------------------------------- <ANNOUNCEMENT BAR MODULE> --------------------------------
    function announcementBar(announcementBarResponse) {
        var selectorAnnouncementBar = $jq321("body");
        var placement = announcementBarResponse.placement;

        if (placement == 'top') {
            selectorAnnouncementBar.prepend(announcementBarResponse.view);
        }
        else if (placement == 'bottom') {
            selectorAnnouncementBar.append(announcementBarResponse.view);
        }

        //Free shipping bar starts from here
        if (announcementBarResponse.free_ship_settings !== null) {
            doCalculationForShipping(announcementBarResponse.free_ship_settings);
            addCartInterval(announcementBarResponse.free_ship_settings);
        }
        /**
        * Attach event on click
        */
        attachEventOnShippingBar(announcementBarResponse.clickClassShippingBar);
	}
    
    $jq321("body").on('click', '#ccannouncement-close', function (e) {
        e.preventDefault();

        $jq321('#ccannouncement-main').fadeOut();
        setCookie("sp-hide-announcement", 1, 15);  // 15 minutes (UTC)
    });

    function isHideAnnouncementCookieSet() {
        var cookie = getCookie("sp-hide-announcement");
        return (typeof cookie == "null" || typeof cookie == "undefined" || cookie === "") ? false : true;
    }

    function addCartInterval(settings) {
        setInterval(function () {
            doCalculationForShipping(settings);
            // fetchCartItems();
        }, 2000);
    }

    function doCalculationForShipping(settings) {
        var cartContents = fetch('/cart.json', { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                let cartValue = data.items;
                // fetchCartItems(cartValue);
                if (cartValue.length == 0) {
                    console.log("SP: Cart is empty");
                    let initialMessage = settings.initial_message;
                    initialMessage = initialMessage.replace("{{amount}}", settings.goal_value);
                    initialMessage = initialMessage.replace("{{button}}", settings.button);
                    initialMessage = initialMessage.replace("{{coupon}}", settings.coupon);
                    $jq321(".getDiscoundText").html(initialMessage);
                } else {
                    let cartPrice = data.total_price;
                    cartPrice = Math.floor(cartPrice / 1e2);
                    let actualGoal = parseInt(settings.goal_value);
                    if (cartPrice >= actualGoal) {
                        $jq321(".getDiscoundText").html(settings.goal_message);
                    } else if (cartPrice < actualGoal) {
                        let remainingAmount = actualGoal - cartPrice;
                        let progressMessage = settings.progress_message;
                        progressMessage = progressMessage.replace("{{remaining_amount}}", remainingAmount);
                        $jq321(".getDiscoundText").html(progressMessage);
                    }
                }
            });
    }
    
    /**
     * Free shipping bar click
     */
    function attachEventOnShippingBar(className) { 
        $jq321("#ccannouncement-main").on("click", function () { 
            let freeShippingBarClick = {
                id: impressionsID,
                freeShippingBarClick : 1
            }
            postImpressions(freeShippingBarClick, "sp_free_shipping_bar_click");
        });
    }
    // ---------------------------------- </ANNOUNCEMENT BAR MODULE> --------------------------------

    // ---------------------------------- <SHARE CART MODULE> --------------------------------
    function shareCart(response) {
        let cartPage = !(!window.location.pathname.match("(.*)/cart/(.*)") && !window.location.pathname.match("(.*)/cart"));
        if (cartPage) {
            let firstSelector = $jq321("form[action='/cart']").parent();
            if (firstSelector.length > 0) {
                var cartContents = fetch('/cart.json', { method: 'GET' })
                    .then(response => response.json())
                    .then(data => {
                        let copyLink = "https://" + Shopify.shop + "/cart/";
                        let cartItems = data.items;
                        if (cartItems.length > 0) {
                            $jq321(firstSelector[1]).append(response.iconsFile);
                            for (const items of cartItems) {
                                copyLink = copyLink + items.variant_id + ":" + items.quantity + ",";
                            }

                            //Set the link of copy link icon
                            copyLink = copyLink.slice(0, -1);
                            $jq321("#cc-sp-share-cart-copy-link-icon").attr("copy-link", copyLink);

                            //Copy icon
                            $jq321("#cc-sp-share-cart-copy-link-icon").on("click", function () {
                                $jq321("#cc-sp-share-cart-copied-message-text").show();
                                navigator.clipboard.writeText($jq321(this).attr("copy-link"));
                                setTimeout(function () {
                                    $jq321("#cc-sp-share-cart-copied-message-text").hide();
                                }, 3000);
                            });

                            //mail icon
                            $jq321("#cc-sp-share-cart-mail-icon-anchor").attr("href", "mailto:?subject=Checkout%20my%20cart&body=%0AHi%2C%0A%0ATake%20a%20look%20at%20what%20I%20am%20buying%0A%0A" + copyLink);
                            $jq321("#cc-sp-share-cart-mail-icon").on("click", function () {
                                window.location.href = "mailto:?subject=Checkout%20my%20cart&body=" + copyLink;
                            });
                        }
                    });
            }
        }
    }
    // ---------------------------------- </SHARE CART MODULE> --------------------------------

    // ---------------------------------- < STICKY CART MODULE> --------------------------------
    function cartUpdateCall(itemID, quantity) {
        let formData = {
            'id': itemID,
            'quantity': quantity
        };
        fetch('/cart/change.js', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        }).then(response => {
        }).catch((error) => {
            console.error('Error:', error);
        });
    }

    function fetchItemsForStickyCart() {

        fetch('/cart.json', { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                let cartItems = data.items;
                if (cartItems.length == 0) {
                    $jq321(".cc-inner-content").remove();
                    $jq321("#cc-sp-share-cart-empty-cart-text").show();
                    $jq321("#cc-sp-share-cart-copy-link-icon").attr("copy-link", "#");
                    $jq321(".sp-loader").hide();
                    $jq321("#cc-sp-sticky-cart-count").html('0');
                    $jq321("#total_text_drawer").html('');
                    $jq321("#currency").html('');
                } else {
                    let copyLink = "https://" + Shopify.shop + "/cart/";
                    let totalprice = 0;
                    $jq321("#cc-sp-share-cart-empty-cart-text").hide();
                    let totalItemsCount = 0;
                    $jq321(".cc-inner-content").remove();
                    for (const items of cartItems) {
                        totalItemsCount = parseInt(totalItemsCount) + parseInt(items.quantity);
                        copyLink = copyLink + items.variant_id + ":" + items.quantity + ",";
                        let variantTitle = items.variant_title == null ? "" : '<p class="sp-variant">' + items.variant_title + '</p>';
                        $jq321(
                            `<div class="cc-inner-content sp-border">
                    <div class="img-div">
                        <img src="${items.image}" class="img-fluid rounded-start" width="50" height="50" alt="...">
                    </div>
                    <div class="card-body p-0 pt-2">
                    <div class="sp-pro-title">
                        <h5> 
                            ${items.product_title}
                        </h5>
                        <a href="javascript:void(0)" class="closebtn cc-sp-sticky-cart-remove-btn" data-value="${items.id}" style="font-size:19px">&times;</a>
                    </div>
                        ${variantTitle}    
                        <p class="sp-product-price">${Shopify.currency.active}
                        ${parseInt(items.price) / 100}.00</p>
                        <div class="cc-sp-quantity buttons_added">
                <input type="button" value="-" current-quntity="${items.quantity}" class="minus cc-sp-sticky-cart-minus-btn" style="background-color:transparent;" data-value="${items.id}"><input id="cc-sp-sticky-cart-items-count" type="number" step="1" name="cc-sp-quantity" 
                value= ${items.quantity} title="Quantity" class="cc-sp-input-text cc-qty text" size="4" pattern="" inputmode=""><input type="button" value="+" class="plus cc-sp-sticky-cart-plus-btn" style="background-color:transparent;" current-quntity="${items.quantity}" data-value="${items.id}">
            </div>
                    </div>
                </div>`
                        ).insertAfter("#cc-sp-share-cart-sidenav-main");
                        totalprice += (Math.floor(parseInt(items.final_line_price) / 100));
                    }

                    copyLink = copyLink.slice(0, -1);
                    $jq321('#currency').html(Shopify.currency.active);
                    $jq321('#total_text_drawer').html(totalprice + ".00");
                    $jq321("#cc-sp-sticky-cart-count").html(totalItemsCount);
                    $jq321("#drawer_button").attr("href", copyLink);
                    $jq321("#cc-sp-share-cart-copy-link-icon").attr("copy-link", copyLink);
                    $jq321('#cc-sp-share-cart-mail-icon').attr("href", "mailto:?subject=Checkout%20my%20cart&body=" + copyLink);

                    //When user click on the copy link button
                    $jq321("#cc-sp-share-cart-copy-link-icon").on("click", function () {
                        navigator.clipboard.writeText($jq321(this).attr("copy-link"));
                        $jq321("#cc-sp-sticky-cart-copied-message-text").show();
                        setTimeout(function () {
                            $jq321("#cc-sp-sticky-cart-copied-message-text").hide();
                        }, 2000);
                    });

                    //Remove cart item
                    $jq321(".cc-sp-sticky-cart-remove-btn").click(function () {
                        $jq321(".sp-loader").show();
                        let itemID = $jq321(this).attr("data-value");
                        cartUpdateCall(itemID, 0);
                    });

                    //Minus the quantity
                    $jq321(".cc-sp-sticky-cart-minus-btn").click(function () {
                        $jq321(".sp-loader").show();
                        let itemID = $jq321(this).attr("data-value");
                        let currentItemsCount = $jq321(this).attr("current-quntity");
                        currentItemsCount = parseInt(currentItemsCount) - 1;
                        cartUpdateCall(itemID, currentItemsCount);
                    });

                    //Plus the quantity
                    $jq321(".cc-sp-sticky-cart-plus-btn").click(function () {
                        $jq321(".sp-loader").show();
                        let itemID = $jq321(this).attr("data-value");
                        let currentItemsCount = $jq321(this).attr("current-quntity");
                        currentItemsCount = parseInt(currentItemsCount) + 1;
                        cartUpdateCall(itemID, currentItemsCount);
                    });
                    $jq321(".sp-loader").hide();
                }
            });
    }

    function stickyCart(response) {
        setTimeout(function () {
            $jq321("body").prepend(response.cart_icon);
            $jq321("body").prepend(response.cart_drawer);

            //attach event with widget
            $jq321("#stickycart_icon").click(function () {
                $jq321("#cc-sp-share-cart-sidenav").show();
                $jq321(".sp-comment-sticky").hide();
            });

            //Attach event of sidenav close
            $jq321("#drawer_close").click(function () {
                $jq321("#cc-sp-share-cart-sidenav").hide();
                $jq321(".sp-comment-sticky").show();
            });

            fetchItemsForStickyCart();
            setInterval(function () {
                fetchItemsForStickyCart();
            }, 4000);
        }, 2000);
    }
    // ---------------------------------- < /STICKY CART MODULE> --------------------------------
    // ---------------------------------- <Impressions starts here> --------------------------------
    $jq321(document).ready(function () {
        setTimeout(function () {
            let timeCountdown = $jq321(".timer-store-front").length > 0 ? 1 : 0;
            let stockCountdown = $jq321(".stock-top").length > 0 ? 1 : 0;
            let visitorCounter = $jq321(".visitor-counter-content-box-carecartbysalespop-2020").length > 0 ? 1 : 0;
            let soldCounter = $jq321(".sold-counter-content-box").length > 0 ? 1 : 0;
            let trustBadges = $jq321("#CloneBox").length > 0 ? 1 : 0;
            let shippingBar = $jq321(".ccAnnouncmntBanner-bpop").length > 0 ? 1 : 0;

            if (timeCountdown == 1 || stockCountdown == 1 || visitorCounter == 1 || soldCounter == 1 || trustBadges == 1 || shippingBar == 1) {
                let impressionStats = {
                    id     : impressionsID,
                    timer  : timeCountdownForImpression,
                    stock  : stockCountdown,
                    visitor: visitorCounter,
                    sold   : soldCounter,
                    trust  : trustBadges,
                    bar    : shippingBar
                };
                postImpressions(impressionStats, "sp_six_modules_impressions");   
            }
         }, 3000); //@todo decrease this time to 3 seconds while pushing on live;
    });

    function postImpressions(data, impressionTitle) {
        $jq321.ajax({
            type: "GET",
            url: salespoplib_vars_obj.impressionURL + 'saveImpressions',
            dataType: "jsonp",
            jsonpCallback: "impressionSaved",
            crossDomain: true,
            async: false,
            data: {
                "domain_url": Shopify.shop,
                "impressions": data,
                "title": impressionTitle,
		"version": Math.random()+Date.now()  
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
    }

    window.impressionSaved = function (result) {
        // console.log(result);
    };
    // ---------------------------------- </Impressions> --------------------------------

});

// QUICK PRODUCT VIEW ADD TO CART CALL
function addToCart() {
    var variant = $jq321("#variant").val();

    var quantity = $jq321("#quantity").val();

    let formData = {
        'items': [{
            'id': variant,
            'quantity': quantity
        }]
    };

    fetch('/cart/add.js', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
        .then(response => {
            return response.json();
        })
        .catch((error) => {
            console.error('Error:', error);
        });

    $jq321(".quick-shop-modal").hide();

    // SUCCESS MESSAGE SHOW
    $jq321(".info-custom-alert").fadeIn();

    setTimeout(function () {
        $jq321(".info-custom-alert").fadeOut();
        location.reload();
    }, 3000);
}
