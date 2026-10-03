const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");

const signup = async (req, res) => {


try {

    const {
        name,
        email,
        phone,
        password
    } = req.body;

    if (
        !name ||
        !email ||
        !phone ||
        !password
    ) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    const normalizedEmail =
        email.trim().toLowerCase();

    const existingUser =
        await User.findOne({
            where: {
                email: normalizedEmail
            }
        });

    if (existingUser) {
        return res.status(400).json({
            message: "Email already exists"
        });
    }

    const existingPhone =
        await User.findOne({
            where: {
                phone: phone.trim()
            }
        });

    if (existingPhone) {
        return res.status(400).json({
            message: "Phone number already exists"
        });
    }

    const hashedPassword =
        await bcrypt.hash(password, 10);

    await User.create({
        name: name.trim(),
        email: normalizedEmail,
        phone: phone.trim(),
        password: hashedPassword
    });

    return res.status(201).json({
        message: "User created successfully"
    });

} catch (error) {

    console.error(error);

    return res.status(500).json({
        message: "Something went wrong"
    });
}


};

const login = async (req, res) => {


try {

    const {
        loginInput,
        password
    } = req.body;

    if (!loginInput || !password) {
        return res.status(400).json({
            message:
                "Email/phone and password are required"
        });
    }

    const normalizedLoginInput =
        loginInput.trim().toLowerCase();

    const user =
        await User.findOne({
            where: {
                [Op.or]: [
                    {
                        email:
                            normalizedLoginInput
                    },
                    {
                        phone:
                            loginInput.trim()
                    }
                ]
            }
        });

    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    const isPasswordCorrect =
        await bcrypt.compare(
            password,
            user.password
        );

    if (!isPasswordCorrect) {
        return res.status(401).json({
            message: "Incorrect password"
        });
    }

    const token =
        jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

    return res.status(200).json({
        message: "Login successful",
        token: token
    });

} catch (error) {

    console.error(error);

    return res.status(500).json({
        message: "Something went wrong"
    });
}


};

const checkUser = async (req, res) => {

    try {

        const { email } = req.query;

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const normalizedEmail =
            email.trim().toLowerCase();

        const user =
            await User.findOne({
                where: {
                    email: normalizedEmail
                }
            });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            message: "User exists",
            userId: user.id,
            name: user.name,
            email: user.email
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Something went wrong"
        });
    }
};



module.exports = {
signup,
login,
checkUser
};
