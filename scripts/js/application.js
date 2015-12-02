// note: change "dannguyen" to "sashaperigo" if pull request is accepted
// note: this is temp hacky hacky javascript that will be done much better as
//   part of a framework such as Jekyll...however, it is lightweight and flexible
//   enough to serve as a stand-in while the schema is being fleshed out
// i.e. it should adapt to increasing/decreasing columns...though it expects
// a few conventions (e.g. '#' or '%' to be in the name of a numeric column)

var CSV_URL = 'https://raw.githubusercontent.com/dannguyen/csprof-diversity-data/master/data.csv';
var SOURCE_COL_NAME = 'Source',
    METHODOLOGY_COL_NAME = 'Notes on methodology';
(function(){
  Papa.parse(CSV_URL, {
    download: true,
    dynamicTyping: true,
    header: false, // No need to do associative array indexing. These things confuse me in JS...
    complete: function(results) {
      var rows = results.data;
      console.info(rows.length + " rows parsed from: " + CSV_URL);
      // add header
      var headers = rows[0]
      var header_str = headers.map(function(h){
        if(h.includes('#') || h.includes('%')){
          return "<th data-sort-method='number' class='number'>" + h + "</th>";
        }else if([SOURCE_COL_NAME, METHODOLOGY_COL_NAME].indexOf(h) > -1){
          return "";  // # thse two columns are concated later
        }else{
          return "<th>" + h + "</th>";
        }
      }).join("") + "<th>Source/Notes</th>";
      // add it to the DOM
      document.getElementById("schools-table-header-row")
              .insertAdjacentHTML("beforeend", header_str);

      // now iterate through the rest of the rows
      for (var i = 1, nrows = rows.length - 1; i < nrows; i++){
        var row = rows[i];
        var row_str = "<tr>";

        // now iterate through the headers
        for(var j = 0, ncols = headers.length; j < ncols; j++) {
          var key = headers[j], val = row[j];
          // temp-hack: concat these two fields at the end into a single field
          // (look at the next block)
          if(key != SOURCE_COL_NAME && key != METHODOLOGY_COL_NAME){

            // for columns that should contain numbers,
            // force numerical sort
            if(key.includes('#') || key.includes('%')){
              var tdclass = "number";
              var sort_val = val.toString().match(/^([0-9.]+)[ %]*?$/);
              if(sort_val == null){
                sort_val = -99999; // make blank if not a number
              }else{
                sort_val = sort_val[1];
                val = (Math.round(sort_val * 10) / 10).toFixed(1);
              }
            }else{
              var tdclass = "text";
              var sort_val = val.replace(/"/g, '');
            }

            row_str += "<td class=\"" + tdclass + "\" data-sort=\"" + sort_val + "\">" + val + "</td>";

          }
        }
        // that temp-hack: concat source and methodology into one field
        // for the Source column
        // make it a link so the cell isn't super long
        var sval = row[headers.indexOf(SOURCE_COL_NAME)],
            mval = row[headers.indexOf(METHODOLOGY_COL_NAME)];
        var zz =  "<td>" + mval + "<br>" +
                   "<a href=\"" + sval + "\">" +
                    sval.split('//')[1].split('/')[0]
                    + "</a>" + "</td>";
        row_str += zz + "</tr>";

        document.getElementById("schools-table-body").insertAdjacentHTML("beforeend", row_str);
      }

      // now sort the darn thing
      new Tablesort(document.getElementById("schools-table"));


    }
  });
}());
