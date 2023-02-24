////////////////////////////////////////////
//var urlfetchcsv = "https://ethercalc.net/_/points/csv";
//var urlfetchcsv = "https://lite.framacalc.org/_/f5mtflxh78-9zbr/csv";
var urlfetchcsv = "src/points.csv";
var urlpostline = "https://ethercalc.net/_/points";
//var urlpostline = "https://lite.framacalc.org/_/f5mtflxh78-9zbr";

var gPlayer = null ;
var map = null ;
var scount = 0;
////////////////////////////////////////////
// we will parse text based on keys
var tagskeys = {
	//"Q":["Que ?","question-circle",80,0],
	"E":["Encontrar","calendar-o.clock-o",79,0],
	"I":["fIncas","podcast.home.street-view",82,0],
	"M":["Mover","truck.car.bus.thumbs-o-up",77,0],
	"C":["Comprar","shopping-basket.calculator",84,0],
	"S":["Salvar","recycle.suitcase.wrench.pie-chart",85,0],
	"A":["plAntas y animales","pagelines",89,0],
	//"D":["desconociDo","compass.sun-o",87,0],
	"T":["debaTir idea","commenting.stack-exchange.dot-circle-o.bolt.exclamation-circle.remove.spinner.cogs",86,0],
	"O":["sOñar","music.headphones.eye",89,0],
	"F":["oFresco","heart.hand-paper-o.gift.smile-o",83,0],
	"B":["Busco","life-ring.meh-o.frown-o.search.heart-o.heartbeat",78,0]
	};
////////////////////////////////////////////
var buildMarkerClass = function(d,more) {
	var classtags = "tagged-"+d.tags.split("").join(" tagged-");
	return classtags+' pt '+more;
}
var buildMarkerHtml = function(d) {
		var icfa = "dot-circle-o"; // default if tag not recognized
		if(tagskeys.hasOwnProperty(d.tags[0])) {
			icfa = tagskeys[d.tags[0]][1].split(".")[0];
			//var nsvg = 77 + i%15;
			//nsvg = tagskeys[d.tags[0]][2];
			//svg = "svg/p"+nsvg+".svg"; // "background-image:url("+svg+");
			// keep total for each tag
			tagskeys[d.tags[0]][3]++;
		}
		var spl = d.text.split(" ");
		var txtshort = spl.slice(0,1).join(" ");
		var txtlong = spl.slice(1).join(" ");
		// O simple icon
		var ihtml = '<i class="fa fa-'+icfa+'"></i> ';
		// O button icon for audio play
		if(d.link)
			ihtml = '<button audio="'+d.link+'">'+ihtml+'</button> ';

		return '<div>'+ihtml+txtshort+' <span class="more">'+txtlong+'</span></div>';
};

