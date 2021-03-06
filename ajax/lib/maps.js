var gold_icon = {
    url: 'images/marker_sprite_gold.png',
    size: new google.maps.Size(20, 34),
    origin: new google.maps.Point(0,0),
    anchor: new google.maps.Point(10, 33)
};
var gray_icon = {
    url: 'images/marker_sprite_gray.png',
    size: new google.maps.Size(20, 34),
    origin: new google.maps.Point(0,0),
    anchor: new google.maps.Point(10, 33)
};
var shadow = {
    url: 'images/marker_sprite_gray.png',
    size: new google.maps.Size(37, 34),
    origin: new google.maps.Point(20,0),
    anchor: new google.maps.Point(10, 33)
};

/**
 * Generate a marker for a given person and Google Map.
 *
 * @note Requires Google Maps to be imported.
 *
 * @param map the map in which to insert the marker.
 * @param person represents a person, with fields at least for latitude, longitude, listing_count and karma.
 * @param game_mechanics whether to distinguish between users with karma and those without.
 * @param text HTML to put in the marker bubble.
 * @param infowindow     an infowindow to put text in.
 *
 * @returns {google.maps.Marker} a marker for the given person.
 */
function createMarker(map, person, game_mechanics, text, infowindow) {
    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(person.latitude, person.longitude),
        map: map
    });
    var integer_factor = 1000; // Google Maps doesn't appear to understand too fine-grained z-indexes
    if (game_mechanics && person.karma > 0) {
        // Karmic users on top
        marker.setIcon(gold_icon);
        marker.setShadow(shadow);
        // Put visually lower users in front
        marker.setZIndex((3*90 - person.latitude)*integer_factor); // Range [180000,360000]
    }
    else if (person.listing_count == 0) {
        // Listing users in the middle
        marker.setIcon(gray_icon);
        marker.setShadow(shadow);
        marker.setZIndex((-90 - person.latitude)*integer_factor); // Range [-180000,0]
    }
    else {
        // Empty users on the bottom
        marker.setZIndex((90 - person.latitude)*integer_factor); // Range [0,180000]
    }

    // TODO More lightweight method? (without a separate function for each marker)
    google.maps.event.addListener(marker, 'click', (function(marker, text) {
        return function() {
            infowindow.setContent(text);
            infowindow.open(map,marker);
        }
    })(marker, text));

    return marker;
}

/**
 * Generate markers for up to several persons for a given member. This is a stopgap solution; ideally, createMarker
 * would handle this input format, but that requires modifying cGeocode::AllMarkers.
 *
 * @param map            the map in which to insert the marker.
 * @param member         represents a member, with fields at least for person (each with name, latitude and longitude),
 *                       listing_count and karma.
 * @param game_mechanics whether to distinguish between users with karma and those without.
 * @param infowindow     an infowindow to put text in.
 *
 * @returns {google.maps.Marker} a marker for the given member.
 */
function createMarkers(map, member, game_mechanics, infowindow) {
    var markers = [];
    for (var i = 0; i < member.persons.length; i++) {
        var person = {
            'latitude': member.persons[i].latitude,
            'longitude': member.persons[i].longitude,
            'listing_count': member.listing_count,
            'karma': member.karma
        }
        markers[i] = createMarker(map, person, game_mechanics, "<h1>"+ member.persons[i].name +"</h1>", infowindow);
    }
    return markers;
}
