var svgNS = "http://www.w3.org/2000/svg";
var svgDoc = null;
Date.prototype.addDays = function(days) {
	var d = new Date(this.valueOf());
	d.setDate(d.getDate() + days);
	return d;
}
function init(svg) {
	svgDoc = svg;
	if( (window.location.search.indexOf("year") >= 0) && (window.location.search.indexOf("years") == -1) ) {
		var year = null;
		try {
			year = parseInt(/year=([0-9]{4})/.exec(window.location.search)[1], 10);
		} catch(e) {
			console.log("Could not parse year");
			throw "Could not parse year";
		}
		if(year != null) {
			var g = svgDoc.querySelector("g#g_year[data-yearOffset='0']");
			setCalendarDates(g, year);
		}
	} else if( window.location.search.indexOf("years") >= 0 ) {
		try {
			var years = /years=([0-9]{4})\+([0-9]+)$/.exec(window.location.search);
			var startYear = parseInt(years[1], 10);
			var yearCount = parseInt(years[2], 10);
			var g = svgDoc.querySelector("g#g_year[data-yearOffset='0']");
			var gs = [];
			gs.push(g);
			var height = g.getBBox().height;
			for(var i=1; i<yearCount; i++) {
				gs.push( g.cloneNode(true) );
				gs[gs.length - 1].setAttribute("data-yearOffset", i);
				gs[gs.length - 1].setAttribute("transform", "translate(0,${Height})".replace(/\${Height}/, (height * i)));
				g.parentNode.appendChild(gs[gs.length - 1]);
			}
			for(var i=0; i<yearCount; i++) {
				setCalendarDates(gs[i], startYear + i);
			}
			svgDoc.setAttribute("height", (g.getBBox().height * yearCount) + "px");
			svgDoc.viewBox.baseVal.height = g.getBBox().height * yearCount;
		} catch (e) {
			console.log("Could not parse years");
			throw "Could not parse years";
		}
	} else {
		console.log("No years to parse");
		throw "No years to parse";
	}
}
function setCalendarDates(g, year) {
	g.querySelector("#text_yearHeader").innerHTML = year.toString();
	var monthBlocks = g.querySelectorAll(".dateHolder");
	for(var m=0; m<monthBlocks.length; m++) {
		var monthBlock = monthBlocks[m];
		var weekDays = monthBlock.querySelectorAll("text.weekDay");
		var date = new Date(year, m, 1);
		while(date.getDay() != 0) {
			date = date.addDays(-1);
		}
		for(var i=0; i<weekDays.length; i++) {
			var weekDay = weekDays[i];
			weekDay.innerHTML = date.getDate().toString();
			weekDay.setAttribute("data-month", (date.getMonth() + 1));
			weekDay.setAttribute("data-date", date.getDate());
			weekDay.setAttribute("data-year", date.getFullYear());
			if(m == date.getMonth()) {
				weekDay.classList.add("weekDayWeekDay");
			} else {
				weekDay.classList.add("weekDayWrongMonth");
				//console.log( m + " != " + date.getMonth() + " " + date);
			}
			date = date.addDays(1);
		}
	}
}
function getDates(date) {
	return svgDoc.querySelectorAll(
		"[data-month='${Month}'][data-year='${Year}'][data-date='${Date}']"
		.replace(/\${Month}/, (date.getMonth() + 1))
		.replace(/\${Year}/, date.getFullYear())
		.replace(/\${Date}/, date.getDate())
	);
}
function getDate(date) {
	var dates = getDates(date);
	for(var i=0; i<dates.length; i++) {
		var thisDate = new Date(
			 parseInt(dates[i].getAttribute("data-year"), 10)
			,parseInt(dates[i].getAttribute("data-month"), 10) - 1
			,parseInt(dates[i].getAttribute("data-date"), 10)
		);
		if( (thisDate.getMonth() + 1).toString() == dates[i].getAttribute("data-month") ) {
			return dates[i];
		}
	}
	return dates[0];
}
function drawArrowFromDateToDate(date1, date2, color) {
	var path = svgDoc.parentNode.createElementNS(svgNS, "path");
	var text1 = getDate(date1);
	var text2 = getDate(date2);
	if(color == null) {
		color = "rgba(0,0,180,0.7)";
	}
	if((text1 == null) || (text2 == null)) {
		console.log("Date out of range");
		throw "Date out of range";
	} else {
		var x1 = parseFloat(text1.getAttribute("x"));
		var y1 = parseFloat(text1.getAttribute("y"));
		var x2 = parseFloat(text2.getAttribute("x"));
		var y2 = parseFloat(text2.getAttribute("y"));
		var g1 = text1.parentNode.parentNode;
		var g2 = text2.parentNode.parentNode;
		var gy1 = g1.parentNode;
		var gy2 = g2.parentNode;
		x1 += g1.transform.baseVal.getItem(0).matrix.e;
		y1 += g1.transform.baseVal.getItem(0).matrix.f;
		y1 += gy1.transform.baseVal.getItem(0).matrix.f;
		x2 += g2.transform.baseVal.getItem(0).matrix.e;
		y2 += g2.transform.baseVal.getItem(0).matrix.f;
		y2 += gy2.transform.baseVal.getItem(0).matrix.f;
		path.setAttribute(
			 "d"
			,"M ${X1},${Y1} L ${X2},${Y2}"
				.replace(/\${X1}/, x1 )
				.replace(/\${Y1}/, y1 )
				.replace(/\${X2}/, x2 )
				.replace(/\${Y2}/, y2 )
		);
		path.setAttribute("style", "fill:${Color}; stroke:${Color};".replace(/\${Color}/g, color));
		path.setAttribute("marker-end", "url(#arrowHead)");
		svgDoc.querySelector("#g_year").appendChild(path);
	}
}
function circleDate(date, color) {
	var circle = svgDoc.parentNode.createElementNS(svgNS, "circle");
	var text1 = getDate(date);
	if(color == null) {
		color = "rgba(0,0,180,0.7)";
	}
	if(text1 == null) {
		console.log("Date out of range");
		throw "Date out of range";
	} else {
		var x1 = parseFloat(text1.getAttribute("x"));
		var y1 = parseFloat(text1.getAttribute("y"));
		var g1 = text1.parentNode.parentNode;
		var gy1 = g1.parentNode;
		x1 += g1.transform.baseVal.getItem(0).matrix.e;
		y1 += g1.transform.baseVal.getItem(0).matrix.f;
		y1 += gy1.transform.baseVal.getItem(0).matrix.f;
		circle.setAttribute("cx", x1);
		circle.setAttribute("cy", y1-5);
		circle.setAttribute("r", 10);
		circle.setAttribute("style", "fill:${Color}; stroke:${Color};".replace(/\${Color}/g, color));
		svgDoc.querySelector("#g_year").appendChild(circle);
	}
}
function drawLinesBetweenDates(dateArray, color) {
	for(var i=0; i<dateArray.length; i++) {
		if(i+1 < dateArray.length) {
			drawArrowFromDateToDate(dateArray[i], dateArray[i+1], color);
		}
	}
}