jsPsych.plugins["mobile-text-button"] = (function() {

    var plugin = {};
  
    plugin.trial = function(display_element, trial) {
  
      trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);
  
      var button_text = trial.button_text || "继续";
  
      display_element.html(
        '<div style="width:100%; min-height:100vh; display:flex;' +
        'flex-direction:column; align-items:center; justify-content:center;' +
        'box-sizing:border-box; padding:30px;">' +
  
          '<div style="font-size:24px; line-height:1.8; max-width:720px;' +
          'text-align:left; margin-bottom:50px;">' +
            trial.text +
          '</div>' +
  
          '<button id="continue-btn" ' +
          'style="font-size:24px; padding:16px 50px; border-radius:12px;' +
          'cursor:pointer;">' +
            button_text +
          '</button>' +
  
        '</div>'
      );
  
      var start_time = new Date().getTime();
  
      $('#continue-btn').on('click touchstart', function(e) {
  
        e.preventDefault();
  
        var rt = new Date().getTime() - start_time;
  
        display_element.html('');
  
        jsPsych.finishTrial({
          rt: rt
        });
  
      });
  
    };
  
    return plugin;
  
  })();