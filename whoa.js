var min = 0;
var max = .5;
var factor = 20;

function slideToVal(num) {
  return min+(max-min)*(Math.pow(factor,parseFloat(num/100))-1)/(factor-1);
}
function valToSlide(num) {
  return (Math.log(1+((num-min)/(max-min))*(factor-1))/Math.log(factor))*100;
}

$(document).ready(function(){
  //on load stuff
  $("#cutoff").val(init.cutoff);
  $("#rise").val(init.rise);
  $("#decay").val(init.decay);

  loadCategories();

  //memory
  var lastName;

  //events

  $("#rise").change(function() {
   init.rise = Number($("#rise").val());
   if (init.rise < 0) {
     init.rise = 0;
     $(this).val(init.rise);
   }
   console.log(init.rise);
   $('#riseslider').slider('value',valToSlide($(this).val()));
  });
  $("#riseslider").slider({
    slide: function( event, ui ) {}
  });
  $('#riseslider').slider('value',valToSlide($('#rise').val()));
  $('#riseslider').on("slide",function() {
    $('#rise').val(slideToVal($(this).slider('value')));
    init.rise =slideToVal($(this).slider('value'));
  })

  $("#decay").change(function() {
   init.decay = Number($("#decay").val());
   if (init.decay < 0) {
     init.decay = 0;
     $(this).val(init.decay);
   }
   console.log(init.decay);
   $('#decayslider').slider('value',valToSlide($(this).val()));
  });
  $("#decayslider").slider({
    slide: function( event, ui ) {}
  });
  $('#decayslider').slider('value',valToSlide($('#decay').val()));
  $('#decayslider').on("slide",function() {
    $('#decay').val(slideToVal($(this).slider('value')));
    init.decay =slideToVal($(this).slider('value'));
  })

  $('.cats').on('focus','.name',function() {
   lastName = $(this).val();
   console.log(lastName);
  })

  $('.cats').on('change','.name',function() {
   if (init.categories[$(this).val()] == null) {
     init.categories[$(this).val()] = init.categories[lastName];
     delete init.categories[lastName];
   } else {
     $(this).val(lastName);
   }
   console.log(init.categories);
  })

  $('.cats').on('change','.startdate',function() {
   init.categories[$(this).parent().siblings(".name").val()][0] = dateToInd($(this).datepicker('getDate'));
   console.log(init.categories);
  })

  $(".cats").on("change",".priority",function() {
   init.categories[$(this).parent().siblings(".name").val()][1] = Number($(this).val());
   console.log(init.categories);
  })

  $("#addcat").click(function() {
   appendNewCategory();
  })

  $('.cats').on('click','.del',function() {
   delete init.categories[$(this).parent().siblings('.name').val()];
   $(this).parents("li").remove();
  })

  $('.gen').click(function() {
    console.log("generate");
    updateResults();
  })

  $('#past').change(function(event) {
   var input = event.target;

   var reader = new FileReader();
   reader.onload = function(){
     var text = reader.result;
     console.log(reader.result.substring(0, 200));
     try {
       past=JSON.parse(text);
       chartIt();
     }
     finally {
       console.log(past);
     }
   };
   reader.readAsText(input.files[0]);
   $('#pastrep').text(event.target.files[0].name);
  })

  $('#download').click(function() {
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(past,null, "\t"));
    var downloadObject = document.createElement("a");
    downloadObject.setAttribute("href", dataStr);
    downloadObject.setAttribute("download", "scene.stack");
    document.body.appendChild(downloadObject);
    downloadObject.click();
    document.body.removeChild(downloadObject);
  })

  $('#init').change(function(event) {
    var input = event.target;

    var reader = new FileReader();
    reader.onload = function(){
      var text = reader.result;
      console.log(reader.result.substring(0, 200));
      try {
        init=JSON.parse(text);
        reverseUpdate();
      }
      finally {
        console.log(init);
      }
    };
    reader.readAsText(input.files[0]);
    $('#initrep').text(event.target.files[0].name);
  })

  $('#downloadi').click(function() {
    updateInit();
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(init,null, "\t"));
    var downloadObject = document.createElement("a");
    downloadObject.setAttribute("href", dataStr);
    downloadObject.setAttribute("download", "init.aai");
    document.body.appendChild(downloadObject);
    downloadObject.click();
    document.body.removeChild(downloadObject);
  })

  $.widget('custom.legend', {
   options: {
     colors : {1:"#ffdddd"},
     oldKey: "",
     selected : null,
     calRef : $(".acalendar")
   },
   _create: function() {
     this.element.addClass('legend');
     this.refresh();

     this._on( {
       "click .legend-plus" : function() {
         this._add();
       },
       "click .legend-del" : function(event) {
         this._remove($(event.target).siblings(".legend-time").val());
         $(event.target).parent().remove();
       },
       "mouseenter .legend-time" : function(event) {
         this.options.oldKey = $(event.target).val();
         console.log(this.options.oldKey);
       },
       "focus .legend-time" : function(event) {
         this.options.oldKey = $(event.target).val();
         this._select($(event.target).parent());
         console.log(this.options.oldKey);
       },
       "change .legend-time" : function(event) {
         $(event.target).val(this._changeKey($(event.target).val()));
       },
       "click .cut" : function() {
         this.options.selected = "cutoff";
         $(this.element).find(".selected").removeClass("selected");
         $(this.element).find(".cut").addClass("selected");
       }
     } );
   },
   _select: function(target) {
     this.options.selected = $(target).children(".legend-time").val();
     $(this.element).find(".selected").removeClass("selected");
     $(target).addClass('selected');
   },
   _displayNew: function(time,_color) {
     var item = $("<li></li>");
     var displayTime = $("<input type = \"number\" class = \"legend-time\"></input>").val(time);
     var displayColor =$("<input type = \"text\"></input>").val(_color);
     var del = $("<button class=\"legend-del\">X</button>");
     item.append(displayTime,displayColor,del);
     $(this.element).prepend(item);
     this._select(item);
     $(displayColor).spectrum({
       className: 'legend-color',
       change : function(color) {
         var _legend = $(this).parents(".legend");
         _legend.legend("changeColor",$(this).siblings(".legend-time").val(),color.toHexString());
         console.log(_legend.legend("option"));
       }
     });
   },
   refresh: function() {
     this.selected = null;
     $('.legend').empty();
     $(this.element).append($("<button></button>").text("cutoff").addClass("cut"));
     for (color in this.options.colors) {
       this._displayNew(color,this.options.colors[color]);
     }
     var plusItem = $("<button class = \"legend-plus\">+</button>");
     $(this.element).append(plusItem);
   },
   _add: function() {
     var defaultColor = "#999999";
     var defaultKey = 15;
     while (this.options.colors[defaultKey] != null) {
       defaultKey += 15;
     }
     this.options.colors[defaultKey] = defaultColor;
     this._displayNew(defaultKey,defaultColor);
   },
   _remove: function(key) {
     this.options.calRef.acalendar('deleteColor',key)
     delete this.options.colors[key];
   },
   _changeKey: function(newKey) {
     if (this.options.colors[newKey] == null) {
       if (this.options.selected == this.options.oldKey) {
         this.options.selected = newKey;
       }

       this.options.colors[newKey] = this.options.colors[this.options.oldKey];
       delete this.options.colors[this.options.oldKey];
       this.options.calRef.acalendar('changeTime',this.options.oldKey,newKey);
       this.options.oldKey = newKey;
     }
     return this.options.oldKey;
   },
   changeColor: function(key,color) {
     this.options.colors[key] = color;
     this.options.calRef.acalendar('changeColor',key,color);
   }
  });

  $.widget('custom.acalendar', {
   options: {
     times : {},
     year : (new Date()).getFullYear(),
     month : (new Date()).getMonth(),
     mos : ['January','February','March','April','May','June','July','August','September','October','November','December'],
     day : ['Sun', 'Mon', 'Tue', 'Wed' , 'Thu', 'Fri', 'Sat'],
     cutoff : dateToInd(new Date())-1,
     cutcolor : 'red',
     legendRef : $(".legend")
   },
   _create : function() {
     this.element.addClass("acalendar");
     this.refresh();

     this._on({
       "click .prevy" : function() {
         this.options.year--;
         $(this.element).children(".year").text(this.options.year);
         this._getDays();
       },
       "click .nexty" : function() {
         this.options.year++;
         $(this.element).children(".year").text(this.options.year);
         this._getDays();
       },
       "click .prevm" : function() {
         if (this.options.month > 0) {
           this.options.month--;
         } else {
           this.options.month = 11;
           this.options.year--;
           $(this.element).children(".year").text(this.options.year);
         }
         $(this.element).children(".month").text(this.options.mos[this.options.month]);
         this._getDays();
       },
       "click .nextm" : function() {
         if (this.options.month < 11) {
           this.options.month++;
         } else {
           this.options.month = 0;
           this.options.year++;
           $(this.element).children(".year").text(this.options.year);
         }
         $(this.element).children(".month").text(this.options.mos[this.options.month]);
         this._getDays();
       },
       "click .cell" : function(event) {
         var curr = new Date(this.options.year, this.options.month, parseInt($(event.target).text()));

         if (this.options.legendRef.legend("option","selected") != null) {
           if (this.options.legendRef.legend("option","selected") == "cutoff") {
             this.options.cutoff = dateToInd(curr);
             $(this.element).find(".cellcut").removeClass("cellcut").css('border-color','');
             $(event.target).addClass("cellcut").css('border-color',this.options.cutcolor);
           } else if (this.options.times[dateToInd(curr)] == null) {
             this.options.times[dateToInd(curr)] = this.options.legendRef.legend("option","selected");
             $(event.target).addClass("cell-"+this.options.legendRef.legend("option","selected"));
             $(event.target).css('background-color',this.options.legendRef.legend("option","colors")[this.options.legendRef.legend("option","selected")]);
           } else {
             delete this.options.times[dateToInd(curr)];
             $(event.target).removeClass("cell-"+this.options.legendRef.legend("option","selected"));
             $(event.target).css('background-color','');
           }
         }
       }
     })
   },
   refresh : function() {
     $(this.element).empty();

     $(this.element).append($("<button></button>").addClass("prevy").text("<<"));
     $(this.element).append($("<span></span>").addClass("year").text(this.options.year));
     $(this.element).append($("<button></button>").addClass("nexty").text(">>"));

     $(this.element).append($("<br>"));

     $(this.element).append($("<button></button>").addClass("prevm").text("<"));
     $(this.element).append($("<span></span>").addClass("month").text(this.options.mos[this.options.month]));
     $(this.element).append($("<button></button>").addClass("nextm").text(">"));

     $(this.element).append($("<table></table>").addClass("dates"));
     this._getDays();
   },
   _getDays : function() {
     var dates = $(this.element).children(".dates");
     dates.empty();

     var dayRow = $("<tr></tr>");
     for (i = 0; i < 7; i++) {
       dayRow.append($("<td></td>").text(this.options.day[i]));
     }
     dates.append(dayRow);

     var firstDay = new Date(this.options.year,this.options.month,1);
     var lastDay = new Date(this.options.year,this.options.month+1,0);
     var offset = firstDay.getDay();

     var dayCount = 1;
     outerstuff : for (i = 0; i < 6; i++) {
       var newRow = $("<tr></tr>");
       for (j = 0; j < 7; j++) {
         if (offset <= 0) {
           var newButt = $("<button></button>").addClass("cell").text(dayCount);
           if (this.options.times[dateToInd(new Date(this.options.year,this.options.month,dayCount))] != null) {
             newButt.addClass("cell-"+this.options.times[dateToInd(new Date(this.options.year,this.options.month,dayCount))])
                .css('background-color',this.options.legendRef.legend('option','colors')[this.options.times[dateToInd(new Date(this.options.year,this.options.month,dayCount))]]);
           }
           if(this.options.cutoff == dateToInd(new Date(this.options.year,this.options.month,dayCount))) {
             newButt.addClass("cellcut").css('border-color',this.options.cutcolor);
           }
           newRow.append($("<td></td>").append(newButt));

           if (dayCount >= lastDay.getDate()) {
             dates.append(newRow);
             break outerstuff;
           }
           dayCount++;
         } else {
           newRow.append($("<td></td>"));
           offset--;
         }
       }
       dates.append(newRow);
     }
   },
   changeColor : function(key,color) {
     var all = $(this.element).find(".cell-"+key).get();

     for (cell in all) {
       $(all[cell]).css('background-color',color)
     }
   },
   deleteColor : function(value) {
     var times = this.options.times;
     Object.keys(times).map(function(key,index) {
       if (times[key] == parseInt(value)) {
         delete times[key];
       }
     })
     this.options.times=times;

     this.changeColor(value,'');

     var all = $(this.element).find(".cell-"+value).get();
     for (cell in all) {
       $(all[cell]).removeClass("cell-"+value);
     }
   },
   changeTime : function(oldKey,newKey) {
      var times = this.options.times;
      Object.keys(times).map(function(key,index) {
        if (times[key] == parseInt(oldKey)) {
          times[key] = newKey;
        }
      })
      this.option.times = times;

      var all = $(this.element).find(".cell-"+oldKey).get();
      for (cell in all) {
        $(all[cell]).removeClass("cell-"+oldKey);
        $(all[cell]).addClass("cell-"+newKey);
      }
   }
  })

  $('#test').legend({calRef : $('#test2')});
  $("#test2").acalendar({legendRef : $('#test')});

  $( ".accordion" ).accordion({
    heightStyle: "content"
  });

  $( "#tabs" ).tabs().addClass( "ui-tabs-vertical ui-helper-clearfix" );
  $( "#tabs li" ).removeClass( "ui-corner-top" ).addClass( "ui-corner-left" );

  $("#pickdate").datepicker().datepicker('setDate',new Date());
  $("#pickdate").change(function() {
    displayResults($("#currentDisplay"),$(this).datepicker('getDate'));
  })

  updateResults();

  //$(document).tooltip();
});

