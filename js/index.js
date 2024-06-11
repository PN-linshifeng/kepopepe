var close = document.querySelector('.close');
var open = document.querySelector('.open');
var body = document.querySelector('body');
var a = document.querySelectorAll('.nav-box a');
close.addEventListener(
	'click',
	function () {
		body.classList.toggle('isOpen');
	},
	false
);
open.addEventListener(
	'click',
	function () {
		body.classList.toggle('isOpen');
	},
	false
);
a.forEach((e) => {
	e.addEventListener(
		'click',
		function () {
			body.classList.toggle('isOpen');
		},
		false
	);
});
var player = new SVGA.Player('#demoCanvas');
var parser = new SVGA.Parser('#demoCanvas'); // 如果你需要支持 IE6+，那么必须把同样的选择器传给 Parser。
parser.load('./image/eats2x.svga', function (videoItem) {
	player.setVideoItem(videoItem);
	player.startAnimation();
});

var cre = document.querySelector('#topLocale');
cre.addEventListener(
	'click',
	function () {
		document.querySelector('.locale').classList.toggle('open');
	},
	false
);
