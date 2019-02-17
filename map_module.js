var map;
var htmlStr = "";
var field_list = [];
var check = 0;
var measure;


function initialize() {

  measure = {
    mvcLine: new google.maps.MVCArray(),
    mvcPolygon: new google.maps.MVCArray(),
    mvcMarkers: new google.maps.MVCArray(),
    line: null,
    polygon: null
  };

  var fyn = new google.maps.LatLng(55.40,10.38);
  // General Options
  var myStyles = [{
      featureType: "administrative",
      elementType: "geometry",
      stylers: [{
          visibility: "off"
      }]
  }, {
      featureType: "poi",
      stylers: [{
          visibility: "off"
      }]
  }, {
      featureType: "road",
      elementType: "labels.icon",
      stylers: [{
          visibility: "off"
      }]
  }, {
      featureType: "transit",
      stylers: [{
          visibility: "off"
      }]
  }];
  // Generation of the map with custom cursor
  map = new google.maps.Map(document.getElementById("map"), {
      zoom: 5,
      center: fyn,
      styles: myStyles,
      mapTypeId: "hybrid",
      draggableCursor: "crosshair" // Make the map cursor a crosshair so the user thinks they should click something
  });
  var resetControlDiv = document.createElement('div');
  var resetControl = new ResetControl(resetControlDiv, map);

  resetControlDiv.index = 1;
  map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(resetControlDiv);
  map.setTilt(0);
  

  var clearControlDiv = document.createElement('div');
  var clearControl = new ClearControl(clearControlDiv, map);

  clearControlDiv.index = 1;
  map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(clearControlDiv);
  map.setTilt(0);

  var saveControlDiv = document.createElement('div');
  var saveControl = new SaveControl(saveControlDiv, map);
  
  saveControlDiv.index = 1;
  map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(saveControlDiv);
  map.setTilt(0);
  
  google.maps.event.addListener(map, "click", function(evt) {
      // When the map is clicked, pass the LatLng obect to the measureAdd function
      measureAdd(evt.latLng);
  });


  $(document).ready(function() {
    if (check == 0){
        $('#step-3').one("mouseenter", function() {
            google.maps.event.trigger(map, "resize");
            map.setCenter(fyn);
            check = 1;
        });
            //for add1 its coordinates id
            $('#coordinates').one("mouseenter", function() {
                google.maps.event.trigger(map, "resize");
                map.setCenter(fyn);
                check = 1;
            });
            $('#step-3').one("mouseleave", function(){});
    // do  nothing
    }
  });


};

//Display Coordinates below map
function getPolygonCoords(index) {
  var len = measure.polygon.getPath().getLength();
  htmlStr = "";
  var path = this;
  // console.log(path);
  // console.log(index);
  var btnDelete = getDeleteButton(path.btnDeleteImageUrl);

  

  for (var i = 0; i < len; i++) {
    htmlStr += measure.polygon.getPath().getAt(i).toUrlValue(11) + ",";
  }
  htmlStr = htmlStr.slice(0,-1);
  document.getElementById('info').innerHTML = htmlStr;
  measureCalc();
}

function getDeleteButton(imageUrl) {
  return  $("img[src$='" + imageUrl + "']");
}

function copyToClipboard(text) {
  window.prompt("Copy to clipboard: Ctrl+C, Enter", text);
}


