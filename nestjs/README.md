# API
In this file, you'll find the explanation of each api created in the back-end. 
*Note: array/object format is file.json*  

## /auth/
| Method | Root | Parameters | Return    |
|:----:|:-----:|-------|:-----------|
|GET| login| - |1st time: user logins 42 and gives auth (back-end creates user)<br />2nd time: login only<br />*redirect to localhost:3000(frond-end)*|
## /profile/
| Method | Root | Parameters | Return    |
|:----:|:-----:|-------|:-----------|
|GET|me|-|an object<br />`{"id":1,"nickname":"Foo","createDate":"xxx"}`|
|GET|all|-|an array with objects<br />`[{"id":1,"nickname":"Foo","createDate":"xxx"}, {...}, {...}...]`|
|GET|:id|user's id number|an object<br />`{"id":1,"nickname":"Foo","createDate":"xxx"}`|
|POST||Body <br />`{"id": number, "nickname":"alphanumeric string"}`|an object<br />`{"id":2,"nickname":"Bar","createDate":"xxx"}`<br /> *for testing only, delete later*|
|PATCH|name|Body <br />`{"nickname":"alphanumeric string(unique)"}`|an object with user's new nickname<br />`{"id":2,"nickname":"lolo","createDate":"xxx"}`|
## /game/