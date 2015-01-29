/*
* Sprite generator | spritegenerator.net
* Generate sprite canvas to png image
* v1.0
* ---
* @author: Anthony Ly
* @authorurl: http://anthonyly.com
* @twitter: http://twitter.com/pik_at
* ---
* Dependencies : jQuery, Underscore.js
* ---
* Licence: MIT
*/
var SpriteGeneratorDefaults = {
	filename : 'sprite',
	classname : 'sprite',
	canvasId : 'sprite-generator',
	wCanvas : 500,
	hCanvas : 500,

	// Callbacks
	onNewImageAdd : function(newImg, nbImages) {},
	onDeleteImage : function(deleteImage, nbImages) {},
	getCssOutput : function(dataImages) {
		/*
		dataImages = {
			classname,
			filename,
			images : [
				image1, image2, ...
			]
		}
		return cssTextOutput;
		*/
	}
};

// Constructor
var SpriteGenerator =  function(options){
	var _this = this;
	this.checkSupportBrowserAPI();
	this.settings = $.extend({}, SpriteGeneratorDefaults, options);
	this.canvas = document.getElementById(this.settings.canvasId);
	this.context = this.canvas.getContext('2d');
	this.images = [];

	if(!this.canvas.hasOwnProperty('width')) { this.context.canvas.width = this.settings.wCanvas; }
	if(!this.canvas.hasOwnProperty('height')) { this.context.canvas.height = this.settings.hCanvas; }

	return this;
};

SpriteGenerator.prototype.checkSupportBrowserAPI = function() {
	if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
	  	alert('The File APIs are not fully supported in this browser.');
	}
	var canvasCheck = document.createElement('canvas');
  	if(!(canvasCheck.getContext && canvasCheck.getContext('2d'))) {
  		alert('Your browser doesnt support HTML 5 canvas.');
  	}
};

SpriteGenerator.prototype.handleFiles = function(files) {
	var _this = this;
	_.each(files, function(file) {
		if(!file.type.match(/image.*/)){
			alert(file.name + " is not an image.");
		} else {
			_this.readImage(file);
		}
	});
};

SpriteGenerator.prototype.readImage = function(file) {
    var _this = this,
    	classname = this.generateClassname(file.name, true),
    	reader = new FileReader(),
    	image  = new Image();

    reader.readAsDataURL(file);
    reader.onload = function(_file) {
        image.src = _file.target.result;
        image.onload = function() {
            var newImg = _this.createImage(this, classname);
            _this.images.push(newImg);
            _this.settings.onNewImageAdd(newImg, _this.images.length);
			_this.context.drawImage(newImg.img, newImg.x, newImg.y, newImg.w, newImg.h);
        };
    };

};

SpriteGenerator.prototype.createImage = function(img, classname) {
	this.checkCanvasSizeByImageSize(img.width, img.height);
	var idImg = this.uniqId(),
		pos = this.positionImage(img.width, img.height);

	return {id : idImg, name: classname, img : img, x : pos.x, y: pos.y, w : img.width, h: img.height};
};

SpriteGenerator.prototype.checkCanvasSizeByImageSize = function(w, h) {
	var wNew = this.context.canvas.width,
		hNew = this.context.canvas.height;

	// Check image larger by canvas
	if(w > this.context.canvas.width) {
		wNew = w;
	}

	if(this.images.length > 1) {
		var botImage = _.max(this.images, function(image) { return (image.h + image.y);}),
			newBotMax = botImage.h + botImage.y + h;
		if(newBotMax > this.context.canvas.height) {
			hNew = newBotMax;
		}
	} else if(h > this.context.canvas.height) {
		hNew = h;
	}

	if(wNew != this.context.canvas.width || hNew != this.context.canvas.height) {
		this.resizeCanvas(wNew, hNew);
	}
};

SpriteGenerator.prototype.positionImage = function(w, h) {
	var positionFind = true,
		GhostImg = {
			w : w,
			h : h,
			x : 0,
			y : 0
		};
	// Find the best emplacement from top - left to bottom - right
	for(var y = 0; y < this.context.canvas.height; y++) {
		GhostImg.y = y;
		for(var x = 0; x < this.context.canvas.width - w; x++) {
			GhostImg.x = x;
			positionFind = true;
			for(var i = 0; i < this.images.length; i++) {
				if(this.intersects(this.images[i], GhostImg)) {
					positionFind = false;
				}
			}
			if(positionFind) {break;}
		}
		if(positionFind) {break;}
	}

	GhostImg = (positionFind) ? GhostImg : false;

	return GhostImg;
};