function measureAdd(latLng) {
    // Add a draggable marker to the map where the user clicked
    var image = {
      url:"google-309740_960_720.png",
      size: new google.maps.Size(15, 15),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(8, 8)
    };
    var marker = new google.maps.Marker({
        map: map,
        position: latLng,
        draggable: true,
        visible: false,
        raiseOnDrag: false,
        title: "Drag me to change shape",
    });

    // Add this LatLng to our line and polygon MVCArrays
    // Objects added to these MVCArrays automatically update the line and polygon shapes on the map
    measure.mvcLine.push(latLng);
    measure.mvcPolygon.push(latLng);

    // Push this marker to an MVCArray
    // This way later we can loop through the array and remove them when measuring is done
    measure.mvcMarkers.push(marker);

    // Get the index position of the LatLng we just pushed into the MVCArray
    // We'll need this later to update the MVCArray if the user moves the measure vertexes
    var latLngIndex = measure.mvcLine.getLength() - 1;
    console.log(latLngIndex);
    // When the user mouses over the measure vertex markers, change shape and color to make it obvious they can be moved
    google.maps.event.addListener(marker, "mouseover", function() {
        // marker.setIcon(new google.maps.MarkerImage("/google-309740_960_720.png", new google.maps.Size(15, 15), new google.maps.Point(0, 0), new google.maps.Point(8, 8)));
    });

    // Change back to the default marker when the user mouses out
    google.maps.event.addListener(marker, "mouseout", function() {
        // marker.setIcon(new google.maps.MarkerImage("/google-309740_960_720.png", new google.maps.Size(9, 9), new google.maps.Point(0, 0), new google.maps.Point(5, 5)));
    });
    google.maps.event.addListener(marker, "rightclick", function() {
      // Function to delete a marker    
            marker.setMap(null);
            measure.mvcLine.removeAt(latLngIndex);
            measure.mvcPolygon.removeAt(latLngIndex);
            measure.mvcMarkers.push(latLngIndex);
            console.log(latLngIndex);
            // latLngIndex = measure.mvcLine.getLength() - 1;
    });

    // When the measure vertex markers are dragged, update the geometry of the line and polygon by resetting the
    //     LatLng at this position
    google.maps.event.addListener(marker, "drag", function(evt) {
        measure.mvcLine.setAt(latLngIndex, evt.latLng);
        measure.mvcPolygon.setAt(latLngIndex, evt.latLng);
    });

    // When dragging has ended and there is more than one vertex, measure length, area.
    google.maps.event.addListener(marker, "dragend", function() {
        if (measure.mvcLine.getLength() > 1) {
            measureCalc();
        }
    });

    // If there is more than one vertex on the line
    if (measure.mvcLine.getLength() > 0) {

        // If the line hasn't been created yet
        /*if (!measure.line) {

            // Create the line (google.maps.Polyline)
            measure.line = new google.maps.Polyline({
                map: map,
                clickable: false,
                strokeColor: "#00dd00",
                strokeOpacity: 1,
                strokeWeight: 3,
                path:measure. mvcLine
            });

        }*/

        // If there is more than two vertexes for a polygon
        if (measure.mvcPolygon.getLength()>0) {
            // If the polygon hasn't been created yet
            if (!measure.polygon) {
                // Create the polygon (google.maps.Polygon)
                measure.polygon = new google.maps.Polygon({
                    clickable: false,
                    editable: true,
                    map: map,
                    fillColor: "#00dd00",
                    fillOpacity: 0.25,
                    strokeColor: '#00dd00',
                    strokeOpacity: 0.8,
                    paths: measure.mvcPolygon
                });
            }
            var path = measure.polygon.getPath();
            // path.btnDeleteClickHandler = {};
            // path.btnDeleteImageUrl = 'http://i.imgur.com/RUrKV.png';
            //G.event.addListener(poly, "dragend", getPolygonCoords);
            google.maps.event.addListener(measure.polygon.getPath(), "insert_at", getPolygonCoords);
            //google.maps.event.addListener(poly.getPath(), "remove_at", getPolygonCoords);
            google.maps.event.addListener(measure.polygon.getPath(), "set_at", getPolygonCoords);
            measure.polygon.setMap(map);
        }
    }

    // If there's more than one vertex, measure length, area.
    if (measure.mvcLine.getLength() > 1) {
        measureCalc();
    }

}

function measureCalc() {

    // Use the Google Maps geometry library to measure the length of the line
    // var length = google.maps.geometry.spherical.computeLength(measure.line.getPath());
    // jQuery("#span-length").text(length.toFixed(1));

    // If we have a polygon (>2 vertexes in the mvcPolygon MVCArray)
    if (measure.mvcPolygon.getLength() > 2) {
        // Use the Google Maps geometry library to measure the area of the polygon
        var area = google.maps.geometry.spherical.computeArea(measure.polygon.getPath());
        area_ha = area * 0.0001;
        document.getElementById('area').innerHTML = area + " m^2" + "\nor " + area_ha + " ha";
        jQuery("#span-area").text(area.toFixed(1));
    }
}

function measureReset() {
    // If we have a polygon or a line, remove them from the map and set null
    if (measure.polygon) {
        measure.polygon.setMap(null);
        measure.polygon = null;
    }
    if (measure.line) {
        measure.line.setMap(null);
        measure.line = null;
    }
    // Empty the mvcLine and mvcPolygon MVCArrays
    measure.mvcLine.clear();
    measure.mvcPolygon.clear();
    // Loop through the markers MVCArray and remove each from the map, then empty it
    measure.mvcMarkers.forEach(function(elem, index) {
        elem.setMap(null);
    });
    measure.mvcMarkers.clear();
    jQuery("#span-length,#span-area").text(0);
}

