/*	------------------ Variablen ------------------ */	

// Variablen fuer Geolocation
var originLat;					// Breitengrad des eigenen Standorts
var originLng;					// Längengrad des eigenen Standortes
var geolocationStatus;			// Variable ob alles ok mit Geolocation
var numberOfGeoCalls;			// Anzahl wie oft geolocation neu aufgerufen wird(fuer Debug)
var minTrackPoints;				// Mindestanzahl an Messpunkten

// Variablen fuer Latenz und Downloadraten Messung
var latencyTimeStart;			// Starteit Latenz	
var latencyTimeStartArray;		// Starteitfeld Latenz	
var latencyTimeEnd;				// Endzeit Latenz
var latencyTimeSum;				// Gesamtzeit Latenz
var finLatencyMeasure;			// gibt an ob Latenzzeit schon ermittelt wurde
var downloadTimeStart;			// Startzeit download
var downloadTimeStartArray;		// Startzeitfeld download
var downloadTimeEnd;			// Endzeit download
var downloadTimeSum;			// Gesamtzeit download
var finDownloadMeasure;			// gibt an ob Downloadrate schon ermittelt wurde
var xhr; 						// Variable für XHR-Objekt
var shortMeasure;				// gibt an welche Messung genommen werden soll(eine alle 10sec oder 3 alle 30sec)
var finish;						// Zeigt an ob Messung fertig ist
var numberOfmeasurements;		// Anzahl der bisherigen Messungen

// Variablen für Zeitmessung
var aktiv;						// Variable um den Zeitlichenintervall zu steuern
var startTime;					// Startzeit
var endTime;					// Endzeit
var now;						// Variable in der jetztige Zeit abgespeichert wird
var timeStamp;					// Zeitpunkt an der die Messung Gestartet wurde.
var startTimeHelp;				// Hilfsvariable um die Zeit zu stoppen von Latenz und Downloadrate
var endTimeHelp;				// Hilfsvariable um die Zeit zu stoppen von Latenz und Downloadrate

// anderes
var url;						// Url der Downloaddatei
var url50;						// URL von 50 Kilobyte Downloadfile
var url100;						// URL von 100 Kilobyte Downloadfile
var url150;						// URL von 150 Kilobyte Downloadfile
var name;						// Variable für Benutzername
var isAndroidPhone;				// gibt an Ob es ein Androidhandy ist
var version;					// gibt aktuelle Version an
var urlString;					// Speichert richtige URL fuer Webapp oder Andropid

// Variablen für die Ausgabe
var textResult;					// hier wird der Ergebnisstring gespeichert der an die Homepage geschickt wird
var textResultMail; 			// hier wird der Ergebnisstring im Emailformat gespeichert
var logIndex;					// Anzahl von Logeinträgen
var logFile;					// speichert Einträge von Log in String ab
var errorMessage; 				// Hier wird der letzte Fehler abgespeichert
var headerString;				// Variable in der der Header gespeichert wird


/*	------------------ Wichtig fuer Consolenausgabe ------------------ */


window.log = function(message) {
	// Wichtig für die Konstolenausgabe
	console.log?console.log(message):alert(message);
	
	logFile = logFile + logIndex + "  " + message + "%0A";
	
	logIndex = logIndex + 1;
};


/*	------------------ Funktionen ------------------ */											


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
	
	// Einstellung der Versionsnummer und ob es Android ist oder nicht
	isAndroidPhone = false;
	version = "1.0.0";
	
	// anzeigen der Versionsnummer
	document.getElementById("versionId").firstChild.data = version;
	
	if(isAndroidPhone) {
		// für Android	
		document.getElementById("platformId").firstChild.data = "Android App";
		document.getElementById("hardwareId").value = "Android App";
		urlString = "http://speedtracks.org/";	
		//urlString = "http://carey.ds.de:8080/speedtrack/";
		
	} else {
		// für lokales	
		document.getElementById("platformId").firstChild.data = "Web App";
		document.getElementById("hardwareId").value = "Web App";
		urlString = "../";														// Homepage und Lokal	
	}
					
	// URL von Downloadpacket welches runtergeladen werden soll	
	url50   = urlString + "client/downloadFiles/50kb.txt";
	//url50   = "http://speedtrack.doubleslash.de/download/50kb.txt";
	url100 	= urlString + "client/downloadFiles/100kb.txt";
	url150 	= urlString + "client/downloadFiles/150kb.txt";	

	// Array in welches die Werte reingeschrieben werden um Überschneidungen duch Multithreading zu vermeiden
	latencyTimeStartArray = new Array();
	downloadTimeStartArray = new Array();
	
	/* Kurze Messmethode 
	 * (Lange wird nicht verwendet, da kürze mehr Sinn macht,
	 * da sie bei schlechterer Verbindung besser gemessen werden kann 
	 * und da sie mehr Messpunkte produziert)
	 */
	shortMeasure = true;
	
	// Schaut ob Benutzer eingeloggt ist, wenn nicht wird er zu Login weitergeleitet
	isLogedIn();
	
	log("initialize wird beendet");
}

