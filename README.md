# nbaDatabase - Authors [Daniel Lisko](https://github.com/djlisko01) and [Michael Chang](https://github.com/michaelchang106)

## NBA database for DBMS Project 2 - CS 5200

## Business Requirements and Logical/Conceptual Models

[Business Requirements PDF](./BusReq_Heirarchal_tables/Business_Requirements_and_Models_and_BCNF.pdf)

[Business Requirements in Google Docs](https://docs.google.com/document/d/13wTtEmC-XXSWzubHSJDg0rDB8sXb62t-KJJM-X4vpMg/edit?usp=sharing)

### Conceptual Model

![Conceptual Model](./BusReq_Heirarchal_tables/NBA2021-2022_Conceptual_Model_CS5200.png)

[Conceptual Model Lucid Chart](https://lucid.app/lucidchart/728904b6-3eac-41ee-9c80-cc89d811dc4c/edit?viewport_loc=-449%2C-71%2C3131%2C1496%2C0_0&invitationId=inv_bc674f57-3cb0-483b-8c06-247711741271)

### Heirarchal Model

[NBA-HeiarchalTables-JSON-Examples](./BusReq_Heirarchal_tables/NBA-HeiarchalTables-JSON-Examples.pdf)
[Heirarchal Model Lucid Chart](https://lucid.app/lucidchart/e3295927-79f1-4176-bfd1-29a7fae585fe/edit?viewport_loc=-3080%2C-56%2C3328%2C1400%2C0_0&invitationId=inv_60206c0a-d083-4538-a24a-087f8aac8f4d)

### Heirarchal Model refactored from Logical model below
[Logical Model Lucid Chart](https://lucid.app/lucidchart/f8b731fe-7480-4e96-b786-84ca747ef028/edit?viewport_loc=-303%2C16%2C2219%2C1012%2C0_0&invitationId=inv_b1efe1a2-5c17-497c-80c0-568e9ae0d801)

## Division of works and tasks

### Both team members collaborated and contributed evenly on the design and implementation of the database with MongoDB, LucidChart, and Google Suite

### [Michael Chang](https://github.com/michaelchang106) created the CRUD Operations and interface for Games table and developed the 5-6 queries on the Games Collection.

### [Daniel Lisko](https://github.com/djlisko01) created the CRUD Operations and interface for Players table (and inherently Employees) and developed the 5-6 queries on the Employees Collection.

## Execution of project

- Download the code to your preferred directory
- Open that directory with your preferred terminal
- type "npm install" and hit enter
- [follow guide to install mongo](https://docs.mongodb.com/manual/tutorial/manage-mongodb-processes/)
- TLDR:
  - "brew tap mongodb/brew"
  - "brew install mongodb-community@5.0" 
  - "brew services start mongodb-community@5.0"
- type "npm start" and hit enter
  - mongoDB data should be restored using "mongorestore", if failed, type "mongorestore" manually in terminal
- Michael's 5-6 mongo queries will run into the terminal. can read results in terminal and browse code located [in the databse folder](./database/nbaDBMongoQueries.js)
  - queries should run automtically, if not type "npm "
- Daniel's 5-6 mongo queries will run into the terminal. can read results in terminal and browse code located [in the databse folder](./database/dbQuery.js)
- navigate to "http://localhost:3000/" in your preferred browser
- use our developed interface to perform CRUD operations on the Employees -> Players & Coaches, and Games Tables
