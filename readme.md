# Watchly

Watchly is a full-featured video hosting platform similar to YouTube, built using Node.js, Express.js, MongoDB, and Mongoose. This project follows best practices, including JWT authentication, bcrypt password hashing, access tokens, and refresh tokens.

## Features
- User authentication (Signup & Login)
- Secure authentication using JWT & bcrypt
- Video upload, streaming, and management
- Like and dislike functionality
- Commenting system with replies
- Subscription and unsubscription
- Profile management
- Robust API design following RESTful principles

## Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Authentication:** JWT, bcrypt
- **Storage:** Cloudinary/AWS S3 (for video storage)

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/watchly.git
   ```
2. Navigate to the project directory:
   ```sh
   cd watchly
   ```
3. Install dependencies:
   ```sh
   npm install
   ```
4. Set up environment variables in a `.env` file:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_SECRET=your_cloudinary_secret
   ```
5. Start the development server:
   ```sh
   npm start
   ```

## API Endpoints
### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user and get JWT token
- `POST /api/auth/refresh` - Refresh access token

### Video Management
- `POST /api/videos/upload` - Upload a new video
- `GET /api/videos/:id` - Get video details
- `DELETE /api/videos/:id` - Delete a video

### User Interactions
- `POST /api/videos/:id/like` - Like a video
- `POST /api/videos/:id/dislike` - Dislike a video
- `POST /api/videos/:id/comment` - Add a comment
- `POST /api/comments/:id/reply` - Reply to a comment
- `POST /api/users/:id/subscribe` - Subscribe to a user
- `POST /api/users/:id/unsubscribe` - Unsubscribe from a user



