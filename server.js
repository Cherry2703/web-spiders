const express = require('express'); // Framework for building web applications
const app = express(); // Create an Express app instance
const port = process.env.PORT || 3004; // Port for the server, default to 3004 if not specified
const path = require('path'); // Module to work with file paths
const { open } = require('sqlite'); // SQLite module for database interaction
const sqlite3 = require('sqlite3'); // SQLite driver
const dbPath = path.join(__dirname, "./database.db"); // Path to the database file
const cors = require('cors'); // Middleware to enable CORS

// Middleware to parse JSON and enable CORS
app.use(express.json());



// XPHQvpkAAYCQUW91     ramcharanamr2408   IP address 183.82.236.39

// const corsOptions = {
//     origin: 'https://oscowl-todo.vercel.app',  // Correctly set the origin without a trailing slash
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//     credentials: true, // Include credentials like cookies if needed
//   };

app.use(cors())  /// add corsOptions

// Database connection variable
let db = null;

// Import UUID generator for unique IDs and bcrypt for hashing passwords
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // JWT for authentication tokens

// Function to initialize the database and start the server
const initializeDBAndServer = async () => {
    try {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });
        app.listen(port, () => {
            console.log(`Server is running at http://localhost:${port}/`);
        });
    } catch (error) {
        console.log(`DB ERROR: ${error.message}`);
        process.exit(1); // Exit the process if database connection fails
    }
};

initializeDBAndServer(); // Call function to start the server







// Middleware for JWT token verification
const middleWare = (request, response, next) => {
    let jwtToken;
    const authHeader = request.headers['authorization'];
    if (authHeader) {
        jwtToken = authHeader.split(' ')[1]; // Extract token from header
    }
    if (jwtToken) {
        jwt.verify(jwtToken, 'my_secret_jwt_token', async (error, payload) => {
            if (error) {
                response.status(401).send({ message: 'Invalid Token' });
            } else {
                request.username = payload.username; // Attach username to request object
                next();
            }
        });
    } else {
        response.status(401).send({ message: 'Invalid Token' });
    }
};







// Basic route to check server status
app.get("/", (request, response) => {
    response.send('Todos backend testing is working... go for different routes');
});







// Route for user signup
app.post("/signup/", async (request, response) => {
    const { username, email, password } = request.body;
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
    try {
        // Check if a user with the same username already exists
        const dbUser = await db.get(`SELECT username FROM users WHERE username = '${username}';`);
        if (dbUser) {
            response.status(400).send({ message: "User already exists." });
        } else {
            const userId = uuidv4(); // Generate unique ID
            const currentDate = new Date().toLocaleString(); // Get current date and time
            // Insert the new user into the database
            await db.run(`INSERT INTO users(user_id, username, email, password, created_at) VALUES('${userId}','${username}','${email}','${hashedPassword}','${currentDate}');`);
            response.status(201).send({ message: "User created successfully." });
        }
    } catch (error) {
        console.log(`DB Error: ${error.message}`);
        response.status(500).send({ message: "Internal server error." });
    }
});



// Route for user login
app.post("/login/", async (request, response) => {
    const { username, password } = request.body;
    try {
        const dbUser = `SELECT * FROM users WHERE username='${username}';`;
        const checkingUserExists = await db.get(dbUser);
        if (checkingUserExists === undefined) {
            response.status(401).send({ message: 'User Not Found...' });
        } else {
            // Check if the provided password matches the stored hash
            const isValidPassword = await bcrypt.compare(password, checkingUserExists.password);
            if (isValidPassword === true) {
                const payload = { username: username }; // Payload for JWT
                const jwtToken = jwt.sign(payload, 'my_secret_jwt_token'); // Generate JWT token
                response.status(200).send({ jwtToken });
            } else {
                response.status(400).send("Invalid Password");
            }
        }
    } catch (error) {
        response.status(500).send({ message: 'Internal Server Error' });
    }
});

app.get('/profile/', middleWare, async (request, response) => {
    try {
        const { username } = request;
        const dbUser = `SELECT * FROM users WHERE username='${username}';`;
        
        // Use await with a try-catch block for error handling
        const checkingUserExists = await db.get(dbUser);

        // Send the response only if the user exists
        if (checkingUserExists) {
            response.status(200).send(checkingUserExists);
        } else {
            response.status(404).send({ message: "User not found." });
        }
    } catch (error) {
        console.error(`DB Error: ${error.message}`);
        response.status(500).send({ message: "Internal server error." });
    }
});



app.put('/profile/', middleWare, async (request, response) => {
    try {
        const { username } = request;
        const { email, password, role } = request.body;

        const dbUser = `SELECT * FROM users WHERE username='${username}';`;
        
        // Use await with a try-catch block for error handling
        const checkingUserExists = await db.get(dbUser);

        const updatedEmail = email === undefined ? checkingUserExists.email : email;
        const updatedPassword = password === undefined ? checkingUserExists.password : password;
        const updatedRole = role === undefined ? checkingUserExists.role : role

        const updatingUserQuery = `UPDATE users SET email = '${updatedEmail}', password = '${updatedPassword}', role = '${updatedRole}' WHERE username = '${username}';`;

        // Run the query
        await db.run(updatingUserQuery);

        response.status(200).send({ message: 'Profile Updated Successfully' });
    } catch (error) {
        console.error(`DB Error: ${error.message}`);
        response.status(500).send({ message: "Internal server error." });
    }
});



