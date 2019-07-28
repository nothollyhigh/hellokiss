var fs = require('fs');

// npm i pako
var pako = require('pako');

var test = { my: 'super', puper: [456, 567], awesome: 'pako' };

var compressed = pako.gzip(JSON.stringify(test), {});
console.log("--- 111 compressed data:", String.fromCharCode.apply(null, compressed));

// 压缩过的数据写到文件 data.bin
fs.writeFile('data.bin', Buffer.from(compressed),  function(err) {
   if (err) {
       return console.error(err);
   }

   // 从文件读取压缩过的数据
   fs.readFile('data.bin', function (err, data) {
      if (err) {
         return console.error(err);
      }

      // 解析
      var origin = JSON.parse(pako.ungzip(data, { to: 'string' }));
      console.log("--- 222 origin data:", origin);
   });
});
