# Slack Notifier

This action sends a notification message to slack that can be used for push events in GitHub workflows.

## Inputs

### `status`

**Required** The status of the job. Valid values are: `info`, `success`, `failure`, `cancelled`.

### `channel`

**Optional** The name of the slack channel.

### `text`

**Optional** The text that will be sent besides workflow name. Defaults to title case status.

## Example usage

<pre>
uses: mertkutay/slack-action@v1
with:
  status: 'success'
env:
  SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
</pre>

