# Getting Started with ConfigFlow

By the end of this guide, you'll have a working ConfigFlow instance serving config to a local app.

## Step 1: Install

```bash
brew install configflow
```

If you're on Linux, use the install script instead:

```bash
curl -fsSL https://install.configflow.io | sh
```

## Step 2: Initialize

```bash
configflow init
```

This creates a local dev instance. Skip the cluster setup for now — you don't need it until you have 3+ services.

## Step 3: Write your first config

```bash
configflow kv put app/port 8080
configflow kv get app/port
```

## Next steps

If you're building a single app, you're done. Go to the SDK guide.
If you're setting up for a team, go to the Access Control guide next.
