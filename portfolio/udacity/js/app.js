var map;
/* ARRAY OF LOCATION ATTRIBUTES AS OBJECTS */
var the_data = {
   landmark_info: [
     {title: "Daiso Japan", position: {lat: 32.981539, lng: -96.908635}, type: "Shops"},
     {title: "H Mart", position: {lat: 32.985835, lng: -96.910009}, type: "Shops"},
     {title: "Caffebene", position: {lat: 32.983966, lng: -96.911424}, type: "Food"},
     {title: "Chick-fil-A", position: {lat: 32.986195, lng: -96.909300}, type: "Food"},
     {title: "Java Gaming Cafe", position: {lat: 32.988245, lng: -96.910358}, type: "Service"},
     {title: "Walmart", position: {lat: 32.985984, lng: -96.905989}, type: "Shops"}
   ],
  /* FILTERS */
  filters: ["All", "Food", "Shops", "Service"]
};
/* CREATE WINDOW TO SHOW INFO WHEN CLICK ON MARKER*/
var infoWindow;
/* ARRAY TO HOLD ALL THE MARKS */
var landmarks = [];
/* LOAD MAP */
function initMap() {
  /* CREATE MAP */
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 32.981539, lng: -96.908635},
    zoom: 15
  });
  infoWindow = new google.maps.InfoWindow();
  /* LOAD LOCATION MARKERS AND STORE IN MARKER ARRAY */
  for (i=0; i<the_data.landmark_info.length; i++) {
    // create new marker in google maps api
    add_to_map(the_data.landmark_info[i]);
  }

  /* ALLOW MAP TO RESIZE AUTOMATICALLY WHEN SCREEN RESIZES */
  google.maps.event.addDomListener(window, "resize", function() {
    var center = map.getCenter();
    google.maps.event.trigger(map, "resize");
    map.setCenter(center);
  });

  /* ACTIVATE KNOCKOUT.JS VIEW MODEL */
  ko.applyBindings(new MapViewModel(the_data));

} // END OF MAP INITMAP() FUNCTION