function ResetControl(controlDiv, map) {
  
  // Set CSS for the control border.
  var controlUI = document.createElement('div');
  controlUI.style.backgroundColor = '#eea';
  controlUI.style.border = '5px solid #eea';
  controlUI.style.borderRadius = '1px';
  controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
  controlUI.style.cursor = 'pointer';
  controlUI.style.marginRight = '9px';
  controlUI.style.marginTop = '3px';
  controlUI.style.marginBottom = '15px';
  controlUI.style.textAlign = 'center';
  controlUI.title = 'Click to reset the map to it\'s initial state';
  controlDiv.appendChild(controlUI);

  // Set CSS for the control interior.
  var controlText = document.createElement('div');
  controlText.style.color = 'rgb(25,25,25)';
  controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
  controlText.style.fontSize = '10px';
  controlText.style.lineHeight = '20px';
  controlText.style.paddingLeft = '5px';
  controlText.style.paddingRight = '5px';
  controlText.innerHTML = 'Reset Map';
  controlUI.appendChild(controlText);

  // Setup the click event listeners: simply set the map to Chicago.
  controlUI.addEventListener('click', function() {
    if (measure.polygon !== null) {
      measure.polygon.setMap(null);
      measure = {
          mvcLine: new google.maps.MVCArray(),
          mvcPolygon: new google.maps.MVCArray(),
          mvcMarkers: new google.maps.MVCArray(),
          line: null,
          polygon: null
        };
      document.getElementById('info').innerHTML = "";
      document.getElementById('area').innerHTML = "";
      htmlStr = "";
      // document.getElementById('info').value = "";
    }
    field_list = [];
    initialize();
  });
  $('#coorderror').hide();
  $('#coorderror-pts').hide();
}

function ClearControl(controlDiv, map) {
  // Set CSS for the control border.
  var controlUI = document.createElement('div');
  controlUI.style.backgroundColor = '#eea';
  controlUI.style.border = '5px solid #eea';
  controlUI.style.borderRadius = '1px';
  controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
  controlUI.style.cursor = 'pointer';
  controlUI.style.marginRight = '9px';
  // controlUI.style.marginTop = '3px';
  controlUI.style.marginBottom = '15px';
  controlUI.style.textAlign = 'center';
  controlUI.title = 'Click to remove the current polygon from the  map';
  controlDiv.appendChild(controlUI);

  // Set CSS for the control interior.
  var controlText = document.createElement('div');
  controlText.style.color = 'rgb(25,25,25)';
  controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
  controlText.style.fontSize = '10px';
  controlText.style.lineHeight = '20px';
  controlText.style.paddingLeft = '5px';
  controlText.style.paddingRight = '5px';
  controlText.innerHTML = 'Clear Map';
  controlUI.appendChild(controlText);

  // Setup the click event listeners: simply set the map to Chicago.
  controlUI.addEventListener('click', function() {
    if (measure.polygon !== null) {
      measure.polygon.setMap(null);
      measure = {
          mvcLine: new google.maps.MVCArray(),
          mvcPolygon: new google.maps.MVCArray(),
          mvcMarkers: new google.maps.MVCArray(),
          line: null,
          polygon: null
        };
      document.getElementById('info').innerHTML = "";
      document.getElementById('area').innerHTML = "";
      htmlStr = "";
      document.getElementById('info').innerHTML = field_list;

    }
  });
  poly = undefined;
  $('#coorderror').hide();
  $('#coorderror-pts').hide();
}

function SaveControl(controlDiv, map) {
    // Set CSS for the control border.
    var controlUI = document.createElement('div');
    controlUI.setAttribute("id", "drawbtn");
    controlUI.style.backgroundColor = '#afa';
    controlUI.style.border = '5px solid #afa';
    controlUI.style.borderRadius = '1px';
    controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
    controlUI.style.cursor = 'pointer';
    controlUI.style.marginRight = '9px';
    controlUI.style.marginBottom = '15px';
    controlUI.style.textAlign = 'center';
    controlUI.title = 'Click to save the drawn polygon as your desired field';
    controlDiv.appendChild(controlUI);

    // Set CSS for the control interior.
    var controlText = document.createElement('div');
    controlText.style.color = 'rgb(25,25,25)';
    controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
    controlText.style.fontSize = '10px';
    controlText.style.lineHeight = '20px';
    controlText.style.paddingLeft = '7px';
    controlText.style.paddingRight = '5px';
    controlText.innerHTML = 'Save Area';
    controlUI.appendChild(controlText);

    // Setup the click event listeners: simply set the map to Chicago.
    controlUI.addEventListener('click', function() {
      if (htmlStr.length  > 1 ){
        console.log(measure.polygon.my_getBounds().getCenter().lat());
        console.log(measure.polygon.my_getBounds().getCenter().lng());

        field_list.push(htmlStr);
        measure.polygon.setEditable(false);
        measure = {
          mvcLine: new google.maps.MVCArray(),
          mvcPolygon: new google.maps.MVCArray(),
          mvcMarkers: new google.maps.MVCArray(),
          line: null,
          polygon: null
        };
        document.getElementById('info').innerHTML = "";
        document.getElementById('area').innerHTML = "";
        htmlStr = "";
        document.getElementById('info').innerHTML = field_list;


      }
    });
}

google.maps.Polygon.prototype.my_getBounds=function(){
  var bounds = new google.maps.LatLngBounds()
  this.getPath().forEach(function(element,index){bounds.extend(element)})
  return bounds
}