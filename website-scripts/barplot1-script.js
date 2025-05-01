//this is copy-pasted from barplot1, with d3.select(some things) => chart.select(same thing) and chart=barplot1
function barplot1() {
        let isPrescriptionMode = true; //true if per prescription, false if per days supply
        let data = [];
        let drugClass = "ALL";
        let numToDisplay = 5;

        //initialize svg element
        const chart = d3.select("#barplot1")
        const margin = { top: 30, right: 30, bottom: 50, left: 100 };
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

        //select tooltip
        const tooltip = chart.select(".tooltip")
            .style("position", "absolute")
            .style("background-color", "lightgray")
            .style("padding", "5px")
            .style("border", "1px solid #ddd")
            .style("border-radius", "5px")
            .style("pointer-events", "none")
            .style("display", "none");

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
            x.domain([0, d3.max(stackedData[stackedData.length - 1], d => d[1])]);

            //handles the axes
            svg.select(".x-axis")
                .transition()
                .duration(800)
                .call(d3.axisBottom(x));

            svg.select(".y-axis")
                .transition()
                .duration(800)
                .call(d3.axisLeft(y));

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

                    bars.enter()
                        .append("rect")
                        .merge(bars)
                        .transition().duration(800)
                        .attr("y", d => y(d.data["Drug Name"]))
                        .attr("height", y.bandwidth())
                        .attr("x", d => x(d[0]))
                        .attr("width", d => x(d[1]) - x(d[0]));

                    bars.exit().remove();
                });

            groups.exit().remove();

            //tooltip functionality
            svg.selectAll("rect")
                .on("mouseover", function(event, d) {
                    const category = isPrescriptionMode 
                        ? (d3.select(this.parentNode).datum().key === "pocketPresc" ? "Patient Out of Pocket per Prescription" : "Payer Paid per Prescription")
                        : (d3.select(this.parentNode).datum().key === "pocketDays" ? "Patient Out of Pocket per Days Supply" : "Payer Paid per Days Supply");

                    const tot = isPrescriptionMode ? "Total Paid per Prescription" : "Total Paid per Days Supply";
                    const avg = isPrescriptionMode ? "Average Cost per Prescription" : "Average Cost per Days Supply";

                    //what the tooltip says
                    tooltip.style("display", "block")
                        .html(
                            `<b><u>${d.data["Drug Name"]}</u></b> <br> 
                            <strong>Class:</strong> ${d.data["Therapeutic Class"]} <br>
                            <strong>${category}:</strong> $${(d[1] - d[0]).toFixed(2)} <br>
                            <strong>${tot}:</strong> $${(+d.data[avg]).toFixed(2)}`
                        )
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
        d3.csv("2022drugs.csv").then(csvData => {
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

        d3.select("#toggleDropdown").on("change", function() {
            const selectedVal = d3.select(this).property("value");

            isPrescriptionMode = selectedVal === 'true' ? true : false;

            updateChart(filterData());

        })

        d3.select("#drugClassesDropdown1").on("change", function() {
            const selectedVal = d3.select(this).property("value");
            //debug
            console.log("Selected value:", selectedVal);

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
            //filter to top numToDisplay based on allowed amount
            //maybe have option to change allowed amount to something else?
            filtered = filtered.sort((a, b) => b.allowedAmount - a.allowedAmount).slice(0, numToDisplay);
            return filtered;
        }
}
barplot1()