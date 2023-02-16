////////////////////////////////////////////
var urlfetchcsv = "https://ethercalc.net/_/points/csv";
//var urlfetchcsv = "https://lite.framacalc.org/_/f5mtflxh78-9zbr/csv";
//var urlfetchcsv = "src/points.csv";

var urlpostline = "https://ethercalc.net/_/points";
//var urlpostline = "https://lite.framacalc.org/_/f5mtflxh78-9zbr";

var gPlayer = null ;
var map = null ;

const group = L.inflatableMarkersGroup({
	iconCreateFunction: function (icon) {
		const dat = icon.baseMarker.myData;
		return L.divIcon({
			html: '<div><i class="fa fa-asterisk"></i></div>',
			iconSize: [20,20],
			iconAnchor:[0,0],
			className: "pt deflated"
		});
	}
});

////////////////////////////////////////////
// we will parse text based on keys
var tagskeys = {
	"Q":["Que ?","question-circle",80],
	"E":["Encontrar","calendar-o.clock-o",79],
	"I":["fIncas","podcast.home.street-view",82],
	"C":["Comprar tiendas","shopping-basket.calculator",84],
	"A":["cuidAr plantas y animales","pagelines",89],
	"D":["desconociDo","compass.sun-o",87],
	"S":["Salvar cosas","recycle.suitcase.wrench.pie-chart",85],
	"T":["idea debaTir politica","commenting.stack-exchange.dot-circle-o.bolt.exclamation-circle.remove.spinner.cogs",86],
	"M":["viaje coMpartido","truck.car.bus.thumbs-o-up",77],
	"O":["sOñar","music.headphones.eye",89],
	"F":["oFresco","gift.smile-o.heart",83],
	"B":["Busco","life-ring.meh-o.frown-o.search.heart-o.heartbeat",78]
	};
