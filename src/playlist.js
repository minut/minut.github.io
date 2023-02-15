////////////////////////////////////////////

var gPlayer = null ;
// we will parse text based on keys
var tagskeys = {
	"?":["compartido","question-circle"],
	"E":["encontrar eventos","calendar-o.clock-o"],
	"Y":["visitar fincas","podcast.home.street-view"],
	"C":["comprar tiendas","shopping-basket.calculator"],
	"A":["cuidar plantas y animales","pagelines"],
	"D":["descubrir tesoros","compass.sun-o"],
	"S":["salvar cosas","recycle.suitcase.wrench.pie-chart"],
	"T":["debatir idea politica","commenting.stack-exchange.dot-circle-o.bolt.exclamation-circle.remove.spinner.cogs"],
	"M":["mover viaje compartido","truck.car.bus.thumbs-o-up"],
	"O":["soñar musica","music.headphones.eye"],
	"R":["regalo doy","gift.smile-o.heart"],
	"B":["busco necesito","life-ring.meh-o.frown-o.search.heart-o.heartbeat"]
	};

var initPlayerFromUrl = function(url,islive) {
	GreenAudioPlayer.stopOtherPlayers();
	if(gPlayer) gPlayer.setCurrentTime(0);

	$(".row").removeClass("onair");
	$(".row i").removeClass("fa-spin");

	$(".player").remove();
	var pp =$('<div class="player stickbottom"><audio><source src="'+url+'" type="audio/mpeg"></audio></div>');
	$(".container").append(pp)
	gPlayer = new GreenAudioPlayer(".player", {"autoplay":true});
	gPlayer.togglePlay();
	$(".control").show();

	if(islive)
		$(".logo").addClass("live");
	else
		$(".logo").removeClass("live");
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

			$.map(tagskeys, function(v,k){
				var ic = v[1].split(".")[0];
				var tag = $('<div class="tag hint--bottom" data-hint="'+v[0]+'"><i class="fa fa-fw fa-'+ic+'"></i></div>');
				
				tag.on('click', function() {
					$(this).toggleClass("on");
				});
				$('.tags').append(tag);
			});

	    	var p = $('#playlist');
	    	data.forEach(function(d,i) {

	    		//console.log(d,i);

	    		var box = $('<div class="row"></div>');
	    		box.attr("scan",d.name+" "+d.descr);
				var na = $('<div class="detail name"</div>').text(d.name);
	        	var ic = $('<div class="detail icon"><i class="fa fa-fw fa-'+d.icon+'"></i></div>');
				var de = $('<div class="detail descr"</div>').text(d.descr);

				var rad = Math.floor(35*Math.random());
				rad = 15;
				var n = 77 + i%15;
				if(d.pattern)
					n = d.pattern;
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
					var url = "files/"+$(this).attr("link")+".mp3";
					//console.log("clicked:",url);
					initPlayerFromUrl(url);
					$(this).parent().addClass("onair");

				});

			});

	    	$(".name").fitText();

	    	initPlayerFromUrl("");
	    	$(".controls").hide();
	    	$(".loading").hide();

	    	// live radio
	    	$('.play').on('click', function() {
	    		initPlayerFromUrl("http://stream.zeno.fm/kl8i0p0gju4vv",true);
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