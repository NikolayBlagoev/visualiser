# Visualisation Tools for D3

### Usage:

Import and create a visualiser object with specific width and height:

```js
    const visualiser = require('visualiser');
    const inst = new visualiser({width : 1200, height : 1200});
```

To render (currently is equated to obtaining the HTML of the object - can be returned to a request):

```js
    inst.visualise();
```

Currently supports:

### Radar (spider) chart:

Creates a radar chart:

```js
    const visualiser = require('visualiser');
    const inst = new visualiser({width : 1200, height : 1200});
    const exampleData = [{"attack": 4, "defence": 2, "wisdom": 10, "charisma": 2, "dexterity": 0}, {"attack": 6, "defence": 4, "wisdom": 0, "charisma": 10, "dexterity": 6}];
    const exampleFeatures = ["attack", "defence", "wisdom", "charisma", "dexterity"]
    inst.radar({data: exampleData, features: exampleFeatures});
```

![Radar Plot](./imgs/radar.png)
For redundancy we also provide spider chart with the same syntax as the radar.
<br/>
Requires a features array which specifies the features on each axis (can be of any length above 2). The data array contains objects which have a field for each of the features with a corresponding numeric value (between 0 and 10). The data array CAN contain other values as well! Other parameters are:<br/>

maxRadius -> the radius of the chart (ex. 100)<br/>

fillColors -> array of colour values for each object on the chart (ex. ["rgba(0,255,0,0.7)", "rgba(255,0,0,0.7)"])<br/>

centerHorizontalOffset -> the horizontal offset of the center of the spider/radar chart  (ex. 200)<br/>

centerVerticalOffset -> the vertical offset of the center of the spider/radar chart  (ex. 200)<br/>

labelFontSize -> the font size of the labels (ex. 10)<br/>

ticks -> array of numbers, giving which tick values to be shown on the spider chart (ex. [1, 2.5, 5, 7.5, 10] - this will show the position of the 1st, 2.5th, 5th, ect. values on the spider chart)<br/>

strokeColor -> function taking a tick value and mapping it to a colour (ex. (t) => "black")<br/>

strokeHighlight -> function taking a tick value and mapping it to width size (ex. (t) => t%5==0 ? 5 : 3)<br/>

axisColor -> function taking an axis number and mapping it to a colour (ex. (i) => "black")<br/>

axisWidth -> function taking an axis number and mapping it to a width size (ex. (i) => 1)<br/>




### Donut chart:

Creates a donut chart:

```js
    const visualiser = require('visualiser');
    const inst = new visualiser({width : 1200, height : 1200});
    const exampleDonutData = [{itm: 0, value: 10},{value: 35},{hs: 4, value: 8},{d: 4, value: 66}];
    inst.donut({data: exampleDonutData, colorRange: ["green", "#FF0000", "#0000FF"], text: "33%"});
```

![Donut Plot](./imgs/donut.png)

<br/>
The data array contains any attributes, but it is mandatory to have a 'value' attribute in numerical form which specifies the value fot he given slice of the donut. Other attributes:<br/>

outterRadius -> the radius of the chart (ex. 100)<br/>
innerRadius -> the radius of the inner hole (ex. 60)<br/>
offsetX -> offset of the graphic from the left side<br/>
offsetY -> offset of the graphic from the top side<br/>
colorRange -> an array of colours for ach element<br/>
fontSize -> font size of the inner text<br/>
text  -> string text to put in the middle of the donut<br/>
textOffsetX -> offset of the text from the left side of the hole<br/>
textOffsetY -> offset of the graphic from the top side of the hole<br/>


### Line (connected scatterplot) chart:

Creates a line chart where each elemnt is emphasised with a circle:

```js
    const visualiser = require('visualiser');
    const inst = new visualiser({width : 1200, height : 1200});
    const exampleDataLine = [{x: 1, y: 300},{x: 2, y: 5},{x: 3, y: 8},{x: 4, y: 2},{x: 5, y: 6}];
    inst.line({data: exampleDataLine, lineWidth : (i) => 4});
```

![Line Plot](./imgs/line.png)
For redundancy we also provide connectedScatterPlot which does the same function with the same parameters
<br/>
The data array contains elements with each having an 'x' and 'y' attribute in numerical form. The line will connect the points in the order they appear in the array, so you might need to presort it according to the x axis. Other attributes:<br/>
min_render -> The smallest value on the y-axis<br/>
max_render -> The highest value on the y-axis<br/>
offsetX -> offset of the graphic from the left side<br/>
offsetY -> offset of the graphic from the top side<br/>
pointRadius -> the radius of each point<br/>
min_el -> The smallest value on the x-axis<br/>
max_el -> The largest value on the x-axis<br/>
tickCount -> How many values to be on the x-axis<br/>
pointFill -> function, which given the index of the point, returns a colour<br/>


### Bar chart:

Creates a line chart where each elemnt is emphasised with a circle:

```js
    const visualiser = require('visualiser');
    const inst = new visualiser({width : 1200, height : 1200});
    const exampleDataBars = [{"name": "books", value: 10}, {"name": "comics", value: 20}, {"name": "magazines", value: 30}, {"name": "movies", value: 50}];
    inst.bar({data: exampleDataBars, colorBar: (d) => d.name == "books" ? "red" : "green"});
```

![Bar Plot](./imgs/bar.png)

<br/>
The data array contains elements with each having a 'name' and 'value' attribute in string and numerical form respectively. Other attributes:<br/>
XOffset -> offset of the graphic from the left side<br/>
YOffset -> offset of the graphic from the top side<br/>
axisYHeight -> height of y-axis<br/>
axisXWidth -> width of x-axis<br/>
colorBar -> function which given an element returns a colour for it<br/>
fontSize -> function which given an element returns a font size for it<br/>
yFontSize -> give the font for the y-axis<br/>


