document.addEventListener('DOMContentLoaded', () => {

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Define your achievement data with a similar structure to the D3 force graph
    // 'nodes' are your achievements, 'links' represent the branches.
    const data = {
        nodes: [
            { id: 'Begin the Journey', text1: 'Achievement Get!', text2: 'Begin the Journey', icon: 13 },
            { id: 'Go to Class', text1: 'First Day of School', text2: 'Go to Class', icon: 41 },
            { id: 'Make a Friend', text1: 'Social Butterfly', text2: 'Make a Friend', icon: 20 },
            { id: 'Pull an All-Nighter', text1: 'Master of Procrastination', text2: 'Pull an All-Nighter', icon: 38 },
            { id: 'Cook a Meal', text1: 'Chef in Training', text2: 'Cook a Meal', icon: 16 },
            { id: 'Cook 10 Meals', text1: 'Culinary Master', text2: 'Cook 10 Unique Meals', icon: 23 },
            { id: 'Start a Workout', text1: 'Fitness Fanatic', text2: 'Start a Workout Routine', icon: 34 }
        ],
        links: [
            { source: 'Begin the Journey', target: 'Go to Class' },
            { source: 'Go to Class', target: 'Make a Friend' },
            { source: 'Make a Friend', target: 'Pull an All-Nighter' },
            { source: 'Begin the Journey', target: 'Cook a Meal' },
            { source: 'Cook a Meal', target: 'Cook 10 Meals' },
            { source: 'Begin the Journey', target: 'Start a Workout' }
        ]
    };

    // Create the SVG container
    const svg = d3.select("#graph-container")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Create a group 'g' to hold all graph elements, which we will transform for zoom/pan
    const g = svg.append("g");

    // D3 force simulation
    const simulation = d3.forceSimulation(data.nodes)
        .force("link", d3.forceLink(data.links).id(d => d.id).distance(150)) // link distance
        .force("charge", d3.forceManyBody().strength(-300)) // repel nodes from each other
        .force("center", d3.forceCenter(width / 2, height / 2)) // center the graph
        .on("tick", ticked);

    // Create the links
    const link = g.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(data.links)
        .enter().append("line")
        .attr("class", "link");

    // Create the nodes
    const node = g.append("g")
        .attr("class", "nodes")
        .selectAll(".node-group")
        .data(data.nodes)
        .enter().append("g")
        .attr("class", "node-group")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    // Append a circle to each node group
    const nodeCircle = node.append("circle")
        .attr("r", 30) // Radius of the circle
        .attr("fill", "#555")
        .attr("stroke", "#888")
        .attr("stroke-width", 2)
        .attr("class", "node-circle");

    // Tooltip for hover
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip");
    
    node.on("mouseover", function(event, d) {
        // Show tooltip on hover
        tooltip.style("opacity", 1)
            .html(`<strong>${d.text1}</strong><br>${d.text2}`)
            .style("left", (event.pageX + 15) + "px")
            .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function() {
        // Hide tooltip on mouseout
        tooltip.style("opacity", 0);
    });

    // Handle the movement of the nodes and links
    function ticked() {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("transform", d => `translate(${d.x},${d.y})`);
    }

    // Drag functions
    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    // Zoom and Pan functionality
    const zoom = d3.zoom()
        .scaleExtent([0.1, 4]) // Zoom out to 10%, zoom in to 400%
        .on("zoom", (event) => {
            g.attr("transform", event.transform);
        });

    svg.call(zoom);

    // Initial position to center the view and set initial zoom
    svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(1));
});
