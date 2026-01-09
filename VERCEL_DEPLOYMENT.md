# Vercel Deployment Guide for Locallu

This guide will help you deploy your Locallu application to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. Your project pushed to a Git repository (GitHub, GitLab, or Bitbucket)
3. All environment variables ready

## Step 1: Prepare Your Project

Your project is already configured for Vercel deployment with:
- ✅ `vercel.json` configuration file
- ✅ `api/index.js` serverless function wrapper
- ✅ Updated `app.js` to work as a serverless function
- ✅ Firebase keys in `.env` format

## Step 2: Build Your Project Locally (Optional Test)

Before deploying, test the build locally:

```bash
# Install dependencies
npm install

# Build the React frontend
npm run build

# Verify the dist folder was created
ls -la dist/
```

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy your project**:
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Link to existing project? **No** (first time)
   - Project name: **locallu** (or your preferred name)
   - Directory: **./** (current directory)
   - Override settings? **No**

4. **Deploy to production**:
   ```bash
   vercel --prod
   ```

### Option B: Deploy via Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your Git repository
4. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Click **"Deploy"**

## Step 4: Configure Environment Variables

**IMPORTANT**: You must add all environment variables in Vercel's dashboard.

1. Go to your project in Vercel dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

### Required Environment Variables

```bash
# JWT Secret
JWT_SECRET=deyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJleGFtcGxlVXNlcklkIiwiZW1haWwiOiJleGFtcGxlQGV4YW1wbGUuY29tIiwiaWF0IjoxNjA4NjUzODQwLCJleHAiOjE2MDg2NTc0NDB9.aBFfWl29G2jUfyQkO9tbj0AWxzC9TTl4Jr7GShP9pxw

# Email Configuration
EMAIL=41workforce@gmail.com
EMAIL_PASS=ForgeTiT@0528

# Firebase Service Account Keys
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=wf41-ad0e9
FIREBASE_PRIVATE_KEY_ID=0e117b7e6118f6cb8d8fc5459c285c65284dfd23
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQD2RAiRnvfsEEsL\nXUcf6+aOoe1IIcdAOF+rUio1Ql8wcJuZGFiz2qTQmLosoIGrVIo4+6LfHEdLF83l\nHnKaCxNpka/H47MZx0N4ezRj8ktbvg7gKad7wkWqMP53dgtJLSKRYfAW+DD5mt2S\n1fLPFs037rplyOSpJmzHGVRGiex3QorcF0IltTKk7aCyF3SQomKai80LyBauvcqS\nf50Bie7h8r+RWLdIyBgykPL66k2rXx6A706trQFo1LqzVwtazNMA4sYwG/occpPD\n1bnfAR5ObN3SMlpJa7dlLuO5AkRbvDod2PtVwRji2Qo/Y+3Xk7YAQfqsBrv/MSw2\ncEVFllEJAgMBAAECggEAIsGoWfEPOZR1GvX/v0wafp/w7sDBr9kk+3d9uIWVDK+f\n7kQG5N9jaoNbp0fB9U3ZskAllQqXL0x9RSx+bSpKA5jJr9L9qJI8fgkZdE+yfhC9\nZbrLRga9sU734yFYZ2wE2HLzoTJHKztFsV8bxUmJDi9VxF7Nkuf260SyZcA6jPwi\n3TwG6BtJb48UItUEN04RH9JSnCJ2Igcsk1rb1e4qCp8/ZgjWZmVkluwlltTyZQha\ng/49GTGkD1m6ZXFvluGJN6FLTUg/c8ilsSjPbTw+YlwuMZOdxDtXaaVy/FLUE5nj\ngr+AJdpC1XlL5PfBqR5jwPQ7k/0FkOqnDQIRoSOqOQKBgQD/lpSo5UqGiLx/Px13\nKdqhEDtcABh4vUUErDOjL+1RlVFiydAG/hLENfQURsHRlNNP1js3hR2Hut4+WyEt\nZybYP14zkcm5EdWev8YRIjKdeeOGU/055l4JmS37UopVvHhRYUZ0X/ECumKBq+tN\nz4hbX6xHcWS4gWfVWLxUi6ktJQKBgQD2qZuPPh03cPd5RXF/oKU7D1wfjShoFXGP\nbhxIZm6TAmRjmBMsVZ5s9Ol3WAwqKgmuhiYTjGYznXIHoA0Y/gKOkzo71aWHN08a\nFLkG9pP5/31bJzIdMcVv/n2Tc5QqZJczUqM/QLIpkS0N48IsdHtsIy4MV+mc6+Th\nBqlrUQkZFQKBgELEM1FrlGxQi+0xr6DRbitk8hy2aa4gw0bVNSgL/RKyzu/fiFhL\nRtu6vGgPk9IL7qeMbyuxumUai7P+WkxiBeO3qgQOsYOHBSbTMgqHxHEexjDw/9WA\nOFCJk1lz1m9PLJ8VqjH8Xhk4V0NIhc9tx1EXTQnctVL9ewJgi9IKKceBAoGAY5tQ\nP0MFB1tuBCHf2Hsl3jiwqekV1Ro7toDvmOkMY/9GTNWfgHq+tB8enFwI5Yn+SOTR\nQXmj19oPrzaZs2r3211m2bzH0FescMrHgSFX1k+u7n1ghluP8E7jpQS6Y3gless3\nMxbMG28Ns5sy0ULkiGGYedGSfBTiY2COT9D0jJUCgYEAnVdF5OXUvR84X1N9eltm\n3hpsK6NHflg+6iiMQOdWvL2H4E6N/P9t7nl/AenwCyA77KsrrZ75LNedTxltCWDW\nWJ1YazCmBHgj6F2kuSz5SL2yfS+Vtdby6yRm1MhFdZHxZVN/H4u24eUDzV0zhFEz\nK/jdP18k3VE9DWn7vCR3wEU=\n-----END PRIVATE KEY-----\n
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-edg8e@wf41-ad0e9.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=115064396979647637533
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-edg8e%40wf41-ad0e9.iam.gserviceaccount.com
FIREBASE_UNIVERSE_DOMAIN=googleapis.com
FIREBASE_STORAGE_BUCKET=wf41-ad0e9.appspot.com

# Node Environment
NODE_ENV=production
```

**Important Notes:**
- For `FIREBASE_PRIVATE_KEY`, make sure to include the entire key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- The `\n` characters in the private key will be automatically converted to newlines by Vercel
- Set these variables for **Production**, **Preview**, and **Development** environments

4. After adding variables, **redeploy** your application for changes to take effect

## Step 5: Verify Deployment

1. Visit your deployment URL (provided by Vercel)
2. Test the application:
   - Landing page loads
   - Login/Signup works
   - API endpoints respond correctly
   - Firebase connection works

## Step 6: Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Vercel will automatically provision SSL certificates

## Troubleshooting

### Build Fails

- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version (should be >= 16.0.0)

### API Routes Not Working

- Verify `api/index.js` exists
- Check that `vercel.json` has correct rewrite rules
- Ensure environment variables are set

### Firebase Connection Issues

- Verify all Firebase environment variables are set correctly
- Check that `FIREBASE_PRIVATE_KEY` includes the full key with newlines
- Ensure Firebase project ID matches

### Static Files Not Loading

- Verify `dist` folder is created during build
- Check `vercel.json` rewrite rules
- Ensure `outputDirectory` is set to `dist`

## Project Structure for Vercel

```
.
├── api/
│   └── index.js          # Serverless function wrapper
├── app.js                # Express app (exported, not started)
├── vercel.json           # Vercel configuration
├── package.json
├── webpack.config.js
├── .env                  # Local only (not committed)
└── dist/                 # Built React app (generated)
```

## Continuous Deployment

Vercel automatically deploys when you push to your main branch:
- **Production**: Deploys from `main` branch
- **Preview**: Deploys from other branches and pull requests

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Express.js on Vercel](https://vercel.com/docs/concepts/functions/serverless-functions/runtimes/node-js)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

**Need Help?** Check Vercel's deployment logs or contact support.

