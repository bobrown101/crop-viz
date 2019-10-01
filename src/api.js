import Papa from "papaparse";
import axios from "axios";
import data from "./usda_crops_5yr.csv";


export const FILTER_TYPES = {
    TOTAL_YIELD: "Total Yield",
    YIELD_PER_ACRE: "Yield Per Acre"
}

const getAllCountyData = () => {
  return new Promise((resolve, reject) => {
    axios
      .get(data)
      .then(response => {
        let result = Papa.parse(response.data, {
          header: true
        });

        result = result.data.filter(x => {
            return !x.COUNTY_NAME.includes("OTHER")
        }).map(x => {
            return {
                ...x,
                YIELD_PER_ACRE: x.TOTAL_YIELD / x.TOTAL_HARVESTED_ACRES
            }
        })
        resolve(result);
      })
      .catch(e => {
        reject(e);
      });
  });
};

const analyzeAllCountyData = countyData => {
  let allYears = [];
  let allCrops = [];
  let minMaxYieldByCropByYear = {};
  let minMaxYieldPerAcreByCropByYear = {};

  countyData.forEach(x => {
    if (!allYears.includes(x.YEAR)) {
      allYears.push(x.YEAR);
    }
    if (!allCrops.includes(x.CROP)) {
      allCrops.push(x.CROP);
    }
  });

  allYears.forEach(year => {
    const countyDataForYear = countyData.filter(x => x.YEAR == year);
    allCrops.forEach(crop => {
      let countyDataForYearAndCrop = countyDataForYear.filter(
        x => x.CROP == crop
      );
      let yieldMin = findMinInArray(countyDataForYearAndCrop, "TOTAL_YIELD");
      let yieldMax = findMaxInArray(countyDataForYearAndCrop, "TOTAL_YIELD");

      let yieldPerAcreMin = findMinInArray(countyDataForYearAndCrop, "YIELD_PER_ACRE");
      let yieldPerAcreMax = findMaxInArray(countyDataForYearAndCrop, "YIELD_PER_ACRE");


      if (yieldMax !== null) { // null means that no crop was grown in this year
        if (year in minMaxYieldByCropByYear) {
          minMaxYieldByCropByYear[year][crop] = {
            yieldMin,
            yieldMax
          };
        } else {
          minMaxYieldByCropByYear[year] = {};
          minMaxYieldByCropByYear[year][crop] = {
            yieldMin,
            yieldMax
          };
        }
      }


      if (yieldPerAcreMax !== null) {  // null means that no crop was grown in this year
        if (year in minMaxYieldPerAcreByCropByYear) {
          minMaxYieldPerAcreByCropByYear[year][crop] = {
            yieldPerAcreMin,
            yieldPerAcreMax
          };
        } else {
          minMaxYieldPerAcreByCropByYear[year] = {};
          minMaxYieldPerAcreByCropByYear[year][crop] = {
            yieldPerAcreMin,
            yieldPerAcreMax
          };
        }
      }

    });
  });

  let analyzeResults = {
    allCrops,
    allYears,
    minMaxYieldByCropByYear,
    minMaxYieldPerAcreByCropByYear
  };
  console.log("Found the following analysis", analyzeResults);
  return analyzeResults;
};

const getCountiesJson = () => {
  return new Promise((resolve, reject) => {
    axios
      .get("https://d3js.org/us-10m.v1.json")
      .then(us => {
        resolve(us.data);
      })
      .catch(e => {
        reject(e);
      });
  });
};
const findMaxInArray = (array, property) => {
  let result = Math.max.apply(Math, array.map(o => o[property]));
  if (Math.abs(result) == Infinity) {
    return null;
  }
  return result;
};

const findMinInArray = (array, property) => {
  let result = Math.min.apply(Math, array.map(o => o[property]));
  if (Math.abs(result) == Infinity) {
    return null;
  }

  return result;
};

const normalize = (val, min, max) => {
  return (val - min) / (max - min);
};



export default {
  getCountiesJson,
  getAllCountyData,
  analyzeAllCountyData,
  normalize,
  FILTER_TYPES
};