const group = L.inflatableMarkersGroup({
	iconCreateFunction: function (icon) {
		return L.divIcon({
			html: buildMarkerHtml(icon.baseMarker.myData),
			iconSize: [20,20],
			iconAnchor:[0,0],
			className: buildMarkerClass(icon.baseMarker.myData,"deflated")
		});
	}
});
////////////////////////////////////////////
var initPlayerFromUrl = function(url,islive) {
	console.log("startplayer:",url);
	GreenAudioPlayer.stopOtherPlayers();
	if(gPlayer) gPlayer.setCurrentTime(0);

	$(".pt").removeClass("onair");
	$(".pt i").removeClass("fa-spin");

	$(".player").remove();
	var pp =$('<div class="player"><audio><source src="'+url+'" type="audio/mpeg"></audio></div>');
	$(".container").append(pp)
	gPlayer = new GreenAudioPlayer(".player", {"autoplay":true});
	gPlayer.togglePlay();
	$(".control").show();

	if(islive)
		$(".playstream").addClass("live");
	else
		$(".playstream").removeClass("live");
};
////////////////////////////////////////////
var addNewPoint = function(text) {
	text = text.replace(/,/g, "");
	var tgs = text.match(/^[A-Z]* /g);
	if(tgs) tgs = tgs[0].trim();
	else tgs = "";
	if(tgs && tagskeys.hasOwnProperty(tgs[0])) {
		text = text.replace(tgs,"");
	};
	var lat = map.getCenter().lat.toFixed(3);
	var lng = map.getCenter().lng.toFixed(3);
	var tronco = "230218,1,"+lat+","+lng+","+tgs+","+text;
	$.ajax({
		type: 'POST',
		url: urlpostline,
		dataType: 'application/json',
		contentType: 'text/csv',
		processData: false,
		data: tronco
	}).fail(function() {
		//alert("error");
	});
};
////////////////////////////////////////////
var toggleTag = function(tagelem) {
	var on = tagelem.hasClass("on");
	$(".on").removeClass("on");
	$(".row").show();
	if(on) { // show all, mmmh
		$.each(localMarkers,function(k,v) {
			group.removeLayer(v);
			group.addLayer(v);
		});
	};
	if(!on) { // activate single tag
		var currentTag = tagelem.attr("tag");
		tagelem.addClass("on");
		$(".row").hide();
		$(".tagged-"+currentTag).show();
		$.each(localMarkers,function(k,v) {
			//console.log(v);
			group.removeLayer(v);
			// only publish those having current tag
			if(v.myData.tags.indexOf(currentTag)!=-1) {
				group.addLayer(v);
				//console.log("adding:",v);
			}
		})
	}
	group._zoomend();

	// clicks for radio play, mmmhn agian ?
	$('.pt button').on('click', function() {
		console.log("clicked:",$(this));
		initPlayerFromUrl("files/"+$(this).attr("audio")+".mp3");
		$(this).parent().parent().addClass("onair");
	});
};
////////////////////////////////////////////
var localMarkers = [];
var loadData = function() {
	
	// MAKE TAGS BAR
	$.map(tagskeys, function(v,k){
		var ic = v[1].split(".")[0];
		var tag = $('<div tag="'+k+'" class="tag hint--bottom" data-hint="'+v[0]+'"><i class="fa fa-fw fa-'+ic+'"></i></div>');
		tag.on('click', function() {
			toggleTag($(this));
		});
		$('.tags').append(tag);
	});

	data.forEach(function(d,i) {
		//console.log("adding:",d,i);
		if(!d.lat) {
			d.lat = 28.65+0.01*Math.random();
			d.lng = -17.83+0.01*Math.random();
		} else {
			d.lat = +d.lat;
			d.lng = +d.lng;
		}
		const marker = L.marker([d.lat,d.lng], {
			icon: L.divIcon({
				html: buildMarkerHtml(d),
				iconSize:[40,40], // this value is necessary for this plugin
				iconAnchor:[0,0],
				className: buildMarkerClass(d,"inflated"),
			})
		});
        marker.myData = d; // hijack the L.Layer object to pass data
        localMarkers.push(marker);
		group.addLayer(marker);
		marker.on("click", function(e){
			var cluster = $(e.sourceTarget._icon).hasClass("deflated");
			if(cluster) // we zoom in
				map.setZoomAround(e.latlng,map.getZoom()+1);
			else // we toggle open
				$(e.sourceTarget._icon).toggleClass("opened");
		});
	});

	group.addTo(map);

	//$(".name").fitText();

	initPlayerFromUrl("");
	$(".controls").hide();
	$(".loading").hide();

	// stats for tag bar
	$('.tag').each(function(e) {
		var t = $(this).attr("tag");
		$(this).append($('<span class="stat">'+tagskeys[t][3]+'</span>'));
	})
	
	// clicks for radio play
	$('.pt button').on('click', function() {
		console.log("clicked:",$(this));
		initPlayerFromUrl("files/"+$(this).attr("audio")+".mp3");
		$(this).parent().parent().addClass("onair");
	});

	/////////////////////// EVENTs
	// live radio
	$('.playstream').on('click', function() {
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

	// toggle search / addnew
	$("#toggleinput").on('click', function() {
		$("#toggleinput").toggleClass("switched");
		$(".searcher").toggleClass("hide");
		$(".adder").toggleClass("hide");
	});
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
	var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
		attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
	});
	var CartoDB_Positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
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
        maxZoom: 17,
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
		"CartoDB_PositronNoLabels": CartoDB_PositronNoLabels,
		"Esri_WorldImagery": Esri_WorldImagery,
		"CartoDB_Positron": CartoDB_Positron
	};
	var layerControl = L.control.layers(tileLayers, null, {position: 'topleft'});
	layerControl.addTo(map);

	map.on('click', function(e) {
		var gps = e.latlng.lat.toFixed(4)+","+e.latlng.lng.toFixed(4);
		console.log("230223,1,"+gps+",,");
		// close all popups
		$(".opened").removeClass("opened");
	});
	map.on('zoomend', function(e) {

	});
};
////////////////////////////////////////////
window.addEventListener('load', function() { 

	console.log("welcome home.");

	// splash about screen
	$.get("README.md", function(data) {
		$(".about .introduction").html(marked.parse(data));
	});
	$(".about").on('click', function(e) {
		$(".about").hide();
	});
	$(".about i.fa-close").on('click', function(e) {
		$(".about").hide();
	});
	$(".toglabout").on('click', function(e) {
		$(".about").show();
	});
	$(".about").hide();

	// $(".toglview").hide();
	// $(".hleft").on('click', function(e) {
	// 	scount+=1;
	// 	if(scount>3)
	// 		$(".toglview").show();
	// });
	
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