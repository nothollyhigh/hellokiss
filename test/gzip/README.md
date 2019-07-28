### install & run

```sh
npm i pako

node test.js

go run test.go
```

output:

```sh
PS gzip> node .\test.js
--- 111 compressed data:       «VÊ­T²R*.-H-RÒQ* ÓVÑ&¦f:¦fæ±:Jå©Åù¹©@5ÙùJµ ÝNæ1
--- 222 origin data: { my: 'super', puper: [ 456, 567 ], awesome: 'pako' }
PS gzip> go run test.go
--- 111 compressed data:       �VʭT�R*.-H-R�Q* �V�&�f:�f��:J�������@5���J� �N�1
--- 222 origin data: {"my":"super","puper":[456,567],"awesome":"pako"}
```