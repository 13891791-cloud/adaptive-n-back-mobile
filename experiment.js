/* ************************************ */
/* Define helper functions */
/* ************************************ */
function evalAttentionChecks() {
	var check_percent = 1
	if (run_attention_checks) {
		var attention_check_trials = jsPsych.data.getTrialsOfType('attention-check')
		var checks_passed = 0
		for (var i = 0; i < attention_check_trials.length; i++) {
			if (attention_check_trials[i].correct === true) {
				checks_passed += 1
			}
		}
		check_percent = checks_passed / attention_check_trials.length
	}
	return check_percent
}

function assessPerformance() {
	/* Function to calculate the "credit_var", which is a boolean used to
	credit individual experiments in expfactory. */
	var experiment_data = jsPsych.data.getTrialsOfType('poldrack-single-stim')
	var missed_count = 0
	var trial_count = 0
	var rt_array = []
	var rt = 0
		//record choices participants made
	var choice_counts = {}
	choice_counts[-1] = 0
	choice_counts[32] = 0
	for (var i = 0; i < experiment_data.length; i++) {
		if (experiment_data[i].possible_responses != 'none') {
			trial_count += 1
			rt = experiment_data[i].rt
			key = experiment_data[i].key_press
			choice_counts[key] += 1
			if (rt == -1) {
				missed_count += 1
			} else {
				rt_array.push(rt)
			}
		}
	}
	//calculate average rt
	var avg_rt = -1
	if (rt_array.length !== 0) {
		avg_rt = math.median(rt_array)
	} 
	var missed_percent = missed_count/experiment_data.length
	//calculate whether response distribution is okay
	var responses_ok = true
	Object.keys(choice_counts).forEach(function(key, index) {
		if (choice_counts[key] > trial_count * 0.85) {
			responses_ok = false
		}
	})
	credit_var = (missed_percent < 0.4 && (avg_rt > 200) && responses_ok)
	jsPsych.data.addDataToLastTrial({"credit_var": credit_var})
}

var getInstructFeedback = function() {
	return '<div class = centerbox><p class = center-block-text>' + feedback_instruct_text +
		'</p></div>'
}

var randomDraw = function(lst) {
	var index = Math.floor(Math.random() * (lst.length))
	return lst[index]
};


//Calculates whether the last trial was correct and records the accuracy in data object
var record_acc = function(data) {

    var target_lower = data.target.toLowerCase()

    var stim_lower = curr_stim.toLowerCase(0)

    var key = data.key_press

    // 原来的正确率逻辑，保留不动
    if (stim_lower == target_lower && key == 37) {

        correct = true

        if (block_trial >= delay) {
            block_acc += 1
        }

    } else if (stim_lower != target_lower && key == 40) {

        correct = true

        if (block_trial >= delay) {
            block_acc += 1
        }

    } else {

        correct = false
    }

    // 从这里开始只是新增数据分类
    var is_target =
        stim_lower == target_lower;

    var responded_match =
        key == 37;

    var responded_nonmatch =
        key == 40;

    var no_response =
        key == -1 || key == null || typeof key === "undefined";

    var hit = 0;
    var miss = 0;
    var false_alarm = 0;
    var correct_rejection = 0;
    var response_type = "no_response";

    if (!no_response) {

        if (is_target && responded_match) {
            hit = 1;
            response_type = "hit";
        }

        else if (is_target && responded_nonmatch) {
            miss = 1;
            response_type = "miss";
        }

        else if (!is_target && responded_match) {
            false_alarm = 1;
            response_type = "false_alarm";
        }

        else if (!is_target && responded_nonmatch) {
            correct_rejection = 1;
            response_type = "correct_rejection";
        }
    }

    jsPsych.data.addDataToLastTrial({

        correct: correct,

        stim: curr_stim,

        trial_num: current_trial,

        participant_id: participant_id,

        session_type: session_type,

        training_day: training_day,

        session_date: session_date,

        block_num: current_block + 1,

        block_trial: block_trial + 1,

        n_level: delay,

        target_letter: target,

        is_target: is_target,

        response:
            responded_match ? "match" :
            responded_nonmatch ? "non_match" :
            "no_response",

        response_type: response_type,

        hit: hit,

        miss: miss,

        false_alarm: false_alarm,

        correct_rejection: correct_rejection,

        no_response: no_response ? 1 : 0,

        rt: data.rt

    })

    current_trial = current_trial + 1

    block_trial = block_trial + 1
};

