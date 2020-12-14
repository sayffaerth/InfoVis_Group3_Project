function salesData(data) {

  visRace(data);

}

function visRace(data) {

  var margin = {top: 10, right: 30, bottom: 30, left: 60},
  width = 500 - margin.left - margin.right,
  height = 700 - margin.top - margin.bottom;

  var svg = d3.select("#raceContainer")
      .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
      .append("g")
          .attr("transform", `translate(${margin.left}, ${margin.top})`);

  var xAxis = d3.scaleLinear()
      .domain(d3.extent(data[0].Seife))
      .range([0, width]);
  svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(xAxis))

  var yAxis =d3.scaleLinear()
      .domain(d3.extent(data[0].Seife))
      .range([height, 0])
  svg.append("g")
      .call(d3.axisLeft(yAxis))
}