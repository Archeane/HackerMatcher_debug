function DisplayVisualization(){
	var MatchesJSON = [];
	for(i = 0; i < Matches.length; i++){
		MatchesJSON.push(JSON.parse(Matches[i]));
	}
	//console.log(MatchesJSON);
	
//-------------filters-----------------------
	var allMajors = [];
	var allGradYears = [];
	var allEduLevels = [];
	var allNumOfHacks = [];
	
	//add all the fields to filters array
	for(i = 0; i < MatchesJSON.length; i++){
		var user = MatchesJSON[i];
		if(!(allMajors.includes(user.major))){
			allMajors.push(user.major);
		}
		if(!(allGradYears.includes(Math.floor(user.graduationYear)))){
			allGradYears.push(Math.floor(user.graduationYear));
		}
		if(!(allEduLevels.includes(user.educationLevel))){
			allEduLevels.push(user.educationLevel);
		}
		if(!(allNumOfHacks.includes(user.numOfHackathons))){
			allNumOfHacks.push(user.numOfHackathons);
		}
	}

	//-----append options to filters----------
	var gradFilter = document.querySelector("#graduationYear > .dropdown-menu");
	for(g = 0; g < allGradYears.length; g++){
		var div = document.createElement('div');
		div.class="dropdown-item";
		var checkBox = document.createElement('input');
		checkBox.type="checkbox";
		checkBox.name=allGradYears[g];
		checkBox.value = allGradYears[g];
		checkBox.id = allGradYears[g];

		var label = document.createElement('span');
		label.htmlFor = allGradYears[g];
		label.appendChild(document.createTextNode(allGradYears[g]));
		div.appendChild(checkBox);
		div.appendChild(label);
		gradFilter.appendChild(div);
	}
	var eduFilter = document.querySelector("#educationLevel > .dropdown-menu");
	for(m = 0; m < allEduLevels.length; m++){
		var div = document.createElement('div');
		div.class="dropdown-item";
		var checkBox = document.createElement('input');
		checkBox.type="checkbox";
		checkBox.name=allEduLevels[m];
		checkBox.value = allEduLevels[m];
		checkBox.id = allEduLevels[m];

		var label = document.createElement('span');
		label.htmlFor = allEduLevels[m];
		label.appendChild(document.createTextNode(allEduLevels[m]));
		div.appendChild(checkBox);
		div.appendChild(label);
		eduFilter.appendChild(div);
	}
	var hacksFilter = document.querySelector("#hackathons > .dropdown-menu");
	for(m = 0; m < allNumOfHacks.length; m++){
		var div = document.createElement('div');
		div.class="dropdown-item";
		var checkBox = document.createElement('input');
		checkBox.type="checkbox";
		checkBox.name=allNumOfHacks[m];
		checkBox.value = allNumOfHacks[m];
		checkBox.id = allNumOfHacks[m];

		var label = document.createElement('span');
		label.htmlFor = allNumOfHacks[m];
		label.appendChild(document.createTextNode(allNumOfHacks[m]));
		div.appendChild(checkBox);
		div.appendChild(label);
		hacksFilter.appendChild(div);
	}
	var majorsFilter = document.querySelector("#major > .dropdown-menu");
	for(m = 0; m < allMajors.length; m++){
		var div = document.createElement('div');
		div.class="dropdown-item";
		var checkBox = document.createElement('input');
		checkBox.type="checkbox";
		checkBox.name=allMajors[m];
		checkBox.value = allMajors[m];
		checkBox.id = allMajors[m];

		var span = document.createElement('span');
		span.appendChild(document.createTextNode(allMajors[m]));
		div.appendChild(checkBox);
		div.appendChild(span);
		majorsFilter.appendChild(div);
	}
	var filterString = '{"major": [],"graduationYear": [],"educationLevel": [],"hackathons": []}';
	var filters = JSON.parse(filterString);
	//var filters = [['majors',[]],['gradYear',[]],['eduLevel',[]],['numOfHacks',[]]];
	$(':checkbox').on('change',function(){
		if($(this).prop('checked')){
			//filters.push($(this).val());
			$('#vis').empty();
			var parent = $(this).parentsUntil(".dropdown").parent().attr('id');
			filters[parent].push($(this).val());
			console.log(filters);
			display(MatchesJSON, filters);
		}else{
			$('#vis').empty();
			display(MatchesJSON);
		}
	});
	
	display(MatchesJSON);
	
}


