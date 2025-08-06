# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/adcbee4b-cfb3-40b0-8db1-fafe1e609d1c

## API Configuration

This application integrates with a backend API for AI bias detection, explainability, and compliance reporting. 

**Environment Variables:**
- `VITE_API_BASE_URL`: The base URL for your backend API (default: `http://localhost:8000`)

**API Endpoints Used:**
- `GET /api/v1/dashboard/summary` - Dashboard summary data
- `GET /api/v1/dashboard/model_risk` - Model risk breakdown
- `POST /api/v1/bias/detect` - Bias detection analysis
- `POST /api/v1/explain` - Model explainability analysis
- `POST /api/v1/compliance/generate` - Compliance report generation

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/adcbee4b-cfb3-40b0-8db1-fafe1e609d1c) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Configure environment variables (optional)
# Create a .env file in the root directory and set your backend API URL:
# VITE_API_BASE_URL=http://localhost:8000
# Note: Environment variables in Vite must be prefixed with VITE_

# Step 5: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/adcbee4b-cfb3-40b0-8db1-fafe1e609d1c) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