// add a LISTENER
function add_to_map(m) {
  var marker = new google.maps.Marker({
    position: m.position,
    title: m.title,
    type: m.type,
    animation: google.maps.Animation.DROP,
    map: map
  });

  /*ADD LISTENER. OPENS MODAL TO SHOW MORE INFO*/
  marker.addListener("click", function() {
    show_location_info(this, infoWindow);
  });
  landmarks.push(marker);
}
/* AJAX TO 3rd PARTY API TO GET MORE INFO. LOAD LOCATION INFO TO MODAL */
function show_location_info(marker, w) {
  w.marker = marker;
  /* USE FOURSQUARE TO GET MORE INFO ON LOCATION */
  var CLIENT_ID = "1NUJUS2D1N5AKDEUR5A3VFFKTM5YJDOG50LIK42AJSAM13O2";
  var CLIENT_SECRET = "3DYAJ5IICN42ZAD5Z4YXGF1N3GD0DN3WNLIGKBTW01IRKRIF";
  var FOURSQUARE_URL = "https://api.foursquare.com/v2/venues/search";
  var DATA_PARAMS = {
    query: marker.title,
    near: "Carrollton, Texas",
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    v: "20180304",
    limit: 1
  };

  $.ajax({
    url: FOURSQUARE_URL,
    data: DATA_PARAMS,
    dataType: "json",
    success: function(data) {
      /* ADD IN EXTRA INFO FROM FOURSQUARE. IF-ELSE THERE IN CASE
      SOME ATTRIBUTES ARE NOT RETURNED FROM JSON OBJECT */
      var category = "<strong>Category: </strong>: N/A <br>";
      var phone = "<strong>Phone: </strong>: N/A <br>";
      var twitter = "<strong>Twitter Handle: </strong>: N/A <br>";
      var facebook = "<strong>Facebook ID: </strong>: N/A <br>";
      var url = "<strong>Website: </strong>: N/A <br>";
      var menu = "<strong>Menu: </strong>: N/A <br>";
      var user_checkin = "<strong>Checkin Count: </strong>: N/A <br>";
      /* GET CATEGORY*/
      if (data.response.venues[0].categories !== undefined) {
        cat = data.response.venues[0].categories[0].name;
        category = "<strong>Category: </strong>" + cat + "<br>";
      }
      /* GET CONTACT INFO */
      if (data.response.venues[0].contact !== undefined) {
         if (data.response.venues[0].contact.formattedPhone !== undefined) {
           var phone_num = data.response.venues[0].contact.formattedPhone;
           phone = "<strong>Phone: </strong>" + phone_num + "<br>";
         }
         if (data.response.venues[0].contact.twitter !== undefined) {
           var twitter_id = data.response.venues[0].contact.twitter;
           phone = "<strong>Twitter Handle: </strong>@" + twitter_id + "<br>";
         }
         if (data.response.venues[0].contact.facebookUsername !== undefined) {
           var fb_name = data.response.venues[0].contact.facebookUsername;
           facebook = "<strong>Facebook ID: </strong>" + fb_name + "<br>";
         }
      }
      /* GET WEBSITE LINK */
      if (data.response.venues[0].url !== undefined) {
        the_url = data.response.venues[0].url;
        url = "<strong>Website: </strong><a href='" + the_url + "'>Website</a><br>";
      }
      /* GET MENU LINK */
      if (data.response.venues[0].menu !== undefined) {
        m = data.response.venues[0].menu.url;
        menu = "<strong>Menu: </strong><a href='" + m + "'>Menu</a><br>";
      }
      /* GET USER CHECKIN NUMBER*/
      if (data.response.venues[0].stats.checkinsCount !== undefined) {
        num = data.response.venues[0].stats.checkinsCount;
        user_checkin = "<strong>Checkin Count: </strong>" + num + "<br>";
      }
      // concatenate all the content strings and set to infoWindow
      var content = "<strong>Location: </strong>" + marker.title + "<br>"
                    + category + phone + twitter + facebook
                    + url + menu + user_checkin
                    + "<strong>Powered by FourSquare API</strong>";
      w.setContent(content);
      // make it bounce for 2 seconds!
      marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function() {
           marker.setAnimation(null);
      }, 2000);
      // open the infoWindo onclick
      w.open(map, marker);
    },
    error: function(xhr) {
      alert("Error in loading data from FourSquare");
    },
    fail: function() {
      alert("FourSquare failed to load.");
    }
  });
}

// open infoWindow when you click on location in the filtered list
function open_window(element) {
  var name = element.innerHTML;
  for(i=0; i<landmarks.length; i++) {
    if (name == landmarks[i].title) {
      show_location_info(landmarks[i], infoWindow);
      break;
    }
  }
}
/* KNOCKOUT VIEW MODEL */
var MapViewModel = function(data) {
  var self = this;
  self.filters = ko.observableArray(data.filters);
  self.filter = ko.observable("");
  self.locations = ko.observableArray(data.landmark_info);
  self.filteredLocations = ko.computed(function() {
    // picks up the selected option in drop down
    var filter = self.filter();
    // show all places if nothing selected or all is chosen
    if (!filter || filter == "All") {
      // make all markers visible
      for (i=0; i<landmarks.length; i++) {
        landmarks[i].setVisible(true);
      }
      return self.locations();
    } else {
      return ko.utils.arrayFilter(self.locations(), function(j) {
        // set those with matching filter to visible
        for (i=0; i<landmarks.length; i++) {
          if (landmarks[i].type == filter) {
            landmarks[i].setVisible(true);
          } else {
            landmarks[i].setVisible(false);
          }
        }
        // only show those that match filter type
        return j.type == filter;
      });
    }
  });
};
