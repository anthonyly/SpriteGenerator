$(function() {
	// Handlebars templating
	var srcItem = $("#item-image-template").html(),
		tplItem = Handlebars.compile(srcItem);

	var	srcCssOutput = $("#css-output-template").html(),
		tplCssOutput = Handlebars.compile(srcCssOutput);

	// Callbacks options
	var SpriteGeneratorOptions = {
		onNewImageAdd : function(newImg, nbImages) {
			$('#list-images').append(tplItem(newImg));
			if(!$('.rock').length) {
				$('body').addClass('rock');
			}
		},
		onDeleteImage : function(deleteImage, nbImages) {
			$('#item-' + deleteImage.id).remove();
			if(nbImages == 0 && $('.rock').length) {
				$('body').removeClass('rock');
			}
		},
		getCssOutput : function(dataImages) {
			return tplCssOutput(dataImages);
		}
	};

	// The Sprite Generator
	var SG = new SpriteGenerator(SpriteGeneratorOptions);

	// Actions
	$('#btn-css').on('click', function() {
		SG.downloadCssByLink(this);
	});

	$('#btn-clean').on('click', function(e) {
		$('#list-images').empty();

		SG.clearCanvas();

		if($('.rock').length) {
			$('body').removeClass('rock');
		}
	});

	$('#btn-add-file').on('change', function() {
		SG.handleFiles(this.files);
	});

	$('#btn-save-sprite').on('click', function() {
		SG.downloadSpriteByLink(this);
	});

	// Drag and drop file
	$('body').on('drop', function (e){
	     e.preventDefault();
	     var files = e.originalEvent.dataTransfer.files;

	     SG.handleFiles(files);
	});

	$(document).on('dragenter dragover drop', function (e) {
	    e.stopPropagation();
	    e.preventDefault();
	});

	$('body').on('dragenter', function (e){
		e.stopPropagation();
	    e.preventDefault();
	    $('.canvas-container').addClass('dragenter');
	});

	$('body').on('dragleave drop', function (e){
	    $('.canvas-container').removeClass('dragenter');
	});

	$('body').on('dragover', function (e){
	    e.preventDefault();
	});

	// Display list images
	$('#list-images').on('click', '.delete-image', function(e) {
		e.preventDefault();
		var idImage = $(this).data('id');

		SG.deleteImageById(idImage);
	});

	$('#list-images').on('click', '.display-classname', function(e) {
		var $formClassname = $(this).siblings('.form-classname'),
			$inputClassname = $formClassname.find('input');
		$(this).hide();
		$formClassname.show()
		$inputClassname.select();
	});

	$('#list-images').on('submit', '.form-classname', function(e) {
		e.preventDefault();
		var $displayClassname = $(this).siblings('.display-classname'),
			$input = $(this).find('.input-classname'),
			newClassname = $input.val();
			idImage = $(this).data('id');
		if($.trim(newClassname).length == 0) return;
		var imageUpdated = SG.modifyClassenameById(idImage, newClassname);
		$input.val(imageUpdated.name);
		$displayClassname.text(cutString(imageUpdated.name));
		$(this).hide();
		$displayClassname.show();

	});

	function cutString(name) {
		return (name.length > 20) ? name.substr(0, 18) + '...' : name;
	};

	// Handlebars helpers
	Handlebars.registerHelper('cut', function(options) {
		var name = options.fn(this);
	  	return cutString(name);
	});
	Handlebars.registerHelper('cssZero', function(options) {
		var px = parseInt(options.fn(this), 10);
	  	return (px != 0) ? '-' + px : px;
	});
});