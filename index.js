const request = require('request-promise-native');

const requestFields = [
  "STATUT",
  "DEBUT",
  "FIN",
  "DateMiseJour",
  "STATIONNEMENT",
  "STATION_NO"
]


update();

async function update () {
  // const coords = {
  //   "xmin": 0,
  //   "ymin": 0,
  //   "xmax": 1000000,
  //   "ymax": 6184889
  // };

  // XMIN = 243000 -> 240000
  // XMAX = 255000 -> 255000
  // YMIN = 5180000 -> 5180000
  // YMAX = 5194000 -> 5195000

  const coords = {
    "xmin": 240000,
    "ymin": 5180000,
    "xmax": 255000,
    "ymax": 5195000
  };

  // const coords = {
  //   "xmin": 0,
  //   "ymin": 0,
  //   "xmax": 1000000,
  //   "ymax": 1000000
  // };

  const step = 5000;

  const promises = [];
  for (let i = coords.xmin; i <= coords.xmax; i += step) {
    for (let j = coords.ymin; j <= coords.ymax; j += step) {
      promises.push(queryMap({
        xmin: i,
        xmax: i + step,
        ymin: j,
        ymax: j + step
      }));
    }  
  }

  let results = [];
  const allResults = await Promise.all(promises);
  
  allResults.forEach(r => {
    results.push(...r);
  });

  console.log(`Total: ${results.length}`);

  // console.log(results.filter(feu => /527\d/.test(feu.attributes.STATION_NO)));
  console.log(results);
}

async function queryMap (geometry = { xmin, ymin, xmax, ymax }) {
  
  const url = "http://carte.ville.quebec.qc.ca/arcgis/rest/services/CI/OperationDeneigement/MapServer/1/query";
  let result = await request({
    url,
    qs: {
      f: "json",
      outFields: requestFields.join(","),
      geometry: JSON.stringify(geometry)
    }
  });

  if (result) {
    if (result.exceededTransferLimit) {
      throw new Error("Exceeded transfer limit");
    }

    result = JSON.parse(result) || {};
    result = result.features;
  }

  if (!result) {
    result = [];
  }

  console.log(`X: ${geometry.xmin} -> ${geometry.xmax} / Y: ${geometry.ymin} -> ${geometry.ymax} : ${result.length} results`);
  
  return result;
}
