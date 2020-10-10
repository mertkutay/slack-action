import { context } from '@actions/github';
import * as core from '@actions/core';
import { IncomingWebhook } from '@slack/webhook';

async function run() {
  try {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    const status = core.getInput('status', { required: true });
    const channel = core.getInput('channel', { required: false });
    const { workflow, payload } = context;
    const { repository, sender } = payload;
    const commit = payload.head_commit;
    const branch = context.ref.replace('refs/heads/', '');
    const repositoryName = repository.full_name;
    const repositoryUrl = repository.html_url;
    const branchUrl = `${repositoryUrl}/tree/${branch}`;

    let text = '';
    let color;
    switch (status.toLowerCase()) {
      case 'started':
        text = `:information_source: Started: ${workflow}`;
        break;
      case 'success':
        color = 'good';
        text = `:white_check_mark: Success: ${workflow}`;
        break;
      case 'failure':
        color = 'danger';
        text = `:no_entry: Failure: ${workflow}`;
        break;
      case 'cancelled':
        color = 'warning';
        text = `:warning: Cancelled: ${workflow}`;
        break;
      default:
        throw new Error(
          'Valid statuses are: started, success, failure, cancelled',
        );
    }

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
