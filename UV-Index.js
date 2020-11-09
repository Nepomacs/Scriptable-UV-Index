// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: green; icon-glyph: sun;


const apiKey = 'INSERT_KEY_HERE';


// Colors:

const ColorLow = new Color('#109E48');
const ColorModerate = new Color('#ffdc01');
const ColorHigh = new Color('#f89c1c');
const ColorVeryHigh = new Color('#ee1d23');
const ColorExtreme = new Color('#d83484');
const ColorGray = new Color('#606060');

const ColorSecondaryLow = new Color('#11AB4F');
const ColorSecondaryModerate = new Color('#E6C700');
const ColorSecondaryHigh = new Color('#DE8C18');
const ColorSecondaryVeryHigh = new Color('#D41920');
const ColorSecondaryExtreme = new Color('#BF2E74');

// Run Widget
// Check if widget runs in preview-mode.

const data = await getData();

const widget = await createWidget(data);

if (!config.runsInWidget) {
  await widget.presentSmall();
} else {
  Script.setWidget(widget);
  Script.complete();
}



async function fetchLocation() {
  Location.setAccuracyToThreeKilometers();
  return await Location.current();

}


async function getData() {

  let location = await fetchLocation();
  let currentUVData = await fetchCurrentUV(location);
  let forecastUVData = await fetchForecastUV(location);

  let curDate = new Date(currentUVData.date * 1000);
  let forcDate = new Date(forecastUVData.date * 1000);

  let currCalcUV = calculateUV(currentUVData.value);
  let ccalcText = currCalcUV.t;
  let ccalcColor = currCalcUV.c;

  let fcCalcUV = calculateUV(forecastUVData.value);
  let fcalcText = fcCalcUV.t;
  let fcalcColor = fcCalcUV.sc;


  let data = {
    currentUV: currentUVData.value.toString(),
    currentUVText: ccalcText,
    currentUVColor: ccalcColor,
    currentUVDate: curDate.toLocaleString(),
    forecastUV: forecastUVData.value.toString(),
    forecastUVDate: forcDate.toLocaleDateString(),
    forecastUVText: fcalcText,
    forecastUVColor: fcalcColor
  };
  
  return data;
}



async function fetchCurrentUV(location) {


  const url = `http://api.openweathermap.org/data/2.5/uvi?lat=${location.latitude}&lon=${location.longitude}&appid=${apiKey}`;
  const response = await new Request(url).loadJSON();

  return response;

}


async function fetchForecastUV(location) {

  const url = `http://api.openweathermap.org/data/2.5/uvi/forecast?lat=${location.latitude}&lon=${location.longitude}&appid=${apiKey}`;
  const response = await new Request(url).loadJSON();

  const tomorrow = response[0];
  return tomorrow;

}


function createWidget() {
  const w = new ListWidget();
  w.backgroundColor = data.currentUVColor;


  const heading = w.addText("UVI | ".toUpperCase() + data.currentUVDate);
  heading.centerAlignText();
  heading.textColor = Color.white();
  heading.font = Font.mediumSystemFont(7);

  // Current Values

  let curValueNum = w.addText(data.currentUV);
  curValueNum.centerAlignText();
  curValueNum.font = Font.thinSystemFont(45);
  curValueNum.textColor = Color.white();

  let curValueText = w.addText(data.currentUVText.toUpperCase());
  curValueText.centerAlignText();
  curValueText.font = Font.mediumRoundedSystemFont(15);
  curValueText.textColor = Color.white();


  w.addSpacer();


  const heading2 = w.addText("Forecast".toUpperCase() + " for " + data.forecastUVDate);
  heading2.centerAlignText();
  heading2.textColor = Color.white();
  heading2.font = Font.mediumSystemFont(7);


  // Forecast Stacks

  const foreCastContainer = w.addStack();
  foreCastContainer.cornerRadius = 10;


  const fcStack1 = foreCastContainer.addStack();
  fcStack1.addText("");

  foreCastContainer.addSpacer(0);

  const fcStack2 = foreCastContainer.addStack()
  fcStack2.setPadding(0, 4, 0, 4);
  fcStack2.backgroundColor = data.forecastUVColor;

  
  const fcContent = fcStack2.addStack();
  fcContent.centerAlignContent();

  let fcValueNum = fcContent.addText(data.forecastUV);
  fcValueNum.font = Font.thinSystemFont(20);
  fcValueNum.textColor = Color.white();

  fcContent.addSpacer();

  let fcValueText = fcContent.addText(data.forecastUVText.toUpperCase());
  fcValueText.font = Font.mediumRoundedSystemFont(10);
  fcValueText.textColor = Color.white();
  

  foreCastContainer.addSpacer(0);
  
  const fcStack3 = foreCastContainer.addStack()
  fcStack3.addText("");

  return w
}


function calculateUV(value) {

  let color;
  let text;

  

  switch(true) {
    case (value >= 11):
      color = ColorExtreme;
      colorSecondary = ColorSecondaryExtreme;
      text = "Extreme";
      break;
    case value >= 8:
      color = ColorVeryHigh;
      colorSecondary = ColorSecondaryVeryHigh;
      text = "Very High";
      break;
    case value >= 6:
      color = ColorHigh;
      colorSecondary = ColorSecondaryHigh;
      text = "High";
      break;
    case value >= 3:
      color = ColorModerate;
      colorSecondary = ColorSecondaryModerate;
      text = "Moderate";
      break;
    case value >= 1:
      color = ColorLow;
      colorSecondary = ColorSecondaryLow;
      text = "Low";
      break;
    default:
      color = ColorGray;
      colorSecondary = ColorGray;s
      text = "Error";
  }

  let data = {
    c: color,
    sc: colorSecondary,
    t: text
  }

  return data;

}


