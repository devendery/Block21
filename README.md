# Block21 (B21) Website

A decentralized, production-ready website for the Block21 token built with Next.js 14, TypeScript, and Tailwind CSS.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

1.  **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    ```

2.  **Run the development server:**

    ```bash
    npm run dev
    # or
    yarn dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🛠 Deployment

This project is optimized for deployment on [Vercel](https://vercel.com).

1.  Push this code to a GitHub repository.
2.  Import the repository in Vercel.
3.  Vercel will automatically detect Next.js and deploy.

## 📝 Google Sheets Integration (ICO Dashboard)

To enable the data collection for the ICO Dashboard:

1.  Go to [Google Apps Script](https://script.google.com/).
2.  Create a new project.
3.  Copy the code from `google-apps-script.js` (in this project root) into the script editor.
4.  **Run the `setup()` function** once to initialize the sheet headers.
5.  **Deploy as Web App**:
    -   Click "Deploy" > "New deployment".
    -   Select type: "Web app".
    -   Description: "B21 ICO Backend".
    -   Execute as: "Me".
    -   **Who has access: "Anyone"** (Critical for public submissions).
6.  Copy the **Web App URL**.
7.  Open `app/dashboard/page.tsx` and replace `GOOGLE_SCRIPT_URL` with your new URL.

## 📂 Project Structure

-   `app/`: Pages and routes.
-   `components/`: Reusable UI components.
-   `hooks/`: Custom React hooks (e.g., `useWallet`).
-   `lib/`: Utility functions and API calls.
-   `public/`: Static assets (ICO status JSON).

## ⚠️ Important Notes

-   **Contract Address**: The B21 contract address is configured in `lib/utils.ts`.
-   **Chain ID**: Configured for Polygon Mainnet (137).
-   **Disclaimer**: This project adheres to strict "No Guarantee" language as requested.
