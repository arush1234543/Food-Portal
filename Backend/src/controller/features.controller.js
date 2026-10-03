import Session from "../models/Session.model.js";
import User from "../models/User.model.js";

export async function changeTheme(req, res){
    try{

        
        const { email, theme } = req.body
    
        if(!email){
        return res.status(400).json({
            message: "Email not recieved",
            success: false
        })
    }
    
    const user = await User.findOne({email})
    
    if(!user){
        return res.status(401).json({
            message: "User not found",
            success: false
        })
    }
    
    user.theme = theme
    await user.save()
    
    return res.status(200).json({
        message: "Theme updated successfully",
        success: true,
        user
    })
}
catch(err){
    return res.status(500).json({
        message: "An unexpected error occured",
        success: false
    })
}
}