var update_delay = function() {
	var mistakes = base_num_trials - block_acc
	if (delay >= 2) {
		if (mistakes < 3) {
			delay += 1
		} else if (mistakes > 5) {
			delay -= 1
		}
	} else if (delay == 1) {
		if (mistakes < 3) {
			delay += 1
		}
	}
	block_acc = 0
	current_block += 1
};

var update_target = function() {
	if (stims.length >= delay) {
		target = stims.slice(-delay)[0]
	} else {
		target = ""
	}
};

var getStim = function() {
	var trial_type = target_trials.shift()
	var targets = letters.filter(function(x) { return x.toLowerCase() == target.toLowerCase()})
	var non_targets = letters.filter(function(x) { return x.toLowerCase() != target.toLowerCase()})
	if (trial_type === 'target') {
		curr_stim = randomDraw(targets)
	} else {
		curr_stim = randomDraw(non_targets)
	}
	stims.push(curr_stim)
	return '<div class = "centerbox"><div class = "center-text">' + curr_stim + '</div></div>'
}

var getData = function() {

    return {

        trial_id: "stim",

        exp_stage:
            session_type === "train" ? "adaptive" : "fixed_2back",

        participant_id: participant_id,

        session_type: session_type,

        training_day: training_day,

        session_date: session_date,

        load: delay,

        n_level: delay,

        target: target,

        block_num: current_block + 1,

        block_trial: block_trial + 1,

        global_trial_num: current_trial + 1

    }

}


/* ************************************ */
/* Define experimental variables */
/* ************************************ */
// generic task variables
var run_attention_checks = false
var attention_check_thresh = 0.65
var credit_var = true //default to true

// task specific variables
var letters = 'bBdDgGtTvV'.split("")
var num_blocks = 8 // number of adaptive blocks
var base_num_trials = 20 // total num_trials = base + load 
var test_num_trials = 80;   // 前测/后测有效 trial 数
var block_acc = 0 // record block accuracy to determine next blocks delay
var delay = 2 // starting delay
var trials_left = 0 // counter used by adaptive_test_node
var target_trials = [] // array defining whether each trial in a block is a target trial
var current_trial = 0
var current_block = 0  
var block_trial = 0
var target = ""
var curr_stim = ''
var stims = [] //hold stims per block
// ================================
// Session information
// ================================

// Read mode from URL:
// ?mode=pre
// ?mode=train&day=1
// ?mode=post
var urlParams = new URLSearchParams(window.location.search);

var session_type = urlParams.get('mode');
var training_day = urlParams.get('day');

// Participant ID will be entered on the first page
var participant_id = "";

// Current date
var session_date = new Date().toISOString().slice(0, 10);
/* ************************************ */
/* Set up jsPsych blocks */
/* ************************************ */
// Set up attention check node
var attention_check_block = {
	type: 'attention-check',
	data: {
		trial_id: "attention"
	},
	timing_response: 180000,
	response_ends_trial: true,
	timing_post_trial: 200
}

var attention_node = {
	timeline: [attention_check_block],
	conditional_function: function() {
		return run_attention_checks
	}
}

//Set up post task questionnaire
var post_task_block = {
   type: 'survey-text',
   data: {
       trial_id: "post task questions"
   },
   questions: ['<p class = center-block-text style = "font-size: 20px">Please summarize what you were asked to do in this task.</p>',
              '<p class = center-block-text style = "font-size: 20px">Do you have any comments about this task?</p>'],
   rows: [15, 15],
   columns: [60,60]
};

/* define static blocks */
var feedback_instruct_text =
    '欢迎参加本实验。<br><br>' +
    '接下来你将完成一个工作记忆任务。<br><br>' +
    '请在安静的环境中完成任务，并尽可能快速、准确地作答。';

var feedback_instruct_block = {

    type: 'mobile-text-button',

    text: feedback_instruct_text,

    button_text: '开始实验',

    data: {
        trial_id: 'instruction'
    }

};

