var filter = {
  cutoff: 0,
  rise: .05,
  decay: .05
}
var init = {
  categories : {
    default : [1,1]
  },
  dates : {
  }
}

var past = {
  default : {
  }
}

function printo(database) {
  for (category in database) {
    console.log(category+":");

    var catKeys = Object.keys(database[category]);

    for (var j = 0; j < catKeys.length; j++) {
      console.log(catKeys[j]+","+database[category][catKeys[j]].toString());
    }
    console.log("--");
  }
}

function filtercut(past,filter) {
  var database = {};

  for (category in past) {
    var lines = {};
    var pastKeys = Object.keys(past[category]);

    outerloop : for (var i = 0; i < pastKeys.length; i++) {
      if (pastKeys[i] > filter.cutoff) {
        break outerloop;
      }

      lines[pastKeys[i]] = past[category][pastKeys[i]];
    }

    database[category] = lines;
  }

  return database;
}

function generate(init,past,filter) {
  var database = filtercut(past,filter);

  var datekeys = Object.keys(init.dates);

  for (var i = 0; i < datekeys.length; i++) {
    var total = 0;

    for (category in init.categories) {

      if (datekeys[i] > filter.cutoff && datekeys[i] >= init.categories[category][0]) {
        try {
          var basekeys = Object.keys(database[category]);

          var prevdate = basekeys[basekeys.length-1];
          var prevstrength = database[category][basekeys[basekeys.length-1]][1];
        }
        catch {
          database[category] = {};

          var prevdate = Number.MIN_SAFE_INTEGER;
          var prevstrength = 0;
        }

        //calculate c
        database[category][datekeys[i]] = [(1-Math.exp((prevdate-datekeys[i])/(1+prevstrength)))*init.categories[category][1],prevstrength];

        total += database[category][datekeys[i]][0];
      } else {
        database[category] = {};
      }
    }

    if (total > 0) {
      for (category in init.categories) {
        console.log(category);
        if (database[category][datekeys[i]] != null) {
          var basekeys = Object.keys(database[category]);

          var prevdate = basekeys.length > 1 ? basekeys[basekeys.length-2] : Number.MIN_SAFE_INTEGER;
          var altdate = basekeys.length > 1 ? basekeys[basekeys.length-2] : datekeys[i];
          var prevstrength = basekeys.length > 1 ? database[category][basekeys[basekeys.length-2]][1] : 0;

          //calculate a
          database[category][datekeys[i]][0] *= init.dates[datekeys[i]]/total;

          //calculate m
          database[category][datekeys[i]][1] += filter.rise*database[category][datekeys[i]][0]*(1-Math.exp((prevdate-datekeys[i])/(1+prevstrength))) - filter.decay*(datekeys[i]-altdate);
          if (database[category][datekeys[i]][1] < 0 ) {
            database[category][datekeys[i]][1] = 0;
          }
        }
      }
    }
  }

  return database;
}
