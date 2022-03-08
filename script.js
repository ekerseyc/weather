var apiKey = 'b220da5617847bf30789df166df8a1aa';
var requestURL = 'https://api.openweathermap.org/data/2.5/onecall?lat=39.526329&lon=-80.341248&appid=b220da5617847bf30789df166df8a1aa&units=imperial';
var geocodingURL = 'http://api.openweathermap.org/geo/1.0/direct';
var searchBox;
var oneCall = 'https://api.openweathermap.org/data/2.5/onecall';

// local storage variables
var searches = [];
var localStorage = window.localStorage;

//search form
$("form").submit(function (e) {
  e.preventDefault()
  var searchBox = $('#search').val();
  $.ajax({
    type: "GET",
    url: geocodingURL + "?q=" + searchBox + "&limit=1&appid=" + apiKey,
    dataType: "json",
    success: function (result, status, xhr) {
      getWeather(result[0]["lat"], result[0]["lon"], result[0]["name"], result[0]["state"], result[0]["country"]); //grabs the lat, long, name state country
      var searchList = [];
      var currentSearch = {
        latitude: result[0]["lat"],
        longitude: result[0]["lon"],
        city: result[0]["name"],
        state: result[0]["state"],
        country: result[0]["country"]
      }
      searchList.push(currentSearch);
      searchList = searchList.concat(JSON.parse(localStorage.getItem('searches') || '[]')); //logs the searches in localStorage
      localStorage.setItem('searches', JSON.stringify(searchList));
      document.querySelector("#search").value = '';
      displaySearches();
    },
    error: function (xhr, status, error) {
      console.log("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
    }
  });
});

//grabs weather from search query
function getWeather(lat, long, name, state, country) {
  $.ajax({
    type: "GET",
    url: oneCall + "?lat=" + lat + "&lon=" + long + "&appid=" + apiKey + "&units=imperial",
    dataType: "json",
    success: function (result, status, xhr) {
      var date = new Date(result["current"]["dt"] * 1000);
      var formatDate = (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear(); //formats date from epoch to MMDDYYYY
      displayCurWeather(name + ", " + state + ", " + country, formatDate, result["current"]["weather"]["0"]["icon"], result["current"]["temp"], result["current"]["wind_speed"], result["current"]["humidity"], result["current"]["uvi"]); //gets the current weather for the search result

      // 5 day forecast call
      $('#fiveDay').html("");
      for (var i = 1; i < 6; i++) {
        var fiveDate = new Date(result["daily"][i]["dt"] * 1000);
        var formatFive = (fiveDate.getMonth() + 1) + "/" + fiveDate.getDate() + "/" + fiveDate.getFullYear(); //formats the 5 day weather dats from epoch to MMDDYYYY
        displayDayOne(formatFive, result["daily"][i]["weather"]["0"]["icon"], result["daily"][i]["temp"]["day"], result["daily"][i]["wind_speed"], result["daily"][i]["uvi"]); //gets the 5 day results
      }
    },
    error: function (xhr, status, error) {
      console.log("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
    }
  });
}

// displays current weather on page
function displayCurWeather(name, dt, icon, temp, wind_speed, humidity, uvi) {
  $("#location").html('<h2>' + name + ' (' + dt + ')' + '<img src="http://openweathermap.org/img/wn/' + icon + '.png"></h2>');
  $("#currentTemp").html(formatTemp(temp));
  $("#currentHumidity").html(formatHum(humidity));
  $("#currentWind").html(formatWind(wind_speed));
  $("#currentUVI").html(formatUVI(uvi));
}

// Functions for Weather inputs
function formatUVI(uviPass) {
  if (uviPass <= 2) {
    return ('UV Index: <span class="badge badge-success">' + uviPass + '</span>');
  }
  else if (uviPass >= 3 && uviPass < 6) {
    return ('UV Index: <span class="badge badge-warning">' + uviPass + '</span>');
  }
}
function formatTemp(tempPass) {
  return ('Temp: ' + tempPass + ' °F');
}

function formatHum(humPass) {
  return ('Humidity: ' + humPass + '%');
}

function formatWind(windPass) { //lol
  return ('Wind: ' + windPass + ' MPH')
}

function displayDayOne(dt, icon, temp, wind_speed, humidity) { //card for the 5 day weather forecast
  $("#fiveDay").append('<div class="card text-center" style="width: 10rem"><div class="card-body"><h5 class="card-title">' + dt + '<img src="http://openweathermap.org/img/wn/' + icon + '.png"></h5><ul class="list-group list-group-flush"><li class="list-group-item">' + formatTemp(temp) + '</li><li class="list-group-item">' + formatWind(wind_speed) + '</li><li class="list-group-item">' + formatHum(humidity) + '</li></ul></div></div>');
}

$(document).ready(function () { //baseline info for NYC when you load the index page
  getWeather(40.7128, -74.0060, "New York", "New York", "US");
  displaySearches();
})

function displaySearches() {
  $('#prevSearch').html("");
  if (localStorage.getItem('searches') !== null) { //grabs the localstorage searches
    searches = JSON.parse(localStorage.getItem('searches'));
  }
  searches.forEach((number, index, array) => { //displays them as clickable buttons on the side
    var inputElement = document.createElement('input');
    inputElement.type = "button";
    inputElement.className = "btn btn-primary btn-block";
    inputElement.setAttribute("value", array[index]["city"]);
    inputElement.addEventListener('click', function () {
      getWeather(array[index]["latitude"], array[index]["longitude"], array[index]["city"], array[index]["state"], array[index]["country"]);
    })
    $('#prevSearch').append(inputElement);
  })
};