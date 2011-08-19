// Variablen

var origin;						// Koordinaten des Eigenen Standorts
var testResult;					// hier wird der ergebniss string gespeichert
	
var latencyTimeStart;			// Starteit Latenz	
var latencyTimeStartArray;		// Starteitfeld Latenz	
var latencyTimeEnd;				// Endzeit Latenz
var latencyTimeSum;				// Gesamtzeit Latenz

var downloadTimeStart;			// Startzeit download
var downloadTimeStartArray;		// Startzeitfeld download
var downloadTimeEnd;			// Endzeit download
var downloadTimeSum;			// Gesamtzeit download

var xhr; 						// 
var url;						// Url der Downloaddatei
var div;						// divisor um auf 1 KByte zu rechnen
var finish;						// Zeigt an ob Messung fertig ist
var numberOfmeasurements;		// Anzahl der bisherigen Messungen
var downloadRate;				// Variable für die Downloadrate
var timeStamp;					// Zeitpunkt an der die Messung Gestartet wurde.
var startTimeHelp;				// Hilfsvariable um die Zeit zu stoppen von Latenz und Downloadrate
var endTimeHelp;				// Hilfsvariable um die Zeit zu stoppen von Latenz und Downloadrate
var headerString;				// Variable in der der Header gespeichert wird
var aktiv;						// Variable um den Zeitlichenintervall zu steuern

var shortMeasure;

// Variablen für Zeitmessung
var startTime;					// Startzeit
var endTime;					// Endzeit
var now;						// Jetztige Zeit
var numberOfGeoCalls;				// Anzahl wie oft geolocation neu aufgerufen wird

// url Variablen der Downloadpackete
var url50;
var url100;
var url250;
var url500;
var url1000;
var url2000;

var logFile;
var logIndex;

// anderes
var finLatencyMeasure;
var finDownloadMeasure;
var name;
var android;
var version;
var urlString;

window.log = function(message) {
	// Wichtig für die Konstolenausgabe
	console.log?console.log(message):alert(message);
	
	logFile = logFile + logIndex + "  " + message + "%0A";
	
	logIndex = logIndex + 1;
};


// Funktionen


// Funktion die beim Start ausgeführt wird
function initialize() {
		
	logIndex = 0;
	
	logFile = "%0A" + "%0A" + "Starte aufnahme der Logs : " + "%0A";
	
	log("initialize wird gestartet");

	log("Der Pfad der Seite ist: " + window.location.href);
		
	// Standort wird ermittelt
	geoInit();
	geoStart();
	
	// inizialisiere SpeedTracker
	initSpeedTracker();
	
	// zuweisung von aktiv, ist wichtig für Intervall
//	aktiv = window.setTimeout("intervalMeasure()", 10000);
	
	android = false;
	
	version = "0.9";
	
	document.getElementById("versionId").firstChild.data = version;
	
	if(android){
		// für Android	
		document.getElementById("platformId").firstChild.data = "Android App";
		urlString = "http://speedtracks.org/";
	}else{
		// für lokales	
		document.getElementById("platformId").firstChild.data = "Web App";
		urlString = "../";
	}
					
// Werte für andere Downloadpackete
		
	url50 = urlString + "speedtrack-webclient/" + "downloadFiles/50kb.txt";
//	div = 50;
	url100 = urlString + "speedtrack-webclient/" + "downloadFiles/100kb.txt";
//	div = 100;
	url250 = urlString + "speedtrack-webclient/" + "downloadFiles/250kb.txt";
//	div = 250;
	url500 = urlString + "speedtrack-webclient/" + "downloadFiles/500kb.txt";
//	div = 500;
	url1000 = urlString + "speedtrack-webclient/" + "downloadFiles/1000kb.txt";
//	div = 1000;
	url2000 = urlString + "speedtrack-webclient/" + "downloadFiles/2000kb.txt";
//	div = 2000;
	
	latencyTimeStartArray = new Array();
	downloadTimeStartArray = new Array();
	
	shortMeasure = true;
	
	isLogedIn();
	
	log("initialize wird beendet");
}

