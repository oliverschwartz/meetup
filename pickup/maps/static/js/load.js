/* ------------------------------------------------------------------------------------------------------------------------------- */
// SETUP OF VARIABLES
mapboxgl.accessToken = 'pk.eyJ1IjoiY29zMzMzIiwiYSI6ImNqdDYzY3A0ZDBkMGc0YXF4azczdXRheWMifQ.3VeYeV_c-231Lab62H2XtQ';

/* Dict containing all markers.
   Stored as key:value pairs, with the key being 
   the event_id, and the value being the JS object. */
markers = {};
var coors = {};

/* Create a marker, and a popup associated with that marker.
    These will be displayed if an event is created. (The popup
    is for deleting the marker).
    These are only displayed if the listener below runs. */
var popup = new mapboxgl.Popup().setHTML("<button class='btn btn-sm btn-danger' id='delete_add_event'>Remove</button>");
var marker = new mapboxgl.Marker({
    draggable: true
})
    .setPopup(popup);

/* ------------------------------------------------------------------------------------------------------------------------------- */

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
    
    /* Trigger geolocate (i.e. zoom in to user's position) */
    map.addControl(geolocate, 'top-left');
    map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
    setTimeout(function() {
        geolocate.trigger();
    }, 10);

    /* Save lat and lng of current position (for geocode.js) */
    setTimeout(function() {
        coors['lat'] = geolocate._lastKnownPosition.coords.latitude;
        coors['lng'] = geolocate._lastKnownPosition.coords.longitude;
    }, 1000);

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
                            "number_going": data.events[key].number_going,
                            "user_going": data.events[key].user_going,
                            "users_going": data.events[key].users_going,
                            "event_id": data.events[key].event_id,
                            "created_by": data.events[key].created_by,
                            "event_name": key.toString(),
                            "event_descr": data.events[key].event_descr,
                            "event_type": data.events[key].event_type,
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
            html = "<div id='popup-" + marker.properties.event_id + "'><h3>" 
                   + marker.properties.event_name + "</h3>"
                   + "<p>" + marker.properties.event_descr + "</p>"
                   + "<p id='number_going'>Number Attending: " + marker.properties.number_going + "</p>";

            html += "<div><p class='link whos_going' style='color:white;' id='whos_going_" + event.properties.event_id + "'>See who's going</p></div></div>";

            html += "<div style='display: none;' id='hidden-" + marker.properties.event_id +"'>"
            // iterate over users_going and display on popup
            for (var i = 0; i < marker.properties.users_going.length; i++)
                html += "<p>" + marker.properties.users_going[i] + "</p>";
            html += "</div>"

            // "Going" or "Cancel" button, depending on if user is attending
            if (marker.properties.user_going) 
                html += "<button class='btn btn-danger event-action'" + 
                        "id='" + marker.properties.event_id + "'" + ">Not Going</button>";
            else 
                html += "<button class='btn btn-success event-action'" + 
                        "id='" + marker.properties.event_id + "'" + ">Going</button>";
            
            // If logged-in user created the event, add a 'delete' button
            if (marker.properties.created_by)
                html += "<button style='margin-top:10px;'"
                        + "class='btn btn-danger delete_event'"
                        + "id='delete-" + marker.properties.event_id + "'>Delete Event</button>";
        
            // make a marker for each feature and add to the map
            var new_marker = new mapboxgl.Marker(el)
                .setLngLat(marker.geometry.coordinates)
                .setPopup(new mapboxgl.Popup()
                    .setHTML(html)
                )
                .addTo(map);

            // append marker to markers dict
            markers[marker.properties.event_id] = new_marker;
        });
    });    
});

/* ------------------------------------------------------------------------------------------------------------------------------- */

/* LISTENER: Removing the newly added event (created here 
    because the popup is a dynamically created element so we 
    have to make sure JQuery is listening to interactions 
    with it). */
$("#map").on('click', "#delete_add_event", function(){
    marker.remove();
    var eventInfo = document.getElementById("add_event");
    eventInfo.innerHTML = "";      // remove prompt
    eventInfo.style.display = '';
});