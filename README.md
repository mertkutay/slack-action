# Slack Notifier

This action sends a notification message to slack that can be used for push events in GitHub workflows.

## Inputs

### `status`

**Required** The status of the job

### `channel`

**Optional** The name of the slack channel

## Example usage

uses: mertkutay/slack-action@v1
with:
  status: 'success'
env:
  SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
