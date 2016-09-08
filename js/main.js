
// маска телефона
/*
    jQuery Masked Input Plugin
    Copyright (c) 2007 - 2015 Josh Bush (digitalbush.com)
    Licensed under the MIT license (http://digitalbush.com/projects/masked-input-plugin/#license)
    Version: 1.4.1
*/
!function(factory) {
    "function" == typeof define && define.amd ? define([ "jquery" ], factory) : factory("object" == typeof exports ? require("jquery") : jQuery);
}(function($) {
    var caretTimeoutId, ua = navigator.userAgent, iPhone = /iphone/i.test(ua), chrome = /chrome/i.test(ua), android = /android/i.test(ua);
    $.mask = {
        definitions: {
            "9": "[0-9]",
            a: "[A-Za-z]",
            "*": "[A-Za-z0-9]"
        },
        autoclear: !0,
        dataName: "rawMaskFn",
        placeholder: "_"
    }, $.fn.extend({
        caret: function(begin, end) {
            var range;
            if (0 !== this.length && !this.is(":hidden")) return "number" == typeof begin ? (end = "number" == typeof end ? end : begin, 
            this.each(function() {
                this.setSelectionRange ? this.setSelectionRange(begin, end) : this.createTextRange && (range = this.createTextRange(), 
                range.collapse(!0), range.moveEnd("character", end), range.moveStart("character", begin), 
                range.select());
            })) : (this[0].setSelectionRange ? (begin = this[0].selectionStart, end = this[0].selectionEnd) : document.selection && document.selection.createRange && (range = document.selection.createRange(), 
            begin = 0 - range.duplicate().moveStart("character", -1e5), end = begin + range.text.length), 
            {
                begin: begin,
                end: end
            });
        },
        unmask: function() {
            return this.trigger("unmask");
        },
        mask: function(mask, settings) {
            var input, defs, tests, partialPosition, firstNonMaskPos, lastRequiredNonMaskPos, len, oldVal;
            if (!mask && this.length > 0) {
                input = $(this[0]);
                var fn = input.data($.mask.dataName);
                return fn ? fn() : void 0;
            }
            return settings = $.extend({
                autoclear: $.mask.autoclear,
                placeholder: $.mask.placeholder,
                completed: null
            }, settings), defs = $.mask.definitions, tests = [], partialPosition = len = mask.length, 
            firstNonMaskPos = null, $.each(mask.split(""), function(i, c) {
                "?" == c ? (len--, partialPosition = i) : defs[c] ? (tests.push(new RegExp(defs[c])), 
                null === firstNonMaskPos && (firstNonMaskPos = tests.length - 1), partialPosition > i && (lastRequiredNonMaskPos = tests.length - 1)) : tests.push(null);
            }), this.trigger("unmask").each(function() {
                function tryFireCompleted() {
                    if (settings.completed) {
                        for (var i = firstNonMaskPos; lastRequiredNonMaskPos >= i; i++) if (tests[i] && buffer[i] === getPlaceholder(i)) return;
                        settings.completed.call(input);
                    }
                }
                function getPlaceholder(i) {
                    return settings.placeholder.charAt(i < settings.placeholder.length ? i : 0);
                }
                function seekNext(pos) {
                    for (;++pos < len && !tests[pos]; ) ;
                    return pos;
                }
                function seekPrev(pos) {
                    for (;--pos >= 0 && !tests[pos]; ) ;
                    return pos;
                }
                function shiftL(begin, end) {
                    var i, j;
                    if (!(0 > begin)) {
                        for (i = begin, j = seekNext(end); len > i; i++) if (tests[i]) {
                            if (!(len > j && tests[i].test(buffer[j]))) break;
                            buffer[i] = buffer[j], buffer[j] = getPlaceholder(j), j = seekNext(j);
                        }
                        writeBuffer(), input.caret(Math.max(firstNonMaskPos, begin));
                    }
                }
                function shiftR(pos) {
                    var i, c, j, t;
                    for (i = pos, c = getPlaceholder(pos); len > i; i++) if (tests[i]) {
                        if (j = seekNext(i), t = buffer[i], buffer[i] = c, !(len > j && tests[j].test(t))) break;
                        c = t;
                    }
                }
                function androidInputEvent() {
                    var curVal = input.val(), pos = input.caret();
                    if (oldVal && oldVal.length && oldVal.length > curVal.length) {
                        for (checkVal(!0); pos.begin > 0 && !tests[pos.begin - 1]; ) pos.begin--;
                        if (0 === pos.begin) for (;pos.begin < firstNonMaskPos && !tests[pos.begin]; ) pos.begin++;
                        input.caret(pos.begin, pos.begin);
                    } else {
                        for (checkVal(!0); pos.begin < len && !tests[pos.begin]; ) pos.begin++;
                        input.caret(pos.begin, pos.begin);
                    }
                    tryFireCompleted();
                }
                function blurEvent() {
                    checkVal(), input.val() != focusText && input.change();
                }
                function keydownEvent(e) {
                    if (!input.prop("readonly")) {
                        var pos, begin, end, k = e.which || e.keyCode;
                        oldVal = input.val(), 8 === k || 46 === k || iPhone && 127 === k ? (pos = input.caret(), 
                        begin = pos.begin, end = pos.end, end - begin === 0 && (begin = 46 !== k ? seekPrev(begin) : end = seekNext(begin - 1), 
                        end = 46 === k ? seekNext(end) : end), clearBuffer(begin, end), shiftL(begin, end - 1), 
                        e.preventDefault()) : 13 === k ? blurEvent.call(this, e) : 27 === k && (input.val(focusText), 
                        input.caret(0, checkVal()), e.preventDefault());
                    }
                }
                function keypressEvent(e) {
                    if (!input.prop("readonly")) {
                        var p, c, next, k = e.which || e.keyCode, pos = input.caret();
                        if (!(e.ctrlKey || e.altKey || e.metaKey || 32 > k) && k && 13 !== k) {
                            if (pos.end - pos.begin !== 0 && (clearBuffer(pos.begin, pos.end), shiftL(pos.begin, pos.end - 1)), 
                            p = seekNext(pos.begin - 1), len > p && (c = String.fromCharCode(k), tests[p].test(c))) {
                                if (shiftR(p), buffer[p] = c, writeBuffer(), next = seekNext(p), android) {
                                    var proxy = function() {
                                        $.proxy($.fn.caret, input, next)();
                                    };
                                    setTimeout(proxy, 0);
                                } else input.caret(next);
                                pos.begin <= lastRequiredNonMaskPos && tryFireCompleted();
                            }
                            e.preventDefault();
                        }
                    }
                }
                function clearBuffer(start, end) {
                    var i;
                    for (i = start; end > i && len > i; i++) tests[i] && (buffer[i] = getPlaceholder(i));
                }
                function writeBuffer() {
                    input.val(buffer.join(""));
                }
                function checkVal(allow) {
                    var i, c, pos, test = input.val(), lastMatch = -1;
                    for (i = 0, pos = 0; len > i; i++) if (tests[i]) {
                        for (buffer[i] = getPlaceholder(i); pos++ < test.length; ) if (c = test.charAt(pos - 1), 
                        tests[i].test(c)) {
                            buffer[i] = c, lastMatch = i;
                            break;
                        }
                        if (pos > test.length) {
                            clearBuffer(i + 1, len);
                            break;
                        }
                    } else buffer[i] === test.charAt(pos) && pos++, partialPosition > i && (lastMatch = i);
                    return allow ? writeBuffer() : partialPosition > lastMatch + 1 ? settings.autoclear || buffer.join("") === defaultBuffer ? (input.val() && input.val(""), 
                    clearBuffer(0, len)) : writeBuffer() : (writeBuffer(), input.val(input.val().substring(0, lastMatch + 1))), 
                    partialPosition ? i : firstNonMaskPos;
                }
                var input = $(this), buffer = $.map(mask.split(""), function(c, i) {
                    return "?" != c ? defs[c] ? getPlaceholder(i) : c : void 0;
                }), defaultBuffer = buffer.join(""), focusText = input.val();
                input.data($.mask.dataName, function() {
                    return $.map(buffer, function(c, i) {
                        return tests[i] && c != getPlaceholder(i) ? c : null;
                    }).join("");
                }), input.one("unmask", function() {
                    input.off(".mask").removeData($.mask.dataName);
                }).on("focus.mask", function() {
                    if (!input.prop("readonly")) {
                        clearTimeout(caretTimeoutId);
                        var pos;
                        focusText = input.val(), pos = checkVal(), caretTimeoutId = setTimeout(function() {
                            input.get(0) === document.activeElement && (writeBuffer(), pos == mask.replace("?", "").length ? input.caret(0, pos) : input.caret(pos));
                        }, 10);
                    }
                }).on("blur.mask", blurEvent).on("keydown.mask", keydownEvent).on("keypress.mask", keypressEvent).on("input.mask paste.mask", function() {
                    input.prop("readonly") || setTimeout(function() {
                        var pos = checkVal(!0);
                        input.caret(pos), tryFireCompleted();
                    }, 0);
                }), chrome && android && input.off("input.mask").on("input.mask", androidInputEvent), 
                checkVal();
            });
        }
    });
});

