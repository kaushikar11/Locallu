# Vercel Serverless Function Troubleshooting

## Common Error: FUNCTION_INVOCATION_FAILED

If you're seeing a 500 error with `FUNCTION_INVOCATION_FAILED`, follow these steps:

### 1. Check Vercel Logs

1. Go to your Vercel Dashboard
2. Select your project
3. Go to **Deployments** tab
4. Click on the failed deployment
5. Click **Functions** tab
6. Click on the function that's failing (usually `/api/index.js`)
7. Check the **Logs** tab for detailed error messages

### 2. Common Issues and Fixes

#### Issue: Firebase Initialization Error

**Symptoms:**
- Error mentions Firebase or Firestore
- "Cannot find module" errors
- Authentication errors

**Fix:**
1. Verify all Firebase environment variables are set in Vercel:
   - `FIREBASE_TYPE`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_PRIVATE_KEY_ID`
   - `FIREBASE_PRIVATE_KEY` (must include full key with `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`)
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_CLIENT_ID`
   - `FIREBASE_STORAGE_BUCKET`

2. For `FIREBASE_PRIVATE_KEY`, make sure:
   - The entire key is in one line in Vercel's environment variables
   - Include `\n` characters (they will be converted to newlines automatically)
   - Or paste the key exactly as it appears in your `.env` file

#### Issue: Missing Environment Variables

**Symptoms:**
- `JWT_SECRET is undefined`
- `process.env.FIREBASE_* is undefined`

**Fix:**
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add ALL variables from your `.env` file
3. Make sure to set them for **Production**, **Preview**, and **Development**
4. After adding variables, **redeploy** your application

#### Issue: Module Not Found

**Symptoms:**
- `Cannot find module 'xxx'`
- `Module not found` errors

**Fix:**
1. Make sure all dependencies are in `package.json` (not just `devDependencies`)
2. Check that `node_modules` is not in `.gitignore` (it shouldn't be - Vercel installs it)
3. Verify your `package.json` has all required dependencies

#### Issue: CORS Errors

**Symptoms:**
- CORS policy errors in browser
- 403 Forbidden errors

**Fix:**
- CORS is now enabled in `app.js` - this should be resolved
- If still seeing issues, check that the CORS middleware is properly configured

#### Issue: Route Not Found

**Symptoms:**
- 404 errors for API routes
- Routes not matching

**Fix:**
1. Verify `vercel.json` has correct route configuration
2. Check that `api/index.js` exists and exports the Express app
3. Ensure API routes start with `/api/`

### 3. Testing Locally Before Deploying

Test your serverless function locally:

```bash
# Install Vercel CLI
npm i -g vercel

# Run locally
vercel dev
```

This will simulate the Vercel environment locally and help catch issues before deployment.

### 4. Debugging Steps

1. **Add console.log statements** in `api/index.js`:
   ```javascript
   console.log('API function called');
   console.log('Request path:', req.path);
   console.log('Environment:', process.env.NODE_ENV);
   ```

2. **Check Firebase initialization**:
   ```javascript
   // In config/firebase.js, add:
   console.log('Firebase config:', {
     hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
     hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
     projectId: process.env.FIREBASE_PROJECT_ID
   });
   ```

3. **Verify environment variables are loaded**:
   ```javascript
   // In app.js, add:
   console.log('Environment check:', {
     nodeEnv: process.env.NODE_ENV,
     hasJwtSecret: !!process.env.JWT_SECRET,
     isVercel: !!process.env.VERCEL
   });
   ```

### 5. Common Environment Variable Issues

#### Private Key Format

The `FIREBASE_PRIVATE_KEY` must be formatted correctly. In Vercel's environment variables:

**Correct:**
```
-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQD2RAiRnvfsEEsL\n...\n-----END PRIVATE KEY-----\n
```

**Incorrect:**
- Missing `\n` characters
- Missing `-----BEGIN PRIVATE KEY-----` or `-----END PRIVATE KEY-----`
- Extra spaces or line breaks

### 6. Redeploy After Changes

After fixing environment variables or code:
1. Go to Vercel Dashboard
2. Click **Redeploy** on your latest deployment
3. Or push a new commit to trigger automatic deployment

### 7. Check Function Timeout

Vercel has function timeout limits:
- Hobby plan: 10 seconds
- Pro plan: 60 seconds

If your function is timing out:
- Check for long-running operations
- Optimize database queries
- Consider using background jobs for heavy operations

### 8. Verify Build Process

Check that the build completes successfully:
1. Go to Deployment → Build Logs
2. Verify `npm run build` completes without errors
3. Check that `dist/` folder is created

### 9. Contact Support

If none of these steps resolve the issue:
1. Check Vercel's [Status Page](https://www.vercel-status.com/)
2. Review [Vercel Documentation](https://vercel.com/docs)
3. Check [Vercel Community](https://github.com/vercel/vercel/discussions)

---

## Quick Checklist

Before deploying, ensure:
- [ ] All environment variables are set in Vercel
- [ ] `FIREBASE_PRIVATE_KEY` includes full key with newlines
- [ ] `package.json` has all dependencies
- [ ] `vercel.json` is correctly configured
- [ ] `api/index.js` exists and exports the app
- [ ] Build completes successfully locally (`npm run build`)
- [ ] No syntax errors in code