// Funktion die die Standartkoordinaten inizialisiert
function geoInit() {
	log("start wird aufgerufen");
	
	// Geolocation geht nicht, setze status auf false, damit nicht gemessen wird
	geolocationStatus = false;
	
	// läd origin mit standart Koordinaten
	originLat = 48.137411;
	originLng = 11.581028;
	log("München Mitte wird als Start gewählt");
	
	log("start wird beendet");
}

// Funktion die Testet ob Geo an ist
function geoStart() {	
	log("geoStart wird aufgerufen");
	
	if(navigator.geolocation) {
		// geo ist an
		navigator.geolocation.getCurrentPosition(geoCallback, geoErrorCallback, {
			enableHighAccuracy: true,
			timeout: 120000,
			maximumAge: 10000
		});
		
//		// Geolocation funktioniert, es kann gemessen werden
//		document.getElementById("stateOfTracking").firstChild.data = "Geolocation erfolgreich";
//		geolocationStatus = true;
		
	    log("geo ist an, der Aktuelle Ort wird als Start gewählt");
	} else {
		// Zeige Status
		document.getElementById("stateOfTracking").firstChild.data = "Geolocation geht nicht";
		document.getElementById("stateOfTracking").setAttribute("style", "color:red");

		// Geolocation geht nicht, setze Status auf false, damit nicht gemessen wird
		geolocationStatus = false;
		
		// stoppt Messungsintervall
		finish = true;
	}
	
	log("geoStart wird beendet");
}

// Funktion wenn geo erfolgreich
// Success-Callbackfunktion der Standard Trackmessung
function geoCallback(position) {	
	log("geoCallback wird aufgerufen");
    
	// Anzahl der GeoCalls hochzählen
	numberOfGeoCalls = numberOfGeoCalls + 1;
	log("Anzahl der Geocalls: " + numberOfGeoCalls);
	
	var c = position.coords;
	
	var latRounded = (Math.round(c.latitude *1000 *1000))/1000000;
	var lngRounded = (Math.round(c.longitude *1000 *1000))/1000000;
	
	// ueberpruefen ob sich die Koordinaten geaendert haben
	if(latRounded == originLat && lngRounded == originLng) {
		// Koordinaten haben sich nicht geaendert, Fehler anzeigen
		document.getElementById("stateOfTracking").firstChild.data = "keine neuen Koordinaten";
		document.getElementById("stateOfTracking").setAttribute("style", "color:red");
		document.getElementById("latitudeId").setAttribute("style", "color:red");
		document.getElementById("longitudeId").setAttribute("style", "color:red");
		
		// Punkt wird nicht gezählt
		geolocationStatus = false;
		
	} else {
		// Koordinaten haben sich geaendert, in origin eintragen
		originLat = latRounded;
		originLng = lngRounded;
		log("origin wird mit den Folgenden Werten zugewiesen: " + originLat + ", " + originLng);
		
		// setze normale Farbe
		document.getElementById("latitudeId").setAttribute("style", "color:black");
		document.getElementById("longitudeId").setAttribute("style", "color:black");

		// Geolocation funktioniert, es kann gemessen werden
		geolocationStatus = true;
	}
	
    log("geoCallback wird beendet");
}

