var fs = require('fs-extra');
fs.copySync('test/src/', 'test/build/', { filter: /\.css$/ });