function updateInit() {
  init.dates = $("#test2").acalendar('option','times');
  init.cutoff = $("#test2").acalendar('option','cutoff');
  console.log(init.cutoff);
  init.colors = $("#test").legend('option','colors');
}

function updateResults() {
  updateInit();
  past = generate(init,past);
  console.log(past);

  $('#pickdate').trigger("change");
  displayAll();
  chartIt();
}

function reverseUpdate() {
  $("#test2").acalendar({cutoff : init.cutoff, times : init.dates})
  $("#test").legend({colors: init.colors});
  $("#test2").acalendar("refresh");
  $("#test").legend("refresh");
  loadCategories();
  $("#rise").val(init.rise);
  $("#decay").val(init.decay);
}

function displayResults(target,date) {
  target.empty();
  for (category in past) {
    if (past[category][dateToInd(date)] != null) {
      target.append($("<li></li>").text(category+" - "+Math.round(past[category][dateToInd(date)][0])+" min"));
    }
  }
}

function displayAll() {
  var target = $('#totalDisplay').empty();
  for (category in past) {
    target.append($('<span></span>').text("Category - "+category),$("<br>"));
    var list = $('<ul></ul>');
    for (date in past[category]) {
      list.append($('<li></li>').text(indToDate(date).toISOString().split('T')[0].replace('-','/').replace('-','/')+" - "
      +Math.round(past[category][date][0])+" min"));
    }
    target.append(list);
  }
}

