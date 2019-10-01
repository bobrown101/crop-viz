import React from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import "./App.css";
import api from "./api";

export default class Viz extends React.Component {
  constructor(props) {
    super(props);
    this.renderViz = this.renderViz.bind(this);
    this.generateFill = this.generateFill.bind(this);
  }

  componentDidMount() {
    this.renderViz();
  }
  componentDidUpdate() {
    this.updateViz();
  }

  generateFill(d) {
    let countyData = this.props.countyData;

    const data = countyData.filter(x => x.FIPS_CODE == d.id);

    if (data.length > 0) {
      let value = null;
      if (this.props.filter == api.FILTER_TYPES.TOTAL_YIELD) {
        const analysisData = this.props.analysis.minMaxYieldByCropByYear;
        const dataForYear = analysisData[this.props.selectedYear];
        const dataForCrop = dataForYear[this.props.selectedCrop];
        const min = dataForCrop.yieldMin;
        const max = dataForCrop.yieldMax;
        value = data[0].TOTAL_YIELD;
        const normalized = api.normalize(value, min, max);
        return d3.interpolateGreens(normalized);
      } else {
        const analysisData = this.props.analysis.minMaxYieldPerAcreByCropByYear;
        const dataForYear = analysisData[this.props.selectedYear];
        const dataForCrop = dataForYear[this.props.selectedCrop];
        const min = dataForCrop.yieldPerAcreMin;
        const max = dataForCrop.yieldPerAcreMax;
        value = data[0].YIELD_PER_ACRE;
        const normalized = api.normalize(value, min, max);
        return d3.interpolateGreens(normalized);
      }
    }
  }

  renderViz() {
    const width = 975;
    const height = 610;

    let svg = d3.select(this.refs.myViz).attr("viewBox", [0, 0, width, height]);

    let path = d3.geoPath();
    let us = this.props.countiesJson;

    let container = svg.append("g").attr("class", "container");
    let counties = container.append("g").attr("class", "counties");

    const zoomed = () => {
      const { transform } = d3.event;
      container.attr("transform", transform);
      container.attr("stroke-width", 1 / transform.k);
    };

    let zoom = d3
      .zoom()
      .scaleExtent([1, 8])
      .on("zoom", zoomed);

    counties
      .selectAll("path")
      .data(topojson.feature(us, us.objects.counties).features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", this.generateFill)
      .attr("county", d => {
        return d.id;
      })
      .on("click", d => {
        this.props.selectCounty(d.id);
      });

    container
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

    svg.call(zoom);
  }

  updateViz() {
    let container = d3.select(this.refs.myViz).select(".container");

    container
      .select(".counties")
      .selectAll("path")
      .attr("fill", this.generateFill);
  }

  render() {
    return (
      <div>
        <svg ref="myViz" width="960" height="600"></svg>
      </div>
    );
  }
}
