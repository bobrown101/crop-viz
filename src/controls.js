import React from "react";
import Viz from "./viz";
import api from "./api";

export default ({
  countyData,
  analysis,
  selectedYear,
  selectedCrop,
  selectedCounty,
  countiesJson,
  selectCrop,
  selectYear,
  selectCounty,
  setFilter,
  filter
}) => {
  const filteredData = countyData
    .filter(x => x.YEAR == selectedYear)
    .filter(x => x.CROP == selectedCrop);

  let selectedCountyInfo = countyData.filter(
    x => x.FIPS_CODE == selectedCounty
  );
  return (
    <div>
      <h2>Filter by year</h2>
      <div className="year-box">
        {Object.keys(analysis.minMaxYieldByCropByYear).map(year => {
          return (
            <button
              disabled={year == selectedYear}
              onClick={() => {
                selectYear(year);
              }}
            >
              {year}
            </button>
          );
        })}
      </div>
      <h2>Filter by:</h2>
      <div>
        <button
          onClick={() => {
            setFilter(api.FILTER_TYPES.TOTAL_YIELD);
          }}
          disabled={filter == api.FILTER_TYPES.TOTAL_YIELD}
        >
          Total Yield
        </button>
        <button
          onClick={() => {
            setFilter(api.FILTER_TYPES.YIELD_PER_ACRE);
          }}
          disabled={filter == api.FILTER_TYPES.YIELD_PER_ACRE}
        >
          Yield Per Acre
        </button>
      </div>
      <Viz
        countyData={filteredData}
        analysis={analysis}
        countiesJson={countiesJson}
        selectedYear={selectedYear}
        selectedCrop={selectedCrop}
        selectedCounty={selectedCounty}
        selectCounty={selectCounty}
        filter={filter}
      />
      <h3>Filter by crop type</h3>
      <div>
        {Object.keys(analysis.minMaxYieldByCropByYear[selectedYear]).map(
          crop => {
            return (
              <button
                disabled={crop == selectedCrop}
                onClick={() => selectCrop(crop)}
              >
                {crop}
              </button>
            );
          }
        )}
      </div>
      {selectedCountyInfo.le}
      <div>
        <label>County Name</label>
        <h3>{JSON.stringify(selectedCountyInfo, null, 4)}</h3>
      </div>
    </div>
  );
};
