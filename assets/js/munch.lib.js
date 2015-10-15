var munch_lib = (function () {
    // Much of the code here has come from the google example page here
    // https://developers.google.com/maps/documentation/javascript/places#TextSearchRequests.

    var geneve = {lat: 46.1983922, lng: 6.1422961};
    var map = undefined;
    var infowindow = undefined;
    var search_types = ["restaurant"];
    var last_search = '';
    var radius = 2000;
    var zoom = 14;

    var post_process_place = function (place) {
        if (place.opening_hours) {
            var d = new Date();
            var n = d.getDay() - 1;
            place["current_opening"] = place.opening_hours.weekday_text[n];
        }

        if (place.price_level) {
            place.price_text = Array(place.price_level + 1).join("$");
        }
    };

    var create_result_item = function (place) {
        var result_item_source = $("#result-item-template").html();
        var result_item_template = Handlebars.compile(result_item_source);

        var html = result_item_template(place);
        $("#results").find("table tbody").append(html);

    };

    // returns an image to represent the current state.
    var get_map_marker = function (place) {
        var img = 'assets/img/map-marker';

        if (place.opening_hours) {
            img += (place.opening_hours.open_now == true ? "-open" : "-closed");
        }
        img += ".svg";
        return img;
    };

    var createMarker = function (place) {
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
    };

    var callback = function (results, status) {

        $("#results").find("table tbody").html('');
        // we have to perform an extra call to get the details about
        // the place since search only returns back a subset.
        var service = new google.maps.places.PlacesService(map);
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < results.length; i++) {

                service.getDetails({
                    placeId: results[i].place_id
                }, function (place, status) {
                    if (status === google.maps.places.PlacesServiceStatus.OK) {
                        post_process_place(place);

                        createMarker(place);
                        create_result_item(place);
                    }
                });
            }
        }
    };

    var create_map = function() {
        map = new google.maps.Map(document.getElementById('map'), {
            center: geneve,
            zoom: zoom
        });
    };

    var create_info_window= function () {
        infowindow = new google.maps.InfoWindow();
    };

    return {
        // performs the search. The default behaviour is to get the max restaurants within the defined radius.
        performSearch: function (search_term) {

            if (search_term == undefined) {
                search_term = $("#search").val();
            }

            if (search_term == "") {
                munch_lib.initExplore();
            }

            last_search = search_term;


            create_map();
            create_info_window();

            var service = new google.maps.places.PlacesService(map);

            service.textSearch(
                {
                    location: geneve,
                    radius: radius,
                    query: search_term,
                    types: search_types
                }, callback);
        },

        // this initialises code to get which is activated when there are no search terms.
        initExplore: function () {

            if (last_search != "") {
                $("#search").val(last_search);
                munch_lib.performSearch(last_search)
            } else {
                create_map();
                create_info_window();

                var service = new google.maps.places.PlacesService(map);
                service.nearbySearch({
                    location: geneve,
                    radius: radius,
                    types: search_types
                }, callback);
            }
        },

        // this initialises the detail page with content given a place_id
        initDetail: function (place_id) {
            create_map();

            create_info_window();

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

                    post_process_place(place);

                    var main_detail_template_source = $("#main-info-template").html();
                    var main_detail_template = Handlebars.compile(main_detail_template_source);

                    var extra_detail_template_source = $("#extra-info-template").html();
                    var extra_detail_template = Handlebars.compile(extra_detail_template_source);


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


    }

})();

