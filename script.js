var month;
var week;


// Get Data Fallzahlen
function traverseData(data){
    const fallzahlen = data.filter(item => item.year == 2020);

    visualizeAsLineChart(fallzahlen);
}

//Get Data Kaufverhalten
function salesData(data){
    const racezahlen = data.filter(item => item);
    visualizeRace(racezahlen);
};

// Visualisiere Fallzahlen Funktion
function visualizeAsLineChart(data){

    var parseDate = d3.timeParse("%d/%m/%Y"),
            bisectDate = d3.bisector(function(d) { return d.dateRep; }).left,
            formatValue = d3.format(","),
            dateFormatter = d3.timeFormat("%b %y"); // Monthname Jahreszahl
            dateFormatter2 = d3.timeFormat("%d/%m/%Y"); //Tag/Monat/Jahr
            dateFormatter3 = d3.timeFormat("%m"); //Month
            dateFormatter4 = d3.timeFormat("%W"); //Week
    
    var margin = { top: 10, right: 120, bottom: 20, left: 50 },
            width = 1000 - margin.left - margin.right,
            height = 170 - margin.top - margin.bottom;
    
    //Zeichnet Funktion
    var line = d3.line()
        .x(function(d) { return x(d.dateRep); })
        .y(function(d) { return y(d.cases); });
    
    //Zeichnet Fläche
    var svg = d3.select("#visFall")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom) 
        .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);
    
    
    //Convertiert die Daten
    data.forEach(function(d) {
        d.dateRep = parseDate(d.dateRep);
        d.cases = +d.cases;
    });
    
    //Sortiert das Datum
    data.sort(function(a, b) {
        return a.dateRep - b.dateRep;
    });
    
    //Default Einstellungen
    var moving = false;
    var currentValue = 0;
    var targetValue = width;
    
    var playButton = d3.select("#play-button");
        
    //Legt Achsen fest
    var x = d3.scaleTime()
        .domain([data[0].dateRep, data[data.length-1].dateRep])
        .range([0, targetValue])
        .clamp(true);
    
    var y = d3.scaleLinear()
        .domain([0, 24000])
        .range([height, 0]);
        //y.domain(d3.extent(data, function(d) { return d.cases; }));
    
    var xAxis = d3.axisBottom(x)
        .tickFormat(dateFormatter);
    
    var yAxis = d3.axisLeft(y)
        .tickFormat(d3.format(""));
    
    //Achsen
    svg.append("g")
        .attr("class", "xaxis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
    
    svg.append("g")
        .attr("class", "yaxis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Fallzahlen");
    
    //Fallzahlenverlauf
    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#9de0ff")
        .attr("class", "line")
        .attr("d", line);
    
    
    //Slider
    var slider = svg.append("g")
        .attr("class", "slider");
    
    //Linie an der Slider entlang läuft
    slider.append("line")
        .attr("class", "track")
        .attr("x1", x.range()[0])
        .attr("x2", x.range()[1])
        .attr("y1", y.range()[0])
        .attr("y2", y.range()[0])
      .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr("class", "track-overlay")
        .call(d3.drag()
            .on("start.interrupt", function() { slider.interrupt(); })
            .on("start drag", function() {
              currentValue = d3.event.x;
              update(x.invert(currentValue)); 
            })
        );
    
    slider.insert("g", ".track-overlay")
        .attr("class", "ticks")
        .attr("transform", "translate(0," + 30 + ")");
    
    //Line
    var liner = slider.append("line")
        .attr("class", "x")
        .style("stroke", "white")
        .style("opacity", 0.5)
        .style("stroke-width", "2px")
        .attr("y1", -7)
        .attr("y2", 140);
    
    //Focus Kreis
    var focus = slider.append("circle")
        .attr("class", "y")
        .style("fill", "none")
        .style("stroke", "white")
        .attr("r", 4)
        .attr("cy", 140);
    
    //Hintergrund Quadrat
    var quader = slider.append("rect")
        .attr("class", "tooltip")
        .attr("width", 75)
        .attr("height", 30)
        .attr("transform", "translate("+ (7) + "," + (-7) + ")")
        .style("fill", "grey")
        .style("opacity", 0.7)
        .attr("rx", 4)
        .attr("ry", 4);
    
    //Texte am Slider
    var label1 = slider.append("text")  
        .attr("class", "label")
        .text(dateFormatter2(data[0].dateRep))
        .attr("transform", "translate("+ (15) + "," + (6) + ")")
        .attr("font-family", "calibri")
        .attr("font-size","10px")
        .style("fill", "white");
    
    var label2 = slider.append("text")  
        .attr("class", "label")
        .text("Fallzahl:"+ data[0].cases)
        .attr("transform", "translate("+ (15) + "," + (18) + ")")
        .attr("font-family", "calibri")
        .attr("font-size","10px")
        .style("fill", "white");
    
    
    //Button Funktion
    playButton
        .on("click", function() {
        var button = d3.select(this);
        if (button.text() == "Pause") {
          moving = false;
          clearInterval(timer);
          // timer = 0;
          button.text("Play");
        } else {
          moving = true;
          timer = setInterval(step, 1);
          button.text("Pause");
        }
        //console.log("Slider moving: " + moving);
      })
    
    //Play Funktion
    function step() {
      update(x.invert(currentValue));
      currentValue = currentValue + (targetValue/1500);
      if (currentValue > targetValue) {
        moving = false;
        currentValue = 0;
        clearInterval(timer);
        // timer = 0;
        playButton.text("Play");
        //console.log("Slider moving: " + moving);
      }
    }

    //Formt die Zeit über den Datensatz zu den Cases um
    function transformCases(){
        var x0 = x.invert(currentValue),
            i = bisectDate(data, x0, 1),
            d0 = data[i - 1],
            d1 = data[i],
            d = x0 - d0.dateRep > d1.dateRep - x0 ? d1 : d0;
        return d;
    }
    
    // Update position and text of label according to slider scale
    function update(h) {
        
        //Mitbewegen der Linie
        liner.attr("x1", x(h));
        liner.attr("x2", x(h));
    
        //Mitbewegen der Texte
        label1
            .attr("x", x(h))
            .text(dateFormatter2(h));
        label2
            .attr("x", x(h))
            .text("Fallzahl:"+transformCases().cases);
    
        //Mitbewegen des Positionskreises
        focus
            .attr("cx", x(h))
            .attr("cy", y(transformCases().cases));
    
        quader
            .attr("x", x(h));

        //Angabe aktueller Monat und Week
        //TODO: Auslagern für Race und Grafik
        month = dateFormatter3(h);
        week = dateFormatter4(h);
 
    }
}
 