// Funktion die die Standart Koordinaten inizialisiert
function geoInit() {
	log("start wird aufgerufen");
	
	// läd origin mit standart Koordinaten
	origin = new google.maps.LatLng(48.137411,11.581028);
	log("München Mitte wird als Start gewählt");
	
	log("start wird beendet");
}

// Funktion die Testet ob Geo an ist
function geoStart() {	
	log("geoStart wird aufgerufen");
	
	if(navigator.geolocation){
		// geo ist an
		navigator.geolocation.getCurrentPosition(geoCallback, geoErrorCallback, {
			enableHighAccuracy: true,
			timeout: 120000,
			maximumAge: 10000
		});
	    log("geo ist an, der Aktuelle Ort wird als Start gewählt");
	}else{
		// Zeige Status
		document.getElementById("stateOfTracking").firstChild.data = "Geolocation Geht nicht";
		document.getElementById("stateOfTracking").setAttribute("style", "color:red");
		
		// stoppt Messungsintervall
		finish = true;
	}
	
	log("geoStart wird beendet");
}


// Funktion wenn geo erfolgreich
function geoCallback(position) {	
	log("geoCallback wird aufgerufen");
    
	// Anzahl der GeoCalls hochzählen
	numberOfGeoCalls = numberOfGeoCalls + 1;
	log("Anzahl der Geocalls: " + numberOfGeoCalls);
	
    var c = position.coords;   
    
    // zeige Längen und Breitengrad
	document.getElementById("latitudeId").firstChild.data = c.latitude;
	document.getElementById("longitudeId").firstChild.data = c.longitude;
	
    origin = new google.maps.LatLng(c.latitude, c.longitude);
    log("origin wird mit den Folgenden Werten zugewiesen: " + c.latitude + ", " + c.longitude);
    
    log("geoCallback wird beendet");
}

// Funktion für Fehlerbehandlung von geo-Bestimmung
function geoErrorCallback(error) {
	log("geoErrorCallback wird aufgerufen");
	
    // Error	
	switch (error.code){
		case error.PERMISSION_DENIED:
			log("Fehler bei geo-Bestimmung, PERMISSION_DENIED");
			break;
		case error.POSITION_UNAVAILABLE:
			log("Fehler bei geo-Bestimmung, POSITION_UNAVAILABLE");
			break;
		case error.TIMEOUT:
			log("Fehler bei geo-Bestimmung, TIMEOUT");
			break;
		case error.UNKNOWN_ERROR:
			log("Fehler bei geo-Bestimmung, UNKNOWN_ERROR");
			break;
		default:
			log("Fehler bei geo-Bestimmung, Unbekannter fehler");
		    break;
	}
	
	// Zeige Status
	document.getElementById("stateOfTracking").firstChild.data = "Geolocation Fehler";
	document.getElementById("stateOfTracking").setAttribute("style", "color:red");
	
	log("geoErrorCallback wird beendet");
}

// Funktion die nur eine Messung durchführt
function startTracker() {
	log("startTracker wird aufgerufen");
	
	stopTimeMeasuret();
	run();
	stoppZeit();
	sendMail();
	
	log("startTracker wird beendet");
}

// Funktion die Zeit mißt
function startTimeMeasure() {
	log("startTimeMeasure wurde aufgerufen.");
	
	now = new Date();
	startTime = now.getTime();
	log("Die Messung wurde gestartet.");
	
	log("startTimeMeasure wurde beendet.");
}

// Funktion die Zeit mißt
function stopTimeMeasuret() {			// noch einfügen das es aus Seite angezeigt wird.
	log("stopTimeMeasuret wurde aufgerufen.");
	
	now = new Date();
	endTime = (now.getTime() - startTime)/1000;
	
	// Zeige Status
	if(numberOfmeasurements < 50){
		document.getElementById("stateOfTracking").firstChild.data = "Zu wenig Messungen";
		document.getElementById("stateOfTracking").setAttribute("style", "color:red");
		
	}else{
		document.getElementById("stateOfTracking").firstChild.data = "Tracking beendet";
		document.getElementById("stateOfTracking").setAttribute("style", "color:green");	
	}
	
	log("Die Messung wurde gestoppt. Sie lief " + endTime + " Sekunden");
		
	log("stopTimeMeasuret wurde beendet.");
}

