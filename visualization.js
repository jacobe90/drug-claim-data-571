// Set the dimensions and margins of the graph
const margin = {top: 40, right: 200, bottom: 60, left: 80};

// Get the window dimensions
const windowWidth = window.innerWidth;
const windowHeight = window.innerHeight;

// Calculate the width and height based on window size
const width = windowWidth - margin.left - margin.right;
const height = windowHeight - margin.top - margin.bottom - 100; // Subtract 100px for controls

// Add CSS to make the visualization container responsive
d3.select("#visualization")
    .style("width", "100%")
    .style("height", "100vh")
    .style("overflow", "hidden");

// Create SVG container
const svg = d3.select("#visualization")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("max-width", "100%")
    .style("height", "auto")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Add tooltip div
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background-color", "white")
    .style("padding", "5px")
    .style("border", "1px solid #ddd")
    .style("border-radius", "5px")
    .style("pointer-events", "none");

// Create a container for the filter controls
const filterContainer = d3.select("#visualization")
    .insert("div", "svg")
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

// Add a label for the year filter
filterContainer.append("label")
    .text("Year:")
    .style("margin-right", "5px")
    .style("font-weight", "bold")
    .style("font-size", "12px");

// Create a dropdown container for year filter
const yearDropdownContainer = filterContainer.append("div")
    .attr("class", "dropdown-container")
    .style("position", "relative")
    .style("display", "inline-block");

// Create a button to toggle the year dropdown
const yearDropdownButton = yearDropdownContainer.append("button")
    .text("Select")
    .style("padding", "4px 8px")
    .style("background-color", "#f8f9fa")
    .style("border", "1px solid #ddd")
    .style("border-radius", "4px")
    .style("cursor", "pointer")
    .style("font-size", "12px");

// Create the year dropdown content
const yearDropdownContent = yearDropdownContainer.append("div")
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

// Add a label for the generic vs brand filter
filterContainer.append("label")
    .text("Generic/Brand:")
    .style("margin-right", "5px")
    .style("font-weight", "bold")
    .style("font-size", "12px");

// Create a dropdown container for generic vs brand filter
const genericVsBrandDropdownContainer = filterContainer.append("div")
    .attr("class", "dropdown-container")
    .style("position", "relative")
    .style("display", "inline-block");

// Create a button to toggle the generic vs brand dropdown
const genericVsBrandDropdownButton = genericVsBrandDropdownContainer.append("button")
    .text("Select")
    .style("padding", "4px 8px")
    .style("background-color", "#f8f9fa")
    .style("border", "1px solid #ddd")
    .style("border-radius", "4px")
    .style("cursor", "pointer")
    .style("font-size", "12px");

// Create the generic vs brand dropdown content
const genericVsBrandDropdownContent = genericVsBrandDropdownContainer.append("div")
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

// Toggle year dropdown visibility
yearDropdownButton.on("click", function() {
    const isVisible = yearDropdownContent.style("display") === "block";
    yearDropdownContent.style("display", isVisible ? "none" : "block");
    therapeuticClassDropdownContent.style("display", "none"); // Close other dropdown
    genericVsBrandDropdownContent.style("display", "none"); // Close other dropdown
});

// Toggle generic vs brand dropdown visibility
genericVsBrandDropdownButton.on("click", function() {
    const isVisible = genericVsBrandDropdownContent.style("display") === "block";
    genericVsBrandDropdownContent.style("display", isVisible ? "none" : "block");
    therapeuticClassDropdownContent.style("display", "none"); // Close other dropdown
    yearDropdownContent.style("display", "none"); // Close other dropdown
});

// Close dropdowns when clicking outside
d3.select("body").on("click", function(event) {
    if (!therapeuticClassDropdownContainer.node().contains(event.target) && 
        !yearDropdownContainer.node().contains(event.target) &&
        !genericVsBrandDropdownContainer.node().contains(event.target)) {
        therapeuticClassDropdownContent.style("display", "none");
        yearDropdownContent.style("display", "none");
        genericVsBrandDropdownContent.style("display", "none");
    }
});

