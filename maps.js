var map;
var service;
var infowindow;
var id;
var next;
var prev;
var vidarray;
var indx = 0;
var country;
var myKey = 'AIzaSyApeIzETh6paiZ1uRS87fl3Hv8562yzfYA';
var searchTerm = document.querySelector('.search');
var searchForm = document.querySelector('form');
var submitBtn = document.querySelector('.submit');
var prevBtn = document.querySelector('.prev');
var nextBtn = document.querySelector('.next');
var section = document.querySelector('section');
var title = document.getElementById('title');
searchForm.addEventListener('submit', initMap);
prevBtn.addEventListener('click', loadPrev);
nextBtn.addEventListener('click', loadNext);

function initMap(e) {
    e.preventDefault();
    infowindow = new google.maps.InfoWindow();
    map = new google.maps.Map(
    document.getElementById('map'), {center: {
        lat: 0,
        lng: 0
    }, 
        zoom: 5
    });
    
    var request = {
        query: searchTerm.value,
        fields: ['name', 'geometry', 'place_id'],
    };
    
    service = new google.maps.places.PlacesService(map);
    service.findPlaceFromQuery(request, function(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < results.length; i++) {
            createMarker(results[i]);
            }
            id = results[0].place_id;
            map.setCenter(results[0].geometry.location);
            map.fitBounds(results[0].geometry.viewport);
            getCode(id);
        }
    });
}

function createMarker(place) {
    var marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location,
        draggable: true,
    });

google.maps.event.addListener(marker, 'click', function() {
        geocoder = new google.maps.Geocoder();
        var pos = marker.getPosition();
        var request = {
            location: pos,
        }
        infowindow.open(map, this);
    });

google.maps.event.addListener(marker, 'dragend', function() 
    {
        geocodePosition(marker.getPosition());
    });
}

function geocodePosition(pos) {
    geocoder = new google.maps.Geocoder();
    var request = {
        location: pos,
    }
    geocoder.geocode(request, function(results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
            for (var i = 0; i < results[0].address_components.length; i++) {
                for (var j = 0; j < results[0].address_components[i].types.length; j++) {
                    if (results[0].address_components[i].types[j] == "country") {
                        country = results[0].address_components[i]['long_name'];
                        findResults(results[0].address_components[i]['short_name']);
                        infowindow.setContent(results[0].address_components[i]['long_name']);
                    }
                }
            }
        }
    });
}

function getCode(id) {
    var request = {
        placeId: id,
        fields: ['address_components'],
    };
    service = new google.maps.places.PlacesService(map);
    service.getDetails(request, function(result, status) {
        for (var i = 0; i < result.address_components.length; i++) {
            for (var j = 0; j < result.address_components[i].types.length; j++) {
                if (result.address_components[i].types[j] == "country") {
                    country = result.address_components[i]['long_name'];
                    findResults(result.address_components[i]['short_name']);
                }
            }
        }
    });
}

function findResults(isocode) {
    var url = 'https://www.googleapis.com/youtube/v3/videos?part=id&chart=mostPopular&regionCode=' + isocode 
    +'&maxResults=25&key=' + myKey;
    fetch(url).then(function(result) {
        return result.json();
    }).then(function(json) {
        while(section.firstChild) {
            section.removeChild(section.firstChild);
        }
        var vids = json.items;
        var string = vids[0]['id'] + ',';
        for (var i = 1; i < vids.length-1; i++) {
            string += vids[i]['id'] + ',';
        }
        string += vids[vids.length-1]['id'];
        vidarray = string.split(',');
        title.innerHTML = "#1 On Trending In " + country;
        indx = 0;
        displayResults(vids[0]['id']);
    })
}

function displayResults(result) {
    while(section.firstChild) {
        section.removeChild(section.firstChild);
    }
    var vid = document.createElement('iframe');
    vid.src = "https://www.youtube.com/embed/" + result;
    vid.width = '480';
    vid.height = '360';
    section.appendChild(vid); 
}

function loadNext() {
    if (indx == 24) {
        indx = 0;
    } else {
        indx++;
    }
    title.innerHTML = "# " + (indx+1) + " On Trending In " + country;
    displayResults(vidarray[indx]);
}

function loadPrev() {
    if (indx == 0) {
        indx = 24;
    } else {
        indx--;
    }
    title.innerHTML = "# " + (indx+1) + " On Trending In " + country;
    displayResults(vidarray[indx]);
}