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

  legend = function ({ data, colours = (i) => "green", y = this.height * 0.15, x = this.width - 0.5 * this.width, distance_elms = 25, dotRadius = 5,
    backgroundColour = "rgba(240,240,240, 0.8)" }) {
    let tmp = colours
    if (!(colours instanceof Function)) {
      if (Array.isArray(colours)) {

        colours = (d, i) => tmp[i % tmp.length]
      } else {

        colours = (i) => tmp
      }

    }
    let mx_l = 0
    for(const el in data){
      mx_l = data[el].length > mx_l ? data[el].length : mx_l
    }
    y = Math.floor(y)
    x = Math.floor(x)
    let svgLocal = this.svg.append("g")
    .style("user-select", "none")
    .attr("transform", `translate(${x}, ${y})`)
    svgLocal.append("rect")
    .attr("width", `${mx_l*9}`)
    .attr("height", `${data.length * distance_elms + 10}px` )
    .attr("transform", `translate(${-10}, ${-10})`)
    .attr("fill", backgroundColour);
    svgLocal.selectAll("dots")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", 3)
      .attr("cy", function (d, i) { return i * distance_elms })
      .attr("r", dotRadius)
      .style("fill", colours)

      svgLocal.selectAll("labels")
      .data(data)
      .enter()
      .append("text")
      .attr("x", 3 * dotRadius)
      .attr("y", function (d, i) { return i * distance_elms })
      .style("fill", colours)
      .text(function (d) { return d })
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle")
      

    return this;
  }
  donut = function ({ data, outterRadius = 70, innerRadius = 60,
    offsetX = this.width / 2, offsetY = this.height / 2, sortFunc = d => -1, domain = data.map(elem => elem.name),
    colorRange = ["green", "red"], fontSize = 30, text = "5", textOffsetX = offsetX, textOffsetY = offsetY,
    toInclude = ["value", "id"] }) {


    if (!Array.isArray(colorRange)) {
      colorRange = [colorRange]

    }

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

    if (!Array.isArray(fillColors)) {
      fillColors = [fillColors]

    }


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
        .style("font-size", (d) => labelFontSize(d))
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
  grid = function (xScale) {
    
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
  auc = function ({ data, min_render = undefined, max_render = undefined, YOffset = 100, XOffset = 100,
    axisYHeight = this.height / 2, axisXWidth = this.width / 2, pointRadius = 10,
    min_el = undefined, max_el = undefined, tickCount = -1, tickFormatter = (x) => x, lineColor = "green",
    lineWidth = 5, pointFill = (d) => "green", areaColor = "rgba(0,10,190, 0.6)", toIncludeDots = ["x", "y", "id"],
    yGridCount = undefined, xGridCount = tickCount, xGridColour = (i) => "rgba(0,0,200,0.5)", xGridWidth = (i) => 1,
    yGridColour = (i) => "rgba(0,0,200,0.5)", yGridWidth = xGridWidth, xFontSize = (i) => "20px", yFontSize = xFontSize }) {
    let tmpxgw = xGridWidth
    data = [data]
    let tmp_data = []
      let minvaltmp = 0;
      let maxvaltmp = -Infinity;
      let minx = 0;
      let maxx = -Infinity;
      for(const ln in data){
        let tmpmid = []
        let i = 0;
        for(const el in data[ln]){
          let toadd = {}
          let flag = false
          if(data[ln][el].y == undefined){
            toadd.y = data[ln][el]
            
            
            
          }else{
            toadd.y = data[ln][el].y
          }
          minvaltmp = Math.min(minvaltmp,toadd.y )
          maxvaltmp = Math.max(maxvaltmp,toadd.y * 1.2 )
          if(max_render != undefined && toadd.y > max_render ){
            toadd.x = i - 1 + Math.max(1.0/Math.abs(toadd.y/max_render),0.1)
            toadd.y = Math.min(max_render, toadd.y)
            
            console.log(toadd.y)
            flag = true;
          }
          if(min_render != undefined && toadd.y < min_render ){
            toadd.x = i - 1 + Math.max(1/Math.abs(min_render - toadd.y),0.1)
            toadd.y = Math.min(min_render,toadd.y)
            
            flag = true;
          }
          if(flag){
            i+= 1
            minx = Math.min(minx,toadd.x)
            maxx = Math.max(maxx,toadd.x + 2)
            tmpmid.push(toadd)
            continue
          }
          if(data[ln][el].x == undefined){
            toadd.x = i
            i+= 1
          }else{
            toadd.x = data[ln][el].x
            i = toadd.x
          }
          minx = Math.min(minx,toadd.x)
          maxx = Math.max(maxx,toadd.x + 2)
          tmpmid.push(toadd)
        }
        tmp_data.push(tmpmid)
      }

      data = tmp_data
      min_el = min_el == undefined ? minx : min_el
      max_el = max_el == undefined ? maxx : max_el
      min_render = min_render == undefined ? minvaltmp : min_render
      max_render = max_render == undefined ? maxvaltmp : max_render
      max_el = Math.floor(max_el)
      console.log("done", data)
      yGridCount = yGridCount == undefined ? Math.min(10,max_render - min_render) : yGridCount
      console.log(yGridCount, min_el, max_el)
    if (!(xGridWidth instanceof Function)) {
      if (Array.isArray(xGridWidth)) {

        xGridWidth = (i) => tmpxgw[i % tmpxgw.length]
      } else {

        xGridWidth = (i) => tmpxgw
      }
    }
    let tmpygw = yGridWidth

    if (!(yGridWidth instanceof Function)) {
      if (Array.isArray(yGridWidth)) {

        yGridWidth = (i) => tmpygw[i % tmpygw.length]
      } else {

        yGridWidth = (i) => tmpygw
      }
    }
    let tmxgridcolor = xGridColour

    if (!(xGridColour instanceof Function)) {
      if (Array.isArray(xGridColour)) {

        xGridColour = (i) => tmxgridcolor[i % tmxgridcolor.length]
      } else {

        xGridColour = (i) => tmxgridcolor
      }
    }
    
    let tmygridcolor = yGridColour

    if (!(yGridColour instanceof Function)) {
      if (Array.isArray(yGridColour)) {

        yGridColour = (i) => tmygridcolor[i % tmygridcolor.length]
      } else {

        yGridColour = (i) => tmygridcolor
      }
    }

    let tmpointfill = pointFill

    if (!(pointFill instanceof Function)) {
      if (Array.isArray(pointFill)) {

        pointFill = (d, i) => tmpointfill[i % tmpointfill.length]
      } else {

        pointFill = (i) => tmpointfill
      }
    }

    let tmxfontsz = xFontSize

    if (!(xFontSize instanceof Function)) {
      if (Array.isArray(xFontSize)) {

        xFontSize = (i) => tmxfontsz[i % tmxfontsz.length]
      } else {

        xFontSize = (i) => tmxfontsz
      }
    }

    let tmyfontsz = yFontSize

    if (!(yFontSize instanceof Function)) {
      if (Array.isArray(yFontSize)) {

        yFontSize = (i) => tmyfontsz[i % tmyfontsz.length]
      } else {

        yFontSize = (i) => tmyfontsz
      }
    }
    
    let yRange = [min_render, max_render];
    tickCount = tickCount == -1 ? max_el - min_el : tickCount;
    xGridCount = xGridCount == -1 ? tickCount : xGridCount;
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
      .style("font-size", (i) => xFontSize(i))
      .style("text-anchor", "end")




    const yScale = d3.scaleLinear()
      .domain(yRange)
      .range([axisYHeight, 0]);
    localSvg.append("g")
      // .attr("transform", `translate(100, 0)`)
      .call(d3.axisLeft(yScale)).selectAll("text")
      .style("font-size", (i) => yFontSize(i))


    let i = 0;
    data.forEach((container) => {
      
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
          .x(function (d) { return xScale(d.x) })
          .y0(yScale(0))
          .y1(function (d) { return yScale(d.y) })
        )
        .classed("line-segment", true);



      localSvg.append('g').call(d3.axisBottom()
        .tickFormat("")
        .ticks(xGridCount)
        .tickSize(axisYHeight)
        .scale(xScale)).selectAll("line")
        .attr("stroke", (i) => xGridColour(i))
        .attr("stroke-width", (i) => xGridWidth(i));
      localSvg.append('g').call(d3.axisLeft()
        .tickFormat("")
        .ticks(yGridCount)
        .tickSize(-axisXWidth)
        .scale(yScale)).selectAll("line")
        .attr("stroke", (i) => yGridColour(i))
        .attr("stroke-width", (i) => yGridWidth(i));

      let ret = localSvg.selectAll("dot")
        .data(container).enter()
        .append("circle")
        .attr("cx", function (d) { return xScale(d.x); })
        .attr("cy", function (d) { return yScale(d.y); })
        .attr("r", pointRadius)
        .attr("fill", (d) => pointFill(d))
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
  lines = function ({ data, min_render = undefined, max_render = undefined, YOffset = 100, XOffset = 100,
    axisYHeight = this.height / 2, axisXWidth = this.width / 2, pointRadius = 10,
    min_el = undefined, max_el = undefined, tickCount = -1, tickFormatter = (x) => x, lineColor = (i) => "green",
    lineWidth = (i) => 5, pointFill = (d) => "green", toIncludeDots = ["x", "y", "id"],
    yGridCount = undefined, xGridCount = tickCount, xGridColour = (i) => "rgba(0,0,200,0.5)", xGridWidth = (i) => 1,
    yGridColour = (i) => "rgba(0,0,200,0.5)", yGridWidth = xGridWidth, xFontSize = (i) => "20px", yFontSize = xFontSize }) {
      let tmp_data = []
      let minvaltmp = 0;
      let maxvaltmp = -Infinity;
      let minx = 0;
      let maxx = -Infinity;
      for(const ln in data){
        let tmpmid = []
        let i = 0;
        for(const el in data[ln]){
          let toadd = {}
          let flag = false
          if(data[ln][el].y == undefined){
            toadd.y = data[ln][el]
            
            
            
          }else{
            toadd.y = data[ln][el].y
          }
          minvaltmp = Math.min(minvaltmp,toadd.y )
          maxvaltmp = Math.max(maxvaltmp,toadd.y * 1.2 )
          if(max_render != undefined && toadd.y > max_render ){
            toadd.x = i - 1 + Math.max(1.0/Math.abs(toadd.y/max_render),0.1)
            toadd.y = Math.min(max_render, toadd.y)
            
            console.log(toadd.y)
            flag = true;
          }
          if(min_render != undefined && toadd.y < min_render ){
            toadd.x = i - 1 + Math.max(1/Math.abs(min_render - toadd.y),0.1)
            toadd.y = Math.min(min_render,toadd.y)
            
            flag = true;
          }
          if(flag){
            i+= 1
            minx = Math.min(minx,toadd.x)
            maxx = Math.max(maxx,toadd.x + 2)
            tmpmid.push(toadd)
            continue
          }
          if(data[ln][el].x == undefined){
            toadd.x = i
            i+= 1
          }else{
            toadd.x = data[ln][el].x
            i = toadd.x
          }
          minx = Math.min(minx,toadd.x)
          maxx = Math.max(maxx,toadd.x + 2)
          tmpmid.push(toadd)
        }
        tmp_data.push(tmpmid)
      }

      data = tmp_data
      min_el = min_el == undefined ? minx : min_el
      max_el = max_el == undefined ? maxx : max_el
      min_render = min_render == undefined ? minvaltmp : min_render
      max_render = max_render == undefined ? maxvaltmp : max_render
      max_el = Math.floor(max_el)
      console.log("done", data)
      yGridCount = yGridCount == undefined ? Math.min(10,max_render - min_render): yGridCount
      console.log(yGridCount, min_el, max_el)
      
      let tmplw = lineWidth
      if (!(lineWidth instanceof Function)) {
        if (Array.isArray(lineWidth)) {
  
          lineWidth = (i) => tmplw[i % tmplw.length]
        } else {
  
          lineWidth = (i) => tmplw
        }
      }
      
      let tmplc = lineColor
      if (!(lineColor instanceof Function)) {
        if (Array.isArray(lineColor)) {
          
          lineColor = (i) => tmplc[i % tmplc.length]
        } else {
  
          lineColor = (i) => tmplc
        }
      }
      let tmpxgw = xGridWidth

      if (!(xGridWidth instanceof Function)) {
        if (Array.isArray(xGridWidth)) {
  
          xGridWidth = (i) => tmpxgw[i % tmpxgw.length]
        } else {
  
          xGridWidth = (i) => tmpxgw
        }
      }
      let tmpygw = yGridWidth
  
      if (!(yGridWidth instanceof Function)) {
        if (Array.isArray(yGridWidth)) {
  
          yGridWidth = (i) => tmpygw[i % tmpygw.length]
        } else {
  
          yGridWidth = (i) => tmpygw
        }
      }
      let tmxgridcolor = xGridColour
  
      if (!(xGridColour instanceof Function)) {
        if (Array.isArray(xGridColour)) {
  
          xGridColour = (i) => tmxgridcolor[i % tmxgridcolor.length]
        } else {
  
          xGridColour = (i) => tmxgridcolor
        }
      }
      
      let tmygridcolor = yGridColour
  
      if (!(yGridColour instanceof Function)) {
        if (Array.isArray(yGridColour)) {
  
          yGridColour = (i) => tmygridcolor[i % tmygridcolor.length]
        } else {
  
          yGridColour = (i) => tmygridcolor
        }
      }
  
      let tmpointfill = pointFill
  
      if (!(pointFill instanceof Function)) {
        if (Array.isArray(pointFill)) {
  
          pointFill = (i) => tmpointfill[i % tmpointfill.length]
        } else {
  
          pointFill = (i) => tmpointfill
        }
      }
  
      let tmxfontsz = xFontSize
  
      if (!(xFontSize instanceof Function)) {
        if (Array.isArray(xFontSize)) {
  
          xFontSize = (i) => tmxfontsz[i % tmxfontsz.length]
        } else {
  
          xFontSize = (i) => tmxfontsz
        }
      }
  
      let tmyfontsz = yFontSize
  
      if (!(yFontSize instanceof Function)) {
        if (Array.isArray(yFontSize)) {
  
          yFontSize = (i) => tmyfontsz[i % tmyfontsz.length]
        } else {
  
          yFontSize = (i) => tmyfontsz
        }
      }
    let yRange = [min_render, max_render];
    tickCount = tickCount == -1 ? max_el - min_el : tickCount;
    xGridCount = xGridCount == -1 ? tickCount : xGridCount;
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
      .style("font-size", (i) => xFontSize(i))
      .style("text-anchor", "end")




    const yScale = d3.scaleLinear()
      .domain(yRange)
      .range([axisYHeight, 0]);
    localSvg.append("g")
      // .attr("transform", `translate(100, 0)`)
      .call(d3.axisLeft(yScale)).selectAll("text")
      .style("font-size", (i) => yFontSize(i))


    let i = 0;
    data.forEach((container) => {
      
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
        .attr("stroke", (i) => xGridColour(i))
        .attr("stroke-width", (i) => xGridWidth(i));
      localSvg.append('g').call(d3.axisLeft()
        .tickFormat("")
        .ticks(yGridCount)
        .tickSize(-axisXWidth)
        .scale(yScale)).selectAll("line")
        .attr("stroke", (i) => yGridColour(i))
        .attr("stroke-width", (i) => yGridWidth(i));

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
    console.log("done")
    return this;
  }
  connectedScatterPlots = this.lines
  line = function ({ data, min_render = 0, max_render = 1000, YOffset = 100, XOffset = 100,
    axisYHeight = this.height / 2, axisXWidth = this.width / 2, pointRadius = 10,
    min_el = 0, max_el = 10, tickCount = 10, tickFormatter = (x) => x, lineColor = "green",
    lineWidth = 5, pointFill = (d) => "green", toInclude = ["value", "id"],
    yGridCount = max_el - min_el, xGridCount = tickCount, xGridColour = (i) => "rgba(0,0,200,0.5)", xGridWidth = (i) => 1,
    yGridColour = (i) => "rgba(0,0,200,0.5)", yGridWidth = (i) => 1, xFontSize = (i) => "20px", yFontSize = xFontSize }) {
    return this.lines({
      data: [data], min_render: min_render, max_render: max_render, YOffset: YOffset, XOffset: XOffset,
      axisYHeight: axisYHeight, axisXWidth: axisXWidth, pointRadius: pointRadius,
      min_el: min_el, max_el: max_el, tickCount: tickCount, tickFormatter: tickFormatter, lineColor: (i) => lineColor,
      lineWidth: (i) => lineWidth, pointFill: pointFill, toInclude: toInclude, yGridCount: yGridCount, xGridCount: xGridCount,
      xGridColour: xGridColour, xGridWidth: xGridWidth, yGridColour: yGridColour, yGridWidth: yGridWidth,
      xFontSize: xFontSize, yFontSize: yFontSize
    })
  }


  connectedScatterPlot = this.line

  scatterPlot = function ({ data, min_render = 0, max_render = 1000, YOffset = 100, XOffset = 100,
    axisYHeight = this.height / 2, axisXWidth = this.width / 2, pointRadius = 10,
    min_el = 0, max_el = 10, tickCount = 10, tickFormatter = (x) => x, pointFill = (d) => "green", toInclude: toInclude,
    yGridCount = max_el - min_el, xGridCount = tickCount, xGridColour = (i) => "rgba(0,0,200,0.5)", xGridWidth = (i) => 1,
    yGridColour = (i) => "rgba(0,0,200,0.5)", yGridWidth = (i) => 1, xFontSize = (i) => "20px", yFontSize = xFontSize }) {
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
    toInclude = ["value", "id"], yGridCount = max_val, yGridColour = (i) => "rgba(0,0,200,0.5)", yGridWidth = (i) => 1 }) {



    if (!(yGridColour instanceof Function)) {
      yGridColour = (i) => yGridColour
    }
    if (!(yGridWidth instanceof Function)) {
      yGridWidth = (i) => yGridWidth
    }
    if (!(fontSize instanceof Function)) {
      fontSize = (d) => fontSize
    }
    if (!(colorBar instanceof Function)) {
      colorBar = (d) => colorBar
    }

    const max_el = max_val == undefined ? data.reduce((acc, e1) => acc = acc > e1.value ? acc : e1.value, -Infinity) : max_val;
    const min_el = min_val == undefined ? data.reduce((acc, e1) => acc = acc < e1.value - 1 ? acc : e1.value - 1, Infinity) : min_val;
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
      .attr("stroke", (i) => yGridColour(i))
      .attr("stroke-width", (i) => yGridWidth(i));

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

    return this;
  }


}


