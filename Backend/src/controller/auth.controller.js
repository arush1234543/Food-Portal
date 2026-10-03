import User from "../models/User.model.js";
import Session from "../models/Session.model.js";
import OTP from "../models/OTP.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import RandomOTP from "../utils/otp.utils.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "../services/email.service.js";
import config from "../config/config.js";

const cookieOptions = {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: config.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: 15 * 24 * 60 * 60 * 1000
};

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests, please try again later." }
});

export const otpLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many OTP requests, please try again later." }
});

export async function Register(req, res) {
    const { username, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email }).select("_id");

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            username,
            email,
            password: hashedPassword
        });

        const otp = RandomOTP();
        const hashedOTP = await bcrypt.hash(String(otp), 10);

        await Promise.all([
            OTP.create({
                email,
                otp: hashedOTP,
                user: newUser._id,
                purpose: "verify-email",
                expiresAt: new Date(Date.now() + 10 * 60 * 1000)
            }),
            sendVerificationEmail({ to: email, otp })
        ]);

        const accessToken = jwt.sign(
            { userId: newUser._id },
            config.ACCESS_TOKEN_SECRET,
            { expiresIn: "15m" }
        );

        const refreshToken = jwt.sign(
            { userId: newUser._id },
            config.REFRESH_TOKEN_SECRET,
            { expiresIn: "15d" }
        );

        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

        await Session.create({
            user: newUser._id,
            refreshToken: hashedRefreshToken,
            ip: req.ip,
            userAgent: req.headers["user-agent"]
        });

        res.cookie("refreshToken", refreshToken, cookieOptions);

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                theme: newUser.theme,
                verified: newUser.verified
            },
            accessToken
        });
    } catch (error) {
        console.error("Error during registration:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

export async function verifyEmail(req, res) {
    const { email, otp } = req.body;

    try {
        const otpDocument = await OTP.findOne({
            email,
            purpose: "verify-email"
        }).sort({ createdAt: -1 });

        if (!otpDocument) {
            return res.status(400).json({
                success: false,
                message: "No OTP found for this email"
            });
        }

        if (otpDocument.expiresAt < new Date()) {
            await OTP.deleteOne({ _id: otpDocument._id });

            return res.status(400).json({
                success: false,
                message: "OTP has expired"
            });
        }

        if (otpDocument.attempts >= 5) {
            return res.status(400).json({
                success: false,
                message: "Maximum OTP attempts exceeded"
            });
        }

        const isOTPValid = await bcrypt.compare(String(otp), otpDocument.otp);

        if (!isOTPValid) {
            await OTP.updateOne(
                { _id: otpDocument._id },
                { $inc: { attempts: 1 } }
            );

            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        const user = await User.findById(otpDocument.user);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        user.verified = true;

        const accessToken = jwt.sign(
            { userId: user._id },
            config.ACCESS_TOKEN_SECRET,
            { expiresIn: "15m" }
        );

        const refreshToken = jwt.sign(
            { userId: user._id },
            config.REFRESH_TOKEN_SECRET,
            { expiresIn: "15d" }
        );

        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

        await Promise.all([
            user.save(),
            OTP.deleteOne({ _id: otpDocument._id }),
            Session.deleteMany({ user: user._id }),
            Session.create({
                user: user._id,
                refreshToken: hashedRefreshToken,
                ip: req.ip,
                userAgent: req.headers["user-agent"]
            })
        ]);

        res.cookie("refreshToken", refreshToken, cookieOptions);

        return res.status(200).json({
            success: true,
            message: "Email verified successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                theme: user.theme,
                verified: user.verified
            },
            accessToken
        });
    } catch (error) {
        console.error("Error during email verification:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

export async function Login(req, res) {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "An account with this email doesn't exist"
            });
        }

        if (!user.verified) {
            return res.status(403).json({
                success: false,
                message: "Please verify your email first"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Incorrect password"
            });
        }

        const accessToken = jwt.sign(
            { userId: user._id },
            config.ACCESS_TOKEN_SECRET,
            { expiresIn: "15m" }
        );

        const refreshToken = jwt.sign(
            { userId: user._id },
            config.REFRESH_TOKEN_SECRET,
            { expiresIn: "15d" }
        );

        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

        await Session.create({
            user: user._id,
            refreshToken: hashedRefreshToken,
            ip: req.ip,
            userAgent: req.headers["user-agent"]
        });

        const safeUser = await User.findById(user._id)
            .select("-password")
            .lean();

        return res.status(200).cookie("refreshToken", refreshToken, cookieOptions).json({
            success: true,
            message: "Login successful",
            user: safeUser,
            accessToken
        });
    } catch (error) {
        console.error("Error during login:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

export async function refreshToken(req, res) {
    try {
        const { refreshToken } = req.cookies

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "No refresh token"
            })
        }

        const decoded = jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET)

        const sessions = await Session.find({
            user: decoded.userId,
            revoked: false
        })

        let validSession = null

        for (const session of sessions) {
            if (await bcrypt.compare(refreshToken, session.refreshToken)) {
                validSession = session
                break
            }
        }

        if (!validSession) {
            return res.status(401).json({
                success: false,
                message: "Invalid refresh token"
            })
        }

        const user = await User.findById(decoded.userId)
            .select("-password")
            .lean()

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        const accessToken = jwt.sign(
            { userId: user._id },
            config.ACCESS_TOKEN_SECRET,
            { expiresIn: "15m" }
        )

        const newRefreshToken = jwt.sign(
            { userId: user._id },
            config.REFRESH_TOKEN_SECRET,
            { expiresIn: "15d" }
        )

        validSession.refreshToken = await bcrypt.hash(newRefreshToken, 10)
        validSession.ip = req.ip
        validSession.userAgent = req.headers["user-agent"]
        await validSession.save()

        res.cookie("refreshToken", newRefreshToken, cookieOptions)

        return res.status(200).json({
            success: true,
            message: "Token refreshed successfully",
            user,
            accessToken
        })
    } catch (error) {
        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired refresh token"
            })
        }

        console.error("Error during token refresh:", error)

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}