// Funktion die den Header erstellt
function createHeader() {
	log("createHeader wurde aufgerufen.");
	
	headerString = "VERSION:speedTrackerHTML5test" + "\r"
	+ "MOVEMENTTYPE:" + document.getElementById("movementTypeId").options[document.getElementById("movementTypeId").selectedIndex].value + "\r"
	+ "FILE:" + "http://speedtrack.doubleslash.de/download/50kb.bin" + "\r"
	+ "FILESIZE:" + "51200" + "\r"
	+ "HARDWARE:" + document.getElementById("hardwareId").value + "\r"
	+ "GPS:" + "built-in" + "\r"
	+ "MODEM:" + "built-in" + "\r"
	+ "NETWORK:" + document.getElementById("networkId").options[document.getElementById("networkId").selectedIndex].value + "\r" + "\r";
	
	log("createHeader wurde beendet.");
}

// Funktion die alle Werte inizialisiert die vor JEDER Messung benötigt werden
function initSpeedTracker() {
	log("initSpeedTracker wurde aufgerufen.");
	
	logFile = logFile + "%0A" + "%0A" + "%0A" + "Starte neue Aufnahme der Logs : " + "%0A";
	
	// Zeit Null setzen
	downloadTimeStart = 0; 
	downloadTimeEnd = 0;
	latencyTimeStart = 0;
	latencyTimeEnd = 0;
	
	finish = true;
	
	// Anzahl Geoloctionaufrufe zurücksetzen
	numberOfGeoCalls = 0;
	
	// erstellt neuen Header
	createHeader();
	
	// und speichert ihn
	testResult = headerString;
	
	// Inizialisiert die Anzeigen
	numberOfmeasurements = 0;
	
	document.getElementById("numberOfTracks").firstChild.data = numberOfmeasurements;
	document.getElementById("downloadRateOfTracking").firstChild.data = "0";
	document.getElementById("latencyOfTracking").firstChild.data = "0";
	document.getElementById("latitudeId").firstChild.data = "Breitengrad";
	document.getElementById("longitudeId").firstChild.data = "Längengrad";
	document.getElementById("stateOfTracking").setAttribute("style", "color:black");
	document.getElementById("stateOfTracking").firstChild.data = "Tracking gestartet";
	
	// starte Zeitmessung
	startTimeMeasure();
		
	// Inizialisierung für das XHR Objekt
	try {  xhr = new XMLHttpRequest();   }
	catch (e) 
	{
		try {   xhr = new ActiveXObject('Microsoft.XMLHTTP');    }
		catch (e2) 
		{
			try {  xhr = new ActiveXObject('Msxml2.XMLHTTP');     }
			catch (e3) {  xhr = false;   }
		}
	}
	
	log("initSpeedTracker wurde beendet.");
}

// Funktion die eine Intervallmessung startet
function startIntervalMeasure(measureOption) {
	log("startIntervalMeasure wurde aufgerufen.");
	
	shortMeasure = measureOption;
	
	initSpeedTracker();
	finish = false;
	intervalMeasure();
	
	log("startIntervalMeasure wurde beendet.");
}

// Funktion die im Intervall misst
function intervalMeasure() {	
	log("intervalMeasure wurde aufgerufen.");
	
	if(!finish){
		// es kommt noch eine Messung
		
		log("Neue Messung durchführen");

		
		// Ladegrafik anzeigen
		document.getElementById("loadPictureId").setAttribute("style", "visibility:visible; position:relative; top: 50%; left:50%; margin: 8px; margin-left:-16px");

		finDownloadMeasure = false;
		finLatencyMeasure = false;
		
		run();
		
		// Anzahl der Messungen Hochzählen und anzeigen
		numberOfmeasurements = numberOfmeasurements +1;
		if(numberOfmeasurements > 50){
			document.getElementById("numberOfTracks").setAttribute("style", "color:green");
		}else{
			document.getElementById("numberOfTracks").setAttribute("style", "color:red");			
		}
		
		document.getElementById("numberOfTracks").firstChild.data = numberOfmeasurements;
		if(shortMeasure){
			aktiv = window.setTimeout("intervalMeasure()", 10000);
		}else{			
			aktiv = window.setTimeout("intervalMeasure()", 30000);
		}
			
	}else{
		// Messung wurde abgebrochen
		
		log("Es darf nicht mehr gemessen werden");
		
		window.clearTimeout(aktiv);
	}
	
	log("intervalMeasure wurde beendet.");
}