// Add a label for the x-axis metric selection
filterContainer.append("label")
    .text("X-Axis:")
    .style("margin-right", "5px")
    .style("font-weight", "bold")
    .style("font-size", "12px");

// Create a dropdown for x-axis metric selection
const xAxisMetricSelect = filterContainer.append("select")
    .attr("id", "x-axis-metric")
    .style("padding", "4px 8px")
    .style("background-color", "#f8f9fa")
    .style("border", "1px solid #ddd")
    .style("border-radius", "4px")
    .style("cursor", "pointer")
    .style("font-size", "12px");

// Add options to the x-axis metric dropdown
xAxisMetricSelect.append("option")
    .attr("value", "average_cost_per_day_total")
    .text("Cost/Day (Total)");

xAxisMetricSelect.append("option")
    .attr("value", "average_cost_per_day_payer")
    .text("Cost/Day (Insurance)");

xAxisMetricSelect.append("option")
    .attr("value", "average_cost_per_day_oop")
    .text("Cost/Day (OOP)");

// Add a label for the y-axis metric selection
filterContainer.append("label")
    .text("Y-Axis:")
    .style("margin-right", "5px")
    .style("font-weight", "bold")
    .style("font-size", "12px");

// Create a dropdown for y-axis metric selection
const yAxisMetricSelect = filterContainer.append("select")
    .attr("id", "y-axis-metric")
    .style("padding", "4px 8px")
    .style("background-color", "#f8f9fa")
    .style("border", "1px solid #ddd")
    .style("border-radius", "4px")
    .style("cursor", "pointer")
    .style("font-size", "12px");

// Add options to the y-axis metric dropdown
yAxisMetricSelect.append("option")
    .attr("value", "Days Supply")
    .text("Days Supply");

yAxisMetricSelect.append("option")
    .attr("value", "Prescriptions")
    .text("Prescriptions");

// Add a label for the color by selection
filterContainer.append("label")
    .text("Color By:")
    .style("margin-right", "5px")
    .style("font-weight", "bold")
    .style("font-size", "12px");

// Create a dropdown for color by selection
const colorBySelect = filterContainer.append("select")
    .attr("id", "color-by")
    .style("padding", "4px 8px")
    .style("background-color", "#f8f9fa")
    .style("border", "1px solid #ddd")
    .style("border-radius", "4px")
    .style("cursor", "pointer")
    .style("font-size", "12px");

// Add options to the color by dropdown
colorBySelect.append("option")
    .attr("value", "therapeutic_class")
    .text("Therapeutic Class");

colorBySelect.append("option")
    .attr("value", "year")
    .text("Year");

colorBySelect.append("option")
    .attr("value", "generic_vs_brand")
    .text("Generic vs Brand");