// Success-Callbackfunktion der zusätzlichen Geolocation Messung
function extraGeoCallback(position) {
	log("extraGeoCallback wird aufgerufen");
	
	var cGeo = position.coords;
	
	var latRoundedGeo = (Math.round(cGeo.latitude *1000 *1000))/1000000;
	var lngRoundedGeo = (Math.round(cGeo.longitude *1000 *1000))/1000000;
	
	var accuracy = position.coords.accuracy;
	if(accuracy > 100) { 
		log("Geolocation zu ungenau"); 
		return;
	}
	
	var nowGeo = new Date();
	var timeStampGeo = nowGeo.getTime();
	//alert('Position: '+latRoundedGeo+','+lngRoundedGeo);
	save(downloadRateEnd, latencyEnd, latRoundedGeo, lngRoundedGeo, timeStampGeo, "geo");
	
	log("extraGeoCallback wird beendet");
}

// Funktion für Fehlerbehandlung von geo-Bestimmung
// Error-Callbackfunktion der Standard Trackmessung
function geoErrorCallback(error) {
	log("geoErrorCallback wird aufgerufen");
	
    // Error-Code auslesen und behandeln	
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
	
	// Geolocation geht nicht, setze status auf false, damit nicht gemessen wird
	geolocationStatus = false;
	
	log("geoErrorCallback wird beendet");
}

// Error-Callbackfunktion der zusätzlichen Geolocation Messung
function extraGeoErrorCallback(error) {
	log("extraGeoErrorCallback wird aufgerufen");
	
    // Error-Code auslesen und behandeln	
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
	
	log("extraGeoErrorCallback wird beendet");
}

// Funktion die Zeit misst
function startTimeMeasure() {
	log("startTimeMeasure wurde aufgerufen.");
	
	now = new Date();
	startTime = now.getTime();
	log("Die Messung wurde gestartet.");
	
	log("startTimeMeasure wurde beendet.");
}