// Funktion die eine komplette Messung (mit mehreren Intervallen) beendet
function stopMeasure() {
	log("stopMeasure wurde aufgerufen.");
	
	// stoppt Messungsintervall
	finish = true;
	window.clearTimeout(aktiv);

	stopTimeMeasuret();
	
	// sendet die Ergebnisse per Mail oder per post an Servlet
	send(false);
	
	log("stopMeasure wurde beendet.");
}

// Funktion die die Ergebnisse abspeichert
function printTrack() {
	log("printTrack wurde aufgerufen.");
	
	
	var latency;										// Variable für die Latenzzeit
	latency = 0;
	
	// Latenzzeit berechnen
//	latency = ((latencyTimeSum / 5) / 2) / 1000.0; 		//sec
//	latency = ((latencyTimeSum ) / 2); 					//milli sec
	
	// Downloadrate Berechnen
	var time = 0;
	time = ((downloadTimeSum)) / 1000.0; 				//sec
//	time = ((downloadTimeSum)); 						//milli sec
	if (time != 0){
		if(shortMeasure){								// in Byte pro sec da es so auf HP steht
			downloadRate = ((50/time)*1000);			// nur 50 kb werden runtergeladen	
			
			latency = ((latencyTimeSum ) / 2); 			//milli sec
		}else{
			downloadRate = ((150/time)*1000);			// 150 kb werden runtergeladen
			
			latency = ((latencyTimeSum ) / 3 / 2); 		//milli sec
		}
	} else{
		downloadRate = 0;								// wenn time == 0 muss ein Fehler passiert sein!!!!
	}
	
	// Runden von der Ergebnisse
	var downloadRateEnd = Math.round(downloadRate); 
	var latencyEnd = Math.round(latency); 
	var latEnd = (Math.round(origin.lat() *1000 *1000 *1000 *1000) /1000000)/1000000; 
	var lngEnd = (Math.round(origin.lng() *1000 *1000 *1000 *1000) /1000000)/1000000; 
	
	// Ergebnisse abspeichern
	var testResultNew = testResult + downloadRateEnd + "|" + latencyEnd + "|" + latEnd + "|" + lngEnd + "|" + timeStamp + "\r";
	testResult = testResultNew;
	
	document.getElementById("downloadRateOfTracking").firstChild.data = downloadRateEnd;
	document.getElementById("latencyOfTracking").firstChild.data = latencyEnd;
	
	log("Es wurden folgende Werte ermittelt:");
	log("Latenz: " + latency);
	log("time: " + time);
	log("Downloadrate: " + downloadRate);
	
	log("printTrack wurde beendet.");
}

// Funktion die eine Messung durchführt
function run() {	
	log("run wurde aufgerufen.");
	
	downloadTimeSum = 0;
	latencyTimeSum = 0;

	// Zeige Status
	if(numberOfmeasurements < 50){
		document.getElementById("stateOfTracking").setAttribute("style", "color:black");
		document.getElementById("stateOfTracking").firstChild.data = "Tracking läuft, nicht unterbrechen";	
	}else{
		document.getElementById("stateOfTracking").setAttribute("style", "color:green");
		document.getElementById("stateOfTracking").firstChild.data = "Tracking kann gesendet werden";	
	}
	
	// Koordinaten aktuallisieren
	geoStart();		
	
	// Zeit von Messung merken
	now = new Date();
	timeStamp = now.getTime();

	if(shortMeasure){
		log("Messung mit nur einem Punkt starten");
		
		// Downloadzeit berechnen
		getDownloadTimeShort();   
		// Latenzzeit berechnen
		getLatencyShort();		
	}else{
		log("Messung mit drei Punkten starten");
		
		// Downloadzeit berechnen
		getDownloadTime(); 
		// Latenzzeit berechnen
		getLatency();
	}
	

	// Werte ausgeben
	printTrack();

	log("run wurde beendet.");
}

