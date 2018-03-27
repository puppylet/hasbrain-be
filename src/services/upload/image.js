const AWS = require('aws-sdk');
AWS.config.loadFromPath('../../s3.json');
const s3Bucket = new AWS.S3( { params: {Bucket: 'hasBrain'} } );

buf = new Buffer(req.body.imageBinary.replace(/^data:image\/\w+;base64,/, ""),'base64')
const data = {
  Key: req.body.userId,
  Body: buf,
  ContentEncoding: 'base64',
  ContentType: 'image/jpeg'
};
s3Bucket.putObject(data, function(err, data){
  if (err) {
    console.log(err);
    console.log('Error uploading data: ', data);
  } else {
    console.log('succesfully uploaded the image!');
  }
});