jsPsych.plugins["mobile-nback-practice"] = (function() {

    var plugin = {};

    plugin.trial = function(display_element, trial) {

        trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

        var start_time = new Date().getTime();
        var responded = false;

        // 显示刺激和两个按钮
        display_element.html(
            '<div style="width:100%; min-height:100vh; display:flex;' +
            'flex-direction:column; align-items:center; justify-content:center;' +
            'box-sizing:border-box; padding:20px;">' +

                '<div id="nback-stimulus" ' +
                'style="font-size:96px; font-weight:bold; margin-bottom:80px;">' +
                trial.stimulus +
                '</div>' +

                '<div style="display:flex; gap:20px; width:100%; max-width:520px;">' +

                    '<button id="match-btn" ' +
                    'style="flex:1; font-size:26px; padding:22px 8px;' +
                    'border-radius:12px;">匹配</button>' +

                    '<button id="nonmatch-btn" ' +
                    'style="flex:1; font-size:26px; padding:22px 8px;' +
                    'border-radius:12px;">不匹配</button>' +

                '</div>' +

            '</div>'
        );

        // 500ms 后隐藏字母
        var stim_timer = setTimeout(function() {

            $('#nback-stimulus').css('visibility', 'hidden');

        }, 500);


        function finishPractice(key_code, response_name) {

            if (responded) {
                return;
            }

            responded = true;

            var rt = new Date().getTime() - start_time;

            clearTimeout(stim_timer);
            clearTimeout(response_timer);

            var correct =
                key_code === trial.correct_response;

            // 显示练习反馈
            if (correct) {

                display_element.html(
                    '<div style="width:100%; min-height:100vh;' +
                    'display:flex; align-items:center; justify-content:center;' +
                    'font-size:56px;">正确 ✓</div>'
                );

            } else {

                display_element.html(
                    '<div style="width:100%; min-height:100vh;' +
                    'display:flex; align-items:center; justify-content:center;' +
                    'font-size:56px;">错误 ✕</div>'
                );

            }

            // 500ms 后结束本 trial
            setTimeout(function() {

                display_element.html('');

                jsPsych.finishTrial({

                    rt: rt,

                    key_press: key_code,

                    response: response_name,

                    correct: correct

                });

            }, 500);

        }


        $('#match-btn').on('click touchstart', function(e) {

            e.preventDefault();

            finishPractice(37, 'match');

        });


        $('#nonmatch-btn').on('click touchstart', function(e) {

            e.preventDefault();

            finishPractice(40, 'non_match');

        });


        // 2 秒未反应
        var response_timer = setTimeout(function() {

            if (responded) {
                return;
            }

            responded = true;

            clearTimeout(stim_timer);

            display_element.html(
                '<div style="width:100%; min-height:100vh;' +
                'display:flex; align-items:center; justify-content:center;' +
                'font-size:48px;">请更快作答！</div>'
            );

            setTimeout(function() {

                display_element.html('');

                jsPsych.finishTrial({

                    rt: -1,

                    key_press: -1,

                    response: 'no_response',

                    correct: false

                });

            }, 500);

        }, 2000);

    };

    return plugin;

})();