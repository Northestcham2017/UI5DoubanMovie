
// import { cncut } from "cncut";
// import cncut from "cncut";
// const cncut = require("cncut");
// let cncut;
// import("cncut").then(function (d) {
//   cncut = d;
// });
// jQuery.sap.require("cncut");
// import { createRequire } from 'module';

sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel", "jquery.sap.global", "sap/ui/core/Fragment", "Quickstart/Util", "Quickstart/model/formatter"],
  function (Controller, JSONModel, $, Fragment, Util, formatter) {
    "use strict";
    // const cncut = jQuery.sap.require("cncut");
    const aRatingColor = ["#868282", "#eb4242", "#e6e642", "#fbaf25", "#49cce5", "#26cb0e"];// grey, red, yellow, orange, blue, green
    const aRatingColorReverse = ["#26cb0e", "#49cce5", "#fbaf25", "#e6e642", "#eb4242", "#868282"];

    return Controller.extend("Quickstart.App", {
      formatter: formatter,
      onInit: function () {
        var that = this;
        this._MovieData = [];
        this._MovieData2 = [];
        var oSettingsModel = new JSONModel({
          short: false,
          talkShow: false,
          realityShow: false,
          coupleMode: false,
          singleMode: true
        });
        this.getView().setModel(oSettingsModel, "Settings");


        var oSummaryModel = new JSONModel({
          myLove: [],
          doubanLove: []
        });
        this.getView().setModel(oSummaryModel, "Summary");

        d3.csv('data.csv').then(function (data) {
          that._MovieData = that.processData(data);
          that.byId("idSplitContainer").to(that.byId("idSummaryPage"));
          that.showSummary();
        });
      },

      onItemPress: function (oEvent) {
        var that = this;
        var sIcon = oEvent.getSource().getSelectedItem().getIcon();

        switch (sIcon) {
          case "sap-icon://home": // 综合
            that.byId("idSplitContainer").to(that.byId("idSummaryPage"));
            that.showSummary();
            // that.drawWordCloud();
            break;
          case "sap-icon://choropleth-chart": // 国别
            that.byId("idSplitContainer").to(that.byId("idMapPage"));
            if (!that.byId("idCountryMapContent").getContent()) {
              that.byId("idCountryMapContent").setContent("<div><div id='rsr'></div></div>");
            }
            break;
          case "sap-icon://history": // 年份
            that.byId("idSplitContainer").to(that.byId("idYearPage"));
            if (!that.byId("idYearContent").getContent()) {
              that.byId("idYearContent").setContent("<div><div id='year-stacked-bar'></div></div>");
            }
            break;
          case "sap-icon://favorite": // 评分
            that.byId("idSplitContainer").to(that.byId("idRatingPage"));
            if (!that.byId("idRatingPieContent").getContent()) {
              that.byId("idRatingPieContent").setContent("<div><div id='rating-pie'></div></div>");
            }
            break;
          case "sap-icon://video": // 导演
            that.byId("idSplitContainer").to(that.byId("idDirectorPage"));
            if (!that.byId("idDirectorTreeContent").getContent()) {
              that.byId("idDirectorTreeContent").setContent("<div><div id='tree-map'></div></div>");
            }
            break;
          case "sap-icon://person-placeholder": // 演员
            that.byId("idSplitContainer").to(that.byId("idActorPage"));
            if (!that.byId("idActorBubbleContent").getContent()) {
              that.byId("idActorBubbleContent").setContent("<div><div id='actor-bubble'></div></div>");
            }
            break;
          case "sap-icon://tree": // 类型
            that.byId("idSplitContainer").to(that.byId("idCategoryPage"));
            if (!that.byId("idCategoryContent").getContent()) {
              that.byId("idCategoryContent").setContent("<div><div id='category-content'></div></div>");
            }
            break;
          default:
            break;
        }
      },

      booleanReverse: function () {
        console.log("!");
      },

      onSettingsPress: function (oEvent) {
        var oButton = oEvent.getSource(),
          oView = this.getView();

        if (!this._SettingsDialog) {
          this._SettingsDialog = Fragment.load({
            id: oView.getId(),
            name: "Quickstart.SettingsDialog",
            controller: this
          }).then(function (oDialog) {
            oView.addDependent(oDialog);
            return oDialog;
          });
        }

        this._SettingsDialog.then(function (oDialog) {
          // this._configDialog(oButton, oDialog);
          oDialog.open();
        }.bind(this));
      },

      onSettingsSave: function (oEvent) {
        oEvent.getSource().getParent().close();
      },

      onCancel: function (oEvent) {
        oEvent.getSource().getParent().close();
      },

      processData: function (data) {
        var aResultData = [];
        for (var i = 0; i < data.length; i++) {
          var oItem = {
            title: data[i].标题,
            year: data[i].简介.split("/")[0] ? data[i].简介.split("/")[0].trim() : "",
            country: data[i].简介.split("/")[1] ? data[i].简介.split("/")[1].trim() : "",
            type: data[i].简介.split("/")[2] ? data[i].简介.split("/")[2].trim() : "",
            director: data[i].简介.split("/")[3] ? data[i].简介.split("/")[3].trim() : "",
            actor: data[i].简介.split("/")[4] ? data[i].简介.split("/")[4].trim() : "",
            doubanRating: data[i].豆瓣评分,
            link: data[i].链接,
            myRating: data[i].我的评分,
            comment: data[i].评论
          };
          var oSettingsData = this.getView().getModel("Settings").getData();
          if ((oItem.type.indexOf("短片") < 0 && oItem.type.indexOf("脱口秀") < 0 && oItem.type.indexOf("真人秀") < 0) || (oItem.type.indexOf("短片") >= 0 && oSettingsData.short) || (oItem.type.indexOf("脱口秀") >= 0 && oSettingsData.talkShow) || (oItem.type.indexOf("真人秀") >= 0 && oSettingsData.realityShow)) {
            aResultData.push(oItem);
          }
        }
        return aResultData;
      },

      showSummary: function () {
        var iTotalMovie = this._MovieData.length;
        var iDoubanAverageRating, iDoubanTotalRating = 0, iDoubanRatingAccount = 0, iMyAverageRating, iMyTotalRating = 0, iMyRatingAccount = 0;
        var iHighestGapMyLove = 0, iHighestGapDoubanLove = 0, oHighestGapMyLove, oHighestGapDoubanLove;
        var aHighestGapMyLove = [], aHighestGapDoubanLove = [];
        var iLongestCommentLength = 0, iShortestCommentLength = 9999, oLongestCommentMovie, oShortestCommentMovie;
        var i, k;
        for (i = 0; i < this._MovieData.length; i++) {
          if (this._MovieData[i].doubanRating && parseFloat(this._MovieData[i].doubanRating) > 0) {
            var iGap = parseInt(this._MovieData[i].myRating) * 2 - parseFloat(this._MovieData[i].doubanRating, 10);
            this._MovieData[i].gap = iGap.toFixed(1);

            iDoubanTotalRating += parseFloat(this._MovieData[i].doubanRating, 10);
            iDoubanRatingAccount++;

            if (this._MovieData[i].myRating && parseInt(this._MovieData[i].myRating) > 0) {
              iMyTotalRating += parseInt(this._MovieData[i].myRating) * 2;
              iMyRatingAccount++;

              if (aHighestGapMyLove.length < 10) {
                aHighestGapMyLove.push(this._MovieData[i]);
              } else {
                for (k = 0; k < aHighestGapMyLove.length; k++) {
                  var iTopTenGapMyLove = parseInt(aHighestGapMyLove[k].myRating) * 2 - parseFloat(aHighestGapMyLove[k].doubanRating, 10);
                  if (iGap > iTopTenGapMyLove) {
                    aHighestGapMyLove.splice(k, 1, this._MovieData[i]);
                    break;
                  }
                }
              }

              if (aHighestGapDoubanLove.length < 10) {
                aHighestGapDoubanLove.push(this._MovieData[i]);
              } else {
                for (k = 0; k < aHighestGapDoubanLove.length; k++) {
                  var iTopTenGapDoubanLove = parseInt(aHighestGapDoubanLove[k].myRating) * 2 - parseFloat(aHighestGapDoubanLove[k].doubanRating, 10);
                  if (iGap < iTopTenGapDoubanLove) {
                    aHighestGapDoubanLove.splice(k, 1, this._MovieData[i]);
                    break;
                  }
                }
              }

              // if (parseInt(this._MovieData[i].myRating) * 2 - parseFloat(this._MovieData[i].doubanRating, 10) > iHighestGapMyLove) {
              //   iHighestGapMyLove = parseInt(this._MovieData[i].myRating) * 2 - parseFloat(this._MovieData[i].doubanRating, 10);
              //   oHighestGapMyLove = this._MovieData[i];
              // }
              // if (parseFloat(this._MovieData[i].doubanRating, 10) - parseInt(this._MovieData[i].myRating) * 2 > iHighestGapDoubanLove) {
              //   iHighestGapDoubanLove = parseFloat(this._MovieData[i].doubanRating, 10) - parseInt(this._MovieData[i].myRating) * 2;
              //   oHighestGapDoubanLove = this._MovieData[i];
              // }
            }
          }
          if (this._MovieData[i].comment.length > iLongestCommentLength) {
            iLongestCommentLength = this._MovieData[i].comment.length;
            oLongestCommentMovie = this._MovieData[i];
          }
          if (this._MovieData[i].comment.length > 0 && this._MovieData[i].comment.length < iShortestCommentLength) {
            iShortestCommentLength = this._MovieData[i].comment.length;
            oShortestCommentMovie = this._MovieData[i];
          }
        }

        this.getView().getModel("Summary").setProperty("/myLove", aHighestGapMyLove);
        this.getView().getModel("Summary").setProperty("/doubanLove", aHighestGapDoubanLove);

        iDoubanAverageRating = (iDoubanTotalRating / iDoubanRatingAccount).toFixed(2);
        iMyAverageRating = (iMyTotalRating / iMyRatingAccount).toFixed(2);
        this.byId("idSummaryText").setText("你一共看过" + iTotalMovie + "部电影/电视剧，它们的豆瓣平均分为" + iDoubanAverageRating + "，你给它们打分的平均值为" + iMyAverageRating);
        // this.byId("idCompareText").setText("你的打分跟豆瓣网友差距最大的是《" + oHighestGapMyLove.title + "》（豆瓣评分" + oHighestGapMyLove.doubanRating + "，你的评分" + oHighestGapMyLove.myRating + "⭐️）和《" + oHighestGapDoubanLove.title + "》（豆瓣评分" + oHighestGapDoubanLove.doubanRating + "，你的评分" + oHighestGapDoubanLove.myRating + "⭐️）");
        this.byId("idShortestCommentText").setText("你写得最短的短评是为电影《" + oShortestCommentMovie.title + "》所写，仅有" + oShortestCommentMovie.comment.length + "个字，内容是'" + oShortestCommentMovie.comment + "'；");
        this.byId("idCommentLengthText").setText("你写得最长的短评是为电影《" + oLongestCommentMovie.title + "》所写，写了" + oLongestCommentMovie.comment.length + "个字，如下：");
        this.byId("idCommentText").setText(oLongestCommentMovie.comment);
      },

      onCoupleModePress: function (oEvent) {
        // Couple mode
        if (oEvent.getSource().getPressed()) {
          var that = this;
          var i, k, iSameMovie = 0, iSameRating = 0;
          this.getView().getModel("Settings").setProperty("/coupleMode", true);
          this.getView().getModel("Settings").setProperty("/singleMode", false);


          // Get another's data
          d3.csv('data2.csv').then(function (data) {
            that._MovieData2 = that.processData(data);
            for (i = 0; i < that._MovieData.length; i++) {
              for (k = 0; k < that._MovieData2.length; k++) {
                if (that._MovieData[i].link === that._MovieData2[k].link) {
                  iSameMovie++;
                  if (that._MovieData[i].myRating === that._MovieData2[k].myRating) {
                    iSameRating++;
                  }
                  break;
                }
              }
            }
            that.byId("idCoupleSummaryText").setText("你看过" + that._MovieData.length + "部电影/电视剧，TA看过" + that._MovieData2.length + "部，其中重合的一共" + iSameMovie + "部。在这些你们共同看过的片子中，你们打分相同的一共" + iSameRating + "部，占比" + ((iSameRating / iSameMovie) * 100).toFixed(2) + "%");
          });
        } else {
          this.getView().getModel("Settings").setProperty("/coupleMode", false);
          this.getView().getModel("Settings").setProperty("/singleMode", true);
        }
      },

      drawWordCloud: function () {
        // const cncut = sap.ui.require("cncut");
        // const cncut = jQuery.sap.require("cncut");
        // const cncut = require("cncut");
        // const cn = cncut();
        // console.log(cn.cut("你是不是傻逼"));
      },

      getPieChartData: function () {
        var aPieChartResult = [{
          name: "未评分",
          value: 0
        }, {
          name: "1星",
          value: 0
        }, {
          name: "2星",
          value: 0
        }, {
          name: "3星",
          value: 0
        }, {
          name: "4星",
          value: 0
        }, {
          name: "5星",
          value: 0
        }], i;
        for (i = 0; i < this._MovieData.length; i++) {
          switch (this._MovieData[i].myRating) {
            // switch (this._MovieData[i].我的评分) {
            case "1":
              aPieChartResult[1].value++;
              break;
            case "2":
              aPieChartResult[2].value++;
              break;
            case "3":
              aPieChartResult[3].value++;
              break;
            case "4":
              aPieChartResult[4].value++;
              break;
            case "5":
              aPieChartResult[5].value++;
              break;
            default:
              aPieChartResult[0].value++;
              break;
          }
        }
        return aPieChartResult;
      },

      onCountryOptionChanged: function (oEvent) {
        var sKey = oEvent.getSource().getSelectedKey();
        switch (sKey) {
          case "map":
            this.byId("idCountryNav").to(this.byId("idCountryMapPage"));
            break;
          case "bar":
            this.byId("idCountryNav").to(this.byId("idCountryBarPage"));
            if (!this.byId("idCountryBarContent").getContent()) {
              this.byId("idCountryBarContent").setContent("<div><div id='stacked-bar'></div></div>");
            }
            break;
          default:
            break;
        }
      },

      drawBar: function () {
        var aOriginalData = this._MovieData;
        var i, aResultData = [], aCountryList = [];
        for (i = 0; i < aOriginalData.length; i++) {
          var sCountry = aOriginalData[i].country;
          if (this.byId("idMultipleCountrySwitch").getState()) {
            // 合拍片仅计入主制片国
            if (sCountry.indexOf(" ") >= 0) {
              sCountry = sCountry.split(" ")[0];
            }
          }
          if (!aCountryList.includes(sCountry)) {
            aCountryList.push(sCountry);
            var oDataItem = {
              "country": sCountry,
              "total": 0,
              "1star": 0,
              "2star": 0,
              "3star": 0,
              "4star": 0,
              "5star": 0,
              "norating": 0
            };
            aResultData.push(oDataItem);
          }
          var iIndex = aCountryList.indexOf(sCountry);
          aResultData[iIndex]["total"]++;
          var sRating = aOriginalData[i].myRating;
          switch (sRating) {
            case "1":
              aResultData[iIndex]["1star"]++;
              break;
            case "2":
              aResultData[iIndex]["2star"]++;
              break;
            case "3":
              aResultData[iIndex]["3star"]++;
              break;
            case "4":
              aResultData[iIndex]["4star"]++;
              break;
            case "5":
              aResultData[iIndex]["5star"]++;
              break;
            case "":
              aResultData[iIndex]["norating"]++;
              break;
            default:
              break;
          }
        }
        var key = ["norating", "1star", "2star", "3star", "4star", "5star"];
        this.drawStackedBar({
          data: aResultData,
          key: key,
          sort: "total",
          id: "stacked-bar",
          color: aRatingColor,
          category: "country"
        });
      },

      drawStackedBar: function (config) {
        var me = this,
          stackKey = config.key,
          data = config.data,
          sId = config.id,
          sCategory = config.category,
          aColor = config.color,
          sSort = config.sort,
          margin = { top: 20, right: 20, bottom: 30, left: 150 },
          width = 960 - margin.left - margin.right,
          height = 900 - margin.top - margin.bottom,
          xScale = d3.scaleLinear().rangeRound([0, width]),
          yScale = d3.scaleBand().rangeRound([height, 0]).padding(0.1),
          color = d3.scaleOrdinal(aColor),
          xAxis = d3.axisBottom(xScale),
          yAxis = d3.axisLeft(yScale),
          svg = d3.select("#" + sId).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("class", "layers")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        var stack = d3.stack()
          .keys(stackKey)
          /*.order(d3.stackOrder)*/
          .offset(d3.stackOffsetNone);

        var layers = stack(data);
        data.sort(function (a, b) { return a[sSort] - b[sSort]; });
        yScale.domain(data.map(function (d) { return d[sCategory].trim(); }));
        // yScale.domain(data.map(function (d) { return parseDate(d.date); }));
        xScale.domain([0, d3.max(layers[layers.length - 1], function (d) {
          return d[1];
        })]).nice();

        var layer = svg.selectAll(".layer")
          .data(layers)
          .enter().append("g")
          .attr("class", "layer")
          .style("fill", function (d, i) { return color(i); });

        layer.selectAll("rect")
          .data(function (d) { return d; })
          .enter().append("rect")
          .attr("y", function (d) { return yScale(d.data[sCategory]); })
          .attr("x", function (d) { return xScale(d[0]); })
          .attr("height", yScale.bandwidth())
          .attr("width", function (d) { return xScale(d[1]) - xScale(d[0]) });

        svg.append("g")
          .attr("class", "axis axis--x")
          .attr("transform", "translate(0," + (height + 5) + ")")
          .call(xAxis);

        svg.append("g")
          .attr("class", "axis axis--y")
          .attr("transform", "translate(0,0)")
          .call(yAxis);

        svg.selectAll(".layer")
          .append("text")
          .selectAll("tspan")
          .data(function (d) {
            return d;
          })
          .join("tspan")
          .attr("y", function (d) { return parseInt(yScale(d.data[sCategory]), 10) + 8; })
          .attr("x", 2)
          .attr("fill", "black")
          .attr("font-size", "10")
          .attr("visibility", function (d) {
            if (this.parentElement.parentElement.style.fill === "rgb(160, 155, 155)") {
              return "hidden";
            }
          })
          .text(function (d) {
            if (d.data.year) {
              var fRatio = (d.data["5star"] / d.data["total"] * 100).toFixed(2);

              return fRatio > 0 && fRatio < 100 ? fRatio + "%" : "";
            } else {
              return "";
            }
          });

        layer.selectAll("text").each(function () {
          this.parentNode.parentNode.appendChild(this);
        });


      },

      drawMap: function () {
        Util.drawMap(this.byId("idCountryMapContent").getContent());
        this.loadData();
      },

      drawYearChart: function () {
        var aResultData = [], aYearList = [], i;
        var key = ["5star", "other"];
        var aOriginalData = this._MovieData;

        for (i = 0; i < aOriginalData.length; i++) {
          var sYear = aOriginalData[i].year;
          if (!aYearList.includes(sYear)) {
            aYearList.push(sYear);
            var oDataItem = {
              "year": sYear,
              "5star": 0,
              "other": 0,
              "total": 0
            };
            aResultData.push(oDataItem);
          }
          var iIndex = aYearList.indexOf(sYear);
          aResultData[iIndex]["total"]++;
          var sRating = aOriginalData[i].myRating;
          switch (sRating) {
            case "5":
              aResultData[iIndex]["5star"]++;
              break;
            default:
              aResultData[iIndex]["other"]++;
              break;
          }
        }
        aResultData.sort(function (a, b) { return a.year - b.year; });
        this.drawStackedBar({
          data: aResultData,
          key: key,
          sort: "year",
          id: "year-stacked-bar",
          color: ["#26cb0e", "rgb(160, 155, 155)"],
          category: "year"
        });
      },

      drawPie: function () {
        var data = this.getPieChartData(this);
        var name = function (d) {
          return d.name;
        };
        var value = function (d) {
          return d.value;
        };
        var width = 500;
        var height = 500;

        // Compute values.
        const N = d3.map(data, name);
        const V = d3.map(data, value);
        const I = d3.range(N.length).filter(i => !isNaN(V[i]));

        // Unique the names.
        var names = N;
        names = new d3.InternSet(names);

        // Chose a default color scheme based on cardinality.
        // var colors = d3.schemeSpectral[names.size];
        // colors = d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), names.size);

        // Construct scales.
        const color = d3.scaleOrdinal(names, aRatingColor);
        // const color = d3.scaleOrdinal(names, colors);

        // Compute titles.
        const formatValue = d3.format(",");
        var title = i => `${N[i]}\n${formatValue(V[i])}`;

        // Construct arcs.
        const arcs = d3.pie().padAngle(0).sort(null).value(i => V[i])(I);
        const arc = d3.arc().innerRadius(0).outerRadius(Math.min(width, height) / 2);
        const arcLabel = d3.arc().innerRadius(Math.min(width, height) / 2 * 0.8).outerRadius(Math.min(width, height) / 2 * 0.8);

        const svg = d3.select("#rating-pie").append("svg")
          .attr("width", width)
          .attr("height", height)
          .attr("viewBox", [-width / 2, -height / 2, width, height])
          .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

        svg.append("g")
          .attr("stroke", "white")
          .attr("stroke-width", 1)
          .attr("stroke-linejoin", "round")
          .selectAll("path")
          .data(arcs)
          .join("path")
          .attr("fill", d => color(N[d.data]))
          .attr("d", arc)
          .append("title")
          .text(d => title(d.data));

        svg.append("g")
          .attr("font-family", "sans-serif")
          .attr("font-size", 10)
          .attr("text-anchor", "middle")
          .selectAll("text")
          .data(arcs)
          .join("text")
          .attr("transform", d => `translate(${arcLabel.centroid(d)})`)
          .selectAll("tspan")
          .data(d => {
            const lines = `${title(d.data)}`.split(/\n/);
            return (d.endAngle - d.startAngle) > 0.25 ? lines : lines.slice(0, 1);
          })
          .join("tspan")
          .attr("x", 0)
          .attr("y", (_, i) => `${i * 1.1}em`)
          .attr("font-weight", (_, i) => i ? null : "bold")
          .text(d => d);

        // return Object.assign(svg.node(), { scales: { color } });
      },

      drawTreeMap: function () {
        if (this.byId("idDirectorTreeContent").getContent() === "<div><div id='tree-map'></div></div>") {
          var data = this.getTreeMapData(this._MovieData);
          // If id and parentId options are specified, or the path option, use d3.stratify
          // to convert tabular data to a hierarchy; otherwise we assume that the data is
          // specified as an object {children} with nested objects (a.k.a. the “flare.json”
          // format), and use d3.hierarchy.
          var path = function (d) {
            return d.name;
          };
          var value = function (d) {
            return d ? d.size : "";
          };
          var group = function (d) {
            return d.name.split(".")[1];
          };
          var label = function (d, n) {
            // return "平均分：" + d.averageRating;
            return [...d.name.split(".").pop().split(/(?=[A-Z][a-z])/g), n.value.toLocaleString("en")].join("\n");
          };
          var title = function (d, n) {
            // return `${d.name}\n${n.value.toLocaleString("en")}`;
            if (n && n.data && n.data.averageRating) {
              return "平均分：" + n.data.averageRating.toFixed(2);
            } else {
              return "";
            }
          };
          var tile = d3.treemapBinary;
          var width = 1152;
          var height = 1152;
          var id, parentId, children, linkTarget = "_blank", margin = 0, round = true, zDomain, fill = "#ccc", stroke, strokeWidth, strokeOpacity, strokeLinejoin;

          var aColors = aRatingColorReverse;
          // if (!this.byId("idDirectorTreeContent").getContent()) {
          //   aColors = aRatingColorReverse;
          // }
          var colors = ["white"].concat(aColors);
          var fillOpacity = group == null ? null : 0.6;
          var marginTop = margin, marginRight = margin, marginBottom = margin, marginLeft = margin, padding = 1;
          var paddingInner = padding, paddingOuter = padding;
          var paddingTop = paddingOuter, paddingRight = paddingOuter, paddingBottom = paddingOuter, paddingLeft = paddingOuter;
          var sort = function (a, b) {
            return d3.descending(a.data.name.split(".")[1], b.data.name.split(".")[1]);
          };

          const root = path != null ? d3.stratify().path(path)(data)
            : id != null || parentId != null ? d3.stratify().id(id).parentId(parentId)(data)
              : d3.hierarchy(data, children);

          // Compute the values of internal nodes by aggregating from the leaves.
          value == null ? root.count() : root.sum(d => Math.max(0, value(d)));

          // Prior to sorting, if a group channel is specified, construct an ordinal color scale.
          const leaves = root.leaves();
          const G = group == null ? null : leaves.map(d => group(d.data, d));
          if (zDomain === undefined) zDomain = G;
          zDomain = new d3.InternSet(zDomain);
          const color = group == null ? null : d3.scaleOrdinal(zDomain, colors);

          // Compute labels and titles.
          const L = label == null ? null : leaves.map(d => label(d.data, d));
          const T = title === undefined ? L : title == null ? null : leaves.map(d => title(d.averageRating, d));
          // const T = title === undefined ? L : title == null ? null : leaves.map(d => title(d.data, d));

          // Sort the leaves (typically by descending value for a pleasing layout).
          if (sort != null) root.sort(sort);

          // Compute the treemap layout.
          d3.treemap()
            .tile(tile)
            .size([width - marginLeft - marginRight, height - marginTop - marginBottom])
            .paddingInner(paddingInner)
            .paddingTop(paddingTop)
            .paddingRight(paddingRight)
            .paddingBottom(paddingBottom)
            .paddingLeft(paddingLeft)
            .round(round)
            (root);

          const svg = d3.select("#tree-map").append("svg")
            .attr("viewBox", [-marginLeft, -marginTop, width, height])
            .attr("width", width)
            .attr("height", height)
            .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10);

          const node = svg.selectAll("a")
            .data(leaves)
            .join("a")
            // .attr("xlink:href", link == null ? null : (d, i) => link(d.data, d))
            // .attr("target", link == null ? null : linkTarget)
            .attr("transform", d => `translate(${d.x0},${d.y0})`);

          node.append("rect")
            .attr("fill", color ? (d, i) => color(G[i]) : fill)
            .attr("fill-opacity", fillOpacity)
            .attr("stroke", stroke)
            .attr("stroke-width", strokeWidth)
            .attr("stroke-opacity", strokeOpacity)
            .attr("stroke-linejoin", strokeLinejoin)
            .attr("width", d => d.x1 - d.x0)
            .attr("height", d => d.y1 - d.y0);

          if (T) {
            node.append("title").text((d, i) => T[i]);
          }

          if (L) {
            // A unique identifier for clip paths (to avoid conflicts).
            const uid = `O-${Math.random().toString(16).slice(2)}`;

            node.append("clipPath")
              .attr("id", (d, i) => `${uid}-clip-${i}`)
              .append("rect")
              .attr("width", d => d.x1 - d.x0)
              .attr("height", d => d.y1 - d.y0);

            node.append("text")
              .attr("clip-path", (d, i) => `url(${new URL(`#${uid}-clip-${i}`, location)})`)
              .selectAll("tspan")
              .data((d, i) => `${L[i]}`.split(/\n/g))
              .join("tspan")
              .attr("x", 3)
              .attr("y", (d, i, D) => `${(i === D.length - 1) * 0.3 + 1.1 + i * 0.9}em`)
              .attr("fill-opacity", (d, i, D) => i === D.length - 1 ? 0.7 : null)
              .text(d => d);
          }
        }
      },

      drawBubble: function () {
        var data = this.getBubbleData(this._MovieData);

        var label = function (d) {
          return d.id.split(".").pop();
        };
        var value = function (d) {
          return d.value;
        };
        var group = function (d) {
          return d.id.split(".")[1];
        };
        var title = function (d) {
          return `${d.id}\n${d.value.toLocaleString("en")}`;
        };
        var width = 1152, height = 1152, padding = 3, margin = 1, marginTop = 1, marginRight = 1, marginBottom = 1, marginLeft = 1, groups;
        var colors = aRatingColorReverse, fill = "#ccc", fillOpacity = 0.7, stroke, strokeWidth, strokeOpacity;

        // Compute the values.
        const D = d3.map(data, d => d);
        const V = d3.map(data, value);
        const G = group == null ? null : d3.map(data, group);
        const I = d3.range(V.length).filter(i => V[i] > 0);

        // Unique the groups.
        if (G && groups === undefined) groups = I.map(i => G[i]);
        groups = G && new d3.InternSet(groups);

        // Construct scales.
        const color = G && d3.scaleOrdinal(groups, colors);

        // Compute labels and titles.
        const L = label == null ? null : d3.map(data, label);
        const T = title === undefined ? L : title == null ? null : d3.map(data, title);

        // Compute layout: create a 1-deep hierarchy, and pack it.
        const root = d3.pack()
          .size([width - marginLeft - marginRight, height - marginTop - marginBottom])
          .padding(padding)
          (d3.hierarchy({ children: I })
            .sum(i => V[i]));

        const svg = d3.select("#actor-bubble").append("svg")
          .attr("width", width)
          .attr("height", height)
          .attr("viewBox", [-marginLeft, -marginTop, width, height])
          .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
          .attr("fill", "currentColor")
          .attr("font-size", 10)
          .attr("font-family", "sans-serif")
          .attr("text-anchor", "middle");

        const leaf = svg.selectAll("a")
          .data(root.leaves())
          .join("a")
          // .attr("xlink:href", link == null ? null : (d, i) => link(D[d.data], i, data))
          // .attr("target", link == null ? null : linkTarget)
          .attr("transform", d => `translate(${d.x},${d.y})`);

        leaf.append("circle")
          .attr("stroke", stroke)
          .attr("stroke-width", strokeWidth)
          .attr("stroke-opacity", strokeOpacity)
          .attr("fill", G ? d => color(G[d.data]) : fill == null ? "none" : fill)
          .attr("fill-opacity", fillOpacity)
          .attr("r", d => d.r);

        if (T) leaf.append("title")
          .text(d => T[d.data]);

        if (L) {
          // A unique identifier for clip paths (to avoid conflicts).
          const uid = `O-${Math.random().toString(16).slice(2)}`;

          leaf.append("clipPath")
            .attr("id", d => `${uid}-clip-${d.data}`)
            .append("circle")
            .attr("r", d => d.r);

          leaf.append("text")
            .attr("clip-path", d => `url(${new URL(`#${uid}-clip-${d.data}`, location)})`)
            .selectAll("tspan")
            .data(d => `${L[d.data]}`.split(/\n/g))
            .join("tspan")
            .attr("x", 0)
            .attr("y", (d, i, D) => `${i - D.length / 2 + 0.85}em`)
            .attr("fill-opacity", (d, i, D) => i === D.length - 1 ? 0.7 : null)
            .text(d => d);
        }

      },

      getBubbleData: function (data) {
        var aResultData = [], i, k, aActorNames = [], aActorDetails = [];
        for (i = 0; i < data.length; i++) {
          // var sBrief = data[i].简介;
          // var iRating = data[i].我的评分 ? parseInt(data[i].我的评分, 10) : null;
          // var aActors = sBrief.split("/")[4] ? sBrief.split("/")[4].trim().split(" ") : [];
          var iRating = data[i].myRating ? parseInt(data[i].myRating, 10) : null;
          var aActors = data[i].actor ? data[i].actor.split(" ") : [];
          if (iRating) {
            for (k = 0; k < aActors.length; k++) {
              if (aActorNames.indexOf(aActors[k]) < 0) {
                aActorNames.push(aActors[k]);
                var oActor = {
                  "name": aActors[k],
                  "averageRating": iRating,
                  "count": 1
                };
                aActorDetails.push(oActor);
              } else {
                var oItem = aActorDetails[aActorNames.indexOf(aActors[k])];
                oItem.averageRating = (oItem.averageRating * oItem.count + iRating) / (oItem.count + 1);
                oItem.count++;
              }
            }
          }
        }
        for (i = 0; i < aActorDetails.length; i++) {
          var iAverageRating = aActorDetails[i].averageRating;
          var iCount = aActorDetails[i].count;
          var sName = aActorDetails[i].name;
          if (iCount > 1) {
            var oBubbleItem = {
              id: "",
              value: ""
            };
            oBubbleItem.value = iCount;

            if (iAverageRating === 5) {
              oBubbleItem.id = "flare.5star." + sName;
            } else if (iAverageRating < 5 && iAverageRating >= 4) {
              oBubbleItem.id = "flare.4star." + sName;
            } else if (iAverageRating < 4 && iAverageRating >= 3) {
              oBubbleItem.id = "flare.3star." + sName;
            } else if (iAverageRating < 3 && iAverageRating >= 2) {
              oBubbleItem.id = "flare.2star." + sName;
            } else if (iAverageRating < 2 && iAverageRating >= 1) {
              oBubbleItem.id = "flare.1star." + sName;
            } else {
              oBubbleItem.id = "flare.0star." + sName;
            }
            aResultData.push(oBubbleItem);
          }
        }

        aResultData.sort(function (a, b) {
          if (a.id > b.id) {
            return -1;
          } else if (a.id < b.id) {
            return 1;
          } else {
            return 0;
          }
          // return a.id > b.id;
        });
        return aResultData;
      },

      drawCategory: function () {
        var data = [
          {
            civilization: "aaa",
            start: 0,
            end: 3,
            startLabel: "",
            endLabel: "",
            region: "Middle East",
            // timeline: "ANCIENT WORLD",
            color: { r: 102, g: 194, b: 165, opacity: 1 }
          },
          {
            civilization: "bbb",
            start: 2,
            end: 5,
            startLabel: "",
            endLabel: "",
            region: "Middle East",
            // timeline: "ANCIENT WORLD",
            color: { r: 102, g: 194, b: 165, opacity: 1 }
          }
        ];
        var regions = ["Middle East", "South Asia"];
        var timelines = ["ANCIENT WORLD", "MEDIEVAL WORLD", "MODERN WORLD"];
        var color = d3.scaleOrdinal(d3.schemeSet2).domain(regions);
        var height = 1000;
        var width = 1000;
        var margin = ({ top: 30, right: 30, bottom: 30, left: 30 });
        var x = d3.scaleLinear()
          .domain([d3.min(data, d => d.start), d3.max(data, d => d.end)])
          .range([0, width - margin.left - margin.right]);
        var y = d3.scaleBand()
          .domain(d3.range(data.length))
          .range([0, height - margin.bottom - margin.top])
          .padding(0.2);
        // var formatDate = d => d < 0 ? `${-d}BC` : `${d}AD`;
        var axisTop = d3.axisTop(x)
        // .tickPadding(2)
        // .tickFormat(formatDate);
        var axisBottom = d3.axisBottom(x)
        // .tickPadding(2)
        // .tickFormat(formatDate);
        // var dataByRegion = d3.nest().key(d => d.region).entries(data);
        // var dataByTimeline = d3.nest().key(d => d.timeline).entries(data);
        var getRect = function (d) {
          const el = d3.select(this);
          const sx = x(d.start);
          const w = x(d.end) - x(d.start);
          const isLabelRight = (sx > width / 2 ? sx + w < width : sx - w > 0);

          el.style("cursor", "pointer")
          el
            .append("rect")
            .attr("x", sx)
            .attr("height", "10px")
            // .attr("height", y.bandwidth())
            .attr("width", w)
            .attr("fill", d.color);
          el
            .append("text")
            .text(d.civilization)
            .attr("x", isLabelRight ? sx - 5 : sx + w + 5)
            .attr("y", 2.5)
            .attr("fill", "black")
            .style("text-anchor", isLabelRight ? "end" : "start")
            .style("dominant-baseline", "hanging");
        };


        let filteredData;
        filteredData = data.sort((a, b) => a.start - b.start);

        filteredData.forEach(d => d.color = d3.color(color(d.region)))

        const svg = d3.select("#category-content").append("svg")
          .attr("width", width)
          .attr("height", height);
        const g = svg.append("g").attr("transform", (d, i) => `translate(${margin.left} ${margin.top})`);
        const groups = g
          .selectAll("g")
          .data(filteredData)
          .enter()
          .append("g")
          .attr("class", "civ")

        const line = svg.append("line").attr("y1", margin.top - 10).attr("y2", height - margin.bottom).attr("stroke", "rgba(0,0,0,0.2)").style("pointer-events", "none");

        groups.attr("transform", (d, i) => `translate(0 ${y(i)})`)
        groups
          .each(getRect)
        svg
          .append("g")
          .attr("transform", (d, i) => `translate(${margin.left} ${margin.top - 10})`)
          .call(axisTop)
        svg
          .append("g")
          .attr("transform", (d, i) => `translate(${margin.left} ${height - margin.bottom})`)
          .call(axisBottom)
      },

      getTreeMapData: function (data) {
        var aResultData = [{
          name: "flare",
          size: null
        }, {
          name: "flare.5star",
          size: null
        }, {
          name: "flare.4star",
          size: null
        }, {
          name: "flare.3star",
          size: null
        }, {
          name: "flare.2star",
          size: null
        }, {
          name: "flare.1star",
          size: null
        }, {
          name: "flare.0star",
          size: null
        }], i, sDirector, sRating, aDirectorNames = [], aDirectorDetail = [];
        for (i = 0; i < data.length; i++) {
          // sBrief = data[i].简介;
          // sDirector = sBrief.split("/")[3] ? sBrief.split("/")[3].trim() : "";
          // sRating = data[i].我的评分;
          sDirector = data[i].director;
          sRating = data[i].myRating;
          if (sRating) {
            // filter no rating movies
            if (aDirectorNames.indexOf(sDirector) < 0) {
              aDirectorNames.push(sDirector);
              var oDirector = {
                name: sDirector,
                count: 1,
                averageRating: parseInt(sRating, 10)
              }
              aDirectorDetail.push(oDirector);
            } else {
              var oItem = aDirectorDetail[aDirectorNames.indexOf(sDirector)];
              oItem.count++;
              oItem.averageRating = (oItem.averageRating * (oItem.count - 1) + parseInt(sRating, 10)) / oItem.count;
            }
          }
        }
        for (i = 0; i < aDirectorDetail.length; i++) {
          var oDirectorItem = {};
          var iAverageRating = aDirectorDetail[i].averageRating;
          if (aDirectorDetail[i].count >= 2) {
            oDirectorItem.size = aDirectorDetail[i].count;
            oDirectorItem.averageRating = iAverageRating;

            if (iAverageRating === 5) {
              oDirectorItem.name = "flare.5star." + aDirectorDetail[i].name;
              oDirectorItem.category = "5";
            } else if (iAverageRating < 5 && iAverageRating >= 4) {
              oDirectorItem.name = "flare.4star." + aDirectorDetail[i].name;
              oDirectorItem.category = "4";
            } else if (iAverageRating < 4 && iAverageRating >= 3) {
              oDirectorItem.name = "flare.3star." + aDirectorDetail[i].name;
              oDirectorItem.category = "3";
            } else if (iAverageRating < 3 && iAverageRating >= 2) {
              oDirectorItem.name = "flare.2star." + aDirectorDetail[i].name;
              oDirectorItem.category = "2";
            } else if (iAverageRating < 2 && iAverageRating >= 1) {
              oDirectorItem.name = "flare.1star." + aDirectorDetail[i].name;
              oDirectorItem.category = "1";
            } else {
              oDirectorItem.name = "flare.0star." + aDirectorDetail[i].name;
              oDirectorItem.category = "0";
            }
            aResultData.push(oDirectorItem);
          }
        }
        return aResultData;
      },

      loadData: function () {
        var that = this;
        var correctAnswer = [], count = 0, oCountryMapping, aMyMovieCountries = [], oAnswers = {};
        var oMultiSectionCountry = {
          "France": ["France", "French_Guiana", "New_Caledonia"],
          "China": ["China", "Taiwan"],
          "Denmark": ["Denmark", "Greenland"]
        };

        $.getJSON("countryMapping.json", function (countryData) {
          oCountryMapping = countryData;

          var data = that._MovieData;
          var i, k, j, sRegionCode;
          for (i = 0; i < data.length; i++) {
            // var sBrief = data[i].简介;
            // var sTitle = data[i].标题;
            // var sCountry = sBrief.split("/")[1] ? sBrief.split("/")[1].trim() : "";
            var sTitle = data[i].title;
            var sCountry = data[i].country;
            if (sCountry) {
              var aCountry = sCountry.split(" ");
              for (k = 0; k < aCountry.length; k++) {
                var sCode = oCountryMapping[aCountry[k]];
                if (oMultiSectionCountry[sCode]) {
                  for (j = 0; j < oMultiSectionCountry[sCode].length; j++) {
                    sRegionCode = oMultiSectionCountry[sCode][j];
                    if (!aMyMovieCountries.includes(sRegionCode)) {
                      draw(sRegionCode, that);
                      aMyMovieCountries.push(sRegionCode);
                      count++;
                    }
                    if (oAnswers[sRegionCode]) {
                      oAnswers[sRegionCode].push(sTitle);
                    } else {
                      oAnswers[sRegionCode] = [sTitle]
                    }
                  }
                } else {
                  if (!aMyMovieCountries.includes(sCode)) {
                    draw(sCode, that);
                    aMyMovieCountries.push(sCode);
                    count++;
                  }
                  if (oAnswers[sCode]) {
                    oAnswers[sCode].push(sTitle);
                  } else {
                    oAnswers[sCode] = [sTitle]
                  }
                }
              }
            }
          }
        });

        function draw(regionCode, that) {
          var i;
          for (i = 0; i < $("path").length; i++) {
            if (regionCode === $("path")[i].id) {
              $("path")[i].style.animation = "myfirst 2s";
              $("path")[i].style.fill = "#009933";
              $("path")[i].onmouseover = function (oEvent) {
                $("#idMovieList").css("visibility", "initial");
                if (oAnswers[oEvent.currentTarget.id]) {
                  var blurb = '<div><text style="font-size:20px;font-weight:bold">' + oEvent.currentTarget.id + '(' + oAnswers[oEvent.currentTarget.id].length + '部)</text></div><text style="font-size:20px">' + oAnswers[oEvent.currentTarget.id].join(" ") + '</text>';
                  blurb += "</p>";
                  $("#blurb-content").html(blurb);
                }
              }

              correctAnswer.push(regionCode);
              that.byId("idCountryCount").setText("国家数量：" + count + " / 195")
            }
          }
        }
      }
    });
  }
);
