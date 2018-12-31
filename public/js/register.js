console.log('linked');

fieldsApp = new Vue({
	el: '#app-1',
	data:{
		message:"hello there"
	}
});

$(document).ready(() =>{

	//Populate universities select
	$.getJSON('/assets/universities.json', (data) =>{
		for (i = 0; i < data.length; i++){
			var option = new Option(data[i]['institution'], data[i]['institution'], false, false);
			$('#school').append(option);
		}
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


console.log('hah');