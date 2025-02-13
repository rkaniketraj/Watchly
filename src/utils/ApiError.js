class ApiError extends Error{
    constructor(
        statusCode,
        message="something went wronge",
        errors = [],
        stack = ""
    ){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false;
        this.errors = errors

        if (stack) {
            this.stack = stack
        } else{
            Error.captureStackTrace(this, this.constructor)
        }
      
    }
//     super(message) sets the message property in the parent Error class.
// this.statusCode and other properties are custom properties that we add to enhance the error.
}
export {ApiError};