SpriteGenerator.prototype.resetPosition = function() {
	var _this = this;
	_.each(this.images, function(image) {
		image.x = 0;
		image.y = 0;
	});
	if(this.images.length > 1) {
		_.each(this.images, function(image, index) {
			if(index != 0) {
				var pos = _this.positionImage(image.w, image.h);
				image.x = pos.x;
				image.y = pos.y;
			}
		});
	}
};

SpriteGenerator.prototype.deleteImageById = function(idImage) {
	var _this = this,
		deleteImage = _.findWhere(this.images, { id : idImage });
		console.log(deleteImage)
	this.images = _.reject(this.images, function(image){ return image.id == idImage; });
	this.settings.onDeleteImage(deleteImage, this.images.length);
	this.clearAndDraw();
	return idImage;
};

SpriteGenerator.prototype.modifyClassenameById = function(idImage, newClassname) {
	var image = _.findWhere(this.images, { id : idImage });
	console.log(newClassname)
	image.name = this.generateClassname(newClassname);
	return image;
};

SpriteGenerator.prototype.clearAndDraw = function() {
	var _this = this;
	this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
	this.resetPosition();
	_.each(this.images, function(image) {
		_this.context.drawImage(image.img, image.x, image.y, image.w, image.h);
	});
};

SpriteGenerator.prototype.resizeCanvas = function(w, h) {
	this.context.canvas.width = w;
	this.context.canvas.height = h;
	this.clearAndDraw();
};

SpriteGenerator.prototype.clearCanvas = function() {
	this.context.clearRect(0, 0, this.settings.wCanvas, this.settings.hCanvas);
	this.images = [];
	this.settings.onDeleteImage(this.images.length);
};

// Downloads
SpriteGenerator.prototype.downloadSpriteByLink = function(link) {
	// Cropping image
	var imageRight  = _.max(this.images, function(image) { return image.x + image.w; }),
		rCanvas = imageRight.x + imageRight.w;
		imageBot  = _.max(this.images, function(image) { return image.y + image.h; }),
		bCanvas = imageBot.y + imageBot.h,
		dlCanvas = document.createElement("canvas"),
        dlContext = dlCanvas.getContext("2d");

    dlCanvas.width = rCanvas;
    dlCanvas.height = bCanvas;
    dlContext.drawImage(this.canvas,0,0);
    // Generate file
	var dlDataURL = dlCanvas.toDataURL('image/png');
	dlDataURL.replace(/^data:image\/[^;]/, 'data:application/octet-stream');
	$(link).prop('href', dlDataURL);
	$(link).prop('download', this.settings.filename + '.png');
};

SpriteGenerator.prototype.downloadCssByLink = function(link) {
	var _this = this,
		dataCss = {
			classname : _this.settings.classname,
			filename : _this.settings.filename,
			images : _this.images
		};
	// Output text return by app
	var cssOutput = this.settings.getCssOutput(dataCss);

	$(link).prop('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(cssOutput));
  	$(link).prop('download', this.settings.filename + '.css');
};

SpriteGenerator.prototype.getImagesLength = function() {
	return this.images.length;
}

// Helpers
SpriteGenerator.prototype.uniqId = function() {
	return (new Date().getTime() + Math.floor((Math.random()*10000)+1)).toString(16);
};

SpriteGenerator.prototype.generateClassname = function(filename, removeExt) {
	if(removeExt) filename = filename.replace(/.[^.]+$/,'');
    return filename
    			.replace(/ /g,'-')
    			.replace(/\./g,'-');
};

SpriteGenerator.prototype.intersects = function(a, b) {
   return !(
    	((a.y + a.h) < (b.y)) ||
    	(a.y > (b.y + b.h)) ||
    	((a.x + a.w) < b.x) ||
    	(a.x > (b.x + b.w))
   	);
};