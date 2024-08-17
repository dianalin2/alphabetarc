import { Router, json } from "express";
import { Newsletter, User, VerificationLink } from "./models.js";
import jwt from "jsonwebtoken";
import { sendServerEmail } from "./email.js";

const router = Router();

router.use(json());

const jwtSecret = process.env.JWT_SECRET;

function verifyJWT(req, res, next) {
    const token = req.headers.authorization.split(" ")[1];

    jwt.verify(token, jwtSecret, (err, decoded) => {
        if (err)
            return res.status(401).json({ message: "Invalid token" });

        req.user = decoded;
        next();
    });
}

function isVerified(req, res, next) {
    const { email } = req.user;

    const user = User.findOne({ email });

    if (!user)
        return res.status(401).json({ message: "User not found" });

    if (!user.verified)
        return res.status(401).json({ message: "Email not verified" });

    next();
}

router.post("/newsletter/:newsletterId/subscribe", async (req, res) => {
    const { newsletterId } = req.params;
    const { token } = req.body;

    const newsletter = await Newsletter.findById(newsletterId)

    const invitedSubscriber = newsletter.invitedSubscribers.find((invited) => invited.token === token);
    if (!invitedSubscriber)
        return res.status(401).json({ message: "Invalid token" });

    newsletter.subscribers.push(invitedSubscriber.email);
    newsletter.invitedSubscribers = newsletter.invitedSubscribers.filter((invited) => invited.token !== token);

    await newsletter.save();

    res.json(newsletter);
});

router.post("/user/new", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = new User({
            email,
            password,
        });

        await user.save();

        const verification = new VerificationLink({
            user: user._id,
        });

        await verification.save();

        const emailRes = await sendServerEmail(
            "Alphabetarc",
            email,
            "Welcome!",
            "Welcome to Alphabetarc! Please verify your email address with this verification token: " + verification.token
        );

        console.log("Email sent", emailRes);

        res.json({
            message: "User created",
        });
    } catch (err) {
        console.error(err);
        return res.status(400).json({ message: 'Email already in use' });
    }
});

router.post("/user/verify", async (req, res) => {
    const { token } = req.body;

    const doc = await VerificationLink.findOne({ token });

    if (!doc)
        return res.status(401).json({ message: "Invalid token" });

    const user = await User.findById(doc.user);

    if (!user)
        return res.status(401).json({ message: "User not found" });

    if (user.verified)
        return res.status(401).json({ message: "Email already verified" });

    try {
        user.verified = true;
        await user.save();
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error verifying email" });
    }

    res.json({ message: "Email verified" });
});

router.post("/user/token", async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findByLogin({ email, password });

    console.log(user);

    if (!user)
        return res.status(401).json({ message: "Invalid email or password" });

    if (!user.verified)
        return res.status(401).json({ message: "Email not verified" });

    const token = jwt.sign({ email }, jwtSecret);
    res.json({ token });
});


router.post("/newsletter/new", verifyJWT, isVerified, async (req, res) => {
    const { admins, subscribers, title, description, content } = req.body;

    const newsletter = new Newsletter({
        admins,
        invitedSubscribers: subscribers,
        subscribers: [],
        title,
        description,
        content,
        date: new Date(),
    });

    await newsletter.save();

    for (const admin of admins) {
        const adminUser = await User.findById(admin);
        adminUser.newsletters.push(newsletter._id);
        await adminUser.save();
    }

    for (const subscriber of subscribers) {
        const res = await sendServerEmail({
            from: postmarkEmail,
            to: subscriber,
            subject: title,
            text: description,
        });

        console.log("Newsletter verification sent: ", res);
    }

    res.json(newsletter);
});

export default router;
