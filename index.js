var d3;

import('d3')
  .then((ret) => { d3 = ret; })
  .catch((err) => { console.log(err) });
const D3Node = require("d3-node");

module.exports = class Visualiser {
  constructor({ width = 600, height = 600 }) {
    this.width = width;
    this.height = height;
    this.d3n = new D3Node();
    this.svg = this.d3n.createSVG(width, height);
  }
  visualise = function () {
    return this.d3n.html();
  }
  donut = function ({ data, outterRadius = 70, innerRadius = 60,
    offsetX = this.width / 2, offsetY = this.height / 2, sortFunc = d => -1, domain = data.map(elem => elem.name),
    colorRange = ["green", "red"], fontSize = 30, text = "5", textOffsetX = offsetX, textOffsetY = offsetY,
    toInclude = ["value", "id"] }) {



    const color = d3.scaleOrdinal()
      .domain(domain)
      .range(colorRange);
    const pie = d3.pie().sort(sortFunc);
    const datat = pie(data.map(elem => elem.value));

    let ret = this.svg.append("g").attr("transform", `translate(${offsetX},${offsetY})`).selectAll('pieces')
      .data(datat)
      .enter()
      .append('path')
      .attr('d', d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outterRadius)
      )
      .attr('fill', (d) => color(d))
      .classed('donut-arc', true);
    for (const v of toInclude) {
      ret.attr(v, d => d[v]);
    }
    this.svg.append("text")
      .attr("x", textOffsetX)
      .attr("y", textOffsetY)
      .attr("font-size", fontSize)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .text(text)
      .classed("donut-text", true);
    return this;
  }



  radar = function ({ data, features, maxRadius = 100, fillColors = ["rgba(0,255,0,0.7)", "rgba(255,0,0,0.7)"],
    centerHorizontalOffset = 200, centerVerticalOffset = 200, labelFontSize = (d) => "15px", ticks = [1, 2.5, 5, 7.5, 10],
    strokeColor = (t) => "black", strokeHighlight = (t) => t % 5 == 0 ? 5 : 3,
    axisColor = (i) => "black", axisWidth = (i) => 1,
    toInclude = ["value", "id"] }) {
    const polyscale = d3.scaleLinear()
      .domain([0, 10])
      .range([0, maxRadius]);

    const angler = (angle, value, name, attr_value) => {
      const x = Math.cos(angle) * polyscale(value);
      const y = Math.sin(angle) * polyscale(value);
      return {
        "x": centerHorizontalOffset + x, "y": centerVerticalOffset - y,
        "name": name, "val": attr_value
      };
    };
    const shapeMaker = (d) => {
      const coordinates = [];
      for (let i = 0; i <= features.length; i++) {
        const iMod = i % features.length;
        const angle = (Math.PI / 2) + (2 * Math.PI * iMod / features.length);
        coordinates.push(angler(angle, d[features[iMod]], features[iMod], d[features[iMod]]));
      }
      return coordinates;
    };
    const line = d3.line()
      .x(d => d.x)
      .y(d => d.y);
    ticks.forEach(t => {
      const coordinates = [];
      for (let i = 0; i < features.length; i++) {
        const angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
        coordinates.push(angler(angle, t, features[i], 0));
      }
      coordinates.push(coordinates[0]);
      this.svg.append("path")
        .datum(coordinates)
        .attr("d", line)
        .attr("stroke", strokeColor(t))
        .attr("stroke-width", strokeHighlight(t))
        .attr("fill", "none")
        .classed("poly-outlines", true);
    });


    for (let i = 0; i < features.length; i++) {
      const ft_name = features[i];
      const angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
      const line_coordinate = angler(angle, 10, features[i], 0);
      const label_coordinate = angler(angle, 10.5, features[i], 0);

      this.svg.append("line")
        .attr("x1", centerHorizontalOffset)
        .attr("y1", centerVerticalOffset)
        .attr("x2", line_coordinate.x)
        .attr("y2", line_coordinate.y)
        .attr("stroke-width", axisWidth(i))
        .attr("stroke", axisColor(i))
        .classed("axes", true);

      this.svg.append("text")
        .attr("x", i > (features.length / 2) ? label_coordinate.x + 5 : label_coordinate.x - 5)
        .attr("y", label_coordinate.y)
        .attr("text-anchor", i > (features.length / 2) ? "left" : "end")
        .style("font-size", (d)=>labelFontSize(d))
        .text(ft_name);
    }

    data.forEach((d, i) => {
      const coordinates = shapeMaker(d);
      const fillColor = fillColors[i % fillColors.length];

      this.svg.append("path")
        .datum(coordinates)
        .attr("d", line)
        .attr("fill", fillColor)
        .classed("interior-fill", true);
    });

    data.forEach((d, i) => {
      const coordinates = shapeMaker(d);

      const pointColor = "green";
      this.svg.selectAll("dot")
        .data(coordinates).enter()
        .append("circle")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", 5)
        .attr("fill", pointColor)
        .classed("data-point", true);
      // .on("mouseover", () => console.log("Hi"))
      // .on("mouseout",  console.log("Hi"));
    });
    return this;
  }
  
  spider = this.radar
  grid = function(xScale){
    console.log("kill me", xScale.ticks())
    return (g) => g
      .attr('class', 'grid-lines')
      .selectAll('line')
      .data(xScale.ticks())
      .join('line')
      .attr('x1', d => xScale(d))
      .attr('x2', d => xScale(d))
      .attr('y1', 0)
      .attr('y2', 10000)
  }
  auc = function ({ data, min_render = 0, max_render = 1000, YOffset = 100, XOffset = 100,
    axisYHeight = this.height / 2, axisXWidth = this.width / 2, pointRadius = 10,
    min_el = 0, max_el = 10, tickCount = -1, tickFormatter = (x) => x, lineColor = "green",
    lineWidth = 5, pointFill = (d) => "green", areaColor = "rgba(0,10,190, 0.6)", toIncludeDots = ["x", "y", "id"],
    yGridCount = max_el - min_el, xGridCount = tickCount, xGridColour = (i)=> "rgba(0,0,200,0.5)", xGridWidth = (i)=> 1,
    yGridColour = (i)=> "rgba(0,0,200,0.5)", yGridWidth = xGridWidth, xFontSize = (i)=>"20px", yFontSize = xFontSize}) {
    data = [data]
    let yRange = [min_render, max_render];
    tickCount = tickCount == -1 ? max_el - min_el : tickCount;
    xGridCount = xGridCount== -1 ? tickCount : xGridCount;
    const xScale = d3.scaleLinear()
      .range([0, axisXWidth])
      .domain([min_el, max_el]);
    
    let localSvg = this.svg.append("g")
      .style("user-select", "none")
      .attr("transform", `translate(${YOffset}, ${XOffset})`)
    
    localSvg.append("g")
      .attr("transform", `translate(0, ${axisYHeight})`)
      .call(d3.axisBottom(xScale).ticks(tickCount).tickFormat(tickFormatter)).selectAll("text")
      .attr("transform", "translate(-20, 0) rotate(-45)")
      .style("font-size", (i)=> xFontSize(i))
      .style("text-anchor", "end")
      
    
    

    const yScale = d3.scaleLinear()
      .domain(yRange)
      .range([axisYHeight, 0]);
    localSvg.append("g")
      // .attr("transform", `translate(100, 0)`)
      .call(d3.axisLeft(yScale)).selectAll("text")
      .style("font-size", (i)=> yFontSize(i))

    
    let i = 0;
    data.forEach((container) => {
      console.log(container)
      let ret1 = localSvg.append("path")
        .datum(container)
        .attr("d", d3.line()
          .x(function (d) { return xScale(d.x); })
          .y(function (d) { return yScale(d.y); })
          
          )
        .attr("stroke", lineColor)
        .attr("stroke-width", lineWidth)
        .attr("fill", areaColor)
        .attr("d", d3.area()
          .x(function(d) { return xScale(d.x) })
          .y0(yScale(0))
          .y1(function(d) { return yScale(d.y) })
        )
        .classed("line-segment", true);

        
       
      localSvg.append('g').call(d3.axisBottom()
        .tickFormat("")
        .ticks(xGridCount)
        .tickSize(axisYHeight)
        .scale(xScale)).selectAll("line")
        .attr("stroke", (i)=>xGridColour(i))
        .attr("stroke-width",(i)=> xGridWidth(i));
      localSvg.append('g').call(d3.axisLeft()
          .tickFormat("")
          .ticks(yGridCount)
          .tickSize(-axisXWidth)
          .scale(yScale)).selectAll("line")
          .attr("stroke", (i)=>yGridColour(i))
          .attr("stroke-width",(i)=> yGridWidth(i));  

      let ret = localSvg.selectAll("dot")
        .data(container).enter()
        .append("circle")
        .attr("cx", function (d) { return xScale(d.x); })
        .attr("cy", function (d) { return yScale(d.y); })
        .attr("r", pointRadius)
        .attr("fill", (d)=>pointFill(d))
        .classed("line-dots", true);
      // .on("mouseover", (e, d) => {
      //   tooltip.setText(`${container.label}: ${d.value}`)
      //         .setVisible();
      //   d3.select(e.target).attr("fill", this.selectedCircleColor);
      // })
      // .on("mouseout", (e, d) => {
      //   tooltip.setHidden();

      //   let oldColour;
      //   if (this.inHighlights(d.date, containerIdx)) { oldColour = this.highlightedCircleColor; }
      //   else { oldColour = container.colour; }
      //   d3.select(e.target).attr("fill", oldColour);
      // });
      for (const v of toIncludeDots) {
        ret.attr(v, d => d[v]);
      }
      i += 1;
    });
    
    return this;
  }
  lines = function ({ data, min_render = 0, max_render = 1000, YOffset = 100, XOffset = 100,
    axisYHeight = this.height / 2, axisXWidth = this.width / 2, pointRadius = 10,
    min_el = 0, max_el = 10, tickCount = -1, tickFormatter = (x) => x, lineColor = (i) => "green",
    lineWidth = (i) => 5, pointFill = (d) => "green", toIncludeDots = ["x", "y", "id"],
    yGridCount = max_el - min_el, xGridCount = tickCount, xGridColour = (i)=> "rgba(0,0,200,0.5)", xGridWidth = (i)=> 1,
    yGridColour = (i)=> "rgba(0,0,200,0.5)", yGridWidth = xGridWidth, xFontSize = (i)=>"20px", yFontSize = xFontSize}) {
      let yRange = [min_render, max_render];
      tickCount = tickCount == -1 ? max_el - min_el : tickCount;
      xGridCount = xGridCount== -1 ? tickCount : xGridCount;
      const xScale = d3.scaleLinear()
        .range([0, axisXWidth])
        .domain([min_el, max_el]);
      
      let localSvg = this.svg.append("g")
        .style("user-select", "none")
        .attr("transform", `translate(${YOffset}, ${XOffset})`)
      
      localSvg.append("g")
        .attr("transform", `translate(0, ${axisYHeight})`)
        .call(d3.axisBottom(xScale).ticks(tickCount).tickFormat(tickFormatter)).selectAll("text")
        .attr("transform", "translate(-20, 0) rotate(-45)")
        .style("font-size", (i)=> xFontSize(i))
        .style("text-anchor", "end")
        
      
      
  
      const yScale = d3.scaleLinear()
        .domain(yRange)
        .range([axisYHeight, 0]);
      localSvg.append("g")
        // .attr("transform", `translate(100, 0)`)
        .call(d3.axisLeft(yScale)).selectAll("text")
        .style("font-size", (i)=> yFontSize(i))
  
      
      let i = 0;
      data.forEach((container) => {
        console.log(container)
        let ret1 = localSvg.append("path")
          .datum(container)
          .attr("d", d3.line()
            .x(function (d) { return xScale(d.x); })
            .y(function (d) { return yScale(d.y); })
            
            )
          .attr("stroke", lineColor(i))
          .attr("stroke-width", lineWidth(i))
          .attr("fill", "none")
          .classed("line-segment", true);
  
          
         
        localSvg.append('g').call(d3.axisBottom()
          .tickFormat("")
          .ticks(xGridCount)
          .tickSize(axisYHeight)
          .scale(xScale)).selectAll("line")
          .attr("stroke", (i)=>xGridColour(i))
          .attr("stroke-width",(i)=> xGridWidth(i));
        localSvg.append('g').call(d3.axisLeft()
            .tickFormat("")
            .ticks(yGridCount)
            .tickSize(-axisXWidth)
            .scale(yScale)).selectAll("line")
            .attr("stroke", (i)=>yGridColour(i))
            .attr("stroke-width",(i)=> yGridWidth(i));  
  
        let ret = localSvg.selectAll("dot")
          .data(container).enter()
          .append("circle")
          .attr("cx", function (d) { return xScale(d.x); })
          .attr("cy", function (d) { return yScale(d.y); })
          .attr("r", pointRadius)
          .attr("fill", (d) => pointFill(i))
          .classed("line-dots", true);
        // .on("mouseover", (e, d) => {
        //   tooltip.setText(`${container.label}: ${d.value}`)
        //         .setVisible();
        //   d3.select(e.target).attr("fill", this.selectedCircleColor);
        // })
        // .on("mouseout", (e, d) => {
        //   tooltip.setHidden();
  
        //   let oldColour;
        //   if (this.inHighlights(d.date, containerIdx)) { oldColour = this.highlightedCircleColor; }
        //   else { oldColour = container.colour; }
        //   d3.select(e.target).attr("fill", oldColour);
        // });
        for (const v of toIncludeDots) {
          ret.attr(v, d => d[v]);
        }
        i += 1;
      });
      
      return this;
    }
  connectedScatterPlots = this.lines
  line = function ({ data, min_render = 0, max_render = 1000, YOffset = 100, XOffset = 100,
    axisYHeight = this.height / 2, axisXWidth = this.width / 2, pointRadius = 10,
    min_el = 0, max_el = 10, tickCount = 10, tickFormatter = (x) => x, lineColor = "green",
    lineWidth = 5, pointFill = (d)=> "green", toInclude = ["value", "id"],
    yGridCount = max_el - min_el, xGridCount = tickCount, xGridColour = (i)=> "rgba(0,0,200,0.5)", xGridWidth = (i)=> 1,
    yGridColour = (i)=> "rgba(0,0,200,0.5)", yGridWidth = (i)=> 1, xFontSize = (i)=>"20px", yFontSize = xFontSize }) {
    return this.lines({
      data: [data], min_render: min_render, max_render: max_render, YOffset: YOffset, XOffset: XOffset,
      axisYHeight: axisYHeight, axisXWidth: axisXWidth, pointRadius: pointRadius,
      min_el: min_el, max_el: max_el, tickCount: tickCount, tickFormatter: tickFormatter, lineColor: (i)=>lineColor,
      lineWidth: (i)=>lineWidth, pointFill: pointFill, toInclude: toInclude, yGridCount: yGridCount, xGridCount: xGridCount,
      xGridColour: xGridColour, xGridWidth: xGridWidth, yGridColour: yGridColour, yGridWidth: yGridWidth, 
      xFontSize: xFontSize, yFontSize: yFontSize
    })
  }


  connectedScatterPlot = this.line

  scatterPlot = function ({ data, min_render = 0, max_render = 1000, YOffset = 100, XOffset = 100,
    axisYHeight = this.height / 2, axisXWidth = this.width / 2, pointRadius = 10,
    min_el = 0, max_el = 10, tickCount = 10, tickFormatter = (x) => x, pointFill = (d) => "green", toInclude: toInclude,
    yGridCount = max_el - min_el, xGridCount = tickCount, xGridColour = (i)=> "rgba(0,0,200,0.5)", xGridWidth = (i)=> 1,
    yGridColour = (i)=> "rgba(0,0,200,0.5)", yGridWidth = (i)=> 1, xFontSize = (i)=>"20px", yFontSize = xFontSize }) {
    return this.lines({
      data: [data], min_render: min_render, max_render: max_render, YOffset: YOffset, XOffset: XOffset,
      axisYHeight: axisYHeight, axisXWidth: axisXWidth, pointRadius: pointRadius,
      min_el: min_el, max_el: max_el, tickCount: tickCount, tickFormatter: tickFormatter, lineColor: (i) => "green",
      lineWidth: (i) => 0, pointFill: pointFill, toInclude: toInclude, yGridCount: yGridCount, xGridCount: xGridCount,
      xGridColour: xGridColour, xGridWidth: xGridWidth, yGridColour: yGridColour, yGridWidth: yGridWidth, 
      xFontSize: xFontSize, yFontSize: yFontSize
    })
  }


  bar = function ({ data, max_val = undefined, min_val = undefined, YOffset = 100, XOffset = 100, axisYHeight = this.height / 2, axisXWidth = this.width / 2,
    strokeWidth = 2, strokeColor = "black", barMargin = 0, colorBar = (d) => "blue", fontSize = (d) => "15px", yFontSize = "15px",
    toInclude = ["value", "id"], yGridCount = max_val,  yGridColour = (i)=> "rgba(0,0,200,0.5)", yGridWidth = (i)=> 1}) {




    const max_el = max_val == undefined ? data.reduce((acc, e1) => acc = acc > e1.value ? acc : e1.value, -Infinity) : max_val;
    const min_el = min_val == undefined ? data.reduce((acc, e1) => acc = acc < e1.value-1 ? acc : e1.value-1, Infinity) : min_val;
    yGridCount = yGridCount == undefined ? max_el : yGridCount;
    let localSvg = this.svg.append("g")
      .style("user-select", "none")
      .attr("transform", `translate(${YOffset}, ${XOffset})`)
    // Create the X-axis band scale
    const x = d3.scaleBand()
      .range([0, axisXWidth])
      .domain(data.map(d => d.name))
      .padding(0.1);

    // Draw the X-axis on the DOM
    localSvg.append("g")
      .attr("transform", "translate(0," + axisYHeight + ")")
      .call(d3.axisBottom(x).ticks(data.length))
      .selectAll("text")
      .attr("transform", "translate(-10,0) rotate(-45)")
      .style("text-anchor", "end")
      .attr("font-size", fontSize);

    // Create the Y-axis band scale
    const y = d3.scaleLinear()
      .domain([min_el, max_el])
      .range([axisYHeight, 0]);

    // Draw the Y-axis on the DOM
    localSvg.append("g")
      .call(d3.axisLeft(y))
      .attr("font-size", yFontSize);
      
    localSvg.append('g').call(d3.axisLeft()
      .tickFormat("")
      .ticks(yGridCount)
      .tickSize(-axisXWidth)
      .scale(y)).selectAll("line")
      .attr("stroke", (i)=>yGridColour(i))
      .attr("stroke-width",(i)=> yGridWidth(i));    

    // Create and fill the bars
    let ret = localSvg.selectAll("bars")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", d => x(d["name"]))
      .attr("y", d => y(d["value"]))
      .attr("transform", "translate(" + barMargin / 2 + ",0)")
      .attr("width", x.bandwidth() - barMargin)
      .attr("height", d => axisYHeight - y(d.value) - strokeWidth)
      .attr("stroke", strokeColor)
      .attr("stroke-width", strokeWidth)
      .attr("fill", colorBar);

    for (const v of toInclude) {
      ret.attr(v, d => d[v]);
    }



    // .on("mouseover", (e, d) => {
    //   console.log("over")
    // })
    // .on("mouseout", (e, d) => {
    //   tooltip.setHidden();
    //   if (highlighted.includes(d.Name)) { d3.select(e.target).attr("fill", gameBarColor); }
    //   else { d3.select(e.target).attr("fill", barColor); }
    // });

    return this;
  }


}