// Funktion die die Latenzzeit berechnet mit einer Messung
function getLatencyShort()
{ 
	log("getLatency wurde aufgerufen.");
	
		url = url50;
		
		// um request abzufangen
		xhr.onreadystatechange  = function()
		{ 
			if(xhr.readyState  == 4)				// vielleicht code ändern um Latenzzeit genauer zu bekommen
			{
				log("in redyState Block drin...");
				
				if(xhr.status  == 200){
					
					// ok zeit stoppen
					
					endTimeHelp = new Date();		// da sonst bei threadwechsel die daten verfäscht werdenkönnen
					latencyTimeEnd = endTimeHelp.getTime();
					
					latencyTimeSum = latencyTimeSum + (latencyTimeEnd - latencyTimeStart);
					
					finLatencyMeasure = true;
					showNotLoadImg();
					
					log("latencyTimeEnd wurde gemessen");
				}
				else {        
					// Zeige Status
					document.getElementById("stateOfTracking").firstChild.data = "Fehler bei Latenzbestimmung";
					document.getElementById("stateOfTracking").setAttribute("style", "color:red");
					
					log("Fehler, Latenz konnte nicht berechnet werden");
	            	log("Fehler!!! Status : " + xhr.status);
					// Fehler ausgeben
				}
			}
		}; 
		
		xhr.open("HEAD", url, false); 				// soll nur auf Header holen, und synchron sein
		
		startTimeHelp = new Date();					// da sonst bei Threadwechsel die Daten verfälscht werden können
		latencyTimeStart = startTimeHelp.getTime();
		
		xhr.send(null); 
		
	log("getLatency wurde beendet.");
} 

//Funktion die die Latenzzeit berechnet mit fuenf Messungen
function getLatency()
{ 
	log("getLatency wurde aufgerufen.");
	
	for(var i = 0; i < 3; i++){
		
		url = url50;
		
		// um request abzufangen
		xhr.onreadystatechange  = function()
		{ 
			if(xhr.readyState  == 4)				// vielleicht code ändern um Latenzzeit genauer zu bekommen
			{
				log("in redyState Block drin...");
				
				if(xhr.status  == 200){
					
					// ok zeit stoppen
					
					endTimeHelp = new Date();		// da sonst bei threadwechsel die daten verfäscht werdenkönnen
					latencyTimeEnd = endTimeHelp.getTime();
					
					latencyTimeSum = latencyTimeSum + (latencyTimeEnd - latencyTimeStartArray[i]);
					
					finLatencyMeasure = true;
					showNotLoadImg();
					
					log("latencyTimeEnd wurde gemessen");
				}
				else {        
					// Zeige Status
					document.getElementById("stateOfTracking").firstChild.data = "Fehler bei Latenzbestimmung";
					document.getElementById("stateOfTracking").setAttribute("style", "color:red");
					
					log("Fehler, Latenz konnte nicht berechnet werden");
	            	log("Fehler!!! Status : " + xhr.status);
					// Fehler ausgeben
				}
			}
		}; 
		
		xhr.open("HEAD", url, false); 				// soll nur auf Header holen, und synchron sein
		
		startTimeHelp = new Date();					// da sonst bei Threadwechsel die Daten verfälscht werden können
		latencyTimeStartArray[i] = startTimeHelp.getTime();
		
		xhr.send(null); 
		
	}
	
	log("getLatency wurde beendet.");
} 



