//This programm takes a JSON file (console argument 1) from the RKI CoViD-19 Dataset https://npgeo-corona-npgeo-de.hub.arcgis.com/datasets/dd4580c810204019a7b8eb3e0b329dd6_0 and compresses it into a way smaller JSON file (console argument 2), that is useable for LMU InfoVis Group3 WS20/21.
//Example call: $ node convertRKItoIVG3-map.js initialData.json results.json
//Note that a readable JSON format is required, which is achieved by downloading the CSV from the above site and converting it to JSON.
//For questions please refer to schmidt.al@campus.lmu.de
fs = require('fs');

//----- Variables -----//
//const inputFileName = "initialData.json"
//const resultFileName = "result.json"
const inputFileName = process.argv[2]
const resultFileName = process.argv[3]

//How many days are to be included beginning with 01/01/2020. Until 31/12/2020 = 366 (leap year)
const amountDays = 366; 

//----- Editing the JSON Array -----//
console.log("Reading JSON file " + inputFileName);
var m = JSON.parse(fs.readFileSync(inputFileName).toString());

/* No longer required for now as a new Array is constructed that only grabs needed data.
console.log("Removing unneeded fields.");
m.forEach(function(p){
	delete p.FID
	//delete p.Bundesland
	delete p.IdBundesland
	delete p.Landkreis
	delete p.Altersgruppe
	delete p.Geschlecht
	delete p.IdLandkreis
	delete p.Datenstand
	delete p.NeuerFall
	delete p.NeuerTodesfall
	delete p.Refdatum
	delete p.NeuGenesen
	delete p.AnzahlGenesen
	delete p.IstErkrankungsbeginn
	delete p.Altersgruppe2
})
*/

//change Meldedatum to format "DD/MM/YYYY"
m.forEach(function(p){
	var date = p.Meldedatum;
	var newDate = date[8] + date[9] + '/' + date[5] + date[6] + '/' + date[0] + date[1] + date[2] + date[3];
	p.Meldedatum = newDate;
})

//----- Constructing new JSON Array -----//
var n = new Array(amountDays);

var date = new Date(2020,00,01);
for (i = 0; i < amountDays ; i++){
	var dateDay = date.getDate()
	if(dateDay < 10){dateDay = "0" + dateDay}
	var dateMonth = date.getMonth()+1
	if(dateMonth < 10){dateMonth = "0" + dateMonth}
	
	var dateIndex = dateDay + '/' + dateMonth + '/' + date.getFullYear();
	date.setDate(date.getDate()+1);
	
	var attributes = [
		{"Bundesland":"Schleswig-Holstein","cases":{"AnzahlFall":0,"Inzidenz":0,"AnzahlTodesfall":0}},
		{"Bundesland":"Hamburg","cases":{"AnzahlFall":0,"Inzidenz":0,"AnzahlTodesfall":0}},
		{"Bundesland":"Niedersachsen","cases":{"AnzahlFall":0,"Inzidenz":0,"AnzahlTodesfall":0}},
		{"Bundesland":"Bremen","cases":{"AnzahlFall":0,"Inzidenz":0,"AnzahlTodesfall":0}},
		{"Bundesland":"Nordrhein-Westfalen","cases":{"AnzahlFall":0,"Inzidenz":0,"AnzahlTodesfall":0}},
		{"Bundesland":"Hessen","cases":{"AnzahlFall":0,"Inzidenz":0,"AnzahlTodesfall":0}},
		{"Bundesland":"Rheinland-Pfalz","cases":{"AnzahlFall":0,"Inzidenz":0,"AnzahlTodesfall":0}},
		{"Bundesland":"Baden-Württemberg","cases":{"AnzahlFall":0,"Inzidenz":0,"AnzahlTodesfall":0}},
		{"Bundesland":"Bayern","cases":{"AnzahlFall":0,"Inzidenz":0,"AnzahlTodesfall":0}},
		{"Bundesland":"Saarland","cases":{"AnzahlFall":0,"Inzidenz":0,"AnzahlTodesfall":0}},
		{"Bundesland":"Berlin","cases":{"AnzahlFall":0,"Inzidenz":0,"AnzahlTodesfall":0}},
		{"Bundesland":"Brandenburg","cases":{"AnzahlFall":0,"Inzidenz":0,"AnzahlTodesfall":0}},
		{"Bundesland":"Mecklenburg-Vorpommern","cases":{"AnzahlFall":0,"Inzidenz":0,"AnzahlTodesfall":0}},
		{"Bundesland":"Sachsen","cases":{"AnzahlFall":0,"Inzidenz":0,"AnzahlTodesfall":0}},
		{"Bundesland":"Sachsen-Anhalt","cases":{"AnzahlFall":0,"Inzidenz":0,"AnzahlTodesfall":0}},
		{"Bundesland":"Thüringen","cases":{"AnzahlFall":0,"Inzidenz":0,"AnzahlTodesfall":0}}
	];
	
	n[i] = {"Meldedatum":dateIndex,"casesByBL":attributes}
	
}

