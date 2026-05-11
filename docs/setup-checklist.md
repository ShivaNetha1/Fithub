# Setup Checklist

## Local

- Install Node.js 22.12 or newer.
- Run `npm.cmd install`.
- Create `.env.local` from `.env.example`.
- Add Supabase credentials.
- Run migrations.
- Run `npm.cmd run dev -- --hostname 127.0.0.1`.

## Supabase

- Create project.
- Save database password securely.
- Copy project URL.
- Copy publishable key.
- Copy secret key.
- Copy pooled database connection string.
- Copy direct database connection string.
- Run migration SQL files.
- Configure Auth redirect URLs.

## App Verification

- Create owner account.
- Login.
- Create gym.
- Confirm default plans exist.
- Add member.
- Record payment.
- Mark attendance.
- Check dashboard counts.
- Check analytics charts.

## ZIP Creation

From the parent folder:

```powershell
Compress-Archive -Path .\Fithub -DestinationPath .\Fithub.zip -Force
```

Do not include `.env.local` in shared ZIP files.
