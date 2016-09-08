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
