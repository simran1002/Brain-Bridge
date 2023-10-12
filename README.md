Create a Google OAuth 2.0 Client ID:

Go to the Google Developers Console.
Create a new project or select an existing one.
Navigate to "APIs & Services" > "Credentials."
Click on "Create Credentials" and select "OAuth client ID."
Choose "Web application" as the application type.
Set the authorized JavaScript origins and redirect URIs. In a GitHub context, you might need to set the redirect URI to https://github.com/login/oauth/complete. Be sure to replace github.com with your GitHub Enterprise host if you're using a self-hosted GitHub instance.
Click "Create" to generate the client ID and client secret.