app.delete('/profile/', middleWare, async (request, response) => {
    try {
        const { username } = request;
        const dbUser = `DELETE FROM users WHERE username = '${username}';`;

        // Execute the delete query
        await db.run(dbUser);

        response.status(200).send({ message: 'User Deleted Successfully...' });
    } catch (error) {
        console.error(`DB Error: ${error.message}`);
        response.status(500).send({ message: "Internal server error." });
    }
});









//get all users if only ADMIN is Accessed for checking all these users
app.get('/users/', middleWare, async (request, response) => {
    try {
        const { username } = request;
        const checkUserAdmin = `SELECT * FROM users WHERE username = '${username}' AND role = 'ADMIN';`;
        const userCheck = await db.get(checkUserAdmin);

        if (userCheck) {
            const getAllUsers = `SELECT * FROM users;`;
            const users = await db.all(getAllUsers);
            response.status(200).send(users);
        } else {
            response.status(403).send({ message: "Unauthorized access. Admin privileges required." });
        }
    } catch (error) {
        console.error(`DB Error: ${error.message}`);
        response.status(500).send({ message: "Internal server error." });
    }
});




// Function to get all todos for a user
const getAllTodosForUser = async (user_id) => {
    const query = `SELECT * FROM todos WHERE user_id = '${user_id}';`;
    return await db.all(query);
};



// Route to get all todos for the logged-in user (protected by middleware)
app.get('/todos/', middleWare, async (request, response) => {
    const userQuery = `SELECT * FROM users WHERE username = '${request.username}';`;
    const user = await db.get(userQuery);

    if (user) {
        const todos = await getAllTodosForUser(user.user_id);
        response.status(200).send({ todos });
    } else {
        response.status(401).send({ message: 'Unauthorized user.' });
    }
});



// Route to create a new todo (protected by middleware)
app.post('/todos/', middleWare, async (request, response) => {
    try {
        const userQuery = `SELECT * FROM users WHERE username = '${request.username}';`;
        const user = await db.get(userQuery);

        if (user) {
            const { title, description } = request.body;
            const currentUploadTime = new Date().toLocaleString();
            const todo_id = uuidv4(); // Generate unique ID for the todo
            const insertTodoQuery = `
                INSERT INTO todos (id, user_id, title, description, created_at) 
                VALUES ('${todo_id}', '${user.user_id}', '${title}', '${description}', '${currentUploadTime}');
            `;
            await db.run(insertTodoQuery);

            const updatedTodos = await getAllTodosForUser(user.user_id);
            response.status(200).send({
                message: 'New todo added successfully.',
                todos: updatedTodos
            });
        } else {
            response.status(404).send({ message: "User not found." });
        }
    } catch (error) {
        console.error(`DB Error: ${error.message}`);
        response.status(500).send({ message: "Internal server error." });
    }
});





app.get('/todos/:todoId/', middleWare, async (request, response) => {
    try {
        const { todoId } = request.params;

        const userQuery = `SELECT * FROM users WHERE username = '${request.username}';`;
        const user = await db.get(userQuery);

        if (!user) {
            return response.status(404).send({ message: "User not found." });
        }

        const getTodo = `SELECT * FROM todos WHERE user_id = '${user.user_id}' AND id = '${todoId}';`;
        const data = await db.get(getTodo);

        if (!data) {
            return response.status(404).send({ message: "Task not found." });
        }

        response.status(200).send(data);
    } catch (error) {
        console.error(`DB Error: ${error.message}`);
        response.status(500).send({ message: "Internal server error." });
    }
});




app.put('/todos/:todoId/', middleWare, async (request, response) => {
    try {
        const { todoId } = request.params;
        const { username } = request;
        const { title, description, status, priority, is_deleted } = request.body;

        const userQuery = `SELECT * FROM users WHERE username = '${username}';`;
        const user = await db.get(userQuery);

        if (!user) {
            return response.status(404).send({ message: "User not found." });
        }

        const getTodo = `SELECT * FROM todos WHERE user_id = '${user.user_id}' AND id = '${todoId}';`;
        const data = await db.get(getTodo);

        const updatedTitle = title === undefined ? data.title : title;
        const updatedDescription = description === undefined ? data.description : description;
        const updatedStatus = status === undefined ? data.status : status;
        const updatedPriority = priority === undefined ? data.priority : priority;
        const updatedIsDeleted = is_deleted === undefined ? data.is_deleted : is_deleted;


        const updateTodo = `
            UPDATE todos 
            SET title = '${updatedTitle}', description = '${updatedDescription}', status = '${updatedStatus}', 
                priority = '${updatedPriority}', is_deleted = ${updatedIsDeleted} 
            WHERE user_id = '${user.user_id}' AND id = '${todoId}';
        `;
        await db.run(updateTodo);

        response.status(200).send({ message: 'Task Updated Successfully..' });
    } catch (error) {
        console.error(`DB Error: ${error.message}`);
        response.status(500).send({ message: "Internal server error." });
    }
});



app.delete('/todos/:todoId/', middleWare, async (request, response) => {
    try {
        const { todoId } = request.params;
        const { username } = request;

        const userQuery = `SELECT * FROM users WHERE username = '${username}';`;
        const user = await db.get(userQuery);

        if (!user) {
            return response.status(404).send({ message: "User not found." });
        }

        const deleteTask = `DELETE FROM todos WHERE user_id = '${user.user_id}' AND id = '${todoId}';`;
        await db.run(deleteTask);

        response.status(200).send({ message: 'Todo Deleted Successfully' });
    } catch (error) {
        console.error(`DB Error: ${error.message}`);
        response.status(500).send({ message: "Internal server error." });
    }
});
