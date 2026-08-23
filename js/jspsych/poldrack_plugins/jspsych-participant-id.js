jsPsych.plugins["participant-id"] = (function() {

    var plugin = {};

    plugin.trial = function(display_element, trial) {

        display_element.html(
            '<div style="width:100%; min-height:100vh; display:flex; flex-direction:column;' +
            'align-items:center; justify-content:center; box-sizing:border-box; padding:30px;">' +

                '<h2>欢迎参加实验</h2>' +

                '<p style="font-size:22px;">请输入你的被试编号</p>' +

                '<input id="participant-id-input" type="text" autocomplete="off" ' +
                'style="font-size:26px; padding:14px; width:80%; max-width:350px;' +
                'text-align:center; margin-bottom:30px;">' +

                '<button id="participant-id-button" ' +
                'style="font-size:24px; padding:15px 45px; border-radius:12px;">' +
                '进入实验' +
                '</button>' +

                '<div id="participant-error" ' +
                'style="margin-top:20px; color:red; font-size:18px;"></div>' +

            '</div>'
        );

        $('#participant-id-button').on('click touchstart', function(e) {

            e.preventDefault();

            var entered_id =
                $('#participant-id-input').val().trim();

            if (entered_id.length === 0) {

                $('#participant-error').text('请输入被试编号');
                return;
            }

            participant_id = entered_id;

            display_element.html('');

            jsPsych.finishTrial({
                participant_id: participant_id,
                session_type: session_type,
                training_day: training_day,
                session_date: session_date
            });

        });

    };

    return plugin;

})();