////Funktion die die DownloadZeit berechnet
//function getDownloadTime()
//{ 
//	log("getDownloadTime wurde aufgerufen.");
////	data = 0;
//	
//	url = url50;
//	
//	log("Die url wurde auf " + url + " gesetzt.");
//	
//	for(var i = 0; i < 5; i++){
////	   data = data + div;
//		
////		url = url100;
////		
////		if(i > 3){
////			url = url50;
////			// div = 150;
////		}
//		
//		log("Die url in der forschleife ist: " + url );
//		
//		url = url50;
//		
//		log("Die url in der forschleife ist: " + url );
//		
//		// um request abzufangen, schauen ob es reicht das es ein mal angegegeben werden muss oder ob es jedesmal angegeben werden muss
//	    xhr.onreadystatechange  = function()
//	    { 
//	         if(xhr.readyState  == 4)
//	         {
//	        	 log("in redyState Block drin...");
//	        	 
//	              if(xhr.status  == 200){
//	            	  
//	                 // ok EndZeit messen
//	            	  
//	            	endTimeHelp = new Date();		// da sonst bei Threadwechsel die Daten verfälscht werden könnten
//	      			downloadTimeEnd = endTimeHelp.getTime();
//	      			
//	      			downloadTimeSum = downloadTimeSum + (downloadTimeEnd - downloadTimeStart);
//	      			
//	      			
//	                log("downloadTimeEnd wurde gemessen");
//	              }
//	              else {            	 
//	            	  log("Fehler!!! Status : " + xhr.status);
//	            	  // Fehler ausgeben
//	              }
//	         }
//	    }; 
//	
//	   xhr.open("POST", url, false);
//	
//	   // Startzeit messen
//	   startTimeHelp = new Date();
//		downloadTimeStart = startTimeHelp.getTime();
//	  
//	   xhr.send(null); 
//
//	   
////	   log("Datenmenge die bis her runtergeladen wurde: " + data)
//	   
//	}
//	
//	log("getDownloadTime wurde beendet.");
//} 

////Funktion die die DownloadZeit berechnet mit Ajax
//function getDownloadTime()				// Gleiche Funktion wie oben, jedoch mit Ajax und nicht direct mit XHR
//{ 
//	log("getDownloadTime wurde aufgerufen.");
//  
//	for(var i = 0; i < 5; i++){
//		
//		// start measuring
//		startTimeHelp = new Date();
//		downloadTimeStart = startTimeHelp.getTime();
//		
//		$.ajax({
//			type: "GET",
//			url: url50,
//			async: false,			//wichtig da es sonst nur 1 mal rungergeladen wird
//			cache: false,
//			dataType: "text",
//			success: function(data) {
//				
//				// request funktuion wenn die 50 kilobyte runtergelaen wurden
//				
//				endTimeHelp = new Date();		// da sonst bei threadwechsel die daten verfäscht werdenkönnen
//				downloadTimeEnd = endTimeHelp.getTime();
//				
//				downloadTimeSum = downloadTimeSum + (downloadTimeEnd - downloadTimeStart);
//				
//				
//				log("latencyTimeEnd wurde gemessen");				
//			},
//			error: function(jqXHR, textStatus, errorThrown){
//				log("Fehler mit dem runterlaen der datei" + jqXHR + textStatus + errorThrown);
//				log("jqXHR: " + jqXHR);
//				log("textStatus: " + textStatus);
//				log("errorThrown: " +errorThrown);
//			}
//		}).responseText;
//	}
//	
//	log("getDownloadTime wurde beendet.");
//} 

//Funktion die die DownloadZeit berechnet mit Ajax und fuer eine Messung
function getDownloadTimeShort()				// Gleiche Funktion wie oben, jedoch mit Ajax und nicht direct mit XHR
{ 
	log("getDownloadTime wurde aufgerufen.");
		
		// start measuring
		startTimeHelp = new Date();
		downloadTimeStart = startTimeHelp.getTime();
		
		$.ajax({
			type: "GET",
			url: url50,
			async: false,			//wichtig da es sonst nur 1 mal rungergeladen wird
			cache: false,
			dataType: "text",
			success: function(data) {
				
				// request funktuion wenn die 50 kilobyte runtergelaen wurden
				
				endTimeHelp = new Date();		// da sonst bei threadwechsel die daten verfäscht werdenkönnen
				downloadTimeEnd = endTimeHelp.getTime();
				
				downloadTimeSum = downloadTimeSum + (downloadTimeEnd - downloadTimeStart);
							
				finDownloadMeasure = true;
				showNotLoadImg();
							
				log("downloadTimeEnd wurde gemessen");				
			},
			error: function(jqXHR, textStatus, errorThrown){
				// Zeige Status
				document.getElementById("stateOfTracking").firstChild.data = "Fehler bei Downloadrate";
				document.getElementById("stateOfTracking").setAttribute("style", "color:red");
				
				log("Fehler mit dem runterlaen der datei" + jqXHR + textStatus + errorThrown);
				log("jqXHR: " + jqXHR);
				log("textStatus: " + textStatus);
				log("errorThrown: " +errorThrown);
			}
		}).responseText;
	
	log("getDownloadTime wurde beendet.");
} 

