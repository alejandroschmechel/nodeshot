'use strict';

var webshot = require('webshot');
var fs      = require('fs');
var archiver = require('archiver');
var archive = archiver('zip');
var path = require('path');
var mime = require('mime');
var http = require('http'),
    util = require('util'),
    fs = require('fs'),
    forms = require('forms'),
    jsontemplate = require('./json-template');

var options = {
      screenSize: {
        width: 1024
      , height: 910
      }
    , shotSize: {
        width: 640
      , height: 812
      }
      ,shotOffset: { left: 190
    , right: 0
    , top: '140px'
    , bottom: 0 }
    };

var fields = forms.fields,
    validators = forms.validators,
widgets = forms.widgets;

// template for the example page
var template = jsontemplate.Template(
    fs.readFileSync(__dirname + '/page.jsont').toString()
);

// our example registration form
var reg_form = forms.create({
    links: fields.string({ widget: widgets.textarea({ rows: 20, width: 200 }) }),
});

http.createServer(function (req, res) {
    reg_form.handle(req, {
        success: function (form) {
            var i = 0;
            var links = form.data.links;
            links = links.split("\r\n");
            var dir = './' + Math.floor(Date.now() /1000);
            var output = fs.createWriteStream(dir + '.zip');
            console.log(dir);
            if (!fs.existsSync(dir)){
                fs.mkdirSync(dir);
            }
            console.log(links);
            links.forEach(function(itlink){
              var renderStream = webshot(itlink, '', options);
              var file = fs.createWriteStream(dir + '/' + i + '.png', {encoding: 'binary'});
              i++;
              renderStream.on('data', function(data) {
                file.write(data.toString('binary'), 'binary');
              });

            });
            output.on('close', function () {
                console.log(archive.pointer() + ' total bytes');
                console.log('archiver has been finalized and the output file descriptor has closed.');
            });

            archive.on('error', function(err){
                throw err;
            });

            setTimeout(function(){
              archive.pipe(output);
              archive.glob(dir + '/*.png');
              archive.finalize();

              setTimeout(function(){
                var file = output.path;

                var filename = path.basename(file);
                var mimetype = mime.lookup(file);

                res.setHeader('Content-disposition', 'attachment; filename=' + filename);
                res.setHeader('Content-type', mimetype);

                var filestream = fs.createReadStream(file);
                filestream.pipe(res);
              }, 1000)
            }, 5000)
        },
        // perhaps also have error and empty events
        other: function (form) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(template.expand({
                form: form.toHTML(),
                enctype: '',
                method: 'GET'
            }));
        }
    });

}).listen(8080);

util.puts('Server running at http://127.0.0.1:8080/');