var participant_id_block = {

    type: 'participant-id',

    data: {
        trial_id: 'participant_id',
        exp_stage: 'participant_info'
    }

};
var end_block = {

    type: 'mobile-text-button',

    text:
        '<div style="text-align:center;">' +
        '<h2>实验完成</h2>' +
        '<p>感谢你的参与！</p>' +
        '<p>你已经完成本次任务。</p>' +
        '<p>请点击下方按钮结束实验。</p>' +
        '</div>',

    button_text: '完成',

    data: {
        trial_id: "end",
        exp_id: 'adaptive_n_back',
        exp_stage: 'end'
    },

    on_finish: function(data) {
        assessPerformance(data);
    }

};

var start_practice_block = {

    type: 'mobile-text-button',

    text:
        '<div style="text-align:left;">' +
        '<h2 style="text-align:center;">练习阶段</h2>' +

        '<p>接下来你将进行 <strong>1-back</strong> 练习。</p>' +

        '<p>请判断当前出现的字母，是否与<strong>前 1 个位置</strong>出现的字母相同。</p>' +

        '<p>如果相同，请点击 <strong>“匹配”</strong>；' +
        '如果不同，请点击 <strong>“不匹配”</strong>。</p>' +

        '<p>练习阶段会告诉你回答是否正确；正式实验中不会提供正确或错误反馈。</p>' +

        '<p>请尽可能快速、准确地完成任务。</p>' +
        '</div>',

    button_text: '开始练习',

    data: {
        trial_id: "instruction",
        exp_stage: "practice_instruction"
    }

};

var update_delay_block = {
	type: 'call-function',
	func: update_delay,
	data: {
		trial_id: "update_delay"
	},
	timing_post_trial: 0
}

var update_target_block = {
	type: 'call-function',
	func: update_target,
	data: {
		trial_id: "update_target"
	},
	timing_post_trial: 0
}


var start_adaptive_block = {

    type: 'mobile-text-button',

    data: {
        exp_stage: "adaptive",
        trial_id: "delay_text"
    },

    text: function() {

        return (
            '<div style="text-align:left;">' +

            '<h2 style="text-align:center;">正式任务</h2>' +

            '<p>接下来进行 <strong>' + delay + '-back</strong> 任务。</p>' +

            '<p>请判断当前出现的字母，是否与<strong>前 ' +
            delay +
            ' 个位置</strong>出现的字母相同。</p>' +

            '<p>如果相同，请点击 <strong>“匹配”</strong>；' +
            '如果不同，请点击 <strong>“不匹配”</strong>。</p>' +

            '<p>正式任务中不会提示回答是否正确。</p>' +

            '<p>请尽可能快速、准确地作答。</p>' +

            '</div>'
        );

    },

    button_text: '开始本轮',

    on_finish: function() {

        block_trial = 0
        stims = []
        trials_left = base_num_trials + delay
        target_trials = []

        for (var i = 0; i < delay; i++) {
            target_trials.push('0')
        }

        var trials_to_add = []

        for (var j = 0; j < (trials_left - delay); j++) {

            if (j < Math.round(base_num_trials / 3)) {
                trials_to_add.push('target')
            } else {
                trials_to_add.push('0')
            }

        }

        trials_to_add =
            jsPsych.randomization.shuffle(trials_to_add)

        target_trials =
            target_trials.concat(trials_to_add)

        block_acc = 0;

    }

};
var start_fixed_2back_block = {

    type: 'mobile-text-button',

    data: {
        exp_stage: "test",
        trial_id: "fixed_2back_instruction"
    },

    text: function() {

        var test_name =
            session_type === "pre" ? "前测" : "后测";

        return (
            '<div style="text-align:left;">' +

            '<h2 style="text-align:center;">' +
            test_name +
            '</h2>' +

            '<p>接下来进行固定的 <strong>2-back</strong> 任务。</p>' +

            '<p>请判断当前出现的字母是否与前 <strong>2 个位置</strong>出现的字母相同。</p>' +

            '<p>相同请点击 <strong>“匹配”</strong>；' +
            '不同请点击 <strong>“不匹配”</strong>。</p>' +

            '<p>正式任务中不会提供正确或错误反馈。</p>' +

            '<p>请尽可能快速、准确地作答。</p>' +

            '</div>'
        );
    },

    button_text: '开始任务',

    on_finish: function() {

        delay = 2;

        block_trial = 0;
        stims = [];

        // 80个有效trial + 前2个建立序列trial
        trials_left = test_num_trials + delay;

        target_trials = [];

        // 前2个不能进行2-back判断
        for (var i = 0; i < delay; i++) {
            target_trials.push('0');
        }

        var trials_to_add = [];

        // 保持原任务大约1/3 target的比例
        for (var j = 0; j < test_num_trials; j++) {

            if (j < Math.round(test_num_trials / 3)) {
                trials_to_add.push('target');
            } else {
                trials_to_add.push('0');
            }

        }

        trials_to_add =
            jsPsych.randomization.shuffle(trials_to_add);

        target_trials =
            target_trials.concat(trials_to_add);

        block_acc = 0;
    }

};
var adaptive_block = {
    type: 'mobile-nback',
    stimulus: getStim,
    data: getData,
    on_finish: function(data) {
        record_acc(data)
    }
};

