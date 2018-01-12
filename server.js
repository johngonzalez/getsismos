var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();
var Converter = require("csvtojson").Converter;
var converter = new Converter({});
var mkdirp = require('mkdirp');

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'

 converter.fromFile("./reporte_sismicidad.csv",function(err, sismos){
//     // if an error has occured then handle it
     if(err){
         console.log("An Error Has Occured");
         console.log(err);
     }
    for (i = 12; i < 21/*sismos.length*/; i++) {
      var baseurl = 'https://bdrsnc.sgc.gov.co/sismologia1/HCG/acelerografos/consultas/consulta_general/';
      var date = sismos[i].field1.split('/');
      var time = sismos[i].field2.split(':');
      var year = date[0];
      var month = date[1];
      var day = date[2];
      var hour = time[0];
      var minute = time[1];
      var second = time[2];
      url2 = baseurl +
      'respuesta2.php?' +
      'idsismo=' + year + month + day + hour + minute + second + '&' +
      'latitud=' + sismos[i].field5 + '&' +
      'fecha=' + sismos[i].field1 + '&' +
      'hora=' + sismos[i].field2 + '&' +
      'longitud=' + sismos[i].field6 + '&' +
      'profundidad=' + sismos[i].field7 + '&' +
      'magnitud=' + sismos[i].field8 + '&' +
      'dm=' + sismos[i].field3 + '/' + sismos[i].field4 + '&' +
      'magnitudmw=' + sismos[i].field9;

      request(url2, function(error, response, html){
        if(error){
          console.log(error);
        }
        else{

            var $ = cheerio.load(html);
            var $center = $('center').eq(3);
            var $td;
            var url3;
            var folder = year + '/' + month;
            var filename;
            //mkdirp(folder, function(err) {

              $center.find('tr').each(function(i, el) {
                if(i>0){
                  $td = $(this).find('td').eq(14);
                  url3 = $td.find('a').attr('href');
                  console.log(url3);

                  filename = url3.split('/')[2];
                  url3 = baseurl + url3;

                  request(url3).on('response', function(res){
                    console.log('Downloading ' + filename);
                    res.pipe(fs.createWriteStream('./' + folder + '/' + filename));
                  });
                }
              });

            //});



          }
    })
  }
})

app.listen('8081')
console.log('Magic happens on port 8081');
exports = module.exports = app;
