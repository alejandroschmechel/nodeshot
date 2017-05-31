var webshot = require('webshot');
var fs      = require('fs');

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
, top: '120px'
, bottom: 0 }
};

// var renderStream = webshot('https://twitter.com/alejandro_bs/status/842834893403013120', '', options);
// var file = fs.createWriteStream('google.png', {encoding: 'binary'});
//
// renderStream.on('data', function(data) {
//   file.write(data.toString('binary'), 'binary');
// });

var forms = require('forms');
var fields = forms.fields;
var validators = forms.validators;

var reg_form = forms.create({
    username: fields.string({ required: true }),
    password: fields.password({ required: validators.required('You definitely want a password') }),
    confirm:  fields.password({
        required: validators.required('don\'t you know your own password?'),
        validators: [validators.matchField('password')]
    }),
    email: fields.email()
});

reg_form.toHTML();