//Funktion die die DownloadZeit berechnet mit Ajax und fuer drei Messungen
function getDownloadTime()				// Gleiche Funktion wie oben, jedoch mit Ajax und nicht direct mit XHR
{ 
	log("getDownloadTime wurde aufgerufen.");
  
	for(var i = 0; i < 3; i++){
		
		// start measuring
		startTimeHelp = new Date();
		downloadTimeStartArray[i] = startTimeHelp.getTime();
		
		$.ajax({
			type: "GET",
			url: url50,
			async: false,			//wichtig da es sonst nur 1 mal rungergeladen wird
			cache: false,
			dataType: "text",
			success: function(data) {
				
				// request funktuion wenn die 50 kilobyte runtergelaen wurden
				
				endTimeHelp = new Date();		// da sonst bei threadwechsel die daten verfäscht werdenkönnen
				downloadTimeEnd = endTimeHelp.getTime();
				
				downloadTimeSum = downloadTimeSum + (downloadTimeEnd - downloadTimeStartArray[i]);
				
				finLatencyMeasure = true;
				showNotLoadImg();
				
				log("latencyTimeEnd wurde gemessen");				
			},
			error: function(jqXHR, textStatus, errorThrown){
				document.getElementById("stateOfTracking").firstChild.data = "Fehler bei Downloadrate";
				document.getElementById("stateOfTracking").setAttribute("style", "color:red");
				
				log("Fehler mit dem runterlaen der datei" + jqXHR + textStatus + errorThrown);
				log("jqXHR: " + jqXHR);
				log("textStatus: " + textStatus);
				log("errorThrown: " +errorThrown);
			}
		}).responseText;
	}
	
	log("getDownloadTime wurde beendet.");
}


//Funktion die das Ergebniss an eine e-mailadresse sendet
function send(sendAsMail) {
	log("send wurde aufgerufen.");
	
	if(sendAsMail){
		sendAsMail();		
	}else{
		sendAsPost();		
	}

	log("send wurde beendet.");
}

// Funktion die das Ergebniss an eine e-mailadresse sendet 
// ist fuer Testzwecke gedacht
// geht nicht mehr richtig da die kürzel geändert wurden von %0A zu \r
function sendAsMail() {
	log("sendMail wurde aufgerufen.");
	
    var link = "mailto:Stephan.Weidele@doubleslash.de?"   
             + "subject=" + "Test SP"
             + "&body=" + testResult + "%0A" + "%0A" + "%0A" + logFile;
   
	// Zeige Status
	document.getElementById("stateOfTracking").firstChild.data = "Track senden";
    
    window.location.href = link;
	
	log("sendMail wurde beendet.");
}

// Funktion die das Ergebniss als post an ein Servlet sendet
function sendAsPost() {
	log("sendAsPost wurde aufgerufen.");
    
	now = new Date();
	timeStamp = now.getTime();
	
	trackName = name + "-" + timeStamp;
		
	transfer(testResult, trackName);
	
	log("sendAsPost wurde beendet.");
}

function isLogedIn() {
	log("isLogedIn wurde aufgerufen.");
	
	name = "Gast";
	
	$.post(urlString + "speedtrack/STLoginServlet",
			  { action: "userstatus" },
			  function(data){
				  if(data.success){
					  log("Benutzer ist eingeloggt.");
					  name = data.login;
					  document.getElementById("nameOfUser").firstChild.data = name; 
				  }else{
						document.getElementById("stateOfTracking").firstChild.data = "Benutzter nicht eingeloggt";
						document.getElementById("stateOfTracking").setAttribute("style", "color:red");
					  
					  log("Benutzer ist ausgeloggt.");
					  location.href='index.html';					  
				  }
			  }, "json"
			);
	
	log("isLogedIn wurde beendet.");
}

// Funrkion die die Ladegrafik ausblendet
function showNotLoadImg() {
	
	if(finDownloadMeasure && finLatencyMeasure){
		
		document.getElementById("loadPictureId").setAttribute("style", "visibility:hidden");
		
	}
	
}
