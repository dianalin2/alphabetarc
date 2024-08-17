import mongoose from "mongoose";
import bcrypt from "bcrypt";

mongoose.connect(process.env.MONGODB_URI);

const userSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    verified: {
        type: Boolean,
        default: false,
        required: true,
    },
    signupDate: {
        type: Date,
        default: Date.now,
        required: true,
    },
    newsletters: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Newsletter",
        required: true,
    }],
});

userSchema.pre("save", function (next) {
    if (!this.isModified("password"))
        return next();

    this.password = bcrypt.hashSync(this.password, 10);
    console.log(this);
    next();
});

userSchema.statics.findByLogin = async function ({ email, password }) {
    const user = await this.findOne({ email });

    if (!user)
        return null;

    if (bcrypt.compareSync(password, user.password))
        return user;

    return null;
};

const User = mongoose.model("User", userSchema);

const VerificationLinkSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    token: {
        type: String,
        required: true,
        default: () => Math.random().toString(36).substring(2),
    },
    date: {
        type: Date,
        default: Date.now,
        required: true,
    }
});

const VerificationLink = mongoose.model("VerificationLink", VerificationLinkSchema);

const AnswerSchema = new mongoose.Schema({
    answer: { type: String, required: true },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
});

const QuestionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    answers: {
        type: [AnswerSchema],
        required: true,
        default: [],
    }
});

const IssueSchema = new mongoose.Schema({
    questions: {
        type: [QuestionSchema],
        required: true,
        default: [],
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

const NewsletterInviteSchema = new mongoose.Schema({
    email: { type: String, required: true },
    newsletter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Newsletter",
        required: true,
    },
    token: {
        type: String,
        required: true,
        default: () => Math.random().toString(36).substring(2),
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

const NewsletterSubscriberSchema = new mongoose.Schema({
    email: { type: String, required: true },
    nickname: { type: String, required: true },
    newsletter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Newsletter",
        required: true,
    }
});

const newsletterSchema = new mongoose.Schema({
    admins: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    invitedSubscribers: {
        type: [NewsletterInviteSchema],
        required: true,
        default: [],
    },
    subscribers: {
        type: [NewsletterSubscriberSchema],
        required: true,
        default: [],
    },
    title: { type: String, required: true, default: "Newsletter" },
    description: { type: String, required: true, default: "Our group newsletter..." },
    issues: [IssueSchema],
    startDate: {
        type: Date,
        default: Date.now,
    }
});

const Newsletter = mongoose.model("Newsletter", newsletterSchema);

export { User, VerificationLink, Newsletter };
