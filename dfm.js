
const QueryString = function () {
	var query_string = {};
	var query = window.location.search.substring(1);
	var vars = query.split("&");
	for (var i=0;i<vars.length;i++) {
		var pair = vars[i].split("=");
		if (typeof query_string[pair[0]] === "undefined") {
			query_string[pair[0]] = decodeURIComponent(pair[1]);
		} else if (typeof query_string[pair[0]] === "string") {
			var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
			query_string[pair[0]] = arr;
		} else {
			query_string[pair[0]].push(decodeURIComponent(pair[1]));
		}
	}
	return query_string;
}();

const DFMW = {
	genLink: function(){
		var selected = document.getElementById("dropdown").options[document.getElementById("dropdown").selectedIndex].value;
		var marquee = document.getElementById("marquee").checked;
		if(selected !== "none"){
			document.getElementById("outputlink").value = `http://widget.discord.fm/?lib=${selected}${
				marquee == true ? "&marquee=true" : ""
			}`
		}
    },
	checkBounds: function(song){
		let height = document.getElementsByClassName("widgetBody")[0].clientHeight;
		if(height > 128 || QueryString.marquee == "true"){
			document.getElementById('title').outerHTML = `<marquee id="title" style="width: ${window.innerWidth-170}px;" scrollamount="5"><h1>${song}</h1></marquee>`
		}else{
			document.getElementById('title').outerHTML = `<h1 id="title">${song}</h1>`
		}
    },
    checkWindow: function(){
		if(window.innerHeight < 150 || window.innerWidth < 530){
			document.getElementsByClassName('homeBody')[0].style.display = "none";
			document.getElementsByClassName('widgetBadDisplayBody')[0].style.display = "table-cell";
			document.getElementsByClassName('widgetBody')[0].style.display = "none";
		}else if(QueryString.lib !== undefined){
			document.getElementsByClassName('homeBody')[0].style.display = "none";
			document.getElementsByClassName('widgetBadDisplayBody')[0].style.display = "none";
			document.getElementsByClassName('widgetBody')[0].style.display = "inline-block";
		}
    },
	start: function(lib, libname){
		var socket = new WebSocket('wss://sockets.temp.discord.fm');
		socket.addEventListener('open', function (event) {
			const request = new Request('https://temp.discord.fm/libraries/queue');
			fetch(request)
				.then(function(response) {
					if(response.status == 200) return response.json();
					document.getElementById('title').innerHTML = "Song will update on the next song...";
				})
				.then(function(response) {
					document.getElementById('title').innerHTML = response[lib].current.title;
					DFMW.checkBounds(response[lib].current.title)
				})
				.catch(function(error) {
					console.error(error);
					document.getElementById('title').innerHTML = "Song will update on the next song...";
				});
			console.log('Successfully connected to sockets server! Listening for events...');
			document.getElementById('lib').innerHTML = libname;
		});
		socket.addEventListener('message', function (event) {
			let data = event.data;
			if (data === 'helo') {
				return console.log('received helo');
			}
			try {
				data = JSON.parse(data);
				if (data.event == 'play' && data.data.bot == lib) {
					document.getElementById('title').innerHTML = data.data.song.title
					DFMW.checkBounds(data.data.song.title)
				}
			} catch (err) {
				console.log('Failed to parse incoming data:', err);
			}
		});
	}
}
const Libraries = {
	"electro-hub": "Electro Hub",
	"chill-corner": "Chill Corner",
	"hip-hop": "Hip-Hop",
	"coffee-house-jazz": "Coffee-House Jazz",
	"japanese-lounge": "Japanese Lounge",
	"classical": "Classical",
	"retro-renegade": "Retro Renegade",
	"metal-mix": "Metal Mix",
	"korean-madness": "Korean Madness",
	"electro-swing": "Electro Swing",
	"lfg-electro-hub": "Electro Hub"
}
const DeviceKeywords = [
	"Android",
	"webOS",
	"iPhone",
	"iPad",
	"iPod",
	"BlackBerry",
	"IEMobile",
	"Opera Mini",
	"KFAPWI",
	"Nokia"
]
window.onload = () => {
	if(DeviceKeywords.map(dkw=>navigator.userAgent.match(new RegExp(dkw, "ig"))).map(dkw=>dkw==null).includes(false)){
		document.getElementsByClassName('homeBody')[0].style.display = "none";
		document.getElementsByClassName('widgetPhoneBody')[0].style.display = "table-cell";
		document.getElementById('wpbText').style = `font-size: ${Math.abs(window.innerWidth-window.innerHeight)/6}px`;
		document.getElementById('wpbImg').style = `width: ${Math.abs(window.innerWidth-window.innerHeight)/4}px`;
		document.getElementById('useragent').innerHTML = navigator.userAgent;
	}else if(QueryString.lib !== undefined){
		document.getElementsByClassName('homeBody')[0].style.display = "none";
		document.getElementsByClassName('widgetBody')[0].style.display = "inline-block";
		console.log('Connecting...');
		if(Object.keys(Libraries).map(l=>l==QueryString.lib).includes(true)){
			DFMW.start(QueryString.lib, Libraries[QueryString.lib]);
		}else{
			document.getElementById('title').innerHTML = "Bad Library!";
			document.getElementById('title').innerHTML = "";
		}
		window.onresize = DFMW.checkWindow;
		DFMW.checkWindow();
	}
}