// Load the data
d3.csv("edited_df.csv").then(function(data) {
    // Convert string values to numbers
    data.forEach(d => {
        d["Days Supply"] = +d["Days Supply"];
        d["Prescriptions"] = +d["Prescriptions"];
        d["average_cost_per_day_total"] = +d["average_cost_per_day_total"];
        d["average_cost_per_day_payer"] = +d["average_cost_per_day_payer"];
        d["average_cost_per_day_oop"] = +d["average_cost_per_day_oop"];
    });

    // Get unique years from the data
    const years = [2018, 2019, 2020, 2021, 2022];
    
    // Get unique generic vs brand values
    const genericVsBrandValues = [...new Set(data.map(d => d["Generic v Brand"]))].sort();
    
    // Create year checkboxes container
    const yearCheckboxContainer = yearDropdownContent.append("div")
        .style("display", "grid")
        .style("grid-template-columns", "repeat(2, 1fr)")
        .style("gap", "5px");
    
    // Add "Select All" checkbox for years
    const selectAllYearsContainer = yearCheckboxContainer.append("div")
        .style("grid-column", "1 / -1")
        .style("margin-bottom", "5px")
        .style("padding-bottom", "5px")
        .style("border-bottom", "1px solid #eee");
    
    const selectAllYearsCheckbox = selectAllYearsContainer.append("input")
        .attr("type", "checkbox")
        .attr("id", "select-all-years")
        .attr("checked", true);
    
    selectAllYearsContainer.append("label")
        .attr("for", "select-all-years")
        .text("Select All")
        .style("margin-left", "5px")
        .style("font-weight", "bold");
    
    // Create year checkboxes
    const yearCheckboxes = {};
    years.forEach(year => {
        const checkboxDiv = yearCheckboxContainer.append("div");
        
        const checkbox = checkboxDiv.append("input")
            .attr("type", "checkbox")
            .attr("id", `checkbox-year-${year}`)
            .attr("checked", true);
        
        checkboxDiv.append("label")
            .attr("for", `checkbox-year-${year}`)
            .text(year)
            .style("margin-left", "5px");
        
        yearCheckboxes[year] = checkbox;
    });
    
    // Handle "Select All" checkbox for years
    selectAllYearsCheckbox.on("change", function() {
        const isChecked = this.checked;
        Object.values(yearCheckboxes).forEach(checkbox => {
            checkbox.property("checked", isChecked);
        });
        updateVisualization();
    });
    
    // Handle individual year checkboxes
    Object.entries(yearCheckboxes).forEach(([year, checkbox]) => {
        checkbox.on("change", function() {
            // Check if all checkboxes are checked
            const allChecked = Object.values(yearCheckboxes).every(cb => cb.property("checked"));
            selectAllYearsCheckbox.property("checked", allChecked);
            updateVisualization();
        });
    });

    // Get unique therapeutic classes
    const therapeuticClasses = [...new Set(data.map(d => d["Therapeutic Class"]))].sort();
    
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
    therapeuticClasses.forEach(className => {
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
        updateVisualization();
    });
    
    // Handle individual checkboxes
    Object.entries(checkboxes).forEach(([className, checkbox]) => {
        checkbox.on("change", function() {
            // Check if all checkboxes are checked
            const allChecked = Object.values(checkboxes).every(cb => cb.property("checked"));
            selectAllCheckbox.property("checked", allChecked);
            updateVisualization();
        });
    });
    
    // Create checkboxes for generic vs brand
    const genericVsBrandCheckboxContainer = genericVsBrandDropdownContent.append("div")
        .style("display", "grid")
        .style("grid-template-columns", "repeat(2, 1fr)")
        .style("gap", "5px");
    
    // Add "Select All" checkbox for generic vs brand
    const selectAllGenericVsBrandContainer = genericVsBrandCheckboxContainer.append("div")
        .style("grid-column", "1 / -1")
        .style("margin-bottom", "5px")
        .style("padding-bottom", "5px")
        .style("border-bottom", "1px solid #eee");
    
    const selectAllGenericVsBrandCheckbox = selectAllGenericVsBrandContainer.append("input")
        .attr("type", "checkbox")
        .attr("id", "select-all-generic-vs-brand")
        .attr("checked", true);
    
    selectAllGenericVsBrandContainer.append("label")
        .attr("for", "select-all-generic-vs-brand")
        .text("Select All")
        .style("margin-left", "5px")
        .style("font-weight", "bold");
    
    // Create generic vs brand checkboxes
    const genericVsBrandCheckboxes = {};
    genericVsBrandValues.forEach(value => {
        const checkboxDiv = genericVsBrandCheckboxContainer.append("div");
        
        const checkbox = checkboxDiv.append("input")
            .attr("type", "checkbox")
            .attr("id", `checkbox-generic-vs-brand-${value.replace(/\s+/g, '-')}`)
            .attr("checked", true);
        
        checkboxDiv.append("label")
            .attr("for", `checkbox-generic-vs-brand-${value.replace(/\s+/g, '-')}`)
            .text(value)
            .style("margin-left", "5px");
        
        genericVsBrandCheckboxes[value] = checkbox;
    });
    
    // Handle "Select All" checkbox for generic vs brand
    selectAllGenericVsBrandCheckbox.on("change", function() {
        const isChecked = this.checked;
        Object.values(genericVsBrandCheckboxes).forEach(checkbox => {
            checkbox.property("checked", isChecked);
        });
        updateVisualization();
    });
    
    // Handle individual generic vs brand checkboxes
    Object.entries(genericVsBrandCheckboxes).forEach(([value, checkbox]) => {
        checkbox.on("change", function() {
            // Check if all checkboxes are checked
            const allChecked = Object.values(genericVsBrandCheckboxes).every(cb => cb.property("checked"));
            selectAllGenericVsBrandCheckbox.property("checked", allChecked);
            updateVisualization();
        });
    });
    
    // Handle x-axis metric selection
    xAxisMetricSelect.on("change", function() {
        updateVisualization();
    });
    
    // Handle y-axis metric selection
    yAxisMetricSelect.on("change", function() {
        updateVisualization();
    });

    // Handle color by selection
    colorBySelect.on("change", function() {
        updateVisualization();
    });

    // Create color scale based on Therapeutic Class
    const therapeuticClassColorScale = d3.scaleOrdinal()
        .domain(therapeuticClasses)
        .range(d3.schemeCategory10);
    
    // Create color scale based on Year
    const yearColorScale = d3.scaleOrdinal()
        .domain(years)
        .range(d3.schemeCategory10);

    // Create color scale based on Generic vs Brand
    const genericVsBrandColorScale = d3.scaleOrdinal()
        .domain(genericVsBrandValues)
        .range(d3.schemeCategory10);

    // Create axes groups
    const xAxisGroup = svg.append("g")
        .attr("transform", `translate(0,${height})`);
    
    const yAxisGroup = svg.append("g");
    
    // Create axis labels
    xAxisGroup.append("text")
        .attr("class", "axis-label")
        .attr("x", width / 2)
        .attr("y", 40)
        .attr("fill", "black")
        .text("Average Cost per Day (Total)");
    
    yAxisGroup.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", -60)
        .attr("x", -height / 2)
        .attr("fill", "black")
        .text("Days Supply");
    
    // Create a group for the dots
    const dotsGroup = svg.append("g");
    
    // Function to update the visualization based on selected filters
    function updateVisualization() {
        // Get selected therapeutic classes
        const selectedClasses = Object.entries(checkboxes)
            .filter(([_, checkbox]) => checkbox.property("checked"))
            .map(([className, _]) => className);
        
        // Get selected years
        const selectedYears = Object.entries(yearCheckboxes)
            .filter(([_, checkbox]) => checkbox.property("checked"))
            .map(([year, _]) => parseInt(year));
        
        // Get selected generic vs brand values
        const selectedGenericVsBrand = Object.entries(genericVsBrandCheckboxes)
            .filter(([_, checkbox]) => checkbox.property("checked"))
            .map(([value, _]) => value);
        
        // Get selected x-axis metric
        const xAxisMetric = xAxisMetricSelect.property("value");
        
        // Get selected y-axis metric
        const yAxisMetric = yAxisMetricSelect.property("value");
        
        // Get selected color by option
        const colorBy = colorBySelect.property("value");
        
        // Check if the selected y-axis metric exists in the data
        if (yAxisMetric === "Prescriptions" && !data.some(d => d.hasOwnProperty("Prescriptions"))) {
            // If "Prescriptions" is selected but doesn't exist in the data, show a message and revert to "Days Supply"
            alert("The 'Prescriptions' column does not exist in the data. Reverting to 'Days Supply'.");
            yAxisMetricSelect.property("value", "Days Supply");
            return; // Exit the function to prevent errors
        }
        
        // Update x-axis label based on selected metric
        xAxisGroup.select(".axis-label")
            .text(getXAxisLabel(xAxisMetric));
        
        // Update y-axis label based on selected metric
        yAxisGroup.select(".axis-label")
            .text(getYAxisLabel(yAxisMetric));
        
        // Filter data based on selected classes and years
        let filteredData = data.filter(d => selectedClasses.includes(d["Therapeutic Class"]));
        
        // Apply year filter
        filteredData = filteredData.filter(d => selectedYears.includes(Math.floor(d["Year"])));
        
        // Apply generic vs brand filter
        filteredData = filteredData.filter(d => selectedGenericVsBrand.includes(d["Generic v Brand"]));
        
        // Update color scale domain based on selected option
        if (colorBy === "therapeutic_class") {
            therapeuticClassColorScale.domain(selectedClasses);
        } else if (colorBy === "year") {
            yearColorScale.domain(selectedYears);
        } else if (colorBy === "generic_vs_brand") {
            genericVsBrandColorScale.domain(selectedGenericVsBrand);
        }
        
        // Update scales based on filtered data
        const xScale = d3.scaleLog()
            .domain([0.001, d3.max(filteredData, d => d[xAxisMetric] || 0.001)])
            .range([0, width]);
        
        // Log the y-axis metric and its values for debugging
        console.log(`Y-axis metric: ${yAxisMetric}`);
        console.log(`Y-axis values:`, filteredData.map(d => d[yAxisMetric]));
        
        // Find the maximum value for the y-axis
        const maxYValue = d3.max(filteredData, d => Math.max(10, d[yAxisMetric] || 10));
        
        // Find the next power of 10 that's greater than or equal to the maximum value
        const nextPowerOf10 = Math.pow(10, Math.ceil(Math.log10(maxYValue)));
        
        // Generate tick values (powers of 10)
        const tickValues = [];
        for (let i = 1; i <= Math.ceil(Math.log10(nextPowerOf10)); i++) {
            tickValues.push(Math.pow(10, i));
        }
        
        // Create y-axis scale with minimum value of 10 and appropriate maximum
        const yScale = d3.scaleLog()
            .domain([10, nextPowerOf10])
            .range([height, 0]);
        
        // Log the y-axis scale domain for debugging
        console.log(`Y-axis scale domain:`, yScale.domain());
        console.log(`Y-axis tick values:`, tickValues);
        
        // Update X axis
        xAxisGroup.call(d3.axisBottom(xScale));
        
        // Update Y axis with consistent tick values (powers of 10)
        yAxisGroup.call(d3.axisLeft(yScale)
            .tickValues(tickValues)
            .tickFormat(d => {
                // Format based on the selected y-axis metric
                if (yAxisMetric === "Prescriptions") {
                    return d3.format(",.0f")(d); // Format as integer for prescriptions
                } else {
                    return d3.format(",.1f")(d); // Format with one decimal place for days supply
                }
            }));
        
        // Update dots
        const dots = dotsGroup.selectAll("circle")
            .data(filteredData, d => d["Drug Name"]); // Use Drug Name as key
        
        // Remove dots that are no longer in the filtered data
        dots.exit().remove();
        
        // Add new dots
        const dotsEnter = dots.enter()
            .append("circle")
            .attr("r", 5)
            .style("fill", d => {
                if (colorBy === "therapeutic_class") {
                    return therapeuticClassColorScale(d["Therapeutic Class"]);
                } else if (colorBy === "year") {
                    return yearColorScale(Math.floor(d["Year"]));
                } else if (colorBy === "generic_vs_brand") {
                    return genericVsBrandColorScale(d["Generic v Brand"]);
                }
            })
            .style("opacity", 0.7)
            .on("mouseover", function(event, d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("r", 8)
                    .style("opacity", 1);
                
                // Show tooltip
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                
                // Create tooltip content based on available data
                let tooltipContent = `Drug: ${d["Drug Name"]}<br/>
                                     Therapeutic Class: ${d["Therapeutic Class"]}<br/>
                                     Year: ${d["Year"]}<br/>
                                     Days Supply: ${d["Days Supply"]}<br/>
                                     Prescriptions: ${d["Prescriptions"]}<br/>
                                     Total Cost per Day: $${d["average_cost_per_day_total"].toFixed(2)}<br/>
                                     Insurance Cost per Day: $${d["average_cost_per_day_payer"].toFixed(2)}<br/>
                                     Out of Pocket Cost per Day: $${d["average_cost_per_day_oop"].toFixed(2)}`;
                
                // Highlight the selected y-axis metric in the tooltip
                tooltipContent = tooltipContent.replace(
                    `${yAxisMetric}: ${d[yAxisMetric]}`,
                    `<strong>${yAxisMetric}: ${d[yAxisMetric]}</strong>`
                );
                
                tooltip.html(tooltipContent)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("r", 5)
                    .style("opacity", 0.7);
                
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
        
        // Update all dots (existing and new)
        dots.merge(dotsEnter)
            .attr("cx", d => {
                // Handle zero values for x-axis
                const value = d[xAxisMetric];
                // Ensure value is a number and handle zero values
                const processedValue = (value === 0 || value === null || value === undefined || isNaN(value)) ? 0.001 : value;
                // Calculate position and ensure it's within bounds
                const position = xScale(processedValue);
                // Ensure position is not negative
                return Math.max(0, position);
            })
            .attr("cy", d => {
                // Ensure value is at least 10
                const value = Math.max(10, d[yAxisMetric] || 10);
                // Calculate position and ensure it's within bounds
                const position = yScale(value);
                // Ensure position is not negative and not greater than height
                return Math.max(0, Math.min(height, position));
            })
            .style("fill", d => {
                if (colorBy === "therapeutic_class") {
                    return therapeuticClassColorScale(d["Therapeutic Class"]);
                } else if (colorBy === "year") {
                    return yearColorScale(Math.floor(d["Year"]));
                } else if (colorBy === "generic_vs_brand") {
                    return genericVsBrandColorScale(d["Generic v Brand"]);
                }
            });
        
        // Update legend
        let legendItems;
        if (colorBy === "therapeutic_class") {
            legendItems = selectedClasses;
        } else if (colorBy === "year") {
            legendItems = selectedYears;
        } else if (colorBy === "generic_vs_brand") {
            legendItems = selectedGenericVsBrand;
        }
        updateLegend(legendItems, colorBy);
    }
    
    // Function to get the x-axis label based on the selected metric
    function getXAxisLabel(metric) {
        switch(metric) {
            case "average_cost_per_day_total":
                return "Average Cost per Day (Total)";
            case "average_cost_per_day_payer":
                return "Average Cost per Day (Insurance)";
            case "average_cost_per_day_oop":
                return "Average Cost per Day (Out of Pocket)";
            default:
                return "Average Cost per Day (Total)";
        }
    }
    
    // Function to get the y-axis label based on the selected metric
    function getYAxisLabel(metric) {
        switch(metric) {
            case "Days Supply":
                return "Days Supply";
            case "Prescriptions":
                return "Prescriptions";
            default:
                return "Days Supply";
        }
    }
    
    // Function to update the legend based on selected filters
    function updateLegend(selectedItems, colorBy) {
        // Remove existing legend
        svg.selectAll(".legend").remove();
        
        // Create new legend
        const legend = svg.append("g")
            .attr("class", "legend")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("text-anchor", "start")
            .selectAll("g")
            .data(selectedItems)
            .enter().append("g")
            .attr("transform", (d, i) => `translate(${width + 10},${i * 20})`);

        legend.append("rect")
            .attr("x", 0)
            .attr("width", 19)
            .attr("height", 19)
            .attr("fill", d => {
                if (colorBy === "therapeutic_class") {
                    return therapeuticClassColorScale(d);
                } else if (colorBy === "year") {
                    return yearColorScale(d);
                } else if (colorBy === "generic_vs_brand") {
                    return genericVsBrandColorScale(d);
                }
            });

        legend.append("text")
            .attr("x", 24)
            .attr("y", 9.5)
            .attr("dy", "0.32em")
            .text(d => d);
    }
    
    // Initial visualization
    updateVisualization();
    
    // Add window resize event handler
    window.addEventListener('resize', function() {
        // Get the new window dimensions
        const newWindowWidth = window.innerWidth;
        const newWindowHeight = window.innerHeight;
        
        // Calculate the new width and height
        const newWidth = newWindowWidth - margin.left - margin.right;
        const newHeight = newWindowHeight - margin.top - margin.bottom - 100;
        
        // Update the SVG dimensions
        svg.attr("width", newWidth + margin.left + margin.right)
           .attr("height", newHeight + margin.top + margin.bottom);
        
        // Update the visualization
        updateVisualization();
    });
});

/*
Acknowledgements:
- D3.js documentation
- Claude AI
- Cursor AI
- Stack Overflow
- W3Schools
*/ //TODO: Add whatever other resources you used