export async function logout(req, res) {
    try {
        const { refreshToken } = req.cookies;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: "User already logged out"
            });
        }

        const decoded = jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET);

        const sessions = await Session.find({ user: decoded.userId });
        let validSession = null;

        for (const session of sessions) {
            const isMatch = await bcrypt.compare(refreshToken, session.refreshToken);

            if (isMatch) {
                validSession = session;
                break;
            }
        }

        if (!validSession) {
            res.clearCookie("refreshToken", cookieOptions);

            return res.status(400).json({
                success: false,
                message: "User already logged out"
            });
        }

        await Session.deleteOne({ _id: validSession._id });

        res.clearCookie("refreshToken", cookieOptions);

        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
            res.clearCookie("refreshToken", cookieOptions);

            return res.status(401).json({
                success: false,
                message: "Invalid or expired refresh token"
            });
        }

        console.error("Error during logout:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

export async function logoutAllDevices(req, res) {
    try {
        const { accessToken } = req.body;

        if (!accessToken) {
            return res.status(401).json({
                success: false,
                message: "Access token required"
            });
        }

        const decoded = jwt.verify(accessToken, config.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decoded.userId).select("_id");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        await Session.deleteMany({ user: user._id });

        res.clearCookie("refreshToken", cookieOptions);

        return res.status(200).json({
            success: true,
            message: "Logged out from all devices successfully"
        });
    } catch (error) {
        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired access token"
            });
        }

        console.error("Error during logout all devices:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

export async function resendOTP(req, res) {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const user = await User.findOne({ email })
            .select("_id email verified");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.verified) {
            return res.status(400).json({
                success: false,
                message: "Email is already verified"
            });
        }

        await OTP.deleteMany({
            user: user._id,
            purpose: "verify-email"
        });

        const otp = RandomOTP();
        const hashedOTP = await bcrypt.hash(String(otp), 10);

        await Promise.all([
            OTP.create({
                email,
                otp: hashedOTP,
                user: user._id,
                purpose: "verify-email",
                expiresAt: new Date(Date.now() + 10 * 60 * 1000)
            }),
            sendVerificationEmail({ to: email, otp })
        ]);

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully"
        });
    } catch (error) {
        console.error("Error during OTP resend:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

export async function forgotPassword(req, res) {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const user = await User.findOne({ email }).select("_id email");

        if (!user) {
            return res.status(200).json({
                success: true,
                message: "If an account exists with this email, a password reset OTP has been sent"
            });
        }

        await OTP.deleteMany({
            user: user._id,
            purpose: "forgot-password"
        });

        const otp = RandomOTP();
        const hashedOTP = await bcrypt.hash(String(otp), 10);

        await Promise.all([
            OTP.create({
                email,
                otp: hashedOTP,
                user: user._id,
                purpose: "forgot-password",
                expiresAt: new Date(Date.now() + 10 * 60 * 1000)
            }),
            sendPasswordResetEmail({ to: email, otp })
        ]);

        return res.status(200).json({
            success: true,
            message: "If an account exists with this email, a password reset OTP has been sent"
        });
    } catch (error) {
        console.error("Error during forgot password:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

export async function resetPassword(req, res) {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Email, OTP and new password are required"
            });
        }

        const user = await User.findOne({ email }).select("_id password");

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired OTP"
            });
        }

        const otpDocument = await OTP.findOne({
            user: user._id,
            email,
            purpose: "forgot-password"
        }).sort({ createdAt: -1 });

        if (!otpDocument) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired OTP"
            });
        }

        if (otpDocument.expiresAt < new Date()) {
            await OTP.deleteOne({ _id: otpDocument._id });

            return res.status(400).json({
                success: false,
                message: "OTP has expired"
            });
        }

        if (otpDocument.attempts >= 5) {
            return res.status(400).json({
                success: false,
                message: "Maximum OTP attempts exceeded"
            });
        }

        const isOTPValid = await bcrypt.compare(String(otp), otpDocument.otp);

        if (!isOTPValid) {
            await OTP.updateOne(
                { _id: otpDocument._id },
                { $inc: { attempts: 1 } }
            );

            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        user.password = await bcrypt.hash(newPassword, 10);

        await Promise.all([
            user.save(),
            OTP.deleteOne({ _id: otpDocument._id }),
            Session.deleteMany({ user: user._id })
        ]);

        res.clearCookie("refreshToken", cookieOptions);

        return res.status(200).json({
            success: true,
            message: "Password reset successfully"
        });
    } catch (error) {
        console.error("Error during password reset:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}