// Funktion die Zeit mißt
function stopTimeMeasuret() {
	log("stopTimeMeasuret wurde aufgerufen.");
	
	now = new Date();
	endTime = (now.getTime() - startTime)/1000;
		
	// Zeige Status
	if(numberOfmeasurements < minTrackPoints){
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
	
	headerString = "VERSION:speedTracker WebApp v1.1" + "\r"
	+ "DATAVERSION:1.1" + "\r"
	+ "MOVEMENTTYPE:" + document.getElementById("movementTypeId").options[document.getElementById("movementTypeId").selectedIndex].value + "\r"
	+ "FILE:" + "http://speedtracks.org/client/downloadFiles/100kb.txt" + "\r"
	+ "FILESIZE:" + "102400" + "\r"
	+ "HARDWARE:" + document.getElementById("hardwareId").value + "\r"
	+ "GPS:" + "built-in" + "\r"
	+ "MODEM:" + "built-in" + "\r"
	+ "NETWORK:" + document.getElementById("networkId").options[document.getElementById("networkId").selectedIndex].value + "\r" + "\r";
	
	log("createHeader wurde beendet.");
}

// Funktion die alle Werte inizialisiert die vor JEDER Messung benötigt werden
function initSpeedTracker(p_trackmode) {
	log("initSpeedTracker wurde aufgerufen.");
	
	logFile = logFile + "%0A" + "%0A" + "%0A" + "Starte neue Aufnahme der Logs : " + "%0A";
	
	// Setzt die Anzahl der minimalen Messpunkte
	minTrackPoints = 20;
	
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
	textResult = headerString;
	
	// Inizialisiert die Anzeigen
	numberOfmeasurements = 0;
	
	if(p_trackmode) { 
		document.getElementById("numberOfTracks").firstChild.data = numberOfmeasurements; 
	} else { 
		document.getElementById("numberOfSpeed").firstChild.data = numberOfmeasurements; 
	}
	document.getElementById("downloadRateOfTracking").firstChild.data = "0";
	document.getElementById("latencyOfTracking").firstChild.data = "0";
	document.getElementById("latitudeId").firstChild.data = "Breitengrad";
	document.getElementById("longitudeId").firstChild.data = "Längengrad";
	document.getElementById("stateOfTracking").setAttribute("style", "color:black");
	document.getElementById("stateOfTracking").firstChild.data = "Tracking gestartet";
	
	log("initSpeedTracker wurde beendet.");
}

// Funktion die eine Intervallmessung startet
function startIntervalMeasure(measureOption, p_trackmode) {
	log("startIntervalMeasure wurde aufgerufen.");
	
	shortMeasure = measureOption;
	
	// starte Zeitmessung
	startTimeMeasure();
	
	initSpeedTracker(p_trackmode);
	finish = false;
	intervalMeasure(p_trackmode);
	
	log("startIntervalMeasure wurde beendet.");
}

// Funktion die im Intervall misst
function intervalMeasure(p_trackmode) {
	log("intervalMeasure wurde aufgerufen.");
	
	if(!finish){
		// es kommt noch eine Messung
		
		log("Neue Messung durchführen");

		// Ladegrafik anzeigen
		document.getElementById("loadPictureTrack").setAttribute("style", "visibility:visible; position:relative; top: 50%; left:50%; margin: 8px; margin-left:-16px");
		document.getElementById("loadPictureSpeed").setAttribute("style", "visibility:visible; position:relative; top: 50%; left:50%; margin: 8px; margin-left:-16px");

		finDownloadMeasure = false;
		finLatencyMeasure = false;
		
		run(p_trackmode);
		
		if(p_trackmode) document.getElementById("numberOfTracks").firstChild.data = numberOfmeasurements;
		else document.getElementById("numberOfSpeed").firstChild.data = numberOfmeasurements;
			
		if(shortMeasure){
			aktiv = window.setTimeout(function () {					// Closure-Funktion: Schließt die lokale Funktionsvaribale ein,
				intervalMeasure(p_trackmode);						// konserviert sie und übergibt diese wieder an die Interval Funktion
			}, 10000);												// setTimeout("intervalM..(p_trackmode)") verliert die Variable!!
			/*if(p_trackmode) {
				geoThreadP = true;
					console.log("geoThreadP = true");
				window.setTimeout("geoThreadP = false;", 9000);
					console.log("geoThreadP = false in 9 sec");
				extraGeoMeasure1();
			}*/
		} else {
			aktiv = window.setTimeout(function () {
				intervalMeasure(p_trackmode);
			}, 30000); 
		}
	} else {
		// Messung wurde abgebrochen
		log("Es darf nicht mehr gemessen werden");
		window.clearTimeout(aktiv);
	}
	log("intervalMeasure wurde beendet.");
}

// Funktion die eine komplette Messung (mit mehreren Intervallen) beendet
function stopMeasure(p_trackmode) {
	log("stopMeasure wurde aufgerufen.");
	
	// stoppt Messungsintervall
	finish = true;
	window.clearTimeout(aktiv);

	// stoppt Zeitmessung
	stopTimeMeasuret();
	
	// **testzwecke**
	//navigator.notification.alert(textResult);
	
	// wenn Tracking
	if(p_trackmode) {
		// sendet die Ergebnisse per Mail oder per post an Servlet
		send(false);
	}
	
	log("stopMeasure wurde beendet.");
}

// Funktion die die Ergebnisse ausgibt und abspeichert
function printTrack(p_dataUrlString, p_trackmode) {
	log("printTrack wurde aufgerufen.");
	
	var latency = 0;									// Variable für die Latenzzeit, wird an Upload Servlet übergeben
	var downloadRate = 0;								// Variable für die Downloadrate
	var datasize = 0;									// Größe der Datei in kb -> Berechnung der Downloadrate
	var latencyShow = null;								// Wert der im Frontend angezeigt wird
	var downloadRateShow = null;						// Wert der an das Servlet übergeben wird
	
	if (p_dataUrlString == "url50") datasize = 50;			// setze Größe durch Url
	else if (p_dataUrlString == "url100") datasize = 100;
	else if (p_dataUrlString == "url150") datasize = 150;
	
	if(downloadTimeSum != 0) {
		// Downloadrate Berechnen
		var time = 0;
		time = ((downloadTimeSum)) / 1000.0; 				//sec

		if (time != 0){
			if(shortMeasure) {
				downloadRateShow = ((datasize/time));		// Normale Messungen, Angabe in KB/s (Bytes/s = downloadRate*1000)
				downloadRate = downloadRateShow * 1024;
				
				latency = ((latencyTimeSum ) / 2); 			// milli sec
			} else {
				downloadRate = ((datasize/time));			// "3er" Messungen
				
				latency = ((latencyTimeSum ) / 3 / 2); 		// milli sec
			}
		} 
	} else {
		downloadRate = 0;
		latency = 0;								// Wert der an das Upload Serlver übergeben wird (muss Zahl sein)
		latencyShow = '—';							// Wert der im Frontend angezeigt wird
		downloadRateShow = 0;
	}
	
	// Runden von der Ergebnisse
	downloadRateEnd = Math.round(downloadRate);
	latencyEnd = Math.round(latency);
	downloadRateShow = Math.round(downloadRateShow);
	
	if(latencyShow == null) latencyShow = latencyEnd;
	
	save(downloadRateEnd, latencyEnd, originLat, originLng, timeStamp, "track");
	
	if(p_trackmode) {
		// zeige Längen und Breitengrad
		document.getElementById("latitudeId").firstChild.data = originLat;
		document.getElementById("longitudeId").firstChild.data = originLng;
	
		// zeige Latenzzeit und Downloadzeit an
		document.getElementById("downloadRateOfTracking").firstChild.data = downloadRateShow;
		document.getElementById("latencyOfTracking").firstChild.data = latencyShow;
	} else {
		// zeige Latenzzeit und Downloadzeit an
		document.getElementById("downloadRateOfSpeed").firstChild.data = downloadRateShow;
		document.getElementById("latencyOfSpeed").firstChild.data = latencyShow;
	}
	
	// zeige werte in Log
	log("Es wurden folgende Werte ermittelt:");
	log("Latenz: " + latency);
	log("time: " + time);
	log("Downloadrate: " + downloadRate);
	
	log("printTrack wurde beendet.");
}

// Funktion die eine Messung durchführt
function run(p_trackmode) {								// Trackmode oder Einzelmessung -> Trackmode: true = Tracks, false = Einzel
	log("run wurde aufgerufen.");
							
	downloadTimeSum = 0;
	latencyTimeSum = 0;

	if(p_trackmode) {
		// Zeige Status und Anzahl Messungen
		if(numberOfmeasurements < minTrackPoints) {
			document.getElementById("stateOfTracking").setAttribute("style", "color:black");
			document.getElementById("numberOfTracks").setAttribute("style", "color:red");			
			document.getElementById("stateOfTracking").firstChild.data = "Tracking läuft, nicht unterbrechen";	
		} else {
			document.getElementById("stateOfTracking").setAttribute("style", "color:green");
			document.getElementById("numberOfTracks").setAttribute("style", "color:green");
			document.getElementById("stateOfTracking").firstChild.data = "Track kann gesendet werden";	
		}
		
		// Koordinaten aktuallisieren
		geoStart();
		
		// schauen ob Geoloaction an und ob es richtig gemessen hat
		if(!geolocationStatus) {
			// Fehler mit Geoloction!!!
			document.getElementById("stateOfTracking").setAttribute("style", "color:red");
			return;
		}
	}
	
		// Zeit von Messung merken
		now = new Date();
		timeStamp = now.getTime();
	
		if(shortMeasure) {
			log("Messung mit nur einem Punkt starten");
			geoThread = true;
			// Downloadzeit berechnen
			getDownloadTimeShort(url100, p_trackmode);
			/*if(downloadTimeSum != 0) {
				// Latenzzeit berechnen
				getLatencyShort(url100);
			} else latencyTimeSum = 0;*/
		} else {
			log("Messung mit drei Punkten starten");
			
			// Latenzzeit berechnen
			getLatency(); 
			// Downloadzeit berechnen
			getDownloadTime(); 
		}
		
		// Werte ausgeben
		//printTrack("url100", p_trackmode);
		
		// Anzahl der Messungen Hochzählen und anzeigen
		numberOfmeasurements = numberOfmeasurements +1;

	log("run wurde beendet.");
}

// Funktion die die Latenzzeit berechnet mit einer Messung
function getLatencyShort(p_dataUrl)					// Parameter enthält URL zur Datei und gibt den Namen an Bsp. url50->speedtrack.org/.../50kb.txt
{ 
	log("getLatency wurde aufgerufen.");
		
	startTimeHelp = new Date();					// da sonst bei Threadwechsel die Daten verfälscht werden können
	latencyTimeStart = startTimeHelp.getTime();
	
		$.ajax({
			type: "HEAD",
			url: p_dataUrl,
			async: false,
			cache: false,
			success: function(data) {
				// ok Zeit stoppen
				endTimeHelp = new Date();		// da sonst bei threadwechsel die daten verfäscht werdenkönnen
				latencyTimeEnd = endTimeHelp.getTime();
				
				latencyTimeSum = latencyTimeSum + (latencyTimeEnd - latencyTimeStart);
				
				finLatencyMeasure = true;
				showNotLoadImg();
				
				log("latencyTimeEnd wurde gemessen");
				log("getLatency wurde beendet.");
			},
			error: function(jqXHR, textStatus, errorThrown) {
				// Zeige Status
				document.getElementById("stateOfTracking").firstChild.data = "Fehler bei Latenzbestimmung";
				document.getElementById("stateOfTracking").setAttribute("style", "color:red");
				
				log("Fehler, Latenz konnte nicht berechnet werden");
				log("Error: " + jqXHR + textStatus + errorThrown);
			}
		});
} 

// Funktion die die Latenzzeit berechnet mit fuenf Messungen
function getLatency()
{ 
	log("getLatency wurde aufgerufen.");
	
	for(var i = 0; i < 3; i++){
		
		url = url50;
		
		// um request abzufangen
		xhr.onreadystatechange  = function()
		{ 
			if(xhr.readyState  == 4)
			{
				log("in redyState Block drin...");
				
				if(xhr.status  == 200) {
					
					// ok zeit stoppen
					
					endTimeHelp = new Date();		// da sonst bei Threadwechsel die Daten verfäscht werden können
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

function extraGeoMeasure2() {
	log("extraGeoMeasure2 wurde aufgerufen");
	var options = { enableHighAccuracy: true,
					timeout: 1000,
					maximumAge: 1000 };
	navigator.geolocation.getCurrentPosition(extraGeoCallback, extraGeoErrorCallback, options);
	window.setTimeout("extraGeoMeasure1()", 2000);
	log("extraGeoMeasure2 wurde beendet");
}


function extraGeoMeasure1() {
	log("extraGeoMeasure1 wurde aufgerufen");
	if(geoThread == true || geoThreadP == true) {
		if(navigator.geolocation) {
			window.setTimeout("extraGeoMeasure2()", 3000);
			//console.log("geoThread: "+geoThred+" geoThreadP: " +geoThreadP);
		}
	} else {
		log("extraGeoMeasure1 wurde beendet");
		return;
	}
	
}




// Funktion die die Downloadzeit berechnet mit Ajax und fuer eine Messung
function getDownloadTimeShort(p_dataUrl, p_trackmode)				// Gleiche Funktion wie oben, jedoch mit Ajax und nicht direct mit XHR
{ 														// Parameter gibt Datei an, Bsp. url50
	log("getDownloadTime wurde aufgerufen.");

			if(isAndroidPhone) {
				var connection = checkConnection();
				if(connection == "No network connection") {
					downloadTimeSum = 0;
					if(p_trackmode) {
						document.getElementById("stateOfTracking").firstChild.data = "Keine Internetverbindung?";
						document.getElementById("stateOfTracking").setAttribute("style", "color:red");
					} else {
						document.getElementById("stateOfSpeed").firstChild.data = "Keine Internetverbindung?";
						document.getElementById("stateOfSpeed").setAttribute("style", "color:red");
					} return;
				} else {
					if(p_trackmode) {
						document.getElementById("stateOfTracking").firstChild.data = "Messung läuft..";
						document.getElementById("stateOfTracking").setAttribute("style", "color: #000");
					} else {
						document.getElementById("stateOfSpeed").firstChild.data = "Messung läuft..";
						document.getElementById("stateOfSpeed").setAttribute("style", "color: #000");
					}
				}
			}

			// start measuring
			startTimeHelp = new Date();
			downloadTimeStart = startTimeHelp.getTime();
			
			$.ajax({
				type: "GET",
				url: p_dataUrl,
				//async: false,
				cache: false,			// wichtig da es sonst aus cache geladen wird
				dataType: "text",
				success: function(data) {
					// Callback Funktion für erfolgreichen Download
					geoThread = false;
					
					if(p_trackmode) {
						document.getElementById("stateOfTracking").firstChild.data = "Messung läuft..";
						document.getElementById("stateOfTracking").setAttribute("style", "color: #000");
					} else {
						document.getElementById("stateOfSpeed").firstChild.data = "Messung läuft..";
						document.getElementById("stateOfSpeed").setAttribute("style", "color: #000");
					}
					
					endTimeHelp = new Date();		// da sonst bei threadwechsel die daten verfäscht werdenkönnen
					downloadTimeEnd = endTimeHelp.getTime();
					
					downloadTimeSum = downloadTimeSum + (downloadTimeEnd - downloadTimeStart);
								
					finDownloadMeasure = true;
					showNotLoadImg();
								
					log("downloadTimeEnd wurde gemessen");	
					
					if(downloadTimeSum != 0) {
						// Latenzzeit berechnen
						getLatencyShort(url100);
					} else latencyTimeSum = 0;
					
					printTrack("url100", p_trackmode);
				},
				error: function(jqXHR, textStatus, errorThrown){	
					// Falls keine Internetverbindung besteht gibt 
					// XHR einen NETWORK_ERR zurück (code: 19 bzw. 101) (Webkit/Safari)
					// "0x80004005 (NS_ERROR_FAILURE)" bzw. "0x80040111 (NS ERROR NOT AVAILABLE)" Firefox
					if(errorThrown.code == 19 || errorThrown.code == 101 ||
					  (errorThrown.message.search("0x80004005") ||  errorThrown.message.search("0x80040111")) != -1) {
						downloadTimeSum = 0;
						if(p_trackmode) {
							document.getElementById("stateOfTracking").firstChild.data = "Keine Internetverbindung?";
							document.getElementById("stateOfTracking").setAttribute("style", "color:red");
						} else {
							document.getElementById("stateOfSpeed").firstChild.data = "Keine Internetverbindung?";
							document.getElementById("stateOfSpeed").setAttribute("style", "color:red");
						}
					} else {
						// Zeige Status
						document.getElementById("stateOfTracking").firstChild.data = "Fehler bei Downloadrate";
						document.getElementById("stateOfTracking").setAttribute("style", "color:red");
					}
					
					log("Fehler mit dem runterlaen der datei" + jqXHR + textStatus + errorThrown);
					log("jqXHR: " + jqXHR);
					log("textStatus: " + textStatus);
					log("errorThrown: " +errorThrown);
				}
			}).responseText; 
			if(p_trackmode) {
				extraGeoMeasure1();			
			}
	
	log("getDownloadTime wurde beendet.");
} 

// Funktion die die DownloadZeit berechnet mit Ajax und fuer drei Messungen
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
			async: false,
			cache: false,				//wichtig da es sonst nur 1 mal rungergeladen wird
			dataType: "text",
			success: function(data) {
				
				// request funktuion wenn die 50 kilobyte runtergeladen wurden
				
				endTimeHelp = new Date();		// da sonst bei threadwechsel die Daten verfäscht werden können
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

// Funktion die bestimmt ob es an Servlet oder Emailadresse gesendet werden soll
function send(sendAsMail) {
	log("send wurde aufgerufen.");
	
	if(sendAsMail){
		sendReportAsMail();		
	}else{
		sendAsPost();		
	}

	// zeige Status
	document.getElementById("stateOfTracking").firstChild.data = "Track senden";
	
	log("send wurde beendet.");
}

// Funktion die das Ergebniss an eine E-mailadresse sendet 
// ist fuer Debug Zewcke gedacht
function sendReportAsMail() {
	log("sendMail wurde aufgerufen.");
	
		var link = "mailto:speedtrack.report@doubleslash.de?"   
             + "subject=" + "Track und Logfile der Messung mit Webapp"
             + "&body=" + "Da ein Fehler aufgetreten ist konnte der Benutzer die Messung per Email versenden." + "%0A" + "Es ist Folgender Fehler aufgetreten: " + errorMessage + "%0A" + textResultMail + "%0A" + "%0A" + "%0A" + logFile;

    window.location.href = link;
    	
	log("sendMail wurde beendet.");
}

// Funktion die das Ergebniss als post an ein Servlet sendet
function sendAsPost() {
	log("sendAsPost wurde aufgerufen.");
    
	now = new Date();
	timeStamp = now.getTime();
	
	trackName = name + "-" + timeStamp;
		
	transfer(textResult, trackName);
		
	log("sendAsPost wurde beendet.");
}

// Funktion die kontrolliert ob Benutzer eingeloggt ist
function isLogedIn() {
	log("isLogedIn wurde aufgerufen.");
	
	name = "Gast";
	
	$.post(urlString + "speedtrack/STLoginServlet",
			  { action: "userstatus" },
			  function(data) {
				  if(data.success) {
					  log("Benutzer ist eingeloggt.");
					  name = data.login;
					  document.getElementById("nameOfUserTrack").firstChild.data = name;
					  document.getElementById("nameOfUserSpeed").firstChild.data = name;
					  //send(true);		// Funktion zum Senden des Tracks
				  } else {
					  document.getElementById("stateOfTracking").firstChild.data = "Benutzter nicht eingeloggt";
					  document.getElementById("stateOfTracking").setAttribute("style", "color:red");
					  
					  document.getElementById("stateOfSpeed").firstChild.data = "Benutzter nicht eingeloggt";
					  document.getElementById("stateOfSpeed").setAttribute("style", "color:red");
					  
					  log("Benutzer ist ausgeloggt.");
					  location.href='index.html';					  
				  }
			  }, "json"
			);
	
	log("isLogedIn wurde beendet.");
}

// Funrkion die die Ladegrafik ausblendet
function showNotLoadImg() {
	log("showNotLoadImg wurde aufgerufen.");
	
	// blendet lLadebild aus wenn Messungen beendet sind
	if(finDownloadMeasure && finLatencyMeasure) {
		document.getElementById("loadPictureTrack").setAttribute("style", "visibility:hidden");
		document.getElementById("loadPictureSpeed").setAttribute("style", "visibility:hidden");
		log("Ladebild wurde ausgeblendet.");
	}
	
	log("showNotLoadImg wurde beendet.");
}

/* Funktion die das Ergebniss an das servlet überträgt, 
 * bei einem Fehler wird ein Sendebutton eingeblendet 
 * mit dem man dann eine Email mit dem Track und dem Log senden kann
 */
function transfer(result, name) {  
	log("transfer wurde aufgerufen.");
	
	document.getElementById("buttonDiv").setAttribute("style", "visibility:hidden");
	
	$.post(urlString + "speedtrack/STWizardServlet",
			  { trackString: result, trackName: name, action: "webapp" },
			  function(data) {
				  	var successString = data.success;
				  	var messageString = data.message;
				  
					errorMessage = messageString;
					
		    		if(successString) {				// Fehler oder Erfolg anzeigen
		    			document.getElementById("reportSuccess").innerText = "Übertragung erfolgreich abgeschlossen.";
		    			document.getElementById("reportSuccess").setAttribute("style", "color:black");
		    		} else {
		    			if(messageString != "Track benötigt mindestens "+minTrackPoints+" Messpunkte") {
		    				document.getElementById("buttonDiv").setAttribute("style", "visibility:visible");			
		    			}
		    			document.getElementById("reportSuccess").innerText = "Übertragung fehlerfaht.";
		    			document.getElementById("reportSuccess").setAttribute("style", "color:red");
		    		}
		    		if(messageString) {
		    			document.getElementById("reportMassage").firstChild.data = messageString;
		    		} else {
		    			// Error aus indexLoggedIn ausblenden	
		    			document.getElementById("reportMassage").firstChild.data = "";
		    		}
			  }, "json"
			);
	
	log("transfer wurde beendet.");
}

function checkConnection() {
    var networkState = navigator.network.connection.type;

    var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]   	= 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.NONE]     = 'No network connection';
    
    return states[networkState];
    //alert('Connection type: ' + states[networkState]);
}

function save(downloadRate,latency,latitude,longitude,timestamp,measureTyp) {
	// Ergebnisse abspeichern
	var textResultNew = textResult + downloadRate + "|" + latency + "|" + latitude + "|" + longitude + "|" + timestamp + "|" + measureTyp + "\r";
	textResult = textResultNew;
	
	// Ergebnisse abspeichern für Email
	textResultNew = textResultMail + downloadRate + "|" + latency + "|" + latitude + "|" + longitude + "|" + timestamp + "|" + measureTyp + "%0A";
	textResultMail = textResultNew;
	//alert(textResult);
}