// валидация телефона
$(document).ready(function() {
    var GetinTouch = {
        init: function() {
            this.bindUiActions();
        },
        bindUiActions: function() {
            $('form').submit(function(event) {
                event.preventDefault();
            });

            $(".checkout").click(function() {
                if ($(this).hasClass('preorder-btn')) {
                    $(window).trigger('fillField');
                }

                GetinTouch.validateForm($(this));
            });

        },
        validateForm: function(submit) {
            var formValid = true,
                thisForm = submit.closest('form');
                /* validate e-mail */
            $('input.required, textarea.required', thisForm).each(function() {
                var thisInput = $(this);

                if ($(this).is('input')){

                    /* validate phone */
                    var rv_phone = /[0-9]/;

                    if ($(this).attr('name') === "phone") {
                        if($(this).val().length < 7 || thisInput==="" || !rv_phone.test(thisInput.val())){
                            var rvphone = true;
                            formValid = false;
                            thisInput.addClass('wrong-form');
                            thisInput.val("");
                            // thisInput.attr('placeholder', "Введите телефон");
                            $(this).focus(function() {
                                thisInput.removeClass('wrong-form');
                            });
                        }
                        else{
                            thisInput.removeClass('wrong-form');
                        }
                    } else {
                        if(thisInput===""){
                            formValid = false;
                        }
                    }

                    var rv_email = /@/;

                    if ($(this).attr('name') === "email") {
                        if($(this).val().length < 7 || thisInput==="" || !rv_email.test(thisInput.val())){
                            var rv_email = true;
                            formValid = false;
                            inputGroup.addClass('wrong-form');
                            thisInput.val("");
                            thisInput.attr('placeholder', "Введите email");
                            $(this).focus(function() {
                                inputGroup.removeClass('wrong-form');
                            });
                        }
                        else{
                            inputGroup.removeClass('wrong-form');
                        }
                    } else {
                        if(thisInput===""){
                            formValid = false;
                        }
                    }
                } else{
                  
                }
            });
            if (formValid) {
                GetinTouch.sendForm(thisForm);
                // $('.popup input:not("[type=submit]"), .form input:not("[type=submit]"), .order-block input:not("[type=submit]")').val('');
            } else {
                return false;
            }
        },
        sendForm: function(thisForm) {
                var url = "sendmail.php";
                $.ajax({
                    type: "POST",
                    url: url,
                    data: thisForm.serialize(), // serializes the form's elements.
                    success: function(){
                        $('.thanks-modal').modal();
                        thisForm.find('input[type="text"]').val('');
                    }
                });
                
            return false;
        }
    };
    /* validate onblure */
    $('input').keyup(function(){
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if ($(this).attr('name') === "mail_field") {
            if($(this) === "" || !re.test($(this).val())){
                var rvmail = true;
                formValid = false;
                $(this).addClass('wrong-form');
            }
            else{
                $(this).removeClass('wrong-form');
            }
        }
        var rv_name = /[а-яА-ЯёЁa-zA-Z0-9\s]+$/;
        if ($(this).attr('name') === "name_field") {
            if($(this)==="" || !rv_name.test($(this).val())){
                var rvname = true;
                formValid = false;
                $(this).addClass('wrong-form');
            }
            else{
                $(this).removeClass('wrong-form');
            }
        } else {
            if($(this)===""){
                formValid = false;
            }
        };
        var rv_phone = /[0-9]/;

        if ($(this).attr('name') === "phone_field") {
            if($(this).val().length < 10 || $(this)==="" || !rv_phone.test($(this).val())){
                var rvphone = true;
                formValid = false;
                $(this).addClass('wrong-form');
            }
            else{
                $(this).removeClass('wrong-form');
            }
        } else {
            if($(this)===""){
                formValid = false;
            }
        };
    });
    GetinTouch.init();

    //$('input[name="phone_field"]').on('input', function () {
    //   if(/^[0-9]{0,9}$]/.test($(this).val())) {
    //       $(this).val('test');
    //   }
    //});
});


// запрет на ввод букв, только цифры
$("#phone").keypress(function( b ){
    var C = /[0-9\x25\x24\x23]/;
    var a = b.which;
    var c = String.fromCharCode(a);
    return !!(a==0||a==8||a==9||a==13||c.match(C));

});

// маска телефона
jQuery(function($){
   $("#phone").mask("+38 (099) 999 99 99");
});

// очистка формы по клику на кнопку "ок"
$('.thanks-close').click(function() {
  $("#phone").val('');
});
$('button.btn').click(function(e) {
  e.preventDefault();
});

$('.play-video-btn').click(function() {
  play()
});

$('.close, .modal').click(function() {
  pause()
});
function onYouTubeIframeAPIReady() {
    ytplayer = new YT.Player('myvideo');
}
function pause(){
  if (ytplayer) {
      ytplayer.stopVideo();
  }
}
function play() {
  if (ytplayer) {
      ytplayer.playVideo();
  }
}
