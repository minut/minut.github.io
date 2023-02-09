////////////////////////////////////////////

// GreenAudioPlayer.init({
//     selector: '.player', // inits Green Audio Player on each audio container that has class "player"
// 	stopOthersOnPlay: true
// });

////////////////////////////////////////////

window.addEventListener('load', function() { 

	console.log("welcome");

	$.ajax({
	url: "playlist.csv",
	async: false,
	success: function (csvd) {
		data = $.csv.toObjects(csvd);
	},
	dataType: "text",
	complete: function () {
    	console.log("jdata",data);
    	var p = $('#playlist');
    	data.forEach(function(d) {

    		var box = $('<div class="brox"></div>');
    		box.attr("scan",d.name+" "+d.descr);
			var na = $('<div class="detail name"</div>').text(d.name);
			var pl = $('<div class="player"><audio crossorigin><source src="'+d.link+'" type="audio/mpeg"></audio></div>');
        	var ic = $('<i class="detail fa fa-fw fa-'+d.icon+'"</i>');
			ic.attr("link",d.link);
			var de = $('<div class="detail descr"</div>').text(d.descr);
			

			box.append(pl);
			box.append(ic);
			box.append(na);
			box.append(de);
			p.append(box);

			ic.on('click', function() {
				var url = $(this).attr("link");
			});

			// $.ajax({
			// 	url: "svg/10.svg",
			// 	async: false,
			// 	dataType: "text",
			// 	complete: function () {

			// 	});

		});

		GreenAudioPlayer.init({
			selector: '.player',
			stopOthersOnPlay: true
		});

		$('#filter').on('input', function() {
			var s = $(this).val();
			console.log(s);   
			$('.brox').each(function(i, e) {
				if($(e).attr("scan").indexOf(s)>=0) $(e).show();
				else $(e).hide();
			});
		});
	}
});

}, false);