// Setup 1-back practice

practice_trials = []

for (var i = 0; i < (base_num_trials + 1); i++) {

    var stim = randomDraw(letters)

    stims.push(stim)

    if (i >= 1) {
        target = stims[i - 1]
    }

    if (stim.toLowerCase() == target.toLowerCase()) {
        correct_response = 37
    } else {
        correct_response = 40
    }

    var practice_block = {

        type: 'mobile-nback',

        stimulus: stim,

        correct_response: correct_response,

        show_feedback: true,

        data: {
            trial_id: "stim",
            exp_stage: "practice",
            stim: stim,
            target: target
        }

    };

    practice_trials.push(practice_block)
}

//Define control (0-back) block
var control_trials = []
for (var i = 0; i < base_num_trials*2; i++) {
	var control_block = {
		type: 'poldrack-single-stim',
		is_html: true,
		stimulus: getStim,
		data: {
			trial_id: "stim",
			exp_stage: "control",
			load: 0,
			target: 't',
		},
		choices: [37,40],
		timing_stim: 500,
		timing_response: 2000,
		timing_post_trial: 0,
		on_finish: function(data) {
			record_acc(data)
		}
	};
	control_trials.push(control_block)
}

var adaptive_test_node = {
	timeline: [update_target_block, adaptive_block],
	loop_function: function() {
		trials_left -= 1
		if (trials_left === 0) {
			return false
		} else { 
			return true 
		}
	}
}
	
var adaptive_n_back_experiment = [];

// 1. 输入被试编号
adaptive_n_back_experiment.push(participant_id_block);

// 2. 总指导语
adaptive_n_back_experiment.push(feedback_instruct_block);

// ================================
// PRETEST
// 固定 2-back
// ================================

if (session_type === "pre") {

    delay = 2;

    adaptive_n_back_experiment.push(start_practice_block);

    adaptive_n_back_experiment =
        adaptive_n_back_experiment.concat(practice_trials);

    adaptive_n_back_experiment.push(start_fixed_2back_block);

    adaptive_n_back_experiment.push(adaptive_test_node);

}


// ================================
// TRAINING
// 8-block adaptive n-back
// ================================

else if (session_type === "train") {

    adaptive_n_back_experiment.push(start_practice_block);

    adaptive_n_back_experiment =
        adaptive_n_back_experiment.concat(practice_trials);

    for (var b = 0; b < num_blocks; b++) {

        adaptive_n_back_experiment.push(start_adaptive_block);

        adaptive_n_back_experiment.push(adaptive_test_node);

        adaptive_n_back_experiment.push(update_delay_block);

    }

}


// ================================
// POSTTEST
// 固定 2-back
// ================================

else if (session_type === "post") {

    delay = 2;

    adaptive_n_back_experiment.push(start_practice_block);

    adaptive_n_back_experiment =
        adaptive_n_back_experiment.concat(practice_trials);

		adaptive_n_back_experiment.push(start_fixed_2back_block);

    adaptive_n_back_experiment.push(adaptive_test_node);

}


// ================================
// END
// ================================

adaptive_n_back_experiment.push(end_block);