/*	------------------ Variablen ------------------ */	

var urlString;						// String in dem URL gespeichert wird


/*	------------------ Wichtig fuer Consolenausgabe ------------------ */


window.log = function(message) {
	// Wichtig für die Konstolenausgabe
	console.log?console.log(message):alert(message);
};


/*	------------------ Funktionen ------------------ */		


// Funktion die wichtige sachen inizialisiert
function userInit() {
	
	// (ACHTUNG muss auch in script.js geändert werden)
	// Angabe ob fuer Android oder nicht
	var android = false;
	// Versionsangabe
	version = "1.0.0";
	
	document.getElementById("versionId").firstChild.data = version;
	
	if(android) {
		// für Android	
		document.getElementById("platformId").firstChild.data = "Android App";
		urlString = "http://speedtracks.org/";
	} else {
		// für lokales	
		document.getElementById("platformId").firstChild.data = "Web App";
		urlString = "../";
	}
}


// Funktion die den User einloggt
function userLogin() {
	log("userLogin wird gestartet");
	
	var password = document.getElementById("passwordId").value;
	var loginName = document.getElementById("loginNameId").value;

	if(loginName == null || loginName == "") {
		alert("Bitte geben sie einen Loginnamen ein");	
		log("Kein Username eingegeben");
	} else if(password == null || password == "") {
		alert("Bitte geben sie ein Passwort ein");
		log("Kein Passwort eingegeben");
	} else {
		
		$.post(urlString + "speedtrack/STLoginServlet",
				  { login: loginName, passwd: password },
				  function(data) {
					  if(data.success) {
						  log("userLogin erfolgreich");
						  //send(true);			// Sendefunktion des Tracks in script.js
						  location.href='indexLoggedIn.html'; 
					  } else {
						  log(data.message);
						  alert(data.message);					  
					  }
				  }, "json"
				);
	}
	
	log("userLogin wird beendet");	
}

// Funktion die den User ausloggt
function userLogout(){
	log("userLogout wird gestartet");
	
    $.ajax({
    	type: "POST",
		contentType: "application/json;",
		dataType: "json",
		async: false,
    	url: urlString + "speedtrack/STLogoutServlet",
    	success: function(data){
    		location.href='index.html';
    	}
    });
    
    log("userLogout wird beendet");
}

// Funktion die die Userregistrierungsdaten versendet
function registrationCommit(){
	log("registrationCommit wird gestartet");
	
	// Zurücksetzen der Fehlerfarben
	initRegistry();
	
	// Registrierungsanfrage absenden
	$.post(urlString + "speedtrack/STRegistrationServlet",
		{   action: "write",
			login: document.getElementById("regNameId").value, 
			pass1: document.getElementById("passwordId1").value, 
			pass2: document.getElementById("passwordId2").value, 
			email: document.getElementById("emailId").value, 
			website: document.getElementById("WebsiteId").value, 
			country: document.getElementById("landId").value, 
			place: document.getElementById("placeId").value, 
			aboutme: document.getElementById("aboutMeId").value },
			function(data) {
				if(data.success) {
					location.href='index.html'; 
				} else {
					if(data.message == "") {
						var resultString = "Folgende Fehler sind aufgetreten: ";
						if(data.errors.login != null) {
							resultString = resultString + " Bei Loginname: " + data.errors.login ;
							document.getElementById("loginNameLableId").setAttribute("style", "color:red");
						}
						if(data.errors.pass1 != null) {
							resultString = resultString + " Bei Passwort 1: " + data.errors.pass1;
							document.getElementById("passwordLableId1").setAttribute("style", "color:red");
						}
						if(data.errors.pass2 != null) {
							 resultString = resultString + " Bei Password 2: " + data.errors.pass2;	
								document.getElementById("passwordLableId2").setAttribute("style", "color:red");
						}
						if(data.errors.email != null) {
							resultString = resultString + " Bei E-Mail: " +  data.errors.email;
							document.getElementById("emailLableId").setAttribute("style", "color:red");
						} else if(resultString == "Folgende Fehler sind aufgetreten: ") {							
							resultString = "Es ist ein unbekannter Fehler aufgetreten";
						}	
						alert(resultString);
					} else {
						alert(data.message);					  						
					}
				}
			}, "json"
	);
	log("registrationCommit wird beendet");
}

// Funktion die ein neues Password beantraegt
function newPassword() {
	log("newPassword wird gestartet");	
	
	// Passwordanfrage absenden
	$.post(urlString + "speedtrack/STForgotPasswordServlet",
			{ login: document.getElementById("forgetPasswordId").value },
				function(data) {
					 if(data.success) {
						location.href='indexLoggedIn.html'; 
					} else {
						alert(data.message);					  
				}
			}, "json"
	);
	
	log("newPassword wird beendet");
}

//// Funktion die den User weiterleitet
//function acceptInfo(){
//	location.href='indexRegistration.html';
//}
//
//// Funktion die den User weiterleitet
//function goBack(){
//	location.href='index.html';
//}

// Funktion die die Farben der Registrierungslables auf schwarz setzt
function initRegistry() {
	log("initRegistry wird gestartet");
	
	document.getElementById("loginNameLableId").setAttribute("style", "color:black");
	document.getElementById("passwordLableId1").setAttribute("style", "color:black");
	document.getElementById("passwordLableId2").setAttribute("style", "color:black");
	document.getElementById("emailLableId").setAttribute("style", "color:black");
	
	log("initRegistry wird beendet");
}
