$(document).ready(function() {
    var lng = document.getElementById("id_lng");
    var lat = document.getElementById("id_lat");
    if (typeof localStorage !== 'undefined') {
        if (localStorage.getItem("lng") !== null) {
            lng.value = localStorage.getItem("lng");
            lat.value = localStorage.getItem("lat");
        }
    }
});