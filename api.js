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

    const user = User.findOne({ email }).then((user) => {
        if (!user)
            return res.status(401).json({ message: "User not found" });

        if (!user.verified)
            return res.status(401).json({ message: "Email not verified" });

        next();
    });
}

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
    const { admins, invitedSubscriberEmails, frequency, questionMakingTime, title, description, startDate } = req.body;

    console.log(req.body);

    try {
        const newsletter = new Newsletter({
            admins: [],
            invitedSubscribers: [],
            subscribers: [],
            frequency,
            questionMakingTime,
            title,
            description,
            issues: [],
            startDate: new Date(startDate),
        });

        await newsletter.save();

        for (const admin of admins) {
            const adminUser = await User.findById(admin);

            adminUser.newsletters.push(newsletter._id);
            await adminUser.save();

            newsletter.admins.push(adminUser._id);
            await newsletter.save();
        }

        for (const invitedSubscriberEmail of invitedSubscriberEmails) {
            newsletter.invitedSubscribers.push({
                email: invitedSubscriberEmail,
                newsletter: newsletter._id,
            });

            await newsletter.save();
        }

        for (const invitedSubscriber of newsletter.invitedSubscribers) {
            await sendServerEmail(
                "Alphabetarc",
                invitedSubscriber.email,
                `${title} Subscription Invitation`,
                `You have been invited to subscribe to the newsletter ${title}! Please verify your email address with this verification token: ${invitedSubscriber.token}`
            );
        }

        await newsletter.save();

        for (const admin of admins) {
            const adminUser = await User.findById(admin);
            adminUser.newsletters.push(newsletter._id);
            await adminUser.save();
        }

        res.json(newsletter);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error creating newsletter" });
    }
});

router.post("/newsletter/:newsletterId/subscribe", async (req, res) => {
    const { newsletterId } = req.params;
    const { token } = req.body;

    const newsletter = await Newsletter.findById(newsletterId);

    const invitedSubscriber = newsletter.invitedSubscribers.find((invited) => invited.token === token);
    if (!invitedSubscriber)
        return res.status(401).json({ message: "Invalid token" });

    newsletter.subscribers.push(invitedSubscriber.email);
    newsletter.invitedSubscribers = newsletter.invitedSubscribers.filter((invited) => invited.token !== token);

    await newsletter.save();

    res.json(newsletter);
});


export default router;
