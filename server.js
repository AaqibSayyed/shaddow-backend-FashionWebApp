const express = require('express')
const app = express()
const dotenv  = require('dotenv')
const dbConnection = require('./config/dbConnection.js')
const router =  require('./routes.js')
const errorMiddleware = require('./middleware/error.js')
const cookieParser = require('cookie-parser')

//Handling uncaught exception
process.on('uncaughtException', (error)=>{
    console.error('error: ', error.message)
    console.error('Shutting down the server due to Uncaught Exception')
    process.exit(1)
})

//middlewares
app.use(express.json())
app.use(cookieParser())
app.use('/api/v1',router)
//middleware for errors
app.use(errorMiddleware)

//dotenv config 
dotenv.config({path: "./config/config.env"})
const PORT =  process.env.PORT

//connecting to MongoDBServer
dbConnection()

//app is running 
const server = app.listen(PORT, ()=>{
    console.log(`Your Web App is running on http://localhost:${PORT}`)
})


//Hndling unhandled Promise Rejection 
process.on('unhandledRejection', (error)=>{
    console.error('error: ', error.message)
    console.error('Shutting down the server due to Unhandled Promise Rejection')
    server.close(()=>{
        process.exit(1)
    })

})