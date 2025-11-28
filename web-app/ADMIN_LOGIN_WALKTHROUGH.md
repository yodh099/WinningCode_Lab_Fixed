# Admin Login Walkthrough & Fix

This guide explains how to resolve the "No admin available to receive messages" error and how to log in as an administrator on the Winning Code platform.

## The Issue

The error "No admin available to receive messages" occurs because the system cannot find any user with the `admin` role in the database.

When a user sends a message, the system looks for a recipient in the `profiles` table where `role = 'admin'`. If no such user exists, the message cannot be sent.

## The Solution

To fix this, you must manually promote a registered user to the `admin` role. This involves updating two locations in your Supabase project:
1.  The `public.profiles` table (used for message routing).
2.  The `auth.users` metadata (used for permission middleware).

## Step-by-Step Instructions

### 1. Create an Account (if you haven't already)
1.  Go to your application's registration page (e.g., `/register`).
2.  Sign up with the email address you want to use for the admin account.
3.  *Note: By default, new accounts are created with the `client` role.*

### 2. Access Supabase Dashboard
1.  Log in to your [Supabase Dashboard](https://supabase.com/dashboard).
2.  Select your project ("Winning Code Lab").

### 3. Update the `profiles` Table
This step fixes the "No admin available" error.

1.  In the left sidebar, click on **Table Editor**.
2.  Select the `profiles` table.
3.  Find the row corresponding to your user (you can search by `full_name` or `id`).
4.  Double-click the `role` column for that user.
5.  Change the value from `client` to `admin`.
6.  Click **Save** (or press Enter) to apply the change.

### 4. Update User Metadata (for Admin Dashboard Access)
This step allows you to access the `/admin` routes.

1.  In the left sidebar, click on **Authentication**.
2.  Click on **Users**.
3.  Find your user email in the list.
4.  Click the **three dots (...)** menu on the right side of the user row.
5.  Select **Edit User**.
6.  In the "User Metadata" JSON object, find the `"role": "client"` field.
7.  Change it to `"role": "admin"`.
    ```json
    {
      "full_name": "Your Name",
      "role": "admin",
      ...
    }
    ```
8.  Click **Save User**.

### 5. Verify the Fix
1.  Go back to your application.
2.  **Log out** and **Log in** again (this is required to refresh your session permissions).
3.  You should now be redirected to the **Admin Dashboard** (`/admin/dashboard`) instead of the Client Dashboard.
4.  To test the messaging:
    -   Open a different browser (or Incognito window).
    -   Log in as a standard client user.
    -   Try sending a message.
    -   It should now send successfully without the "No admin available" error.

## Summary
You have now successfully created an admin account and resolved the messaging issue. Any messages sent by clients will be routed to this admin user.
