const s3 = require('../../s3')
const config = {
  bucket: s3.bucket,

  aws: {
    path: 'skills/',
    region: 'ap-southeast-1',
    acl: 'public-read',
    accessKeyId: s3.access_key,
    secretAccessKey: s3.secret
  },

  cleanup: {
    original: true,
    versions: true
  },

  versions: [
    {
      maxHeight: 320,
      maxWidth: 320,
      format: 'jpg',
      suffix: 'large',
    },
    {
      maxHeight: 160,
      maxWidth: 160,
      format: 'jpg',
      suffix: 'medium',
    }
  ]
}

module.exports = config;