////////////////////////////////////////////
var initPlayerFromUrl = function(url,islive) {
	GreenAudioPlayer.stopOtherPlayers();
	if(gPlayer) gPlayer.setCurrentTime(0);

	$(".row").removeClass("onair");
	$(".row i").removeClass("fa-spin");

	$(".player").remove();
	var pp =$('<div class="player"><audio><source src="'+url+'" type="audio/mpeg"></audio></div>');
	$(".container").append(pp)
	gPlayer = new GreenAudioPlayer(".player", {"autoplay":true});
	gPlayer.togglePlay();
	$(".control").show();

	if(islive)
		$(".logo").addClass("live");
	else
		$(".logo").removeClass("live");
};
////////////////////////////////////////////
var addNewPoint = function(text) {
	text = text.replace(/,/g, "");
	var tg = text.slice(0,1);
	if(tagskeys.hasOwnProperty(tg)) {
		text = text.slice(2,999);
	} else tg = "";
	var lat = map.getCenter().lat.toFixed(3);
	var lng = map.getCenter().lng.toFixed(3);
	var gps = '"'+lat+';'+lng+'"';
	var tronco = "1,"+gps+","+tg+","+text;
	$.ajax({
		type: 'POST',
		url: urlpostline,
		dataType: 'application/json',
		contentType: 'text/csv',
		processData: false,
		data: tronco
	});
};
////////////////////////////////////////////
var loadData = function () {

	// MAKE TAGS BAR
	$.map(tagskeys, function(v,k){
		var ic = v[1].split(".")[0];
		var tag = $('<div tag="'+k+'" class="tag hint--bottom" data-hint="'+v[0]+'"><i class="fa fa-fw fa-'+ic+'"></i></div>');
		
		tag.on('click', function() {
			var on = $(this).hasClass("on");
			$(".on").removeClass("on");
			$(".row").show();
			if(!on) {
				$(this).addClass("on");
				$(".row").hide();
				console.log($(this).attr("tag"));
				$(".tagged-"+$(this).attr("tag")).show();
			}
		});
		$('.tags').append(tag);
	});

	// LOAD LIST OF POINTS
	var p = $('#playlist');
	data.forEach(function(d,i) {
		//console.log("adding:",d,i);
		
		var icfa = "question-circle";
		var nsvg = 77 + i%15;
		if(tagskeys.hasOwnProperty(d.tags[0])) {
			icfa = tagskeys[d.tags[0]][1].split(".")[0];
			nsvg = tagskeys[d.tags[0]][2];
		}
		var spl = d.text.split(" ");
		var txtshort = spl.slice(0,2).join(" ");
		var txtlong = spl.slice(2,-1).join(" ");

		////////////////// CREATE PLAYLIST DIVs
		var ct = "tagged-"+d.tags.split("").join(" tagged-");
		var box = $('<div class="row '+ct+'"></div>');
		box.attr("scan",d.text);
		var na = $('<div class="detail name"></div>').text(txtshort);
    	var ic = $('<div class="detail icon"><i class="fa fa-fw fa-'+icfa+'"></i></div>');
		var de = $('<div class="detail descr"></div>').text(txtlong);

		var rad = Math.floor(35*Math.random());
		var svg = "svg/p"+nsvg+".svg";
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
		
		////////////////// CREATE MAP MARKERs
		var html = '<div><i class="fa fa-'+icfa+'"></i>'+txtshort+"<span>"+txtlong+'</span></div>';
		var gps = d.gps.split(";");
		if(!gps)
			gps = [Math.random(0)];
		const marker = L.marker(gps, {
			icon: L.divIcon({
				html: html,
				iconSize:[40,40], // this value is necessary for this plugin
				iconAnchor:[0,0],
				className:'pt inflated',
			})
		});
        marker.myData = d; // hijack the L.Layer object to pass data
		group.addLayer(marker);

		marker.on("click", function(e){
			$(e.sourceTarget._icon).toggleClass("pointed");
			// if cluster, zoom in
			var cluster = $(e.sourceTarget._icon).hasClass("deflated");
			if(cluster) {
				map.setZoomAround(e.latlng,map.getZoom()+1);
			}
		});
	});
	group.addTo(map);

	$(".name").fitText();

	initPlayerFromUrl("");
	$(".controls").hide();
	$(".loading").hide();

	/////////////////////// EVENTs
	// live radio
	$('.play').on('click', function() {
		initPlayerFromUrl("http://stream.zeno.fm/kl8i0p0gju4vv",true);
	});
	// search filtering
	$('#search').on('input', function() {
		var s = $(this).val();
		//console.log(s);   
		$('.row').each(function(i, e) {
			if($(e).attr("scan").indexOf(s)>=0) $(e).show();
			else $(e).hide();
		});
	});
	// add new point
	$('#submitnew').on('click', function() {
		var tt = $("#addnew").val();
		addNewPoint(tt);
		$("#addnew").val("");
	});
	// toggle view
	$("#toggleview").on('click', function() {
		$("#toggleview i").toggleClass("fa-list");
		$("#toggleview i").toggleClass("fa-map");
		$("#map").toggleClass("hide");
		$("#playlist").toggleClass("hide");
	});
	// toggle search / addnew
	$("#toggleinput").on('click', function() {
		$("#toggleinput").toggleClass("switched");
		$(".searcher").toggleClass("hide");
		$(".adder").toggleClass("hide");
	});

	$("#playlist").addClass("hide");
}
////////////////////////////////////////////
var buildMap = function() {
	var Thunderforest_Outdoors = L.tileLayer('https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey={apikey}', {
		attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		apikey: '873f0cdd6f464ad8b73afd4e1da1e53b',
		maxZoom: 22
	});
	var Thunderforest_Pioneer = L.tileLayer('https://{s}.tile.thunderforest.com/pioneer/{z}/{x}/{y}.png?apikey={apikey}', {
		attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		apikey: '873f0cdd6f464ad8b73afd4e1da1e53b',
		maxZoom: 22
	});
	var OpenTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
		maxZoom: 17,
		attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
	});
	var Stadia_AlidadeSmooth = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
		maxZoom: 20,
		attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
	});
	var Stadia_AlidadeSmoothDark = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
		maxZoom: 20,
		attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
	});
	var CyclOSM = L.tileLayer('https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', {
		maxZoom: 20,
		attribution: '<a href="https://github.com/cyclosm/cyclosm-cartocss-style/releases" title="CyclOSM - Open Bicycle render">CyclOSM</a> | Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
	});
	var CartoDB_PositronNoLabels = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
		subdomains: 'abcd',
		maxZoom: 20
	});
	map = L.map('map',{
		zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: false,
        center: [28.671,-17.855],
        zoom: 11,
        minZoom: 10,
        maxZoom: 15,
        locateButton: true,
        layers: [CartoDB_PositronNoLabels]
	});
	var tileLayers = {
		"Stadia_AlidadeSmooth": Stadia_AlidadeSmooth,
		"Stadia_AlidadeSmoothDark": Stadia_AlidadeSmoothDark,
		"OpenTopoMap": OpenTopoMap,
		"Thunderforest_Outdoors": Thunderforest_Outdoors,
		"Thunderforest_Pioneer": Thunderforest_Pioneer,
		"CyclOSM": CyclOSM,
		"CartoDB_PositronNoLabels": CartoDB_PositronNoLabels
	};
	var layerControl = L.control.layers(tileLayers, null, {position: 'topleft'});
	layerControl.addTo(map);

	map.on('click', function(e) {
		var gps = e.latlng.lat.toFixed(4)+";"+e.latlng.lng.toFixed(4);
		console.log(gps);
		// close all popups
		$(".pointed").removeClass("pointed");
	});
};
////////////////////////////////////////////
window.addEventListener('load', function() { 

	console.log("welcome");

	buildMap();

	$.ajax({
		url: urlfetchcsv,
		async: false,
		success: function (csvd) {
			data = $.csv.toObjects(csvd);
		},
		dataType: "text",
		complete: loadData
	});

}, false);