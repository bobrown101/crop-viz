import React from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import "./App.css";
import api from "./api";

export default class Viz extends React.Component {
  constructor(props) {
    super(props);
    this.renderViz = this.renderViz.bind(this);
  }

  componentDidMount() {
    this.renderViz();
  }
  componentDidUpdate() {
    this.renderViz();
  }

  renderViz() {
    var svg = d3.select(this.refs.myViz);

    var path = d3.geoPath();
    let countyData = this.props.countyData;
    let us = this.props.countiesJson;

    svg
      .append("g")
      .attr("class", "counties")
      .selectAll("path")
      .data(topojson.feature(us, us.objects.counties).features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", d => {
        const data = countyData.filter(x => x.FIPS_CODE == d.id);
        const analysisData = this.props.analysis.minMaxYieldByCropByYear;
        const dataForYear = analysisData[this.props.selectedYear];
        const dataForCrop = dataForYear[this.props.selectedCrop];
        const min = dataForCrop.min;
        const max = dataForCrop.max;

        if (data.length > 0) {
          let value = null
          if(this.props.filter == api.FILTER_TYPES.TOTAL_YIELD){
              value = data[0].TOTAL_YIELD
          }else{
              value = data[0].TOTAL_YIELD / data[0].TOTAL_HARVESTED_ACRES
          }
          const normalized = api.normalize(value, min, max);
          return d3.interpolateGreens(normalized);
        }
      })
      .attr("county", d => {
        return d.id;
      })
      .on("click", d => {
          this.props.selectCounty(d.id)
      });

    svg
      .append("path")
      .attr("class", "county-borders")
      .attr(
        "d",
        path(
          topojson.mesh(us, us.objects.counties, function(a, b) {
            return a !== b;
          })
        )
      );
  }

  render() {
    return (
      <div>
        <svg ref="myViz" width="960" height="600"></svg>
      </div>
    );
  }
}
