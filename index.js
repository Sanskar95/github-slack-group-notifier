const https = require('https')
const { Octokit } = require('@octokit/rest')
const core = require('@actions/core')
const github = require('@actions/github')
const octokit = new Octokit({
    userAgent: 'myApp v1.2.3',
    previews: ['jean-grey', 'symmetra'],
    timeZone: 'Europe/Amsterdam',
    baseUrl: 'https://api.github.com',

    log: {
        debug: () => {},
        info: () => {},
        warn: console.warn,
        error: console.error,
    },

    request: {
        agent: undefined,
        fetch: undefined,
        timeout: 0,
    },
})

async function getPullRequest() {
    const { data: pullRequest } = await octokit.pulls.get({
        owner: 'octokit',
        repo: 'rest.js',
        pull_number: 123,
    })
    return pullRequest.mergeable_state === 'clean'
}

function run() {
    try {
        const token = core.getInput('github-token', { required: true })
        const slackWebhook = core.getInput('slack-webhook', { required: true })

        const { pull_request: pr } = github.context.payload
        const { owner, repo } = github.context.payload

        if (!pr) {
            throw new Error('Event payload missing `pull_request`')
        }

        core.debug(`Checking #${pr.number}`)
        if (getPullRequest()) {
            sendSlackMessage(slackWebhook, getMessageBody(pr.html_url, pr.number))
        }
    } catch (error) {
        core.setFailed(error.message)
    }
}

function getMessageBody(link, number) {
    return {
        text: 'The merge status of below PR is clean ,request you to have a look ', // text
        icon_emoji: ':bangbang:', // User icon, you can also use custom icons here
        attachments: [
            {
                color: '#eed140', // color of the attachments sidebar.
                fields: [
                    {
                        title: 'Link', // Custom field
                        value: link, // Custom value
                        short: true, // long fields will be full width
                    },
                    {
                        title: 'PR number', // Custom field
                        value: number, // Custom value
                        short: true, // long fields will be full width
                    },
                ],
            },
        ],
    }
}

const hook =
    'https://hooks.slack.com/services/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'

function configuireSlackMessage(webhookURL, messageBody) {
    // make sure the incoming message body can be parsed into valid JSON
    try {
        messageBody = JSON.stringify(messageBody)
    } catch (e) {
        throw new Error('Failed to stringify messageBody', e)
    }

    // Promisify the https.request
    return new Promise((resolve, reject) => {
        // general request options, we defined that it's a POST request and content is JSON
        const requestOptions = {
            method: 'POST',
            header: {
                'Content-Type': 'application/json',
            },
        }

        // actual request
        const req = https.request(webhookURL, requestOptions, (res) => {
            let response = ''

            res.on('data', (d) => {
                response += d
            })

            // response finished, resolve the promise with data
            res.on('end', () => {
                resolve(response)
            })
        })

        // there was an error, reject the promise
        req.on('error', (e) => {
            reject(e)
        })

        // send our message body (was parsed to JSON beforehand)
        req.write(messageBody)
        req.end()
    })
}

async function sendSlackMessage(yourWebHookURL, userAccountNotification) {
    if (!yourWebHookURL) {
        console.error('Please fill in your Webhook URL')
    }

    console.log('Sending slack message')
    try {
        const slackResponse = await sendSlackMessage(
            yourWebHookURL,
            userAccountNotification
        )
        console.log('Message response', slackResponse)
    } catch (e) {
        console.error('There was a error with the request', e)
    }
}

run()
