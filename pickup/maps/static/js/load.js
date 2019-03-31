mapboxgl.accessToken = 'pk.eyJ1IjoiY29zMzMzIiwiYSI6ImNqdDYzY3A0ZDBkMGc0YXF4azczdXRheWMifQ.3VeYeV_c-231Lab62H2XtQ';

/* Initialize map object */
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v9',
    center: [0,0], // doesn't matter what these are
    zoom: 1,
});

/* Modify map with icons & other settings */
map.on('load', function () {
    // Add compass, zoom, and geolocate
    const geolocate = new mapboxgl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true
        },
        trackUserLocation: true
    });
    map.addControl(geolocate);
    map.addControl(new mapboxgl.NavigationControl());
    setTimeout(function() {geolocate.trigger();}, 10);

    /* Create a call back function. First, it queries the database with an 
       AJAX request. Following this, it calls the callback function argument
       (see next code block). */
    events = [];
    eventNumber = 0;
    function displayEvents(callback) {
        $.ajax({
            url: '/ajax/fetch_from_db/',
            data: {}, // empty query - just fetch all events
            dataType: 'json',
            success: function (data) {
                for (var key in data.events) {
                    event = {};
                    if (data.events.hasOwnProperty(key)) {
                        event["type"] = "Feature";
                        event["geometry"] = {
                            type: "Point",
                            coordinates: [data.events[key].lng, data.events[key].lat],
                        };
                        event["properties"] = {
                            "user_going": data.events[key].user_going,
                            "event_id": data.events[key].event_id,
                            "created_by": data.events[key].created_by,
                            "event_name": key.toString(),
                            "event_descr": data.events[key].event_descr,
                            "event_type": data.events[key].event_type,
                            "number_going": data.events[key].number_going,
                            "location": data.events[key].location,
                        };
                    }
                    events.push(event);
                    eventNumber++;
                }
            }
        });

        /* Give the AJAX enough time to complete before loading images */
        setTimeout(function() {
            callback();
        }, 50);
    }

    /* Executes an instance of the above function, complete with a callback. 
       Here the callback function adds all of the features to the map (i.e. 
        annotated markers). */
    displayEvents(function() {
        imageURLs = {
            "Party": "https://imageog.flaticon.com/icons/png/512/65/65667.png",
            "Concert": "https://image.flaticon.com/icons/png/512/199/199361.png",
        }

        var geojson = {
            type: "FeatureCollection",
            features: [],
        };
        for (i = 0; i < eventNumber; i++) {
            geojson["features"].push(events[i]);
        }

        // add markers to map
        geojson.features.forEach(function(marker) {

            // create a HTML element for each feature
            var el = document.createElement('div');
            el.className = 'marker';
            el.style.backgroundImage = "url('" + imageURLs[marker.properties.event_type] + "')"
            
            // Set the HTML in the popup
            html = "<h2>" + marker.properties.event_name + "</h2>"
                   + "<p>" + marker.properties.event_descr + "</p>"
                   + "<p>Number Attending: " + marker.properties.number_going + "</p>";
           
            // "Going" or "Cancel" button, depending on if user is attending
            if (marker.properties.user_going) 
                html += "<button class='btn btn-danger'>Cancel</button>";
            else 
                html += "<button class='btn btn-success'>Going</button>";
        
            // make a marker for each feature and add to the map
            new mapboxgl.Marker(el)
                .setLngLat(marker.geometry.coordinates)
                .setPopup(new mapboxgl.Popup()
                    .setHTML(html)
                )
                .addTo(map);
        });
    });    
});

/* Create a marker, and a popup associated with that marker.
   These will be displayed if an event is created. (The popup
    is for deleting the marker) */
var popup = new mapboxgl.Popup().setHTML("<button class='btn btn-sm btn-danger' id='delete_event'>Remove</button>");
var marker = new mapboxgl.Marker({
    draggable: true
})
    .setPopup(popup);

/* Create an event: create a draggable marker for the 
   user to position */
$(document).ready(function() {
    /* Handler for clicking the "Add an event" */
    $("#add_anchor").click(function() {
        var eventInfo = document.getElementById("add_event");
        marker.setLngLat(map.getCenter()).addTo(map);
        function onDragEnd() {
            eventInfo.style.display = 'block';
            eventInfo.innerHTML = "Click <a id='goto_event' style='color: #00ffff;' href='/testing/'>here</a> to add event details once you've positioned your marker. \
                                <br>To delete the event, click the icon.";
        }
        marker.on('dragend', onDragEnd);

        /* Continually save the coordinates of the marker */
        setInterval(function() {
            localStorage.setItem("lng", marker.getLngLat().lng);
            localStorage.setItem("lat", marker.getLngLat().lat);
        }, 10);
    });

        
});

/* Handler for removing the event */
$("#map").on('click', "#delete_event", function(){
    console.log("hello")
    marker.remove();
    var eventInfo = document.getElementById("add_event");
    eventInfo.innerHTML = "";      // remove prompt
    eventInfo.style.display = '';
});