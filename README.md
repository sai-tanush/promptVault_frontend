#  React.js Frontend Setup Guide

This document provides a step-by-step guide to set up and run the frontend server locally.

---

##  Prerequisites

Before getting started, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or above)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Git](https://git-scm.com/)
- Backend Server is running in PORT:5001


---

##  Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/sai-tanush/promptVault_frontend.git
```

---

### 2. Install Dependencies

Navigate to the project directory and install all required packages:

```bash
cd prompt_frontend
npm i
```

---

### 3. Configure Environment Variables

Download the `.env_frontend` file shared with you and **place it in the root directory** of your project.

Then, rename it to `.env`.

```bash
mv .env_frontend .env
```

>  The backend won’t run properly without this file, as it contains essential environment configurations.

---

### 4. Run the Backend Server

Once everything is set up, start the server using:

```bash
npm run dev
```

---

## Server Running

After a successful start, you should see something like:

You can now access your frontend at:

```
http://localhost:5173/
```

---

## Notes

- Make sure your database credentials and API keys are correctly set inside `.env`.
- If you face any issues, try removing `node_modules` and running `npm install` again.

---
