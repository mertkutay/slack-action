const core = require("@actions/core");
const github = require("@actions/github");
import { IncomingWebhook, IncomingWebhookResult } from "@slack/webhook";

async function run() {
  try {
    const webhook_url = process.env.SLACK_WEBHOOK_URL;
    const status = core.getInput("status", { required: true });
    const channel = core.getInput("channel", { required: false });
    const workflow = context.workflow;
    const repository = context.payload.repository;
    const repositoryName = repository.full_name;
    const repositoryUrl = repository.html_url;
    const sender = context.payload.sender;

    let text = "";
    let color;
    switch (status.toLowerCase()) {
      case "started":
        text = `:information_source: Started: ${workflow}`;
      case "success":
        color = "good";
        text = `:white_check_mark: Success: ${workflow}`;
      case "failure":
        color = "danger";
        text = `:no_entry: Failure: ${workflow}`;
      case "cancelled":
        color = "warning";
        text = `:warning: Cancelled: ${workflow}`;
    }

    const commit = context.payload.head_commit;
    const compare = context.payload.compare;
    const branch = context.ref.replace("refs/heads/", "");

    const fields = [
      {
        title: "Branch",
        value: `<${compare}|${branch}>`,
        short: false,
      },
      {
        title: "Commit",
        value: `<${commit.url}|${commit.message}>`,
        short: false,
      },
    ];

    const ts = new Date(repository.pushed_at);

    const message = {
      text,
      channel,
      attachments: [
        {
          fallback: `New Commit on ${repositoryName}/${branch} by ${sender.login}`,
          color: color,
          author_name: sender.login,
          author_link: sender.html_url,
          author_icon: sender.avatar_url,
          fields,
          footer: `<${repositoryUrl}|${repositoryName}>`,
          footer_icon: "https://github.githubassets.com/favicon.ico",
          ts: ts.getTime().toString(),
        },
      ],
    };

    const webhook = new IncomingWebhook(webhook_url);
    return await webhook.send(message);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
