function barplots() {
    //variables for both barplots
    let isPrescriptionMode = true; //true if per prescription, false if per days supply
    let year = "2022";
    let GvB = "Both";
    let patientPayer = "Both";

    //this is copy-pasted from barplot1, with d3.select(some things) => chart.select(same thing) and chart=barplot1
    function barplot1() {
        //let isPrescriptionMode = true; //true if per prescription, false if per days supply
        let data = [];
        let drugClass = "ALL";
        let numToDisplay = 5;

        //initialize svg element
        const chart = d3.select("#barplot1")
        const margin = { top: 30, right: 30, bottom: 50, left: 150 };
        const width = 800 - margin.left - margin.right;
        const height = 500 - margin.top - margin.bottom;
        const svg = chart.select("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        //set x and y scales
        //const x = d3.scaleBand().range([0, width]).padding(0.3);
        //const y = d3.scaleLinear().range([height, 0]);
        const x = d3.scaleLinear().range([0, width]);
        const y = d3.scaleBand().range([height, 0]).padding(0.3);

        //set colors for bars
        const color = d3.scaleOrdinal()
            .domain(["Patient", "Payer"])
            .range(["#dd3333", "#aaccff"]);

        //add x and y axes
        svg.append("g").attr("class", "x-axis").attr("transform", `translate(0,${height})`);
        svg.append("g").attr("class", "y-axis");

        //add x-axis label
        svg.select(".x-axis")
            .append("text")
            .attr("fill", "black")
            .attr("x", width / 2)
            .attr("y", 40)

        //select tooltip
        const tooltip = chart.select(".tooltip")
            .style("position", "absolute")
            .style("background-color", "lightgray")
            .style("padding", "5px")
            .style("border", "1px solid #ddd")
            .style("border-radius", "5px")
            .style("pointer-events", "none")
            .style("display", "none")
            .style("text-align", "left");

        //update chart to show bars in filteredData
        function updateChart(filteredData) {
            //debug code, helpful to see what data goes into the bar chart
            console.log("Updating Chart with Data:", filteredData);

            if (filteredData.length === 0) {
                console.error("No data available to display.");
                return;
            }

            //sets up the stacked data
            const stack = d3.stack()
                .keys(isPrescriptionMode ? ["pocketPresc", "payerPresc"] : ["pocketDays", "payerDays"])
                .order(d3.stackOrderNone)
                .offset(d3.stackOffsetNone);

            const stackedData = stack(filteredData);

            //set the axis scales
            //x.domain(filteredData.map(d => d["Drug Name"])); 
            //y.domain([0, d3.max(stackedData[stackedData.length - 1], d => d[1])]);
            y.domain(filteredData.map(d => d["Drug Name"])); 
            if (patientPayer == "Both") {
                x.domain([0, d3.max(stackedData[1], d => d[1])]);
            } else if (patientPayer == "Patient") {
                x.domain([0, d3.max(stackedData[0], d => d[1])]);
            } else { //patientPayer == "Payer"
                x.domain([0, d3.max(stackedData[1], d => d[1]-d[0])]);
            }

            //handles the axes
            svg.select(".x-axis")
                .transition()
                .duration(800)
                .call(d3.axisBottom(x));

            svg.select(".y-axis")
                .transition()
                .duration(800)
                .call(d3.axisLeft(y));

            //updates axis label
            svg.select(".x-axis")
                .select("text")
                .text((isPrescriptionMode) ? "Average Cost per Prescription" : "Average Cost per Days Supply")

            //selects and updates/creates the bars
            const groups = svg.selectAll(".bar-group")
                .data(stackedData);

            groups.enter()
                .append("g")
                .attr("class", "bar-group")
                .attr("fill", (d, i) => color(i === 0 ? "Patient" : "Payer"))
                .merge(groups)
                .each(function(d, i) {
                    const group = d3.select(this);
                    const bars = group.selectAll("rect")
                        .data(d);

                    //update bars based on patient/payer selection
                    //if bar is not needed, it has width 0
                    if (patientPayer == 'Both') {
                        bars.enter()
                            .append("rect")
                            .merge(bars)
                            .transition().duration(800)
                            .attr("y", d => y(d.data["Drug Name"]))
                            .attr("height", y.bandwidth())
                            .attr("x", d => x(d[0]))
                            .attr("width", d => x(d[1]) - x(d[0]));
                    } else if (patientPayer == "Patient") {
                        bars.enter()
                            .append("rect")
                            .merge(bars)
                            .transition().duration(800)
                            .attr("y", d => y(d.data["Drug Name"]))
                            .attr("height", y.bandwidth())
                            .attr("x", d => x(d[0]))
                            .attr("width", d => (i == 0) ? x(d[1]) - x(d[0]) : 0);
                    } else { //patientPayer == "Payer"
                        bars.enter()
                            .append("rect")
                            .merge(bars)
                            .transition().duration(800)
                            .attr("y", d => y(d.data["Drug Name"]))
                            .attr("height", y.bandwidth())
                            .attr("x", d => x(0))
                            .attr("width", d => (i == 1) ? x(d[1]) - x(d[0]) : 0);
                    }

                    bars.exit().remove();
                });

            groups.exit().remove();

            //tooltip functionality
            svg.selectAll("rect")
                .on("mouseover", function(event, d) {
                    //pick which line to bold
                    const category = isPrescriptionMode 
                        ? (d3.select(this.parentNode).datum().key === "pocketPresc" ? "Out of Pocket Cost per Prescription" : "Insurance Cost per Prescription")
                        : (d3.select(this.parentNode).datum().key === "pocketDays" ? "Out of Pocket Cost per Day" : "Insurance Cost per Day");
            
                    //what the tooltip says
                    let tooltipText = `<b><u>${d.data["Drug Name"]}</u></b> <br> 
                            Class: ${d.data["Therapeutic Class"]} <br>
                            <hr>
                            Total Cost per Prescription: $${(+d.data["Average Cost per Prescription"]).toFixed(2)} <br>
                            Insurance Cost per Prescription: $${(+d.data["Payer Paid per Prescription"]).toFixed(2)} (${(100 * +d.data["Payer Paid per Prescription"] / +d.data["Average Cost per Prescription"]).toFixed(1)}%) <br>
                            Out of Pocket Cost per Prescription: $${(+d.data["Patient Out of Pocket per Prescription"]).toFixed(2)} (${(100 * +d.data["Patient Out of Pocket per Prescription"] / +d.data["Average Cost per Prescription"]).toFixed(1)}%) <br>
                            <hr>
                            Total Cost per Day: $${(+d.data["Average Cost per Days Supply"]).toFixed(2)} <br>
                            Insurance Cost per Day: $${(+d.data["Payer Paid per Days Supply"]).toFixed(2)} (${(100 * +d.data["Payer Paid per Days Supply"] / +d.data["Average Cost per Days Supply"]).toFixed(1)}%)<br>
                            Out of Pocket Cost per Day: $${(+d.data["Patient Out of Pocket per Days Supply"]).toFixed(2)} (${(100 * +d.data["Patient Out of Pocket per Days Supply"] / +d.data["Average Cost per Days Supply"]).toFixed(1)}%) <br>`

                    //bold the line
                    let regex = new RegExp(category)
                    tooltipText = tooltipText.replace(regex, (s) => "<b>" + s + "</b>")

                    tooltip.style("display", "block")
                        .html(tooltipText)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 20) + "px");
                })
                .on("mousemove", function(event) {
                    tooltip.style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 20) + "px");
                })
                .on("mouseout", function() {
                    tooltip.style("display", "none");
                });
        }


        //Load data from CSV and initialize chart and class dropdown
        d3.csv("barplot1-temp-data.csv").then(csvData => {
            //Convert CSV strings to numbers
            csvData.forEach(d => {
                d.pocketPresc = +d["Patient Out of Pocket per Prescription"];
                d.payerPresc = +d["Payer Paid per Prescription"];
                d.pocketDays = +d["Patient Out of Pocket per Days Supply"];
                d.payerDays = +d["Payer Paid per Days Supply"];
                d.allowedAmount = +d["Allowed Amount"];
            });

            data = csvData;

            //add all classes to class dropdown
            const therapeuticClasses = [...new Set(data.map(d => d["Therapeutic Class"]))].sort();
            let classDropdown = d3.select("#drugClassesDropdown1");
            therapeuticClasses.forEach((className) => {
                classDropdown.append("option").attr("value", className).text(className);
            })

            updateChart(filterData());
        });

        d3.select("#drugClassesDropdown1").on("change", function() {
            const selectedVal = d3.select(this).property("value");
            //debug
            //console.log("Selected value:", selectedVal);

            drugClass = selectedVal;

            updateChart(filterData());

        });

        d3.select("#quantity1").on("input", function() {
            const selectedNum = d3.select(this).property("value");

            numToDisplay = selectedNum;

            updateChart(filterData());

        });

        //filters data to top numToDisplay drugs based on class, for the updateChart function
        function filterData() {
            let filtered = data;
            //filter to only selected class
            if (drugClass !== "ALL") {
                filtered = filtered.filter((d) => d["Therapeutic Class"] === drugClass);
            }
            //filter to generic, brand, or both
            if (GvB !== "Both"){
                filtered = filtered.filter((d) => d["Generic v Brand"] === GvB);
            }
            //filter to only year
            filtered = filtered.filter((d) => d["Year"] === year);
            //filter to top numToDisplay based on allowed amount
            filtered = filtered.sort((a, b) => b.allowedAmount - a.allowedAmount).slice(0, numToDisplay);
            return filtered;
        }

        barplot1.update = updateChart;
        barplot1.filter = filterData;
    }

    //this is copy-pasted from barplot2, with d3.select(some things) => chart.select(same thing) and chart=barplot2
    function barplot2() {
        //let isPrescriptionMode = true; //true if per prescription, false if per days supply
        let data = [];
        //let GvB = "Generic";
        let numToDisplay = 5;

        //initialize svg element
        const chart = d3.select("#barplot2")
        const margin = { top: 30, right: 30, bottom: 50, left: 160 };
        const width = 800 - margin.left - margin.right;
        const height = 500 - margin.top - margin.bottom;
        const svg = chart.select("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        //set x and y scales
        //const x = d3.scaleBand().range([0, width]).padding(0.3);
        //const y = d3.scaleLinear().range([height, 0]);
        const x = d3.scaleLinear().range([0, width]);
        const y = d3.scaleBand().range([height, 0]).padding(0.3);

        //set colors for bars
        const color = d3.scaleOrdinal()
            .domain(["Patient", "Payer"])
            .range(["#dd3333", "#aaccff"]);

        //add x and y axes
        svg.append("g").attr("class", "x-axis").attr("transform", `translate(0,${height})`);
        svg.append("g").attr("class", "y-axis");

        //add x-axis label
        svg.select(".x-axis")
            .append("text")
            .attr("fill", "black")
            .attr("x", width / 2)
            .attr("y", 40)

        //select tooltip
        const tooltip = chart.select(".tooltip")
            .style("position", "absolute")
            .style("background-color", "lightgray")
            .style("padding", "5px")
            .style("border", "1px solid #ddd")
            .style("border-radius", "5px")
            .style("pointer-events", "none")
            .style("display", "none")
            .style("text-align", "left");

        //update chart to show bars in filteredData
        function updateChart(filteredData) {
            //debug code, helpful to see what data goes into the bar chart
            console.log("Updating Chart with Data:", filteredData);

            if (filteredData.length === 0) {
                console.error("No data available to display.");
                return;
            }

            //sets up the stacked data
            const stack = d3.stack()
                .keys(isPrescriptionMode ? ["pocketPresc", "payerPresc"] : ["pocketDays", "payerDays"])
                .order(d3.stackOrderNone)
                .offset(d3.stackOffsetNone);

            const stackedData = stack(filteredData);

            //set the axis scales
            y.domain(filteredData.map(d => d["Therapeutic Class"])); 
            if (patientPayer == "Both") {
                x.domain([0, d3.max(stackedData[1], d => d[1])]);
            } else if (patientPayer == "Patient") {
                x.domain([0, d3.max(stackedData[0], d => d[1])]);
            } else { //patientPayer == "Payer"
                x.domain([0, d3.max(stackedData[1], d => d[1]-d[0])]);
            }

            //handles the axes
            svg.select(".x-axis")
                .transition()
                .duration(800)
                .call(d3.axisBottom(x));

            svg.select(".y-axis")
                .transition()
                .duration(800)
                .call(d3.axisLeft(y));

            //updates axis label
            svg.select(".x-axis")
                .select("text")
                .text((isPrescriptionMode) ? "Average Cost per Prescription" : "Average Cost per Days Supply")

            //selects and updates/creates the bars
            const groups = svg.selectAll(".bar-group")
                .data(stackedData);

            groups.enter()
                .append("g")
                .attr("class", "bar-group")
                .attr("fill", (d, i) => color(i === 0 ? "Patient" : "Payer"))
                .merge(groups)
                .each(function(d, i) {
                    const group = d3.select(this);
                    const bars = group.selectAll("rect")
                        .data(d);

                    //update bars based on patient/payer selection
                    //if bar is not needed, it has width 0
                    if (patientPayer == 'Both') {
                        bars.enter()
                            .append("rect")
                            .merge(bars)
                            .transition().duration(800)
                            .attr("y", d => y(d.data["Therapeutic Class"]))
                            .attr("height", y.bandwidth())
                            .attr("x", d => x(d[0]))
                            .attr("width", d => x(d[1]) - x(d[0]));
                    } else if (patientPayer == "Patient") {
                        bars.enter()
                            .append("rect")
                            .merge(bars)
                            .transition().duration(800)
                            .attr("y", d => y(d.data["Therapeutic Class"]))
                            .attr("height", y.bandwidth())
                            .attr("x", d => x(d[0]))
                            .attr("width", d => (i == 0) ? x(d[1]) - x(d[0]) : 0);
                    } else { //patientPayer == "Payer"
                        bars.enter()
                            .append("rect")
                            .merge(bars)
                            .transition().duration(800)
                            .attr("y", d => y(d.data["Therapeutic Class"]))
                            .attr("height", y.bandwidth())
                            .attr("x", d => x(0))
                            .attr("width", d => (i == 1) ? x(d[1]) - x(d[0]) : 0);
                    }

                    bars.exit().remove();
                });

            groups.exit().remove();

            //tooltip functionality
            svg.selectAll("rect")
                .on("mouseover", function(event, d) {
                    const category = isPrescriptionMode 
                        ? (d3.select(this.parentNode).datum().key === "pocketPresc" ? "Out of Pocket Cost per Prescription" : "Insurance Cost per Prescription")
                        : (d3.select(this.parentNode).datum().key === "pocketDays" ? "Out of Pocket Cost per Day" : "Insurance Cost per Day");
            
                    //what the tooltip says
                    let tooltipText = `<b>${d.data["Therapeutic Class"]}</b> <br> 
                            <hr>
                            Total Cost per Prescription: $${(+d.data["Average Cost per Prescription"]).toFixed(2)} <br>
                            Insurance Cost per Prescription: $${(+d.data["Payer Paid per Prescription"]).toFixed(2)} (${(100 * +d.data["Payer Paid per Prescription"] / +d.data["Average Cost per Prescription"]).toFixed(1)}%) <br>
                            Out of Pocket Cost per Prescription: $${(+d.data["Patient Out of Pocket per Prescription"]).toFixed(2)} (${(100 * +d.data["Patient Out of Pocket per Prescription"] / +d.data["Average Cost per Prescription"]).toFixed(1)}%) <br>
                            <hr>
                            Total Cost per Day: $${(+d.data["Average Cost per Days Supply"]).toFixed(2)} <br>
                            Insurance Cost per Day: $${(+d.data["Payer Paid per Days Supply"]).toFixed(2)} (${(100 * +d.data["Payer Paid per Days Supply"] / +d.data["Average Cost per Days Supply"]).toFixed(1)}%)<br>
                            Out of Pocket Cost per Day: $${(+d.data["Patient Out of Pocket per Days Supply"]).toFixed(2)} (${(100 * +d.data["Patient Out of Pocket per Days Supply"] / +d.data["Average Cost per Days Supply"]).toFixed(1)}%) <br>`

                    //bold the line
                    let regex = new RegExp(category)
                    tooltipText = tooltipText.replace(regex, (s) => "<b>" + s + "</b>")

                    tooltip.style("display", "block")
                        .html(tooltipText)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 20) + "px");
                })
                .on("mousemove", function(event) {
                    tooltip.style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 20) + "px");
                })
                .on("mouseout", function() {
                    tooltip.style("display", "none");
                });
        }


        //Load data from CSV and initialize chart
        d3.csv("barplot2-temp-data.csv").then(csvData => {
            //Convert CSV strings to numbers
            csvData.forEach(d => {
                d.pocketPresc = +d["Patient Out of Pocket per Prescription"];
                d.payerPresc = +d["Payer Paid per Prescription"];
                d.pocketDays = +d["Patient Out of Pocket per Days Supply"];
                d.payerDays = +d["Payer Paid per Days Supply"];
                d.allowedAmount = +d["Allowed Amount"];
            });

            data = csvData;

            updateChart(filterData());
        });

        d3.select("#quantity2").on("input", function() {
            const selectedNum = d3.select(this).property("value");

            numToDisplay = selectedNum;

            updateChart(filterData());

        });

        //filters data to top numToDisplay drugs based on class, for the updateChart function
        function filterData() {
            let filtered = data;
            //filter to generic, brand, or both
            filtered = filtered.filter((d) => d["Generic v Brand"] === GvB);
            //filter to only year
            filtered = filtered.filter((d) => d["Year"] === year);
            //filter to top numToDisplay based on allowed amount
            filtered = filtered.sort((a, b) => b.allowedAmount - a.allowedAmount).slice(0, numToDisplay);
            return filtered;
        }

        barplot2.update = updateChart;
        barplot2.filter = filterData;

    }

    //create barplots
    barplot1()
    barplot2()

    //make shared dropdowns update both charts

    d3.select("#toggleDropdown").on("change", function() {
        const selectedVal = d3.select(this).property("value");

        isPrescriptionMode = selectedVal === 'true' ? true : false;

        barplot1.update(barplot1.filter());
        barplot2.update(barplot2.filter());

    })

    d3.select("#yearSelectorDropdown").on("change", function() {
        const selectedVal = d3.select(this).property("value");

        year = selectedVal

        barplot1.update(barplot1.filter());
        barplot2.update(barplot2.filter());

    })

    d3.select("#drugGvBDropdown").on("change", function() {
        const selectedVal = d3.select(this).property("value");

        GvB = selectedVal;

        barplot1.update(barplot1.filter());
        barplot2.update(barplot2.filter());

    });

    d3.select("#patientOrPayerDropdown").on("change", function() {
        const selectedVal = d3.select(this).property("value");
        //debug
        //console.log("Selected value:", selectedVal);

        patientPayer = selectedVal;

        barplot1.update(barplot1.filter());
        barplot2.update(barplot2.filter());

    });

}
barplots()