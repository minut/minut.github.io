////////////////////////////////////////////
//var urlfetchcsv = "https://ethercalc.net/_/points/csv";
//var urlfetchcsv = "https://lite.framacalc.org/_/f5mtflxh78-9zbr/csv";
var urlfetchcsv = "src/almapalma.csv";
var urlpostline = "https://ethercalc.net/_/points";
//var urlpostline = "https://lite.framacalc.org/_/alma-9zin";

var gPlayer = null ;
var map = null;
var layergr = null;
var puerta = false;
var puertacount = 1;
var playlistTotal = 0;
var playlistCurrent = 0;

var localMarkers = [];
var audioMarkers = [];
var cursor = 0;
////////////////////////////////////////////
// we will parse text based on keys
var tagskeys = {
	//"Q":["Que ?","question-circle",0],
	//"D":["desconociDo","compass.sun-o",0],
	"E":["eventos","calendar-o.clock-o",0],
	"I":["fincas","podcast.home.street-view",0],
	"M":["transporte","truck.car.bus.thumbs-o-up",0],
	"S":["cosas","wrench.recycle.suitcase.pie-chart",0],
	"C":["comida","pie-chart.lemon-o.shopping-basket.calculator",0],
	"N":["naturaleza","pagelines",0],
	"A":["creacion","music.headphones.eye",0],
	"D":["debate","commenting.stack-exchange.dot-circle-o.bolt.exclamation-circle.remove.spinner.cogs",0],
	"O":["ofresco","heart.hand-paper-o.gift.smile-o",0],
	"B":["busco","life-ring.meh-o.frown-o.search.heart-o.heartbeat",0]
};
////////////////////////////////////////////
var buildMarkerClass = function(d,more) {
	var classtags = "tagged-"+d.tags.split("").join(" tagged-");
	return classtags+' pt '+more;
};
var getTagIcon = function(d) {
	var icfa = "dot-circle-o"; // default if tag not recognized
	if(tagskeys.hasOwnProperty(d.tags[0]))
		icfa = tagskeys[d.tags[0]][1].split(".")[0];
	return icfa;
};
var buildMarkerHtml = function(d) {
	var icfa = "dot-circle-o"; // default if tag not recognized
	if(tagskeys.hasOwnProperty(d.tags[0])) {
		icfa = tagskeys[d.tags[0]][1].split(".")[0];
		tagskeys[d.tags[0]][2]++;
	}
	var spl = d.text.split(" ");
	var txtshort = spl.slice(0,1).join(" ");
	var txtlong = spl.slice(1).join(" ");
	var exp = /(\b(https?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    txtlong = txtlong.replace(exp,"<a target='_blank' href='$1'>$1</a>"); 
	// O simple icon
	var ihtml = '<i class="fa fa-'+icfa+'"></i> ';
	var arrow = '<div class="tri"></div>';

	txtshort = ' <span class="tit">'+txtshort+'</span>';
	txtlong = ' <span class="more">'+txtlong+'</span>';
	// O button icon for audio play
	if(d.file) {
		ihtml = '<button audio="'+d.file+'">'+ihtml+'</button> <span class="dur">'+d.dur+'min</span> ';
	}
	return '<div>'+arrow+ihtml+txtshort+txtlong+'</div>';
};
////////////////////////////////////////////
const group = L.inflatableMarkersGroup({
	iconCreateFunction: function (icon) {
		return L.divIcon({
			html: buildMarkerHtml(icon.baseMarker.options.myData),
			iconSize:[30,30], // this value is necessary for this plugin
			iconAnchor:[-1,19],
			className: buildMarkerClass(icon.baseMarker.options.myData,"deflated")
		});
	}
});
////////////////////////////////////////////
var initPlayerFromUrl = function(url,islive) {
	$(".brut").removeClass("vivo");
	if(url) {
		if(!url.startsWith("http")) {
			url = "files/"+url+".mp3";
			$(".bmap").addClass("vivo");
		} else {
			$(".blive").addClass("vivo");
		}
	}

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

	$("#audioname").html(url);

	$(".player audio").on("ended", function() {
		console.log("nextsong:",cursor);
		cursor = (cursor+1)%audioMarkers.length;
		var nextf = audioMarkers[cursor];
		initPlayerFromUrl(nextf);
	});

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
	// $.ajax({
	// 	type: 'POST',
	// 	url: urlpostline,
	// 	dataType: 'application/json',
	// 	contentType: 'text/csv',
	// 	processData: false,
	// 	data: tronco
	// }).fail(function() {
	// 	//alert("error");
	// });

	// $.ajax({
	// 	type: 'POST',
	// 	url: 'https://eu-central-1.aws.data.mongodb-api.com/app/data-fzstk/endpoint/data/v1/action/insertOne',
	// 	dataType: 'application/json',
	// 	contentType: 'application/json',
	// 	headers: {
	// 		'Origin': "37.168.36.249",
	// 		'Content-Type': 'application/json',
	// 		'Access-Control-Request-Headers': '*',
	// 		'Access-Control-Allow-Origin': '*',
	// 		'api-key': 'gQ07NNfWK623fN5qm2iz9dK51TQYPRmHG9CSJjwrlJRtuloJBvC5Jleuzc4lhXwA'
	// 	},
	// 	data: {
	// 		"dataSource": "ClusterMong",
	// 		"database": "db_alma",
	// 		"collection": "radio",
	// 		"document": {
	// 			"lat": lat,
	// 			"lng": lng,
	// 			"tags": tgs,
	// 			"text": text,
	// 			"date": "23.02.25"
	// 		}
	// 	},
	// 	success: function(r) {
	// 		console.log("POST",r);
	// 	}
	// });
};

////////////////////////////////////////////
var refreshAudioButtons = function() {
	setTimeout(function func() {
		console.log("plugging buttons");
		$('.pt.inflated button').on('click', function() {
			console.log("clicked:",$(this));
			var aud = $(this).attr("audio");
			if(aud.startsWith("http")) // live stream
				initPlayerFromUrl(aud,true);
			else // local file
				initPlayerFromUrl(aud);
			$(this).parent().parent().addClass("onair");
			event.stopPropagation();
		});
	}, 500);
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
			if(v.options.myData.tags.indexOf(currentTag)!=-1) {
				group.addLayer(v);
				//console.log("adding:",v);
			}
		})
	}
	group._zoomend();
	refreshAudioButtons();
};
////////////////////////////////////////////
var instantiateTodo = function() {
	
	buildMap();

	var myLayerGroup = new L.LayerGroup();

	// MAKE TAGS BAR
	$.map(tagskeys, function(v,k){
		var ic = v[1].split(".")[0];
		var tag = $('<div tag="'+k+'" class="tag hint--bottom" data-hint="'+v[0]+'"><i class="fa fa-fw fa-'+ic+'"></i></div>');
		tag.on('click', function() {
			toggleTag($(this));
		});
		$('.tags').append(tag);
	});
	var ic = 0;
	data.forEach(function(d,i) {
		//console.log("adding:",d,i);
		if(!d.lat) {
			var ang = ((ic++)%50)*360;
			var rad = 0.18+0.3*Math.random();
			d.lat = 28.7+rad*Math.cos(ang);
			d.lng = -17.90+rad*Math.sin(ang);
		} else {
			d.lat = +d.lat;
			d.lng = +d.lng;
		}
		const marker = L.marker([d.lat,d.lng], {
			//title: d.text,
			myData: d,
			icon: L.divIcon({
				html: buildMarkerHtml(d),
				iconSize:[130,30], // this value is necessary for this plugin
				iconAnchor:[-1,19],
				className: buildMarkerClass(d,"inflated"),
			}),
		});
		const smarker = L.marker([d.lat,d.lng], {
			title: d.text,
			tagicon: getTagIcon(d),
			icon: L.divIcon({className: "hide"})
		});
        //console.log(marker);
        //marker.feature = {'title':d.text};
        myLayerGroup.addLayer(smarker);
        localMarkers.push(marker);
        if(d.file)
        	audioMarkers.push(d.file);
		group.addLayer(marker);

		marker.on("click", function(e){
			var cluster = $(e.sourceTarget._icon).hasClass("deflated");
			if(cluster) // we zoom in
				map.setZoomAround(e.latlng,map.getZoom()+1);
			else // we toggle open
				$(e.sourceTarget._icon).toggleClass("opened");
		});


	});

	//myLayerGroup.addTo(map);
	group.addTo(map);

	//$(".name").fitText();

	initPlayerFromUrl("");
	$(".controls").hide();
	$(".loading").hide();

	// stats for tag bar
	$('.tag').each(function(e) {
		var t = $(this).attr("tag");
		$(this).append($('<span class="stat hide">'+tagskeys[t][2]+'</span>'));
	})

	/////////////////////// EVENTs
	// search filtering
	$('#search').on('submit', function() {
		var s = $(this).val();
		console.log(s);   
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

	refreshAudioButtons();

	//https://github.com/stefanocudini/leaflet-search
	var searchControl = L.control.search({
		layer: myLayerGroup,
		propertyName: 'title',
		initial: false, // search not only start of strings
		zoom: 14,
		textPlaceholder: "busca... (espacio para ver todo)",
		autoResize: false,
		hideMarkerOnCollapse: true,
		buildTip: function(text, val) {
			var ic = '<i class="fa fa-fw fa-'+val.layer.options.tagicon+'"></i> '
			return '<div>'+ic+val.layer.options.title+'</div>';
		},
		marker: { // custom L.Marker or false for hide
			icon: false, // custom L.Icon for maker location or false for hide
			animate: false, // animate a circle over location found
			circle: { // draw a circle in location found
				radius: 10,
				weight: 2,
				color: '#e03',
				stroke: true,
				fill: true
			}
		}
	});
	searchControl.addTo(map);

	console.log("BRAVO ! TODO EN CALMA.")
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
	var corner1 = L.latLng(27.671,-18.855),
	corner2 = L.latLng(29.671,-16.855),
	maxbounds = L.latLngBounds(corner1, corner2);
	map = L.map('map',{
		zoomControl: false, // we add manually
        scrollWheelZoom: true,
        doubleClickZoom: false,
        center: [28.671,-17.855],
        zoom: 9,
        minZoom: 8,
        maxZoom: 17,
        locateButton: true,
        layers: [CartoDB_PositronNoLabels],
        maxBounds: maxbounds
	});
	var tileLayers = {
		// "Stadia_AlidadeSmooth": Stadia_AlidadeSmooth,
		// "Stadia_AlidadeSmoothDark": Stadia_AlidadeSmoothDark,
		"caminar (OpenTopo)": OpenTopoMap,
		"caminar (ThunderF)": Thunderforest_Outdoors,
		// "Thunderforest_Pioneer": Thunderforest_Pioneer,
		"caminar (CyclOSM)": CyclOSM,
		// "CartoDB_Positron": CartoDB_Positron,
		"papel": CartoDB_PositronNoLabels,
		"photo": Esri_WorldImagery,
	};
	
	L.control.zoom({position: 'topright'}).addTo(map);
	
	var layerControl = L.control.layers(tileLayers, null, {position: 'topright'});
	layerControl.addTo(map);

	map.on('click', function(e) {
		var gps = e.latlng.lat.toFixed(4)+','+e.latlng.lng.toFixed(4);
		console.log(""+gps);
		// close all popups
		$(".opened").removeClass("opened");
	});
	map.on('zoomend', function(e) {
		refreshAudioButtons();
	});
};
////////////////////////////////////////////
window.addEventListener('load', function() { 

	console.log("welcome home.");

	// splash about screen
	$.get("README.md", function(data) {
		$(".about .introduction").html(marked.parse(data));
		$(".about a").attr("target", "_blank");
	});
	// $(".cc").on('click', function(e) {
	// 	puertacount++;
	// 	if(puertacount>7)
	// 		puerta = true;
	// });
	$(".about").on('click', function(e) {
		//if(puerta) $(".about").hide();
		$(".about").hide();
	});
	$(".babout").on('click', function(e) {
		$(".about").show();
		event.stopPropagation();
	});

	$(".blive").on('click', function(e) {
		$(".bmap").removeClass('vivo');
		$(".blive").addClass('vivo');
		initPlayerFromUrl("http://stream.zeno.fm/kl8i0p0gju4vv",true);
	});
	
	$(".bmap").on('click', function(e) {
		$(".blive").removeClass('vivo');
		$(".bmap").addClass('vivo');
		cursor = Math.floor(audioMarkers.length*Math.random());
		initPlayerFromUrl(audioMarkers[cursor]);
	});
	
	//$(".about").hide();

	$.ajax({
		url: urlfetchcsv,
		async: false,
		success: function(csvd) {
			data = $.csv.toObjects(csvd);
		},
		dataType: "text",
		complete: instantiateTodo
	});

}, false);


// $.ajax({
// 	crossDomain: true,
// 	type: 'POST',
// 	url: 'https://eu-central-1.aws.data.mongodb-api.com/app/data-fzstk/endpoint/data/v1/action/find',
// 	dataType: 'application/json',
// 	contentType: 'application/json',
// 	headers: {
// 		'Content-Type': 'application/json',
// 		'Access-Control-Request-Headers': '*',
// 		'Access-Control-Allow-Origin': '*',
// 		'api-key': 'EFGR1kttMZR54Zn26nzbFUxkj3BKGw2fQeNbhGrX4Fuo0sLt2qcL4iq0GwpwR0ky'
// 	},
// 	data: {
// 		"dataSource": "ClusterMong",
// 		"database": "db_alma",
// 		"collection": "radio",
// 		"filter": {
// 			//"status": "1",
// 		},
// 		//"sort": { "made": 'fromheart' },
// 		"limit": 40
// 	},
// 	success: function(r) {
// 		console.log('done:',r);	
// 	}
// });