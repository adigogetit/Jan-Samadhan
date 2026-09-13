const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const ALLOWED_ROLES = [
    "citizen",
    "government",
    "university",
    "student",
    "investor",
];

const authCookieOptions = (req) => {
    const forwardedProto = req.headers["x-forwarded-proto"];
    const isForwardedHttps = typeof forwardedProto === "string" &&
        forwardedProto.split(",")[0].trim() === "https";
    const isHttps =
        process.env.NODE_ENV === "production" ||
        req.secure ||
        isForwardedHttps;

    return {
        httpOnly: true,
        secure: isHttps,
        sameSite: isHttps ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    };
};

const signup = async (req, res) => {
    try {
        const { name, email, password, phone, role, organizationId, universityId, department, district } = req.body;

        // -----------------------------
        // VALIDATION
        // -----------------------------

        if (!name || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "Name, email, password and role are required",
            });
        }

        const allowedRoles = [
            "citizen",
            "government",
            "university",
            "student",
            "investor",
        ];

        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role selected",
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 8 characters",
            });
        }

        // -----------------------------
        // CHECK EXISTING USER
        // -----------------------------

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail,
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists",
            });
        }

        // -----------------------------
        // HASH PASSWORD
        // -----------------------------

        const passwordHash = await bcrypt.hash(password, 12);

        // -----------------------------
        // CREATE USER
        // -----------------------------

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            phone: phone || null,
            passwordHash,
            role,

            organizationId: organizationId || null,
            universityId: universityId || null,

            department: department || null,
            district: district || null,

            state: "Jharkhand",

            isActive: true,

            // Citizens can use the platform immediately.
            // Other institutional roles can require approval.
            isApproved: role === "citizen",
        });

        // -----------------------------
        // CREATE LOGIN TOKEN
        // -----------------------------

        const token = jwt.sign(
            {
                userId: user._id.toString(),
                role: user.role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );

        // -----------------------------
        // SET HTTP-ONLY COOKIE
        // -----------------------------

        res.cookie("token", token, authCookieOptions(req));

        // -----------------------------
        // RESPONSE
        // -----------------------------

        return res.status(201).json({
            success: true,
            message: "Account created successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                organizationId: user.organizationId,
                universityId: user.universityId,
                department: user.department,
                district: user.district,
                state: user.state,
                isActive: user.isActive,
                isApproved: user.isApproved,
            },
        });
    } catch (error) {
        console.error("Signup error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to create account",
        });
    }
};


const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase().trim(),
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Your account has been deactivated",
            });
        }

        if (!user.passwordHash) {
            return res.status(400).json({
                success: false,
                message: "This account does not use password login",
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.passwordHash
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        const token = jwt.sign(
            {
                userId: user._id.toString(),
                role: user.role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );

        res.cookie("token", token, authCookieOptions(req));

        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                district: user.district,
                state: user.state,
                isApproved: user.isApproved,
            },
        });
    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong while logging in",
        });
    }
};

const getMe = async (req, res) => {
    return res.status(200).json({
        success: true,
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            phone: req.user.phone,
            role: req.user.role,
            organizationId: req.user.organizationId,
            universityId: req.user.universityId,
            department: req.user.department,
            district: req.user.district,
            state: req.user.state,
            isActive: req.user.isActive,
            isApproved: req.user.isApproved,
            createdAt: req.user.createdAt,
        },
    });
};

const logout = async (req, res) => {
    try {
        res.clearCookie("token", authCookieOptions(req));

        return res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    } catch (error) {
        console.error("Logout error:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong while logging out",
        });
    }
};

const googleClientId =
    process.env.GOOGLE_CLIENT_ID || process.env.Google_Client_ID;

const googleClient = new OAuth2Client(googleClientId);

const googleLogin = async (req, res) => {
    try {
        const { credential, role } = req.body;

        if (!credential) {
            return res.status(400).json({
                success: false,
                message: "Google credential is required",
            });
        }

        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: googleClientId,
        });

        const payload = ticket.getPayload();

        if (!payload) {
            return res.status(401).json({
                success: false,
                message: "Invalid Google credential",
            });
        }

        const {
            sub: googleId,
            email,
            name,
            picture,
            email_verified: emailVerified,
        } = payload;

        if (!email || !emailVerified) {
            return res.status(401).json({
                success: false,
                message: "Google email could not be verified",
            });
        }

        let user = await User.findOne({
            email: email.toLowerCase(),
        });

        // Existing account
        if (user) {
            if (user.googleId && user.googleId !== googleId) {
                return res.status(409).json({
                    success: false,
                    message: "This email is already linked to another Google account",
                });
            }

            // Link Google to existing JAN-SAMADHAN account
            if (!user.googleId) {
                user.googleId = googleId;
                await user.save();
            }
        } else {
            // New Google account requires a role
            const allowedRoles = [
                "citizen",
                "government",
                "university",
                "student",
                "investor",
            ];

            if (!role || !allowedRoles.includes(role)) {
                return res.status(400).json({
                    success: false,
                    requiresRole: true,
                    message: "Please select your JAN-SAMADHAN role",

                    googleProfile: {
                        googleId,
                        name: name || "",
                        email: email.toLowerCase(),
                        picture: picture || "",
                    },
                });
            }

            user = await User.create({
                name: name || "Google User",
                email: email.toLowerCase(),
                googleId,
                role,
                isActive: true,
                isApproved: role === "citizen",
                state: "Jharkhand",
            });
        }

        const token = jwt.sign(
            {
                userId: user._id.toString(),
                role: user.role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );

        res.cookie("token", token, authCookieOptions(req));

        return res.status(200).json({
            success: true,
            message: "Google login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                picture: picture || null,
                isApproved: user.isApproved,
            },
        });
    } catch (error) {
        console.error("Google login error:", error);

        return res.status(401).json({
            success: false,
            message: "Google authentication failed",
        });
    }
};

module.exports = {
    signup, login, getMe, logout, googleLogin,
};