function bubbleChart() {
  var width = 1200;
  var height = 1200;

  var tooltip = floatingTooltip('hackers_tooltip', 240);

  var center = { x: width / 2, y: height / 2 };
  const threeClusterCenters = {
  	1: { x: width / 4, y: height / 2 },
    2: { x: width / 2, y: height / 2 },
    3: { x: 2 * width / 3, y: height / 2 }
  };
  const sixClusterCenters = {
  	1: { x: width / 4, y: height / 4 },
    2: { x: width / 2, y: height / 4 },
    3: { x: 2 * width / 3, y: height / 4 },
    4: { x: width / 4, y: 3*height / 4 },
    5: { x: width / 2, y: 3*height / 4 },
    6: { x: 2 * width / 3, y: 3*height / 4 }
  };

  
  var damper = 0.102;

  // These will be set in create_nodes and create_vis
  var svg = null;
  var bubbles = null;
  var nodes = [];

  function charge(d) {
	return -Math.pow(d.radius, 2.0) / 8;
  }

  var force = d3.layout.force()
	.size([width, height])
	.charge(charge)
	.gravity(-0.01)
	.friction(0.9);

/*
  var fillColor = d3.scale.ordinal()
	.domain(['undergraduate', 'graduate', 'PhD'])
	.range(['#d84b2a', '#beccae', '#7aa25c']);
*/
  var radiusScale = d3.scale.pow()
	.exponent(0.5)
	.range([2, 85]);

  function createNodes(rawData) {
	// Use map() to convert raw data into node data.
	// Checkout http://learnjsdata.com/ for more on
	// working with data.
	var myNodes = rawData.map(function (d) {
	  return {
	  	id: d.id,
	  	email: d.email,
		radius: radiusScale(+d.score),
		value: d.score,
		name: d.name,
		school: d.school,
		major: d.major,
		graduationYear: d.graduationYear,
		educationLevel: d.educationLevel,
		imgURL: d.profileurl,
		hackathons: d.numOfHackathons,
		x: Math.random() * 900,
		y: Math.random() * 800
	  };
	});
	// sort them to prevent occlusion of smaller nodes.
	myNodes.sort(function (a, b) { return b.value - a.value; });

	return myNodes;
  }

  var chart = function chart(selector, rawData) {
	var maxAmount = d3.max(rawData, function (d) { return +d.score; });
	radiusScale.domain([0, maxAmount]);

	nodes = createNodes(rawData);
	console.log(nodes);
	force.nodes(nodes);

	svg = d3.select(selector)
	  .append('svg')
	  .attr('width', width)
	  .attr('height', height);

	var defs = svg.append('defs')

	// defs.append("pattern")
	// 	.attr('id','snow')
	// 	.attr('height',"100%")
	// 	.attr('width', "100%")
	// 	.attr('patternContentUnits','objectBoundingBox')
	// 	.append("image")
	// 	.attr('height',1)
	// 	.attr('width',1)
	// 	.attr('preserveAspectRatio','none')
	// 	.attr('xmlns:xlink','http://www.w3.org/1999/xlink')
	//   	.attr("xlink:href", 'http://placekitten.com/g/48/48');

	defs.selectAll('.circles-pattern')
		.data(nodes)
		.enter().append('pattern')
		.attr('class','circles-pattern')
		.attr('id', function(d){
			return d.email;
		})
		.attr('height',"100%")
		.attr('width', "100%")
		.attr('patternContentUnits','objectBoundingBox')
		.append("image")
		.attr('height',1)
		.attr('width',1)
		.attr('preserveAspectRatio','none')
		.attr('xmlns:xlink','http://www.w3.org/1999/xlink')
	  	.attr("xlink:href", function(d){
	  		return d.imgURL;
	  	});

	bubbles = svg.selectAll('.bubble')
	  .data(nodes, function (d) { return d.id; })
	  

	bubbles.enter()
	  .append('circle')
	  .classed('bubble', true)
	  .attr('r', 0)
	  .attr('stroke-width', 2)
	  .on('mouseover', showDetail)
	  .on('mouseout', hideDetail)
	  .style('fill', function(d){
	  	  return 'url(#'+d.email+')';			//get the image in defs patterns, which has ids=d.email
	  })
	  .on('click', function(d){
	  	window.location = "http://localhost:8080/users/" + d.email;	//TODO: REPLACE EMAIL WITH URLID?
	  })

	bubbles.transition()
	  .duration(2000)
	  .attr('r', function (d) { return d.radius; });

	groupBubbles();
  };

  function groupBubbles() {

	force.on('tick', function (e) {
	  bubbles.each(moveToCenter(e.alpha))
		.attr('cx', function (d) { return d.x; })
		.attr('cy', function (d) { return d.y; });
	});

	force.start();
  }

  function moveToCenter(alpha) {
	return function (d) {
	  d.x = d.x + (center.x - d.x) * damper * alpha;
	  d.y = d.y + (center.y - d.y) * damper * alpha;
	};
  }

  function splitBubbles(filters) {
	force.on('tick', function (e) {
	  bubbles.each(moveToYears(e.alpha, filters))
		.attr('cx', function (d) { return d.x; })
		.attr('cy', function (d) { return d.y; });
	});

	force.start();
  }

  function moveToYears(alpha, filters) {
	return function (d) {
		//set center variable
		var uniCombo = "";
		for(j = 0; j < filters.length; j++){
			for(i = 0; i < filters[j][1].length; i++){
				uniCombo += i.toString();
			}
		}


	  var target = centers[d.year];
	  d.x = d.x + (target.x - d.x) * damper * alpha * 1.1;
	  d.y = d.y + (target.y - d.y) * damper * alpha * 1.1;
	};
  }

  function showDetail(d) {
	d3.select(this).attr('stroke', 'black')

	var content = '<div class="content">';
	if(d.name){
		content += '<div class="row"><div class="col-md-12"><span class="name">'+d.name+', </span>';
	}
	if(d.educationLevel){
		content += '<span class="educationLevel">'+d.educationLevel+'</span></div></div>';
	}
	if(d.school){
		content += '<div class="row"><div class="col-md-12"><span class="school">'+d.school+'</span></div></div>';
	}
	content += '<div class="row">';
	if(d.major){
		content += '<div class="col-md-12"><span class="major text-left">'+d.major+', </span>';
	}
	if(d.graduationYear){
		content += '<span class="graduationYear text-right">'+d.graduationYear+'</span></div></div>';
	}
	content += '<div class="row">';
	if(d.hackathons){
		content += '<span class="numOfHackathons">'+d.hackathons+" Hackathons"+'</span></div>';
	}
	content += '</div>';

	tooltip.showTooltip(content, d3.event);
  }

  function hideDetail(d) {
  	d3.select(this).attr('stroke', 'transparent');
	tooltip.hideTooltip();
  }
  return chart;
}


