## Adaptive Replacement Cache Demo
---

#### Setup Instructions
---
1. Host the contents of this repo in your server.
2. Edit the contents of the file 'config.json' with your **MYSQL Database** credentials.


##### config.json
~~~~ json
"{
    "host":"Your-mysql-db-host-address",
    "db_user":"your-db-username",
    "db_pwd":"your-db-password"
}"
~~~~
3. Once hosted and edited the config.json file, fire the setup in your browser and initilate the Sample Database data using **Initialize Setup** button
4. Search for any __word__ from the list on the left of the page to see the code in action. 
---

#### Technologies Used
---
1. **Angular** for Front-end design and ARC cache logic.
2. **PHP** (in combination with SLIM Framework) for Necessary API's
3. MYSQL Database for storing and fetching data
---
#### Working
----
1. The Setup fetches a key from Database, if a key is not already present in the Cache. Adaptive Replacement Cache Algorithm is used to manage Cache.
2. Whenever a key is removed from Cache, it is stored in a Table called, "evicted" keys just for testing purposes of this setup.

`P.S: Clicking on **Initialize Setup** re-sets the whole system, including Tables and Cache.`