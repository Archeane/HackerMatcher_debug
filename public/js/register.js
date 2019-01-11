var validated = false;
$(document).ready(() =>{

	//Populate universities select
	$.getJSON('/assets/colleges.json', (data) =>{
		$('#school').select2({data: data});
		/*for (i = 0; i < data.length; i++){
			var option = new Option(data[i]['institution'], data[i]['institution'], false, false);
			$('#school').append(option);
		}*/
	});

	//Populate majors select
	$.getJSON('/assets/majors.json', (data) =>{
		for (i = 0; i < data.length; i++){
			var option = new Option(data[i]['major'], data[i]['major'], false, false);
			$('#major').append(option);
		}
	});



	//-------------------------field 2-----------------------

	//populate select2
	var $interests = $('#reg-interest').select2();
	var $intrequest = $.ajax({
		url: '/assets/interests.json' // wherever your data is actually coming from
	});

	$intrequest.then(function (data) {
		for (var d = 0; d < data.length; d++) {
			var item = data[d];
			var option = new Option(item.name, item.name, false, false);
			$interests.append(option);
		}
		$interests.trigger('change');
	});

	var $lanelement = $('#reg-languages').select2();
	var $lanrequest = $.ajax({
		url: '/assets/languages.json' // wherever your data is actually coming from
	});
	$lanrequest.then(function (data) {
		for (var d = 0; d < data.length; d++) {
			var item = data[d];
			var option = new Option(item.name, item.name, false, false);
			$lanelement.append(option);
		}
		$lanelement.trigger('change');
	});

	var $techelement = $('#reg-technologies').select2();
	var $techrequest = $.ajax({
		url: '/assets/technologies.json' // wherever your data is actually coming from
	});

	$techrequest.then(function (data) {
		for (var d = 0; d < data.length; d++) {
			var item = data[d];
			var option = new Option(item.name, item.name, false, false);
			$techelement.append(option);
		}
		$techelement.trigger('change');
	});

	var $fieldelement = $('#reg-fields').select2();
	var $fiedrequest = $.ajax({
		url: '/assets/fields.json' // wherever your data is actually coming from
	});

	$fiedrequest.then(function (data) {
		for (var d = 0; d < data.length; d++) {
			var item = data[d];
			var option = new Option(item.name, item.name, false, false);
			$fieldelement.append(option);
		}
		$fieldelement.trigger('change');
	});

	//-----------------display chosen profile image------------------
	$(document).on('change', '.btn-file :file', function () {
		var input = $(this),
			label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
		input.trigger('fileselect', [label]);
	});
	$('.btn-file :file').on('fileselect', function (event, label) {
		var input = $(this).parents('.input-group').find(':text'),
			log = label;
		if (input.length) {
			input.val(log);
		} else {
			if (log) alert(log);
		}
	});

	function readURL(input) {
		if (input.files && input.files[0]) {
			var reader = new FileReader();

			reader.onload = function (e) {
				$('#img-upload').attr('src', e.target.result);
			}

			reader.readAsDataURL(input.files[0]);
		}
	}
	$("#imgInp").change(function () {
		readURL(this);
	});

});


//jQuery time
var current_fs, next_fs, previous_fs; //fieldsets
var left, opacity, scale; //fieldset properties which we will animate
var animating; //flag to prevent quick multi-click glitches

$(".next").click(function(){
	if($('#gender1').is(':checked') || $('#gender2').is(':checked') || $('#gender3').is(':checked')){//check gender
		if($('#school').val() && $('#major').val() && $('#gradYear').val() && $('#eduLevel').val() && $('#numOfHackathons').val()){
			validated = true;
		}else{
			validated = false;
		}
	}else{
		validated = false;
	}		
	if(!validated){
		$('#error').show();
	}else{
		$('#error').hide();
	
		if(animating) return false;
		animating = true;
		
		current_fs = $(this).parent();
		next_fs = $(this).parent().next();
		
		//activate next step on progressbar using the index of next_fs
		$("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");
		
		//show the next fieldset
		next_fs.show(); 
		//hide the current fieldset with style
		current_fs.animate({opacity: 0}, {
			step: function(now, mx) {
				//as the opacity of current_fs reduces to 0 - stored in "now"
				//1. scale current_fs down to 80%
				scale = 1 - (1 - now) * 0.2;
				//2. bring next_fs from the right(50%)
				left = (now * 50)+"%";
				//3. increase opacity of next_fs to 1 as it moves in
				opacity = 1 - now;
				current_fs.css({
	        'transform': 'scale('+scale+')',
	        'position': 'absolute'
	      });
				next_fs.css({'left': left, 'opacity': opacity});
			}, 
			duration: 800, 
			complete: function(){
				current_fs.hide();
				animating = false;
			}, 
			//this comes from the custom easing plugin
			easing: 'easeInOutBack'
		});
	}//end of else
});

$(".previous").click(function(){
	if(animating) return false;
	animating = true;
	
	current_fs = $(this).parent();
	previous_fs = $(this).parent().prev();
	
	//de-activate current step on progressbar
	$("#progressbar li").eq($("fieldset").index(current_fs)).removeClass("active");
	
	//show the previous fieldset
	previous_fs.show(); 
	//hide the current fieldset with style
	current_fs.animate({opacity: 0}, {
		step: function(now, mx) {
			//as the opacity of current_fs reduces to 0 - stored in "now"
			//1. scale previous_fs from 80% to 100%
			scale = 0.8 + (1 - now) * 0.2;
			//2. take current_fs to the right(50%) - from 0%
			left = ((1-now) * 50)+"%";
			//3. increase opacity of previous_fs to 1 as it moves in
			opacity = 1 - now;
			current_fs.css({'left': left});
			previous_fs.css({'transform': 'scale('+scale+')', 'opacity': opacity});
		}, 
		duration: 800, 
		complete: function(){
			current_fs.hide();
			animating = false;
		}, 
		//this comes from the custom easing plugin
		easing: 'easeInOutBack'
	});
});