//----- Filling new JSON Array -----//
console.log("Aggregating data into new JSON Array...");

m.forEach(function(mp){ //For every entry in the list of cases from the RKI...
	var tDate = mp.Meldedatum; 
	
	n.forEach(function(np){
		if(np.Meldedatum == tDate){ //...find the corresponding date in the new JSON Array...
			np.casesByBL.forEach(function(npp){ //...and for every Bundesland within that date...
					
				if(npp.Bundesland == mp.Bundesland){ //...find the Bundesland corresponding to the RKI entry...
					npp.cases.AnzahlFall = parseInt(npp.cases.AnzahlFall) + parseInt(mp.AnzahlFall); //...and then add the entry cases to the total cases for that Bundesland on that day
					npp.cases.AnzahlTodesfall = parseInt(npp.cases.AnzahlTodesfall) + parseInt(mp.AnzahlTodesfall);
				}
			})
		}
	})
})

//----- Calculate Inzidenz -----//
console.log("Calculating Inzidenz...");
//Bevölkerungszahlen Bundesländer 2019  lt. statistischem Bundesamt https://de.wikipedia.org/wiki/Liste_der_deutschen_Bundesl%C3%A4nder_nach_Bev%C3%B6lkerung
var inzBL = [
	{"Bundesland":"Schleswig-Holstein","population":2903773,"pastDays":[0,0,0,0,0,0]},
	{"Bundesland":"Hamburg","population":1847253,"pastDays":[0,0,0,0,0,0]},
	{"Bundesland":"Niedersachsen","population":7993608,"pastDays":[0,0,0,0,0,0]},
	{"Bundesland":"Bremen","population":681202,"pastDays":[0,0,0,0,0,0]},
	{"Bundesland":"Nordrhein-Westfalen","population":17947221,"pastDays":[0,0,0,0,0,0]},
	{"Bundesland":"Hessen","population":6288080,"pastDays":[0,0,0,0,0,0]},
	{"Bundesland":"Rheinland-Pfalz","population":4093903,"pastDays":[0,0,0,0,0,0]},
	{"Bundesland":"Baden-Württemberg","population":11100394,"pastDays":[0,0,0,0,0,0]},
	{"Bundesland":"Bayern","population":13124737,"pastDays":[0,0,0,0,0,0]},
	{"Bundesland":"Saarland","population":986887,"pastDays":[0,0,0,0,0,0]},
	{"Bundesland":"Berlin","population":3669491,"pastDays":[0,0,0,0,0,0]},
	{"Bundesland":"Brandenburg","population":2521893,"pastDays":[0,0,0,0,0,0]},
	{"Bundesland":"Mecklenburg-Vorpommern","population":1608138,"pastDays":[0,0,0,0,0,0]},
	{"Bundesland":"Sachsen","population":4071971,"pastDays":[0,0,0,0,0,0]},
	{"Bundesland":"Sachsen-Anhalt","population":2194782,"pastDays":[0,0,0,0,0,0]},
	{"Bundesland":"Thüringen","population":2133378,"pastDays":[0,0,0,0,0,0]}
];

var ges = 0;
//The Array is sorted by date ascending so we can just loop it according to its index for this
for (i = 0; i < amountDays ; i++){
	n[i].casesByBL.forEach(function(p){
		inzBL.forEach(function(ip){
			if(ip.Bundesland == p.Bundesland){
				var casesPast6days = ip.pastDays.reduce((a, b) => parseInt(a) + parseInt(b), 0);
				var casesToday = parseInt(p.cases.AnzahlFall);
				var cases7days = casesPast6days + casesToday;
				var inzidenz = cases7days / ( parseInt(ip.population) / 100000 );
				p.cases.Inzidenz = inzidenz;
				//console.log("Index: "+i+", BL: "+ip.Bundesland+", pastDays: " + ip.pastDays+", Inzidenz: "+inzidenz);
				rollingIndex = i % 6;
				ip.pastDays[rollingIndex] = casesToday;
			}
		})
	
	})
	
}

/* No longer required for no as no data is nulled and saved
console.log("Removing JSON elements according to specification. Please wait...");
var removedCount = 0;
m.forEach(function(p){
	if(p.FID > 10 && p.FID != 12){
		delete m[p.FID-1]
		removedCount++;
	}
})
console.log("Successfully removed " + removedCount + " elements.");

//----- Creating a new JSON Array without null values -----//
var nMax = m.length - removedCount;
var n = new Array(nMax);

console.log("Building new JSON array with " + nMax + " elements...");
var nIndex = 0;
m.forEach(function(p){
	if(nIndex == nMax){return;}
	if(p != null){
		n[nIndex] = p;
		nIndex++;
	}		
})
*/

//----- Saving resulting JSON File -----//
console.log("Saving results to file "+resultFileName);
fs.writeFile(resultFileName, JSON.stringify(n), function(err, result) {
     if(err) console.log('error', err);
})