import { Newsletter } from './models.js';
import { sendNewsletterIssue } from './email.js';

function processNewsletterIssue(newsletter, issue) {
    sendNewsletterIssue(newsletter);

    const newIssue = {
        questions: [],
        questionMakingEndDate: Date.now() + newsletter.questionMakingDuration,
        date: Date.now() + newsletter.frequency,
    };

    newsletter.issues.push(newIssue);

    setTimeout(() => {
        newsletter.save();
        processNewsletterIssue(newsletter, newIssue);
    }, newsletter.frequency);

    issue.sent = true;
    newsletter.save();
}

async function run() {
    const newsletters = await Newsletter.find();
    for (const newsletter of newsletters) {
        for (const issue of newsletter.issues) {
            if (issue.sent)
                continue;

            setTimeout(() => {
                processNewsletterIssue(newsletter, issue);
            }, issue.date - Date.now());
        }
    }
}

export default run;