//----------------------------------------------------------------------------------
//Visualisiere das Race
function visualizeRace(data){
    
    var margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 500 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

    var svg = d3.select("#visRace")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

    //Formatierungen für die Zeit
    var parseDate = d3.timeParse("%W. KW %Y"),
        bisectDate = d3.bisector(function(d) { return d.Kalenderwoche; }).left,
        formatValue = d3.format(","),
        dateFormatter = d3.timeFormat("%Y");
        dateFormatter2 = d3.timeFormat("%m");

    //Formatiert Kalenderwochen in den Daten
    data.forEach(function(d) {
        d.Kalenderwoche = parseDate(d.Kalenderwoche);
    });

    //Größe Achsen
    var x = d3.scaleBand()
            .range([0, width]).padding(0.7);

    var y = d3.scaleLinear()
            .range([height, 0]);

    //Position Achse
    var xAxis = d3.axisBottom(x);
    var yAxis = d3.axisLeft(y);

    //Sortieren
    data.sort(function(a, b) {
        return a.Kalenderwoche - b.Kalenderwoche;
    });

    //Achsenbeschriftung
    x.domain(Object.keys(dataToDraw(data)));
    y.domain([0, 900]);

    //X-Achse
    svg.append("g")
        .attr("class", "xaxis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    //Y-Achse
    svg.append("g")
        .attr("class", "yaxis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Absatzindex");

    svg.append("line")
        .attr("class", "x")
        .style("stroke", "#ef885a")
        .style("opacity", 1)
        .style("stroke-width", "2px")
        .attr("y1", 410)
        .attr("y2", 410)
        .attr("x1", 0)
        .attr("x2", 410);

    svg.append("text")  
        .attr("class", "hunder")
        .text("Vorjahres Durchschnitt")
        .attr("transform", "translate("+ (318) + "," + (405) + ")")
        .attr("font-family", "calibri")
        .attr("font-size","10px")
        .style("fill", "#ef885a")
        .style("opacity", 1);

    //Entfernt die Kalenderwochen von den Daten
    function dataToDraw(data){
            let returnData = {
                Seife : parseFloat(data.Seife),
                Toilettenpapier : parseFloat(data.Toilettenpapier), 
                Mehl : parseFloat(data.Mehl),
                Desinfektionsmittel : parseFloat(data.Desinfektionsmittel),
                Hefe : parseFloat(data.Hefe)
            }
            return returnData
    }

    // for (let i of data) {
    // if (dateFormatter2(d.Kalenderwoche) == week){
    // timeChoose(data[i]);}}
    timeChoose(data[0]);

    function timeChoose(data){
    var newData = [
        {"Product": "Seife", "Count": parseFloat(data.Seife)},
        {"Product": "Toilettenpapier", Count: parseFloat(data.Toilettenpapier)},
        {"Product": "Mehl", "Count": parseFloat(data.Mehl)},
        {"Product": "Desinfektionsmittel", Count: parseFloat(data.Desinfektionsmittel)},
        {"Product": "Hefe", "Count": parseFloat(data.Hefe)}
    ]
    
    svg.selectAll(".bar")
        .data(newData)
        .enter()
        .append("rect")
            .attr("class", "bar")
            .attr("x", function(d) { return x(d.Product); })
            .attr("y", function(d) { return y(d.Count); })
            .attr("width", x.bandwidth())
            .attr("height", function(d) { return height - y(d.Count); })
            .attr("fill", "#9de0ff");
    
    //Bilder
    var imgSeife = svg.append('image')
    .attr('href', './Pictures/Verkaufszahlen/Seife_oB.png')
    .attr('width', 50)
    .attr('height', 50)
    .attr("x", 36)
    .attr("y",  y(110 + newData[0].Count) );

    var imgToi = svg.append('image')
    .attr('href', './Pictures/Verkaufszahlen/Klopapier.png')
    .attr('width', 50)
    .attr('height', 50)
    .attr("x", 108)
    .attr("y", y(105 + newData[1].Count) );

    var imgMehl = svg.append('image')
    .attr('href', './Pictures/Verkaufszahlen/Mehl.png')
    .attr('width', 50)
    .attr('height', 50)
    .attr("x", 180)
    .attr("y", y(100 + newData[2].Count) );
    
    var imgDes = svg.append('image')
    .attr('href', './Pictures/Verkaufszahlen/Desinfektionsmittel.png')
    .attr('width', 50)
    .attr('height', 50)
    .attr("x", 252)
    .attr("y", y(105 + newData[3].Count) );
    
    var imgHefe = svg.append('image')
    .attr('href', './Pictures/Verkaufszahlen/Hefe.png')
    .attr('width', 50)
    .attr('height', 50)
    .attr("x", 324)
    .attr("y",  y(90 + newData[4].Count) );
    }
}