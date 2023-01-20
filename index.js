let d3;
import('d3') 
.then((ret)=>{ d3 = ret; })         
.catch((err)=>{ console.log(err) });
const D3Node = require("d3-node")
exports.donutChart = function({data, width = 600, height = 600, outterRadius = 70, innerRadius = 60, offsetX = width/2, offsetY = height/2, 
sortFunc = d => -1, domain = data.map(elem => elem.name), colorRange = ["green", "red"], fontSize = 30, text = "5"}) {
  let d3n = new D3Node();
  
  // let svg = d3.select("svg");
  const color = d3.scaleOrdinal()
                  .domain(domain)
                  .range(colorRange);
  const pie   = d3.pie().sort(sortFunc);
  const datat  = pie(data.map(elem => elem.value));
  const svg = d3n.createSVG(width,height)
  svg.append("g").attr("transform", `translate(${offsetX},${offsetY})`).selectAll('pieces')
  .data(datat)
  .enter()
  .append('path')
  .attr('d', d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(outterRadius)
  )
  .attr('fill', (d) => color(d))
  .classed('donut-arc', true);
  svg.append("text")
            .attr("x", offsetX)
            .attr("y", offsetY)
            .attr("font-size", fontSize)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .text(text)
            .classed("donut-text", true);
  return d3n.html();
}

