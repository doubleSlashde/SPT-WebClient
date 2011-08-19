
//Funktion die das Ergebniss an das servlet überträgt
function transfer(result, name) {  
	
	var urlString;
	var android = false;
	
	if(android){
		// für Android	
		urlString = "http://speedtracks.org/";
	}else{
		// für lokales	
		urlString = "../";
	}
	
	
	$.post(urlString + "speedtrack/STWizardServlet",
			  { trackString: result, trackName: name, action: "webapp" },
			  function(data){
				  	var successString = data.success;
				  	var messageString = data.message;
				  
		    		if(successString){
		    			document.getElementById("reportSuccess").firstChild.data = "erfolgreich";
		    			document.getElementById("reportSuccess").setAttribute("style", "color:black");
		    		}else{
//		    			var button1 = document.createElement("a");
//		    			button1.name = "Als E-Mail senden";
		    					    			
//		    			button1.setAttribute("data-role", "button");
//		    			button1.setAttribute("onclick", "send(true)");
//		    			button1.setAttribute("data-theme", "c");
//		    			button1.setAttribute("data-inline", "true");	
		    			
//		    			document.getElementById("buttonDiv").appendChild(button1);
		    			document.getElementById("reportSuccess").firstChild.data = "fehlerhaft";
		    			document.getElementById("reportSuccess").setAttribute("style", "color:red");
		    		}
		    		document.getElementById("reportMassage").firstChild.data = messageString;
			  }, "json"
			);

}

//var button1 = document.createElement("button onclick=\"send(true)\" data-theme=\"c\" id = \"sendButton\" data-inline=\"true\"");
//button1.value = "Als E-Mail senden";
//document.getElementById("buttonDiv").appendChild(button1);