var myBubbleChart = bubbleChart();


function contains(arr, key, val) {
    for (var i = 0; i < arr.length; i++) {
        if(arr[i][key] === val) return true;
    }
    return false;
}

function display(data, filters) {
  if(filters){
  	var filteredData = [];
  	console.log(filters);
  	for(var key in data){
  		if(data.hasOwnProperty(key)) {
  			for(filter in filters){
  				if(filters.hasOwnProperty(filter)){
  					if(filters[filter].includes(data[key][filter])){
  						filteredData.push(data[key]);
  					}
  				}
  			}
	    } 
  	}
  	//console.log(filteredData);
  	myBubbleChart('#vis',filteredData);
  }else{
	myBubbleChart('#vis', data);
  }
}

function addCommas(nStr) {
  nStr += '';
  var x = nStr.split('.');
  var x1 = x[0];
  var x2 = x.length > 1 ? '.' + x[1] : '';
  var rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
	x1 = x1.replace(rgx, '$1' + ',' + '$2');
  }

  return x1 + x2;
}

function floatingTooltip(tooltipId, width) {
  // Local variable to hold tooltip div for
  // manipulation in other functions.
  var tt = d3.select('body')
    .append('div')
    .attr('class', 'tooltip')
    .attr('id', tooltipId)
    .style('pointer-events', 'none');

  // Set a width if it is provided.
  if (width) {
    tt.style('width', width);
  }

  // Initially it is hidden.
  hideTooltip();

  /*
   * Display tooltip with provided content.
   *
   * content is expected to be HTML string.
   *
   * event is d3.event for positioning.
   */
  function showTooltip(content, event) {
    tt.style('opacity', 1.0)
      .html(content);

    updatePosition(event);
  }

  /*
   * Hide the tooltip div.
   */
  function hideTooltip() {
    tt.style('opacity', 0.0);
  }

  /*
   * Figure out where to place the tooltip
   * based on d3 mouse event.
   */
  function updatePosition(event) {
    var xOffset = 20;
    var yOffset = 10;

    var ttw = tt.style('width');
    var tth = tt.style('height');

    var wscrY = window.scrollY;
    var wscrX = window.scrollX;

    var curX = (document.all) ? event.clientX + wscrX : event.pageX;
    var curY = (document.all) ? event.clientY + wscrY : event.pageY;
    var ttleft = ((curX - wscrX + xOffset * 2 + ttw) > window.innerWidth) ?
                 curX - ttw - xOffset * 2 : curX + xOffset;

    if (ttleft < wscrX + xOffset) {
      ttleft = wscrX + xOffset;
    }

    var tttop = ((curY - wscrY + yOffset * 2 + tth) > window.innerHeight) ?
                curY - tth - yOffset * 2 : curY + yOffset;

    if (tttop < wscrY + yOffset) {
      tttop = curY + yOffset;
    }

    tt.style({ top: tttop + 'px', left: ttleft + 'px' });
  }

  return {
    showTooltip: showTooltip,
    hideTooltip: hideTooltip,
    updatePosition: updatePosition
  };
}

