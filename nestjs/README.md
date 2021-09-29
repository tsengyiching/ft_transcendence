# API
In this file, you'll find the list of api created in the back-end.

## /auth/
| Method | Root | Parameters | Return    |
|:----:|:-----:|-------|:-----------|
|GET| login| - |1st time: user logins 42 and gives auth (back-end creates user)<br />2nd time: login only<br />*redirect to localhost:3000(frond-end)*|
## /profile/
| Method | Root | Parameters | Return    |
|:----:|:-----:|-------|:-----------|
|GET|me|-|an object<br />`{"id":1,"nickname":"Foo","createDate":"xxx"}`|
|GET|all|-|an array contains objects<br />`[{"id":1,"nickname":"Foo","createDate":"xxx"}, {...}, {...}...]`|
|GET|:id|user id|an object<br />`{"id":1,"nickname":"Foo","createDate":"xxx"}`|
|POST||Body <br />`{"nickname":"alphanumeric string (len 10 max, and unique)"}`|an object<br />`{"id":2,"nickname":"Bar","createDate":"xxx"}`<br /> *For testing only, delete later*|
|PATCH|name|Body <br />`{"nickname":"alphanumeric string (len 10 max, and unique)"}`|an object with user's new nickname<br />`{"id":2,"nickname":"lolo","createDate":"xxx"}`|
## /game/
| Method | Root | Parameters | Return    |
|:----:|:-----:|-------|:-----------|
|GET|all|-|an array contains objects<br />`[{"id": 5, "mode": 1, "status": "Ongoing/Finish", "createDate": "xxx", "updateDate": "xxx", "leftUserId": 3, "leftUserScore": 10, "rightUserId": 1, "rightUserScore": 2,"winnerId": 3}, {}...]`<br />*If a game hasn't finished yet, winner value is null.*|
|GET|ongoing|-|an array contains objects<br />`[{"id": 5, "mode": 1, "createDate": "xxx", "leftUserId": 2, "rightUserId": 1}, {}...]`|
|GET|:id|game id|an object<br />`{"id": 5, "mode": 1, "status": "Ongoing/Finish", "createDate": "xxx", "updateDate": "xxx", "leftUserId": 3, "leftUserScore": 10, "rightUserId": 1, "rightUserScore": 2,"winnerId": 3}`<br />*If a game hasn't finished yet, winner value is null.*|
|GET|me/records|-|an array contains objects<br />`[{"gameId": 2, "mode": 1, "createDate": "xxx", "updateDate": "xxx", "userScore": 10, "opponentId": 4, "opponentScore": 1, "userGameStatus": "Won/Lost"}, {}...]`|
|GET|:id/records|user id|an array contains objects<br />`[{"gameId": 2, "mode": 1, "createDate": "xxx", "updateDate": "xxx", "userScore": 10, "opponentId": 4, "opponentScore": 1, "userGameStatus": "Won/Lost"}, {}...]`|
|POST||Body<br />`{"mode": 1, "leftUserId": 1, "rightUserId": 2}`<br />*mode: number (enum ?) modify later*|an object with game's mode, id, create time and ongoing status. <br />`{"mode": 1, "id": 7, "createDate": "xxx", "status": 1}`|
|PATCH|:id|game id<br />`{"leftUserScore": number, "rightUserScore": number}`|an object with all details<br />`{"id": 9, "mode": 1, "createDate": "xxx", "updateDate": "xxx", "status": 0, "userGameRecords": [{"id": 16, "userId": 5678, "gameId": 9, "score": 9},{"id": 17,"userId": 60191,  "gameId": 9, "score": 6}], "winner": {"id": 5678, "nickname": "Tim","createDate": "xxx"}}`|