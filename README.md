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
    inst.spider({data: exampleData, features: exampleFeatures});
```

Requires a features array which specifies the features on each axis (can be of any length above 2). The data array contains objects which have a field for each of the features with a corresponding numeric value (between 0 and 10). The data array CAN contain other values as well! Other parameters are:

maxRadius -> the radius of the chart (ex. 100)

fillColors -> array of colour values for each object on the chart (ex. ["rgba(0,255,0,0.7)", "rgba(255,0,0,0.7)"])

centerHorizontalOffset -> the horizontal offset of the center of the spider/radar chart  (ex. 200)

centerVerticalOffset -> the vertical offset of the center of the spider/radar chart  (ex. 200)

labelFontSize -> the font size of the labels (ex. 10)

ticks -> array of numbers, giving which tick values to be shown on the spider chart (ex. [1, 2.5, 5, 7.5, 10] - this will show the position of the 1st, 2.5th, 5th, ect. values on the spider chart)

strokeColor -> function taking a tick value and mapping it to a colour (ex. (t) => "black")

strokeHighlight -> function taking a tick value and mapping it to width size (ex. (t) => t%5==0 ? 5 : 3)

axisColor -> function taking an axis number and mapping it to a colour (ex. (i) => "black")

axisWidth -> function taking an axis number and mapping it to a width size (ex. (i) => 1)




### Donut chart:

### Line (connected scatterplot) chart: