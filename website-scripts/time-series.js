d3.csv("Claims-time-series-test.csv").then(data => {
    // remove unknown / missing classes
    data = data.filter(e => {
        let bannedClasses = ["Unknown", "Missing", "~Missing", "UNKNOWN"];
        return !bannedClasses.includes(e['Therapeutic Class'])
    })
    // convert average out of pocket to float
    data.forEach(e => {
        e["Average Out Of Pocket Per Prescription"] = parseFloat(e["Average Out Of Pocket Per Prescription"]);
    });

    // create array of drug classes
    let drugClasses = data.map(d => d["Therapeutic Class"]);
    drugClasses = [...new Set(drugClasses)]; // remove duplicates

    // create colors for plot
    let ncolors = drugClasses.length;
    console.log("ncolors: ", ncolors);
    let colorScale = d3.scaleSequential()
                       .domain([0, ncolors])
                       .interpolator(d3.interpolateRainbow);

    function generateDistinctColors(numColors = 30) {
        const colors = [];
        for (let i = 0; i < numColors; i++) {
            const hue = Math.floor((i * 360) / numColors);
            const saturation = 90;
            const lightness = 50;
            colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
        }
        return colors;
    }

    const colorSet = [
        ...d3.schemeTableau10,    // 10
        ...d3.schemeSet3,         // 12
        ...d3.schemePaired,       // 12
        ...d3.schemeDark2         // 8
      ].slice(0, 35); // total > 42, so slice to 35
    
    const colorPalette = generateDistinctColors(ncolors);
    console.log(colorPalette);

    let legendColors = {}; // obj mapping name -> color
    drugClasses.forEach((d, i) => {
        legendColors[d] = colorSet[i];
    });
    
    // initialize dropdown
    dropdown = d3.select('#drugClassDropdown')
                 
    dropdown.selectAll('option')
            .data(drugClasses)
            .enter()
            .append('option')
            .attr('value', d => d)
            .text(d => d);
    
    const classDropdown = document.getElementById('drugClassDropdown');
    // Create a container for the filter controls
    const filterContainer = d3.select("#timeSeriesView")
                              .insert("div", ":first-child")
                              .attr("class", "filter-container")
                              .style("margin-bottom", "15px")
                            .style("display", "flex")
                            .style("align-items", "center")
                            .style("flex-wrap", "nowrap")
                            .style("gap", "10px");

    // Add a label for the therapeutic class filter
    filterContainer.append("label")
    .text("Therapeutic Class:")
    .style("margin-right", "5px")
    .style("font-weight", "bold")
    .style("font-size", "12px");

    // Create a dropdown container for therapeutic class filter
    const therapeuticClassDropdownContainer = filterContainer.append("div")
    .attr("class", "dropdown-container")
    .style("position", "relative")
    .style("display", "inline-block");

    // Create a button to toggle the therapeutic class dropdown
    const therapeuticClassDropdownButton = therapeuticClassDropdownContainer.append("button")
    .text("Select")
    .style("padding", "4px 8px")
    .style("background-color", "#f8f9fa")
    .style("border", "1px solid #ddd")
    .style("border-radius", "4px")
    .style("cursor", "pointer")
    .style("font-size", "12px");

    // Create the therapeutic class dropdown content
    const therapeuticClassDropdownContent = therapeuticClassDropdownContainer.append("div")
    .attr("class", "dropdown-content")
    .style("display", "none")
    .style("position", "absolute")
    .style("background-color", "white")
    .style("border", "1px solid #ddd")
    .style("border-radius", "4px")
    .style("padding", "10px")
    .style("max-height", "300px")
    .style("overflow-y", "auto")
    .style("z-index", "1000")
    .style("box-shadow", "0 2px 5px rgba(0,0,0,0.2)");

    // Toggle therapeutic class dropdown visibility
    therapeuticClassDropdownButton.on("click", function() {
        const isVisible = therapeuticClassDropdownContent.style("display") === "block";
        therapeuticClassDropdownContent.style("display", isVisible ? "none" : "block");
        yearDropdownContent.style("display", "none"); // Close other dropdown
        genericVsBrandDropdownContent.style("display", "none"); // Close other dropdown
    });

    // Close dropdowns when clicking outside
    d3.select("body").on("click", function(event) {
        if (!therapeuticClassDropdownContainer.node().contains(event.target)) {
            therapeuticClassDropdownContent.style("display", "none");
        }
    });

    // Create checkboxes for each therapeutic class
    const checkboxContainer = therapeuticClassDropdownContent.append("div")
        .style("display", "grid")
        .style("grid-template-columns", "repeat(2, 1fr)")
        .style("gap", "5px");
    
    // Add "Select All" checkbox
    const selectAllContainer = checkboxContainer.append("div")
        .style("grid-column", "1 / -1")
        .style("margin-bottom", "5px")
        .style("padding-bottom", "5px")
        .style("border-bottom", "1px solid #eee");
    
    const selectAllCheckbox = selectAllContainer.append("input")
        .attr("type", "checkbox")
        .attr("id", "select-all")
        .attr("checked", true);
    
    selectAllContainer.append("label")
        .attr("for", "select-all")
        .text("Select All")
        .style("margin-left", "5px")
        .style("font-weight", "bold");
    
    // Create individual checkboxes
    const checkboxes = {};
    drugClasses.forEach(className => {
        const checkboxDiv = checkboxContainer.append("div");
        
        const checkbox = checkboxDiv.append("input")
            .attr("type", "checkbox")
            .attr("id", `checkbox-${className.replace(/\s+/g, '-')}`)
            .attr("checked", true);
        
        checkboxDiv.append("label")
            .attr("for", `checkbox-${className.replace(/\s+/g, '-')}`)
            .text(className)
            .style("margin-left", "5px");
        
        checkboxes[className] = checkbox;
    });

    // Handle "Select All" checkbox
    selectAllCheckbox.on("change", function() {
        const isChecked = this.checked;
        Object.values(checkboxes).forEach(checkbox => {
            checkbox.property("checked", isChecked);
        });
        updatePlots();
    });

    // Handle individual checkboxes
    Object.entries(checkboxes).forEach(([className, checkbox]) => {
        checkbox.on("change", function() {
            // Check if all checkboxes are checked
            const allChecked = Object.values(checkboxes).every(cb => cb.property("checked"));
            selectAllCheckbox.property("checked", allChecked);
            updatePlots();
        });
    });

    const svgDiv = d3.select('#timeSeriesView')
                     .append('div')
                     .style('display', 'flex')
                     .style('gap', '10px');

    const pricePerPerscriptionSvg = svgDiv.append('svg')
        .attr('id', 'timeSeriesPricePerPerscription')
        .attr('width', 600)
        .attr('height', 450);
    
    const percentGenericSvg = svgDiv.append('svg')
      .attr('id', 'timeSeriesPercentGeneric')
      .attr('width', 600)
      .attr('height', 450);

    const legendSvg = svgDiv.append('svg')
      .attr('id', 'legend')
      .attr('width', 200)
      .attr('height', 600);
    
    // Add tooltip div
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .attr("id", "tooltip-timeseries")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background-color", "white")
        .style("padding", "5px")
        .style("border", "1px solid #ddd")
        .style("border-radius", "5px")
        .style("pointer-events", "none");

    // update legend for plots
    function updateLegend() {
        console.log("updating legend");
        // Get selected therapeutic classes
        const selectedClasses = Object.entries(checkboxes)
            .filter(([_, checkbox]) => checkbox.property("checked"))
            .map(([className, _]) => className);
        console.log(selectedClasses);

        // Remove existing legend
        d3.select('#timeSeriesView').selectAll(".legend").remove();
        
        // Create new legend
        const legend = legendSvg.append("g")
            .attr("class", "legend")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("text-anchor", "start")
            .selectAll("g")
            .data(selectedClasses)
            .enter()
            .append("g")
            .attr("transform", (d, i) => `translate(${0},${i * 20})`);

        legend.append("rect")
            .attr("x", 0)
            .attr("width", 19)
            .attr("height", 19)
            .attr("fill", d =>
                legendColors[d]
            );

        legend.append("text")
            .attr("x", 24)
            .attr("y", 9.5)
            .attr("dy", "0.32em")
            .text(d => d);
        
        console.log("updated legend");
    }
    
    // update plot function
    function updatePlotPricePerPrescription() {

        // Get selected therapeutic classes
        const selectedClasses = Object.entries(checkboxes)
            .filter(([_, checkbox]) => checkbox.property("checked"))
            .map(([className, _]) => className);
        console.log(selectedClasses);
        // clear svg
        document.getElementById('timeSeriesPricePerPerscription').innerHTML = '';

        // add plot to svg

        // set title
        // document.getElementById('titlePricePerPerscription').innerHTML = currentClass;

        // select svg
        const svg = d3.select("#timeSeriesPricePerPerscription");

        let currentClassData = data.filter(d => selectedClasses.includes(d["Therapeutic Class"]));
        console.log(currentClassData);
        
        
        // Set dimensions
        const width = svg.attr("width"), height = svg.attr("height"), margin = { top: 20, right: 30, bottom: 50, left: 50 };
        
        // Create scales
        const x = d3.scalePoint()
                    .domain(currentClassData.map(d => d.Year))
                    .range([margin.left, width - margin.right])
        
        const xAxis = d3.axisBottom(x);

        const y = d3.scaleLinear()
            .domain([0, d3.max(currentClassData, d => d["Average Out Of Pocket Per Prescription"])])
            .nice()
            .range([height - margin.bottom, margin.top]);
        
        const yAxis = d3.axisLeft(y)
        // Select the SVG element

        // Add X and Y axes
        svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(xAxis);
    
        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(yAxis);
    
        // Create the line generator
        const line = d3.line()
            .x(d => x(d.Year))
            .y(d => y(d["Average Out Of Pocket Per Prescription"]));
        
        const plotLines = svg.append("g")
                             .attr("class", "plotLines")
                             .style("stroke-opacity", 1)
        
        // make line plot for each class
        selectedClasses.forEach((therapeuticClass, idx) => {
            // create g element to contain line and invisible selector line
            let lineGroup = plotLines.append("g")
                               .attr("class", "lineGroup");
            
            // get current class data
            let therapeuticClassData = currentClassData.filter(d => d['Therapeutic Class'] == therapeuticClass)
            console.log(therapeuticClassData);
            console.log(`therapeutic class data ${therapeuticClassData}`)
            
            // Append the line path
            let linePath = lineGroup.append("path")
                .datum(therapeuticClassData)
                .attr("fill", "none")
                .attr("stroke", legendColors[therapeuticClass])
                .attr("stroke-width", 2)
                .attr("d", line)
            
            // append invisible line to make selecting easier
            let invisibleLine = lineGroup.append("path")
                .datum(therapeuticClassData)
                .attr("fill", "none")
                .attr("stroke", "transparent")
                .attr("stroke-width", 15)
                .attr("d", line)
                
            // add invisible dots, made visible upon mouseover of invisible line
            let lineDots = lineGroup.selectAll("circle")
                     .data(therapeuticClassData)
                     .enter()
                     .append("circle")
                     .attr('cx', d => x(d.Year))
                     .attr('cy', d => y(d["Average Out Of Pocket Per Prescription"]))
                     .attr('r', 8)
                     .attr("fill", "none")
                     .on("mousemove", (event, d) => {
                        let tooltipContent = `<strong> Class: </strong> ${therapeuticClass} <br> <strong> Year: </strong> ${d.Year} <br> <strong> Average out of Pocket: </strong> $${d["Average Out Of Pocket Per Prescription"].toFixed(2)}<br/>`;
                        
                        // create callback to make tooltip track mouse position
                        tooltip.html(tooltipContent)
                            .style("left", (event.pageX + 10) + "px")
                            .style("top", (event.pageY - 28) + "px");
                     })
                     .on("mouseout", (event, d) => {
                        let tooltipContent = `<strong>Class: </strong> ${therapeuticClass}<br/>`;
                        
                        // create callback to make tooltip track mouse position
                        tooltip.html(tooltipContent)
                            .style("left", (event.pageX + 10) + "px")
                            .style("top", (event.pageY - 28) + "px");
                     })
            
            lineGroup
                    .on("mouseover", function(event, d) {
                        
                        // set all lines other than selected to low opacity
                        plotLines.transition()
                                .duration(50)
                                .style("stroke-opacity", 0.2);
                        
                        // set moused over line to high opacity, high stroke width
                        linePath.transition()
                                .duration(50)
                                .attr("stroke-width", 4)
                                .transition()
                                .duration(0)
                                .style("stroke-opacity", 1)

                        // set dots to be visible on selected line
                        lineDots.transition()
                                .duration(50)
                                .attr("fill", legendColors[therapeuticClass])

                        // Show tooltip
                        tooltip.transition()
                            .duration(200)
                            .style("opacity", .9);
                        
                        // Create tooltip content based on available data
                        let tooltipContent = `<strong>Class: </strong> ${therapeuticClass}<br/>`;
                        
                        // create callback to make tooltip track mouse position
                        
                        tooltip.html(tooltipContent)
                            .style("left", (event.pageX + 10) + "px")
                            .style("top", (event.pageY - 28) + "px");
                    })
                    .on("mousemove", (event, d) => {
                        // console.log(event.target, d);
                        // let tooltipContent = `Therapeutic Class: ${therapeuticClass}<br/>`;
                        tooltip.style("left", (event.pageX + 10) + "px")
                               .style("top", (event.pageY - 28) + "px");
                    }) 
                    .on("mouseout", function() {
                        // change all lines to full opacity
                        plotLines.transition()
                                .duration(50)
                                .style("stroke-opacity", 1);

                        // remove stroke opacity style from the previously moused line 
                        linePath.transition()
                                .duration(50)
                                .style('stroke-opacity', null)
                                .attr("stroke-width", 2);

                        // make dots of previously moused line invisible
                        lineDots.transition()
                                .duration(50)
                                .attr("fill", "none")

                        // make tooltip invisible
                        tooltip.transition()
                            .duration(200)
                            .style("opacity", 0);
                    });
        });
        
        // X-axis label
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", height - 10)
            .text("Year");

        // Y-axis label
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("transform", `rotate(-90)`)
            .attr("x", -height / 2)
            .attr("y", 15)
            .text("Average Out-of-Pocket per Prescription");
    }
    
    function updatePlotPercentGeneric() {
        // Get selected therapeutic classes
        const selectedClasses = Object.entries(checkboxes)
            .filter(([_, checkbox]) => checkbox.property("checked"))
            .map(([className, _]) => className);
        console.log(selectedClasses);

        // clear svg
        document.getElementById('timeSeriesPercentGeneric').innerHTML = '';

        // add plot to svg

        // set title
        // document.getElementById('titlePercentGeneric').innerHTML = currentClass;

        // select svg
        const svg = d3.select("#timeSeriesPercentGeneric");

        let currentClassData = data.filter(d => selectedClasses.includes(d["Therapeutic Class"]));
        console.log(currentClassData);
        
        // Set dimensions
        const width = svg.attr("width"), height = svg.attr("height"), margin = { top: 20, right: 30, bottom: 50, left: 50 };
        
        // Create scales
        const x = d3.scalePoint()
                    .domain(currentClassData.map(d => d.Year))
                    .range([margin.left, width - margin.right])
        
        const xAxis = d3.axisBottom(x);

        const y = d3.scaleLinear()
            .domain([0, d3.max(currentClassData, d => d["Percent Generic"])])
            .nice()
            .range([height - margin.bottom, margin.top]);
    
        // Select the SVG element

        // Add X and Y axes
        svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(xAxis);
    
        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y));
    
        // Create the line generator
        const line = d3.line()
            .x(d => x(d.Year))
            .y(d => y(d["Percent Generic"]));
        
        const plotLines = svg.append("g")
            .attr("class", "plotLines")
            .style("stroke-opacity", 1)
        // make line plot for each class
        selectedClasses.forEach((therapeuticClass, idx) => {
            // create g element to contain line and invisible selector line
            let lineGroup = plotLines.append("g")
                               .attr("class", "lineGroup");
            
            // get current class data
            let therapeuticClassData = currentClassData.filter(d => d['Therapeutic Class'] == therapeuticClass)
            
            // Append the line path
            let linePath = lineGroup.append("path")
                .datum(therapeuticClassData)
                .attr("fill", "none")
                .attr("stroke", legendColors[therapeuticClass])
                .attr("stroke-width", 2)
                .attr("d", line)
                
            
            // append invisible line to make selecting easier
            lineGroup.append("path")
                    .datum(therapeuticClassData)
                    .attr("fill", "none")
                    .attr("stroke", "transparent")
                    .attr("stroke-width", 10)
                    .attr("d", line)
            
            // add invisible dots, made visible upon mouseover of invisible line
            let lineDots = lineGroup.selectAll("circle")
                     .data(therapeuticClassData)
                     .enter()
                     .append("circle")
                     .attr('cx', d => x(d.Year))
                     .attr('cy', d => y(d["Percent Generic"]))
                     .attr('r', 8)
                     .attr("fill", "none")
                     .on("mousemove", (event, d) => {
                        let tooltipContent = `<strong> Class: </strong> ${therapeuticClass} <br> <strong> Year: </strong> ${d.Year} <br> <strong> Percent Generic: </strong> ${(d["Percent Generic"] * 100).toFixed(2)}% <br/>`;
                        
                        // create callback to make tooltip track mouse position
                        tooltip.html(tooltipContent)
                            .style("left", (event.pageX + 10) + "px")
                            .style("top", (event.pageY - 28) + "px");
                     })
                     .on("mouseout", (event, d) => {
                        let tooltipContent = `<strong>Class: </strong> ${therapeuticClass}<br/>`;
                        
                        // create callback to make tooltip track mouse position
                        tooltip.html(tooltipContent)
                            .style("left", (event.pageX + 10) + "px")
                            .style("top", (event.pageY - 28) + "px");
                     })
            
            lineGroup
                    .on("mouseover", function(event, d) {
                        // set all lines other than selected to low opacity
                        plotLines.transition()
                                .duration(50)
                                .style("stroke-opacity", 0.2);
                        
                        // set moused over line to high opacity, high stroke width
                        linePath.transition()
                                .duration(50)
                                .attr("stroke-width", 4)
                                .transition()
                                .duration(0)
                                .style("stroke-opacity", 1)

                        // set dots to be visible on selected line
                        lineDots.transition()
                                .duration(50)
                                .attr("fill", legendColors[therapeuticClass])

                        // Show tooltip
                        tooltip.transition()
                            .duration(200)
                            .style("opacity", .9);
                        
                        // Create tooltip content based on available data
                        let tooltipContent = `<strong>Class: </strong> ${therapeuticClass}<br/>`;
                        
                        // create callback to make tooltip track mouse position
                        
                        tooltip.html(tooltipContent)
                            .style("left", (event.pageX + 10) + "px")
                            .style("top", (event.pageY - 28) + "px");
                    })
                    .on("mouseout", function() {
                        // change all lines to full opacity
                        plotLines.transition()
                                .duration(50)
                                .style("stroke-opacity", 1);

                        // remove stroke opacity style from the previously moused line 
                        linePath.transition()
                                .duration(50)
                                .style('stroke-opacity', null)
                                .attr("stroke-width", 2);

                        // make dots of previously moused line invisible
                        lineDots.transition()
                                .duration(50)
                                .attr("fill", "none")

                        // make tooltip invisible
                        tooltip.transition()
                            .duration(200)
                            .style("opacity", 0);
                    });
        });
        
        // X-axis label
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", height - 10)
            .text("Year");

        // Y-axis label
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("transform", `rotate(-90)`)
            .attr("x", -height / 2)
            .attr("y", 15)
            .text("Percent of Prescriptions which are generic");

        // add line plot to svg
    }

    updatePlots = () => {
        updateLegend();
        updatePlotPercentGeneric(); 
        updatePlotPricePerPrescription();
    }

    updatePlots();
});