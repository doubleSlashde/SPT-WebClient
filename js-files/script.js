/*	------------------ Variablen ------------------ */	

// Variablen fuer Geolocation
var originLat;					// Breitengrad des eigenen Standorts
var originLng;					// Längengrad des eigenen Standortes
var geolocationStatus;			// Variable ob alles ok mit Geolocation
var numberOfGeoCalls;			// Anzahl wie oft geolocation neu aufgerufen wird(fuer Debug)

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
var name;						// Variable für Benutzername
var isAndroidPhone;				// gibt an Ob es ein Androidhandy ist
var version;					// gibt aktuelle Version an
var urlString;					// Speichert richtige URL fuer Webapp oder Andropid

// Variablen für die Ausgabe
var textResult;					// hier wird der Ergebnisstring gespeichert der an die Homepage geschickt wird
var textResultMail 				// hier wird der Ergebnisstring im Emailformat gespeichert
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
	version = "0.91";
	
	// anzeigen der Versionsnummer
	document.getElementById("versionId").firstChild.data = version;
	
	if(isAndroidPhone){
		// für Android	
		document.getElementById("platformId").firstChild.data = "Android App";
		document.getElementById("hardwareId").value = "Android App";
		urlString = "http://speedtracks.org/";		
		
	}else{
		// für lokales	
		document.getElementById("platformId").firstChild.data = "Web App";
		document.getElementById("hardwareId").value = "Web App";
		urlString = "../";		
	}
					
	// URL von Downloadpacket welches runtergeladen werden soll		
	url50 = urlString + "speedtrack-webclient/" + "downloadFiles/50kb.txt";

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
	
	if(navigator.geolocation){
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
	}else{
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
function geoCallback(position) {	
	log("geoCallback wird aufgerufen");
    
	// Anzahl der GeoCalls hochzählen
	numberOfGeoCalls = numberOfGeoCalls + 1;
	log("Anzahl der Geocalls: " + numberOfGeoCalls);
	
	var c = position.coords;   
	
	var latRounded = (Math.round(c.latitude *1000 *1000))/1000000; 
	var lngRounded = (Math.round(c.longitude *1000 *1000))/1000000; 
	
	// ueberpruefen ob sich die Koordinaten geaendert haben
	if(latRounded == originLat && lngRounded == originLng){
		// Koordinaten haben sich nicht geaendert, Fehler anzeigen
		document.getElementById("stateOfTracking").firstChild.data = "keine neuen Koordinaten";
		document.getElementById("stateOfTracking").setAttribute("style", "color:red");
		document.getElementById("latitudeId").setAttribute("style", "color:red");
		document.getElementById("longitudeId").setAttribute("style", "color:red");
		
		// Punkt wird nicht gezählt
		geolocationStatus = false;
		
	}else{
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

// Funktion für Fehlerbehandlung von geo-Bestimmung
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
	textResult = headerString;
	
	// Inizialisiert die Anzeigen
	numberOfmeasurements = 0;
	
	document.getElementById("numberOfTracks").firstChild.data = numberOfmeasurements;
	document.getElementById("downloadRateOfTracking").firstChild.data = "0";
	document.getElementById("latencyOfTracking").firstChild.data = "0";
	document.getElementById("latitudeId").firstChild.data = "Breitengrad";
	document.getElementById("longitudeId").firstChild.data = "Längengrad";
	document.getElementById("stateOfTracking").setAttribute("style", "color:black");
	document.getElementById("stateOfTracking").firstChild.data = "Tracking gestartet";
			
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
	
	// starte Zeitmessung
	startTimeMeasure();
	
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

	// stoppt Zeitmessung
	stopTimeMeasuret();
	
	// sendet die Ergebnisse per Mail oder per post an Servlet
	send(false);
	
	log("stopMeasure wurde beendet.");
}

// Funktion die die Ergebnisse ausgibt und abspeichert
function printTrack() {
	log("printTrack wurde aufgerufen.");
	
	var latency = 0;									// Variable für die Latenzzeit
	
	var downloadRate = 0;								// Variable für die Downloadrate
	
	// Downloadrate Berechnen
	var time = 0;
	time = ((downloadTimeSum)) / 1000.0; 				//sec

	if (time != 0){
		if(shortMeasure){								// in Byte pro sec da es so auf HP steht
			downloadRate = ((50/time)*1000);			// nur 50 kb werden runtergeladen	
			
			latency = ((latencyTimeSum ) / 2); 			// milli sec
		}else{
			downloadRate = ((150/time)*1000);			// 150 kb werden runtergeladen
			
			latency = ((latencyTimeSum ) / 3 / 2); 		// milli sec
		}
	} else{
		downloadRate = 0;								// wenn time == 0 muss ein Fehler passiert sein!!!!
	}
	
	// Runden von der Ergebnisse
	var downloadRateEnd = Math.round(downloadRate); 
	var latencyEnd = Math.round(latency); 
	
	// Ergebnisse abspeichern
	var textResultNew = textResult + downloadRateEnd + "|" + latencyEnd + "|" + originLat + "|" + originLng + "|" + timeStamp + "\r";
	textResult = textResultNew;
	
	// Ergebnisse abspeichern für Email
	textResultNew = textResultMail + downloadRateEnd + "|" + latencyEnd + "|" + originLat + "|" + originLng + "|" + timeStamp + "%0A";
	textResultMail = textResultNew;

	
	// zeige Längen und Breitengrad
	document.getElementById("latitudeId").firstChild.data = originLat;
	document.getElementById("longitudeId").firstChild.data = originLng;

	// zeige Latenzzeit und Downloadzeit an
	document.getElementById("downloadRateOfTracking").firstChild.data = downloadRateEnd;
	document.getElementById("latencyOfTracking").firstChild.data = latencyEnd;
	
	// zeige werte in Log
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

	// Zeige Status und Anzahl Messungen
	if(numberOfmeasurements < 50){
		document.getElementById("stateOfTracking").setAttribute("style", "color:black");
		document.getElementById("numberOfTracks").setAttribute("style", "color:red");			
		document.getElementById("stateOfTracking").firstChild.data = "Tracking läuft, nicht unterbrechen";	
	}else{
		document.getElementById("stateOfTracking").setAttribute("style", "color:green");
		document.getElementById("numberOfTracks").setAttribute("style", "color:green");
		document.getElementById("stateOfTracking").firstChild.data = "Tracking kann gesendet werden";	
	}
	
	// Koordinaten aktuallisieren
	geoStart();		
	
	// schauen ob Geoloaction an und ob es richtig gemessen hat
	if(geolocationStatus){
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
		
		// Anzahl der Messungen Hochzählen und anzeigen
		numberOfmeasurements = numberOfmeasurements +1;
	}else{
		
		// Fehler mit Geoloction!!!
		document.getElementById("stateOfTracking").setAttribute("style", "color:red");
	}

	log("run wurde beendet.");
}

// Funktion die die Latenzzeit berechnet mit einer Messung
function getLatencyShort()
{ 
	log("getLatency wurde aufgerufen.");
	
		url = url50;
		
		// um Request abzufangen
		xhr.onreadystatechange  = function()
		{ 
			if(xhr.readyState  == 4)
			{
				log("in redyState Block drin...");
				
				if(xhr.status  == 200){
					
					// ok Zeit stoppen
					
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
				
				if(xhr.status  == 200){
					
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




// Funktion die die Downloadzeit berechnet mit Ajax und fuer eine Messung
function getDownloadTimeShort()				// Gleiche Funktion wie oben, jedoch mit Ajax und nicht direct mit XHR
{ 
	log("getDownloadTime wurde aufgerufen.");
		
		// start measuring
		startTimeHelp = new Date();
		downloadTimeStart = startTimeHelp.getTime();
		
		$.ajax({
			type: "GET",
			url: url50,
			async: false,
			cache: false,			// wichtig da es sonst aus cach geladen wird
			dataType: "text",
			success: function(data) {
				
				// request funktuion wenn die 50 kilobyte runtergeladen wurden
				
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
			async: false,			//wichtig da es sonst nur 1 mal rungergeladen wird
			cache: false,
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
	
		var link = "mailto:speedtrack@doubleSlash.de?"   
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
	log("showNotLoadImg wurde aufgerufen.");
	
	// blendet lLadebild aus wenn Messungen beendet sind
	if(finDownloadMeasure && finLatencyMeasure){
		document.getElementById("loadPictureId").setAttribute("style", "visibility:hidden");
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
			  function(data){
				  	var successString = data.success;
				  	var messageString = data.message;
				  
					errorMessage = messageString;
					
		    		if(successString){				// Fehler oder Erfolg anzeigen
		    			document.getElementById("reportSuccess").firstChild.data = "erfolgreich";
		    			document.getElementById("reportSuccess").setAttribute("style", "color:black");
		    		}else{
		    			if(messageString != "Track benötigt mindestens 50 Messpunkte"){
		    				document.getElementById("buttonDiv").setAttribute("style", "visibility:visible");			
		    			}
		    			
		    			document.getElementById("reportSuccess").firstChild.data = "fehlerhaft";
		    			document.getElementById("reportSuccess").setAttribute("style", "color:red");
		    		}
		    		document.getElementById("reportMassage").firstChild.data = messageString;
			  }, "json"
			);
	
	log("transfer wurde beendet.");
}
