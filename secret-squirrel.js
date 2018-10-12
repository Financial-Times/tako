module.exports = {
  files: {
    allow: ['.env.example', '.npmrc', '.nvmrc'],
    allowOverrides: []
  },
  strings: {
    deny: [],
    denyOverrides: [
      'c29d1180-c8a6-11e8-92c2-f3141da0d6da', // README.md:5
      'e65c5980-c89e-11e8-90b7-06e060217de1', // README.md:7
      'adam@braimbridge\\.com' // package.json:5
    ]
  }
};
