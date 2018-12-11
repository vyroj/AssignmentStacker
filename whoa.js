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
    3:30,
    6:30,
    9:30,
    12:30,
    15:30,
    18:30,
    21:30,
    24:30,
    27:30,
    30:30,
    33:30,
    36:30,
    39:30,
    42:30,
    45:30,
    48:30
  }
}

$(document).ready(function(){
  //on load stuff
  $("#cutoff").val(filter.cutoff);
  $("#rise").val(filter.rise);
  $("#decay").val(filter.decay);

  loadCategories();

  //memory
  var lastName;

  //events
  $("#cutoff").datepicker();
  $("#cutoff").change(function() {
    filter.cutoff = dateToInd($("#cutoff").datepicker('getDate'));
    console.log(filter.cutoff);
  });

  $("#rise").change(function() {
   filter.rise = Number($("#rise").val());
   console.log(filter.rise);
  });

  $("#decay").change(function() {
   filter.decay = Number($("#decay").val());
   console.log(filter.decay);
  });

  $('#cats').on('focus','.name',function() {
   lastName = $(this).val();
   console.log(lastName);
  })

  $('#cats').on('change','.name',function() {
   if (init.categories[$(this).val()] == null) {
     init.categories[$(this).val()] = init.categories[lastName];
     delete init.categories[lastName];
   } else {
     $(this).val(lastName);
   }
   console.log(init.categories);
  })

  $('#cats').on('change','.startdate',function() {
   init.categories[$(this).siblings(".name").val()][0] = dateToInd($(this).datepicker('getDate'));
   console.log(init.categories);
  })

  $("#cats").on("change",".priority",function() {
   init.categories[$(this).siblings(".name").val()][1] = Number($(this).val());
   console.log(init.categories);
  })

  $("#addcat").click(function() {
   appendNewCategory();
  })

  $('#cats').on('click','.del',function() {
   delete init.categories[$(this).siblings('.name').val()];
   $(this).parent().remove();
  })

  $('#gen').click(function() {
    init.dates = $("#test2").acalendar('option','times');
    console.log(generate(init,past,filter));
  })

  $('#past').change(function(event) {
   var input = event.target;

   var reader = new FileReader();
   reader.onload = function(){
     var text = reader.result;
     console.log(reader.result.substring(0, 200));
     try {
       past=JSON.parse(text);
     }
     finally {
       console.log(past);
     }
   };
   reader.readAsText(input.files[0]);
  })

  $('#download').click(function() {
    init.dates = $("#test2").acalendar('option',times);
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(generate(init,past,filter),null, "\t"));
    var downloadObject = document.createElement("a");
    downloadObject.setAttribute("href", dataStr);
    downloadObject.setAttribute("download", "scene.stack");
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
     this._refresh();

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
   _refresh: function() {
     $('.legend').empty();
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
     legendRef : $(".legend")
   },
   _create : function() {
     this.element.addClass("acalendar");
     this._refresh();

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
           if (this.options.times[dateToInd(curr)] == null) {
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
   _refresh : function() {
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
             newButt.addClass("cell-"+dateToInd(new Date(this.options.year,this.options.month,dayCount)))
                .css('background-color',this.options.legendRef.legend('option','colors')[this.options.times[dateToInd(new Date(this.options.year,this.options.month,dayCount))]]);
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
       if (times[key] == value) {
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
        if (times[key] == oldKey) {
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
});

function dateToInd(dateObj) {
  return Date.UTC(dateObj.getFullYear(),dateObj.getMonth(),dateObj.getDate())/(24*3600*1000);
}
function indToDate(ind) {
  return new Date(ind*24*3600*1000);
}

function loadCategories() {
 $("#cats").empty();
 for (category in init.categories) {
   $("#cats").append(newCategory(category));
 }
}

function appendNewCategory() {
 var defaultName = "default";
 var i = 0;
 while (init.categories[defaultName+i] != null) {
   i++;
 }
 defaultName += i;
 init.categories[defaultName] = [1,1];
 $("#cats").append(newCategory(defaultName));
}

function newCategory(category) {
 var item = $("<li></li>");
 var name = $("<input type = \"text\" class=\"name\"></input>").val(category);
 var date = $("<input type = \"text\" class=\"startdate\"></input>").val(init.categories[category][0]);
 date.datepicker();
 var priority = $("<input type = \"number\" class=\"priority\"></input>").val(init.categories[category][1]);
 var del = $("<button class=\"del\"></button>").text("delete");
 item.append(name,date,priority,del);
 return item;
}
