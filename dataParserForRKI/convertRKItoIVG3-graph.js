//This programm takes a JSON file (console argument 1) from the RKI CoViD-19 Dataset https://npgeo-corona-npgeo-de.hub.arcgis.com/datasets/dd4580c810204019a7b8eb3e0b329dd6_0 and compresses it into a way smaller JSON file (console argument 2), that is useable for LMU InfoVis Group3 WS20/21.
//Example call: $ node convertRKItoIVG3-graph.js initialData.json fallzahlen.json
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
			
	n[i] = {"dateRep":dateIndex,"cases":0}
	
}

//----- Filling new JSON Array -----//
console.log("Aggregating data into new JSON Array...");

m.forEach(function(mp){ //For every entry in the list of cases from the RKI...
	var tDate = mp.Meldedatum; 
	
	n.forEach(function(np){
		if(np.dateRep == tDate){ //...find the corresponding date in the new JSON Array...
			np.cases = parseInt(np.cases) + parseInt(mp.AnzahlFall);
		}
	})
})


//----- Saving resulting JSON File -----//
console.log("Saving results to file "+resultFileName);
fs.writeFile(resultFileName, JSON.stringify(n), function(err, result) {
     if(err) console.log('error', err);
})