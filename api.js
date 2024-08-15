import { Router, json } from "express";
import { Newsletter, User, VerificationLink } from "./models.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "./email.js";

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

    User.findOne({ email }).then((doc) => {
        if (!doc.verified)
            return res.status(401).json({ message: "Email not verified" });

        next();
    });
}

router.post("/newsletter/:newsletterId/subscribe", (req, res) => {
    const { newsletterId } = req.params;
    const { token } = req.body;

    Newsletter.findById(newsletterId).then((doc) => {
        const invitedSubscriber = doc.invitedSubscribers.find((invited) => invited.token === token && invited.email === req.body.email);
        if (!invitedSubscriber)
            return res.status(401).json({ message: "Invalid token" });

        doc.subscribers.push(invitedSubscriber.email);
        doc.invitedSubscribers = doc.invitedSubscribers.filter((invited) => invited.email !== req.body.email);
        doc.save().then((doc) => {
            res.json(doc);
        });
    });
});

router.post("/user/new", async (req, res) => {
    const { email, password } = req.body;
    const user = new User({
        email,
        password,
    });

    await user.save();

    const verification = new VerificationLink({
        user: user._id,
    });

    await verification.save();

    sendEmail(
        "Alphabetarc",
        email,
        "Welcome!",
        "Welcome to Alphabetarc! Please verify your email address with this verification token: " + verification.token
    ).then((response) => {
        console.log("Email sent", response);
    });

    res.json({
        message: "User created",
    });
});

router.post("/user/verify", async (req, res) => {
    const { token } = req.body;

    // print all verification links

    const doc = await VerificationLink.findOne({ token });

    if (!doc)
        return res.status(401).json({ message: "Invalid token" });

    const user = await User.findById(doc.user);

    if (!user)
        return res.status(401).json({ message: "User not found" });

    if (user.verified)
        return res.status(401).json({ message: "Email already verified" });

    user.verified = true;
    await user.save();

    res.json({ message: "Email verified" });
});

router.post("/user/token", (req, res) => {
    const { email, password } = req.body;

    const user =
        User.findOne({ email, password }).then((doc) => {
            if (!doc)
                return res.status(401).json({ message: "Invalid email or password" });

            const token = jwt.sign({ email }, jwtSecret);
            res.json({ token });
        });

    if (!user)
        return res.status(401).json({ message: "Invalid email or password" });
});


router.post("/newsletter/new", verifyJWT, isVerified, (req, res) => {
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

    newsletter.save().then((doc) => {
        res.json(doc);
    });

    for (const admin of admins) {
        User.findById(admin).then((doc) => {
            doc.newsletters.push(newsletter._id);
            doc.save();
        });
    }

    for (const subscriber of subscribers) {
        sendEmail({
            from: postmarkEmail,
            to: subscriber,
            subject: title,
            text: description,
        }).then((response) => {
            console.log("Newsletter verification sent: ", response);
        });
    }

    res.json(newsletter);
});

export default router;
