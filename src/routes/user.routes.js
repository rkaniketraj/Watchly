import {Router} from "express";
import {logoutUser,loginUser,registerUser} from "../controller/user.controller.js";
import {upload} from "../middleware/multer.middleware.js";




const router = Router();
router.route("/register").post(
    upload.fields([
        {
            name : "avatar",
            maxCount :1

        },
        {
            name : "coverImage",
            maxCount : 1

        }
    ]),
    registerUser
);

router.route("/login").post(loginUser)

//secoure route
router.route("/logout").post(verifyJWT,logoutUser)


export default router;
