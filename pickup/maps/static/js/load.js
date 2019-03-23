mapboxgl.accessToken = 'pk.eyJ1IjoiY29zMzMzIiwiYSI6ImNqdDYzY3A0ZDBkMGc0YXF4azczdXRheWMifQ.3VeYeV_c-231Lab62H2XtQ';

/* Initialize map object */
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v9',
    center: [0,0], // doesn't matter what these are
    zoom: 8,
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

    
    features = [];
    function displayEvents(callback) {
        console.log("doing ajax request")
        $.ajax({
            url: '/ajax/fetch_from_db/',
            data: {}, // empty query - just fetch all events
            dataType: 'json',
            success: function (data) {
                for (var key in data.events) {
                    feature = {};
                    if (data.events.hasOwnProperty(key)) {
                        feature["geometry"] = {
                            "type": "Point", 
                            "coordinates": [data.events[key].lng, data.events[key].lat],
                        };
                        feature["type"] = "feature";
                        feature["properties"] = {
                            "created_by": data.events[key].created_by,
                            "event_name": key.toString(),
                            "event_descr": data.events[key].event_descr,
                            "event_type": data.events[key].event_key,
                            "number_going": data.events[key].number_going,
                            "location": data.events[key].location,
                        }
                    }
                    features.push(feature);
                    console.log(feature["geometry"]["coordinates"]);
                }
            }
        });
        callback();
    }

    displayEvents(function() {
        // Display wine bottle icon
        console.log("displaying icons");
        console.log(features);
        map.loadImage('https://image.flaticon.com/icons/png/512/45/45637.png', 
        function(error, image) {
            if (error) throw error;
            map.addImage('bottle', image);
            map.addLayer({
                "id": "points",
                "type": "symbol",
                "source" : {
                    "type": "geojson",
                    "data": {
                        "type": "FeatureCollection",
                        "features": features,
                    }
                },
                "layout": {
                    "icon-image": 'bottle',
                    "icon-size": 0.1
                }
            });
        });
    });

    

    // Handle clicks on icons
    map.on('click', 'points', function (e) {
        var coors = e.features[0].geometry.coordinates.slice();
        var created_by   = e.features[0].properties.created_by;
        var event_descr  = e.features[0].properties.event_descr;
        var event_name   = e.features[0].properties.event_name;
        var number_going = e.features[0].properties.number_going;
        var location     = e.features[0].properties.location;

        var html = "<p>" + event_name + "</p>" + 
                   "<p>Created by: " + created_by + "</p>" +
                   "<p>" + event_descr + "</p>" +
                   "<p>Number attending: " + number_going + "</p>" +
                   "<p>Location: " + location + "</p>";

        while (Math.abs(e.lngLat.lng - coors[0]) > 180) {
            coors[0] += e.lngLat.lng > coors[0] ? 360 : -360;
        }

        new mapboxgl.Popup()
            .setLngLat(coors)
            .setHTML(html)
            .addTo(map);
    });


    // Change cursor to pointer when mouse is over 'points' layer
    map.on('mouseenter', 'points', function () {
        map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back when mouse leaves
    map.on('mouseleave', 'points', function () {
        map.getCanvas().style.cursor = '';
    });
    
});