function chartIt() {
  var traces = [];

  for (category in past) {
    var aside = Object.keys(past[category]);
    var trac = {
      x: aside.map(function (k) {
        var temp = indToDate(k);
        return temp.getFullYear()+'-'+(temp.getMonth()+1)+'-'+(temp.getDate()+1);
      }),
      y: aside.map(function (k) {
        return past[category][k][0];
      }),
      type:"scatter",
      name:category};
    console.log(trac);
    traces.push(trac);
  }
  var layout = {
    showlegend: true,
    xaxis: {
      type: 'date',
      title: 'date',
      titlefont: {
        family: 'Courier New, monospace',
        size: 18,
        color: '888888'
      }
    },
    yaxis: {
      title: 'time',
      titlefont: {
        family: 'Courier New, monospace',
        size: 18,
        color: '888888'
      }
    }
  }
  console.log(traces);
  Plotly.react(document.getElementById("chart"),traces,layout);
}

function dateToInd(dateObj) {
  return Date.UTC(dateObj.getFullYear(),dateObj.getMonth(),dateObj.getDate())/(24*3600*1000);
}
function indToDate(ind) {
  return new Date(ind*24*3600*1000);
}

function loadCategories() {
 $(".cats").empty();
 for (category in init.categories) {
   $(".cats").append(newCategory(category));
 }
}

function appendNewCategory() {
 var defaultName = "default";
 var i = 0;
 while (init.categories[defaultName+i] != null) {
   i++;
 }
 defaultName += i;
 init.categories[defaultName] = [dateToInd(new Date()),1];
 $(".cats").append(newCategory(defaultName));
}

function newCategory(category) {
 var item = $("<li></li>");
 var right = $("<span></span>").addClass("right");
 var name = $("<input type = \"text\" class=\"name\"></input>").val(category).attr("title","Category name");
 var date = $("<input type = \"text\" class=\"startdate\"></input>").attr("title","Introduction date");
 date.datepicker().datepicker('setDate',indToDate(init.categories[category][0]));
 var priority = $("<input type = \"number\" class=\"priority\"></input>").val(init.categories[category][1]).attr('title',"Weight (higher is higher)");
 var del = $("<button class=\"del\"></button>").text("X").attr('title',"Delete");
 right.append(date,priority,del);
 item.append(name,right);
 return item;
}
