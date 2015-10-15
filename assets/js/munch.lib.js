var geneve = {lat: 46.1983922, lng: 6.1422961};
var map = undefined;
var infowindow = undefined;


function performSearch(search_term) {

    if (search_term ==undefined) {
        search_term = $("#search").val();
    }
    if (search_term == "") {
        initExplore()
    }

    map = new google.maps.Map(document.getElementById('map'), {
        center: geneve,
        zoom: 14
    });

    infowindow = new google.maps.InfoWindow();
    var service = new google.maps.places.PlacesService(map);


    service.textSearch(
        {
            location: geneve,
            radius: 2000,
            query: search_term,
            types: ['restaurant', 'food']
        }, search_callback);
}

function search_callback(results, status) {

    $("#results table tbody").html('');
    // we have to perform an extra call to get the details about
    // the place since search only returns back a subset.
    var service = new google.maps.places.PlacesService(map);
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
            console.log("searching for" + results[i].place_id);

            service.getDetails({
                placeId: results[i].place_id
            }, function (place, status) {
                console.log(place);
                createMarker(place);
                create_result_item(place);
            });
        }
    }
}


function initExplore() {


    map = new google.maps.Map(document.getElementById('map'), {
        center: geneve,
        zoom: 14
    });

    infowindow = new google.maps.InfoWindow();

    var service = new google.maps.places.PlacesService(map);
    service.nearbySearch({
        location: geneve,
        radius: 2000,
        types: ['restaurant', 'food']
    }, callback);
}

function initDetail(place_id) {
    map = new google.maps.Map(document.getElementById('map'), {
        center: geneve,
        zoom: 14
    });

    infowindow = new google.maps.InfoWindow();
    var service = new google.maps.places.PlacesService(map);

    service.getDetails({
        placeId: place_id
    }, function (place, status) {

        map.setCenter(place.geometry.location);

        if (status === google.maps.places.PlacesServiceStatus.OK) {
            var marker = new google.maps.Marker({
                map: map,
                position: place.geometry.location,
                icon: get_map_marker(place)
            });


            var main_detail_template_source = $("#main-info-template").html();
            var main_detail_template = Handlebars.compile(main_detail_template_source);

            var extra_detail_template_source = $("#extra-info-template").html();
            var extra_detail_template = Handlebars.compile(extra_detail_template_source);

            if (place.opening_hours) {
                var d = new Date();
                var n = d.getDay() - 1;
                place["current_opening"] = place.opening_hours.weekday_text[n];
            }

            if (place.price_level) {
                place.price_text = Array(place.price_level + 1).join("$");
            }

            console.log(place);

            var html = main_detail_template(place);
            $("#main_info").html(html);

            html = extra_detail_template(place);
            $("#extra_info").html(html);

            google.maps.event.addListener(marker, 'click', function () {
                infowindow.setContent(place.name);
                infowindow.open(map, this);
            });
        }
    });
}

function callback(results, status) {

    if (status === google.maps.places.PlacesServiceStatus.OK) {
        $("#results table tbody").html('');
        for (var i = 0; i < results.length; i++) {
            createMarker(results[i]);
            create_result_item(results[i]);
        }
    }
}


function create_result_item(place) {
    var result_item_source = $("#result-item-template").html();
    var result_item_template = Handlebars.compile(result_item_source);

    var html = result_item_template(place);
    $("#results table tbody").append(html);

}

function get_map_marker(place) {
    var img = 'assets/img/map-marker';

    if (place.opening_hours) {
        img += (place.opening_hours.open_now == true ? "-open" : "-closed");
    }
    img += ".svg";
    return img;
}

function createMarker(place) {
    var placeLoc = place.geometry.location;

    var marker = new google.maps.Marker({
        map: map,
        position: placeLoc,
        icon: get_map_marker(place)
    });

    google.maps.event.addListener(marker, 'click', function () {

        var map_info_source = $("#map-info-template").html();
        var map_info_template = Handlebars.compile(map_info_source);

        infowindow.setContent(map_info_template(place));
        infowindow.open(map, this);
    });
}

