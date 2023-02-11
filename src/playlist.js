////////////////////////////////////////////

var gPlayer = null ;
var initPlayerFromUrl = function(url) {
	GreenAudioPlayer.stopOtherPlayers();
	if(gPlayer) gPlayer.setCurrentTime(0);

	$(".row").removeClass("onair");
	$(".row i").removeClass("fa-spin");

	$(".player").remove();
	var pp =$('<div class="player stickbottom"><audio><source src="'+url+'" type="audio/mpeg"></audio></div>');
	$(".container").append(pp)
	gPlayer = new GreenAudioPlayer(".player", {"autoplay":true});
	gPlayer.togglePlay();
};

window.addEventListener('load', function() { 

	console.log("welcome");

	$.ajax({
		url: "src/playlist.csv",
		async: false,
		success: function (csvd) {
			data = $.csv.toObjects(csvd);
		},
		dataType: "text",
		complete: function () {
	    	console.log("jdata",data);
	    	var p = $('#playlist');
	    	data.forEach(function(d,i) {

	    		//console.log(d,i);

	    		var box = $('<div class="row"></div>');
	    		box.attr("scan",d.name+" "+d.descr);
				var na = $('<div class="detail name"</div>').text(d.name);
	        	var ic = $('<div class="detail icon"><i class="fa fa-fw fa-'+d.icon+'"></i></div>');
				var de = $('<div class="detail descr"</div>').text(d.descr);

				var rad = Math.floor(35*Math.random());
				var n = 77 + i%15;
				var svg = "svg/p"+n+".svg";
				ic.attr({
					link: d.link,
					style: "background-image:url("+svg+"); border-radius:"+rad+"px;"
				});

				box.append(ic);
				box.append(na);
				box.append(de);
				p.append(box);

				ic.on('click', function() {

					/////////////// PLAY
					var url = "files/" + $(this).attr("link");
					console.log("clicked:",url);
					initPlayerFromUrl(url);
					$(this).parent().addClass("onair");

				});

			});

	    	$(".name").fitText();

	    	initPlayerFromUrl("");

	    	// live radio
	    	$('.logo').on('click', function() {
	    		initPlayerFromUrl("http://stream.zeno.fm/kl8i0p0gju4vv");
			});
			
	    	// search box filtering podcasts
			$('#search').on('input', function() {
				var s = $(this).val();
				console.log(s);   
				$('.row').each(function(i, e) {
					if($(e).attr("scan").indexOf(s)>=0) $(e).show();
					else $(e).hide();
				});
			});

		}
	});

}, false);