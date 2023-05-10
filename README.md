# tick_tech_intern_project
This is an assignment for intrenship in Ticktech IT Solutions.

# Clustered REST API with in-memory data consistency using Node.js

Description:

This Node.js project is a clustered REST API that implements load balancing and in-memory data consistency across different processes using Inter-Process Communication (IPC). The API provides endpoints for managing users data, which is stored in memory.

To achieve load balancing, the project uses Node.js' built-in clustering module, which allows multiple Node.js processes to share the same server port. The master process forks multiple worker processes, each handling incoming requests independently. The number of worker processes can be configured based on the available resources and expected traffic.

To ensure data consistency across the worker processes, the project uses Node.js' IPC mechanism. Each worker process listens for IPC messages from the master process, which acts as a central coordinator. When a user makes a change to the data through the API, the worker process sends a message to the master process, which in turn broadcasts the message to all other worker processes, so they can update their local copy of the data.

The API provides the following endpoints for managing users data:

- GET /users: Returns a list of all users in the system

- GET /users/:id Returns the user with the specified ID

- POST /users Creates a new user with the given data

- PUT /users/:id Updates the user with the specified ID with the given data

- DELETE /users/:id Deletes the user with the specified ID

All data is stored in memory, using a simple JavaScript object as a database. This approach simplifies the implementation and avoids the overhead of an external database or framework. However, it also means that the data is not persistent and will be lost when the server process is restarted.

The project does not use any external 3rd party modules or frameworks, relying solely on Node.js built-in features.

Overall, this project demonstrates how to build a scalable, high-performance REST API using Node.js' clustering and IPC features, while keeping the implementation simple and lightweight by using an in-memory database.
