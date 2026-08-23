jsPsych.plugins["mobile-nback"] = (function() {

  var plugin = {};

  plugin.trial = function(display_element, trial) {

    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

    var start_time = new Date().getTime();
    var responded = false;

    display_element.html(
      '<div style="width:100%; min-height:100vh; display:flex; flex-direction:column;' +
      'align-items:center; justify-content:center; box-sizing:border-box; padding:20px;">' +

        '<div id="nback-stimulus" ' +
        'style="font-size:96px; font-weight:bold; margin-bottom:80px;">' +
        trial.stimulus +
        '</div>' +

        '<div style="display:flex; gap:20px; width:100%; max-width:520px;">' +

          '<button id="match-btn" ' +
          'style="flex:1; font-size:26px; padding:22px 8px; border-radius:12px; cursor:pointer;">' +
          '匹配' +
          '</button>' +

          '<button id="nonmatch-btn" ' +
          'style="flex:1; font-size:26px; padding:22px 8px; border-radius:12px; cursor:pointer;">' +
          '不匹配' +
          '</button>' +

        '</div>' +

      '</div>'
    );

    var stim_timer = setTimeout(function() {
      $('#nback-stimulus').css('visibility', 'hidden');
    }, 500);

    function finish_response(key_code, response_name) {

      if (responded) return;

      responded = true;

      var rt = new Date().getTime() - start_time;

      clearTimeout(stim_timer);
      clearTimeout(response_timer);

      display_element.html('');

      jsPsych.finishTrial({
        rt: rt,
        key_press: key_code,
        response: response_name
      });
    }

    $('#match-btn').on('click touchstart', function(e) {
      e.preventDefault();
      finish_response(37, 'match');
    });

    $('#nonmatch-btn').on('click touchstart', function(e) {
      e.preventDefault();
      finish_response(40, 'nonmatch');
    });

    var response_timer = setTimeout(function() {

      if (responded) return;

      responded = true;

      clearTimeout(stim_timer);

      display_element.html('');

      jsPsych.finishTrial({
        rt: -1,
        key_press: -1,
        response: 'no_response'
      });

    }, 2000);

  };

  return plugin;

})();