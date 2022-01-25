
// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
; (function ($, window, document, undefined) {

    // undefined is used here as the undefined global variable in ECMAScript 3 is
    // mutable (ie. it can be changed by someone else). undefined isn't really being
    // passed in so we can ensure the value of it is truly undefined. In ES5, undefined
    // can no longer be modified.

    // window and document are passed through as local variable rather than global
    // as this (slightly) quickens the resolution process and can be more efficiently
    // minified (especially when both are regularly referenced in your plugin).

    // Create the defaults once
    var pluginName = "jkeyboard",
        defaults = {
            layout: "english",
            selectable: ['azeri', 'english', 'german', 'russian'],
            input: $('#input'),
            customLayouts: {
                selectable: []
            },
        };

    var function_keys = {
        backspace: {
            text: '&nbsp;',
        },
        enter: {
            text: 'Enter'
        },
    };

    var layouts = {
        azeri: [
            ['q', 'ü', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'ö', 'ğ'],
            ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ı', 'ə'],
            ['shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'ç', 'ş', 'backspace'],
            ['numeric_switch', 'layout_switch', 'space', 'return']
        ],
        english: [
            ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p',],
            ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l',],
            ['shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'backspace'],
            ['numeric_switch', 'layout_switch', 'space', 'return']
        ],
        german: [
            ['q', 'w', 'e', 'r', 't', 'z', 'u', 'i', 'o', 'p','ü','ß'],
            ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l','ö','ä'],
            ['shift', 'y', 'x', 'c', 'v', 'b', 'n', 'm', 'backspace'],
            ['numeric_switch', 'layout_switch', 'space', 'return']
        ],
        russian: [
            ['й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з', 'х'],
            ['ф', 'ы', 'в', 'а', 'п', 'р', 'о', 'л', 'д', 'ж', 'э'],
            ['shift', 'я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'б', 'ю', 'backspace'],
            ['numeric_switch', 'layout_switch', 'space', 'return']
        ],
        numeric: [
            ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
            ['-', '/', ':', ';', '(', ')', '$', '&', '@', '"'],
            ['symbol_switch', '.', ',', '?', '!', "'", 'backspace'],
            ['character_switch', 'layout_switch', 'space', 'return'],
        ],
        numbers_only: [
            ['1', '2', '3',],
            ['4', '5', '6',],
            ['7', '8', '9',],
            ['0', 'return', 'backspace'],
        ],
        symbolic: [
            ['[', ']', '{', '}', '#', '%', '^', '*', '+', '='],
            ['_', '\\', '|', '~', '<', '>'],
            ['numeric_switch', '.', ',', '?', '!', "'", 'backspace'],
            ['character_switch', 'layout_switch', 'space', 'return'],

        ]
    }

    var shift = false, capslock = false, layout = 'english', layout_id = 0;

    // The actual plugin constructor
    function Plugin(element, options) {
        this.element = element;
        // jQuery has an extend method which merges the contents of two or
        // more objects, storing the result in the first object. The first object
        // is generally empty as we don't want to alter the default options for
        // future instances of the plugin
        this.settings = $.extend({}, defaults, options);
        // Extend & Merge the cusom layouts
        layouts = $.extend(true, {}, this.settings.customLayouts, layouts);
        if (Array.isArray(this.settings.customLayouts.selectable)) {
            $.merge(this.settings.selectable, this.settings.customLayouts.selectable);
        }
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }

    Plugin.prototype = {
        init: function () {
            layout = this.settings.layout;
            this.createKeyboard(layout);
            this.events();
        },

        setInput: function (newInputField) {
            this.settings.input = newInputField;
        },

        createKeyboard: function (layout) {
            shift = false;
            capslock = false;

            var keyboard_container = $('<ul/>').addClass('jkeyboard'),
                me = this;

            layouts[layout].forEach(function (line, index) {
                var line_container = $('<li/>').addClass('jline');
                line_container.append(me.createLine(line));
                keyboard_container.append(line_container);
            });

            $(this.element).html('').append(keyboard_container);
        },

        createLine: function (line) {
            var line_container = $('<ul/>');

            line.forEach(function (key, index) {
                var key_container = $('<li/>').addClass('jkey').data('command', key);

                if (function_keys[key]) {
                    key_container.addClass(key).html(function_keys[key].text);
                }
                else {
                    key_container.addClass('letter').addClass('letter_'+key).html(key);
                }

                line_container.append(key_container);
            })

            return line_container;
        },

        events: function () {
            var letters = $(this.element).find('.letter'),
                shift_key = $(this.element).find('.shift'),
                space_key = $(this.element).find('.space'),
                backspace_key = $(this.element).find('.backspace'),
                enter_key = $(this.element).find('.enter'),

                me = this,
                fkeys = Object.keys(function_keys).map(function (k) {
                    return '.' + k;
                }).join(',');

            letters.on('click', function () {
                if( answerFlag || _key_count === current_letters_count ){
                    return;
                }

                let tr_num = parseInt(key_count/current_letters_count);
                let tr_id = "#tr_" + tr_num;
                let td_num = key_count - current_letters_count * (tr_num);
                let td = $(tr_id).children()[td_num];
                td.innerText = $(this).text();
                td.className += ' active';

                userWord += $(this).text();
                key_count++; _key_count++;
                // me.type((shift || capslock) ? $(this).text().toUpperCase() : $(this).text());
            });

            space_key.on('click', function () {
                debugger;
                me.type(' ');
            });

            enter_key.on('click', function () {
                if( key_count % current_letters_count == 0 ){
                    //존재하는 단어인지 체크
                    if( current_letters_count === 5 ){
                        if( fiveLetterWords.indexOf(userWord) === -1 ){
                            // $.toast('Not in word list.');
                            toastr.info('Not in word list.');
                            return;
                        }
                    }else if( current_letters_count === 6 ){
                        if( sixLetterWords.indexOf(userWord) === -1 ){
                            toastr.info('Not in word list.');
                            return;
                        }
                    }

                    _key_count = 0;

                    //check answer
                    if( userWord === answerWord ){
                        answerFlag = true;
                        $("#newGameBtn").css("display", "inline-block");
                    }

                    //init array
                    let ansCheckArr = new Array(), userCheckArr = new Array();
                    for (let i = 0; i < current_letters_count; i++){
                        ansCheckArr[i] = false; userCheckArr[i] = false;
                    }

                    //current row
                    let tr_num  = parseInt(key_count/current_letters_count) - 1;
                    let tr_id = "#tr_" + tr_num;

                    const answerWordArr = Array.from(answerWord), userWordArr = Array.from(userWord);

                    //check correct letter
                    for (let i = 0; i < current_letters_count; i++){
                        let td = $(tr_id).children()[i];
                        if( answerWordArr[i] === userWordArr[i] ){
                            td.className += ' correct';
                            $(".letter_" + answerWordArr[i]).addClass("correct_key");
                            ansCheckArr[i] = true; userCheckArr[i] = true;
                        }
                    }

                    for (let i = 0; i < current_letters_count; i++){
                        if( userCheckArr[i] ) continue;
                        let td = $(tr_id).children()[i];
                        let _tileCheck = false;
                        for(let j = 0; j < current_letters_count; j++){
                            if( !ansCheckArr[j] ){
                                //check present letter
                                if( answerWordArr[j] === userWordArr[i] ){
                                    td.className += ' present';
                                    if( !$(".letter_" + answerWordArr[j]).hasClass("correct_key") ){
                                        $(".letter_" + answerWordArr[j]).addClass("present_key");
                                    }
                                    ansCheckArr[j] = true;
                                    _tileCheck = true;
                                    break;
                                }

                            }
                        }
                        //check absent letter
                        if( !_tileCheck ){
                            td.className += ' absent';
                        }
                    }
                    userWord = "";
                }else {
                    toastr.info('Not enough letters.');
                }
                // me.type("\n");
                // me.settings.input.parents('form').submit();
            });

            backspace_key.on('click', function () {
                if( _key_count == 0 ){
                    return;
                }
                key_count--; _key_count--;
                userWord = userWord.slice(0, -1);
                let tr_num = parseInt(key_count/current_letters_count);
                let tr_id = "#tr_" + tr_num;
                let td_num = key_count - current_letters_count * (tr_num);
                let td = $(tr_id).children()[td_num];
                td.innerText = "";
                td.classList.remove('active');

                // me.backspace();
            });

            shift_key.on('click', function () {
                if (capslock) {
                    me.toggleShiftOff();
                    capslock = false;
                } else {
                    me.toggleShiftOn();
                }
            }).on('dblclick', function () {
                capslock = true;
            });


            $(fkeys).on('click', function () {
                var command = function_keys[$(this).data('command')].command;
                if (!command) return;

                command.call(me);
            });
        },

        type: function (key) {
            var input = this.settings.input,
                val = input.val(),
                input_node = input.get(0),
                start = input_node.selectionStart,
                end = input_node.selectionEnd;

            var max_length = $(input).attr("maxlength");
            if (start == end && end == val.length) {
                if (!max_length || val.length < max_length) {
                    input.val(val + key);
                }
            } else {
                var new_string = this.insertToString(start, end, val, key);
                input.val(new_string);
                start++;
                end = start;
                input_node.setSelectionRange(start, end);
            }

            input.trigger('focus');

            if (shift && !capslock) {
                this.toggleShiftOff();
            }
        },

        backspace: function () {
            var input = this.settings.input,
                val = input.val();

            input.val(val.substr(0, val.length - 1));
        },

        toggleShiftOn: function () {
            var letters = $(this.element).find('.letter'),
                shift_key = $(this.element).find('.shift');

            letters.addClass('uppercase');
            shift_key.addClass('active')
            shift = true;
        },

        toggleShiftOff: function () {
            var letters = $(this.element).find('.letter'),
                shift_key = $(this.element).find('.shift');

            letters.removeClass('uppercase');
            shift_key.removeClass('active');
            shift = false;
        },

        toggleLayout: function () {
            layout_id = layout_id || 0;
            var plain_layouts = this.settings.selectable;
            layout_id++;

            var current_id = layout_id % plain_layouts.length;
            return plain_layouts[current_id];
        },

        insertToString: function (start, end, string, insert_string) {
            return string.substring(0, start) + insert_string + string.substring(end, string.length);
        }
    };


    var methods = {
        init: function(options) {
            if (!this.data("plugin_" + pluginName)) {
                this.data("plugin_" + pluginName, new Plugin(this, options));
            }
        },
        setInput: function(content) {
            this.data("plugin_" + pluginName).setInput($(content));
        },
        setLayout: function(layoutname) {
            // change layout if it is not match current
            object = this.data("plugin_" + pluginName);
            if (typeof(layouts[layoutname]) !== 'undefined' && object.settings.layout != layoutname) {
                object.settings.layout = layoutname;
                object.createKeyboard(layoutname);
                object.events();
            };
        },
    };

    $.fn[pluginName] = function (methodOrOptions) {
        if (methods[methodOrOptions]) {
            return methods[methodOrOptions].apply(this.first(), Array.prototype.slice.call( arguments, 1));
        } else if (typeof methodOrOptions === 'object' || ! methodOrOptions) {
            // Default to "init"
            return methods.init.apply(this.first(), arguments);
        } else {
            $.error('Method ' +  methodOrOptions + ' does not exist on jQuery.jkeyboard');
        }
    };

})(jQuery, window, document);
