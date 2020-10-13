import { context } from '@actions/github';
import * as core from '@actions/core';
import { IncomingWebhook } from '@slack/webhook';

async function run() {
  try {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    const status = core.getInput('status', { required: true });
    const channel = core.getInput('channel', { required: false });
    let text = core.getInput('text', { required: false });
    const { workflow, payload } = context;
    const { repository, sender } = payload;
    const commit = payload.head_commit;
    const branch = context.ref.replace('refs/heads/', '');
    const repositoryName = repository.full_name;
    const repositoryUrl = repository.html_url;
    const branchUrl = `${repositoryUrl}/tree/${branch}`;

    let color;
    let emoji;
    switch (status) {
      case 'success':
        color = 'good';
        emoji = ':heavy_check_mark:';
        break;
      case 'failure':
        color = 'danger';
        emoji = ':no_entry:';
        break;
      case 'cancelled':
        color = 'warning';
        emoji = ':warning:';
        break;
      case 'info':
        emoji = ':information_source:';
        break;
      default:
        throw new Error(
          'Valid statuses are: info, success, failure, cancelled',
        );
    }
    if (!text) {
      text = status[0].toUpperCase() + status.slice(1);
    }
    text = `${emoji} ${text}: <${commit.url}/checks|${workflow}>`;

    const fields = [
      {
        title: 'Branch',
        value: `<${branchUrl}|${branch}>`,
        short: false,
      },
      {
        title: 'Commit',
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
          color,
          author_name: sender.login,
          author_link: sender.html_url,
          author_icon: sender.avatar_url,
          fields,
          footer: `<${repositoryUrl}|${repositoryName}>`,
          footer_icon: 'https://github.githubassets.com/favicon.ico',
          ts: ts.getTime().toString(),
        },
      ],
    };

    const webhook = new IncomingWebhook(webhookUrl);
    await webhook.send(message);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
