import React from "react";
import api from "./api";

export default class Data extends React.Component {
  state = null;

  constructor(props) {
    super(props);
    this.selectCrop = this.selectCrop.bind(this)
    this.selectYear = this.selectYear.bind(this)
    this.selectCounty = this.selectCounty.bind(this)
    this.setFilter = this.setFilter.bind(this)

  }

  selectCrop(crop) {
    this.setState({
      ...this.state,
      selectedCrop: crop
    });
  }

  selectYear(year) {
      let newCrop = null
      if(this.state.selectedCrop in this.state.analysis.minMaxYieldByCropByYear[year]){
          newCrop = this.state.selectedCrop
      }else{
        newCrop = Object.keys(
            this.state.analysis.minMaxYieldByCropByYear[year]
          )[0];
      }
    this.setState({
      ...this.state,
      selectedYear: year,
      selectedCrop: newCrop
    });
  }

  selectCounty(id) {
    this.setState({
        ...this.state,
        selectedCounty: id
    });
  }

  setFilter(filter) {
    this.setState({
        filter
    });
  }

  componentDidMount() {
    api.getCountiesJson().then(countiesJson => {
      api.getAllCountyData().then(countyData => {
        let analysis = api.analyzeAllCountyData(countyData);
        this.setState({
          countiesJson,
          countyData,
          analysis: analysis,
          selectedYear: analysis.allYears[0],
          selectedCrop: analysis.allCrops[0],
          filter: api.FILTER_TYPES.TOTAL_YIELD
        });
      });
    });
  }

  render() {
    if (this.state) {
      return this.props.children({
        ...this.state,
        setFilter: this.setFilter,
        selectCrop: this.selectCrop,
        selectYear: this.selectYear,
        selectCounty: this.selectCounty
      });
    } else {
      return "Loading...";
    }
  }
}
