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
const API_KEY='c89W7nkX8C7Mk9HZ0zNj';
var bounds = [
    [-18.855,27.671], // Southwest coordinates
    [-16.855,29.671] // Northeast coordinates
];
window.addEventListener('load', function() { 

	const map = new maplibregl.Map({
		container: 'map',
		//style: `https://api.maptiler.com/maps/winter/style.json?key=${API_KEY}`,
		style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${API_KEY}`,
		//? style: `https://api.maptiler.com/tiles/satellite-mediumres-2018/tiles.json?key=${API_KEY}`,
		//NOTFOUND style: `https://api.maptiler.com/tiles/satellite-v2/{z}/{x}/{y}.jpg?key=${API_KEY}`,
		center: [-17.855,28.671],
		zoom: 12,
		pitch: 10,
		//maxPitch: 85,
		maxBounds: bounds // Sets bounds as max
	});
	map.addControl(new maplibregl.NavigationControl(), 'top-right');

	map.on('load', function() {
		// Add new sources and layers
		map.addSource('contours', {
			type: 'vector',
			url: `https://api.maptiler.com/tiles/contours/tiles.json?key=${API_KEY}`
		});
		map.addLayer({
			'id': 'terrain-data',
			'type': 'line',
			'source': 'contours',
			'source-layer': 'contour',
			'layout': {
				'line-join': 'round',
				'line-cap': 'round'
			},
			'paint': {
				'line-color': '#ff69b4',
				'line-width': 1
			}
		});
		map.addSource("terrain", {
			"type": "raster-dem",
			//"url": `https://api.maptiler.com/tiles/terrain-rgb/tiles.json?key=${API_KEY}`
			//"url": `https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=${API_KEY}`
			"url": `https://api.maptiler.com/tiles/terrain-quantized-mesh-v2/tiles.json?key=${API_KEY}`
		});
		map.setTerrain({
			source: "terrain"
		});

		var urlfetchcsv = "src/points.csv";
		$.ajax({
			url: urlfetchcsv,
			async: false,
			success: function (csvd) {
				data = $.csv.toObjects(csvd);
			},
			dataType: "text",
			complete: function() {

				///////////////////////////////// LETs add MARKERs !
				data.forEach(function(d,i) {
					//console.log("adding:",d,i);
					var icfa = "dot-circle-o"; // default icon if not specified
					var nsvg = 77 + i%15;
					if(tagskeys.hasOwnProperty(d.tags[0])) {
						icfa = tagskeys[d.tags[0]][1].split(".")[0];
						nsvg = tagskeys[d.tags[0]][2];
					}
					var spl = d.text.split(" ");
					var txtshort = spl.slice(0,2).join(" ");
					var txtlong = spl.slice(2,-1).join(" ");
					//var classtags = "tagged-"+d.tags.split("").join(" tagged-");

					if(!d.lat) {
						d.lat = 28.65+0.01*Math.random();
						d.lng = -17.83+0.01*Math.random();
					} else {
						d.lat = +d.lat;
						d.lng = +d.lng;
					}
					var marker = {
						'type': 'Feature',
						'properties': {
							'message': txtshort,
							'iconSize': [40, 40]
						},
						'geometry': {
							'type': 'Point',
							'coordinates': [d.lng, d.lat]
						}
					};
					var html = '<i class="fa fa-'+icfa+'"></i>'+txtshort+" <span>"+txtlong+'</span>';

					// create a DOM element for the marker
					var el = document.createElement('div');
					el.innerHTML = html;
					el.className = 'marker';
					//el.style.backgroundImage ='url(https://placekitten.com/g/' +marker.properties.iconSize.join('/') +'/)';
					el.style.width = marker.properties.iconSize[0] + 'px';
					el.style.height = marker.properties.iconSize[1] + 'px';
				 
					el.addEventListener('click', function () {
						window.alert(marker.properties.message);
					});
				 	
				 	//console.log("adding:",d,i);
					// add marker to map
					new maplibregl.Marker({
						element: el
					})
					.setLngLat(marker.geometry.coordinates)
					.addTo(map);
				});
			}
		});
	});

}, false);