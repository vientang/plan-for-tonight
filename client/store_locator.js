$( document ).ready(function(){
////////////////////////////////////////IMPORTANT VARIABLES///////////////////////////////////////////////////
    //Google
    var googlePlacesApiUrl = "https://maps.googleapis.com/maps/api/js?key=" + GOOGLE_KEY + "&libraries=places&callback=initMap";
    var googleGeocodesApiBaseUri = "https://maps.googleapis.com/maps/api/geocode/json?address=";
    var formattedAddressFromGooglePlacesAPI;
    var marker;

    //DOM
    $("#google-places-api").attr('src', googlePlacesApiUrl);
    var nearestStoreDiv = document.getElementById("nearest-store")
    
////////////////////////////////////////GOOGLE API FUNCTIONS///////////////////////////////////////////////////
    //init a map and tie it to autocomplete functionality 
    window.initMap = function() {
      //create new map, init it in san francisco
      var map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 37.7749, lng: -122.4194},
        zoom: 13
      });

      //add autocomplete functionality to address-search element and bind it to map, limiting it to addresses
      var input = document.getElementById('address-search');
      
      var options = {
          types: ["address"],
          componentRestrictions: {country: "us"}
      };

      var autocomplete = new google.maps.places.Autocomplete(input, options);
      autocomplete.bindTo('bounds', map);

      //add a listener for autocomplete  
      autocomplete.addListener('place_changed', function() {
          var place = autocomplete.getPlace();
          //if invalid submission is given, return error to user
          if (!place.geometry) {
            window.alert("No details available for input: '" + place.name + "'");
            return;
          }

          //otherwise handle handleUserInput
          formattedAddressFromGooglePlacesAPI = place.formatted_address;
          handleUserInput(map,formattedAddressFromGooglePlacesAPI);
      });
    }

/////////////////////////////////////////HELPER FUNCTIONS//////////////////////////////////////////////////    
    function handleUserInput(map, inputtedAddress) {
      var addressInputField = document.getElementById("address-search");
      var parsedAddressInfo = parseAddress(formattedAddressFromGooglePlacesAPI);
      fetchAddressCoordinates(map, parsedAddressInfo);
      addressInputField.value = "";
    }
    
    function parseAddress(address) {
      var addressArr = address.split(" ");
      var parsedAddressStr = addressArr.join("+");
      return parsedAddressStr;
    }

    //fetches address coordinates from google 
    function fetchAddressCoordinates(map, addressStr) {
        $.ajax({
          type: "GET",
          url: googleGeocodesApiBaseUri + addressStr,  
          dataType: 'json', 
          success: function(data) {
            var results = data.results[0];

            var coordinates = {
              lat: results.geometry.location.lat,
              lng: results.geometry.location.lng,
              //using formatted_address vs. address_components because data more predictable
              city: results.formatted_address.split(",")[1],
              state: results.formatted_address.split(",")[2].slice(1,3)
            };
            findNearestStore(map, coordinates);
          },
          error: function(err) {
            console.log("Problem fetching data from Google Geocodes API: ", err)
            window.alert("Uh oh. You might want to double check your address. Try something like:" +
            "2016 California Street, San Francisco, CA, United States")
          }
        });
    }

    //fetches nearest store from db
    function findNearestStore(map, coordinates) {
      $.ajax({
        type: "POST",
        url: '/store',
        data: coordinates,
        dataType: 'json',
        success: function(nearestStore) {
          console.log("Successfully retrieved closest store ", nearestStore)
          renderNearestStoreMarker(map, nearestStore);
          renderNearestStoreAddress(nearestStore);
        },
        error: function(err) {
          console.log("Problem fetching closest store: ", err)
          window.alert("Hmm. Doesn't look like we can find a match. Maybe try another address?")
        }
      });
    }

    function renderNearestStoreMarker(map, nearestStore) {
      var nearestStoreCoordinates = { lat: +nearestStore.lat, lng: +nearestStore.lng }

      //update map focus
      map.setCenter(nearestStoreCoordinates);
      map.setZoom(15); 

      //delete old marker and add new one to map
      if(marker) {
        marker.setMap(null);
      }

      marker = new google.maps.Marker({
        position: nearestStoreCoordinates,
        title: nearestStore.name
      });

      marker.setMap(map);
    }

    function renderNearestStoreAddress(nearestStore) {
      var name = nearestStore.name;
      var address = nearestStore.address;
      var nearestStoreStr = name + ": " +  address;
      nearestStoreDiv.innerText = nearestStoreStr;
    }

////////////////////////////////////////UI CLICK HANDLERS///////////////////////////////////////////////////
    //prevents default when user presses enter
    $('#address-search').keydown(function (e) {
        if (e.which == 13 && $('#input-form').length) return false;
    });  
});