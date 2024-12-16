# Automatic Rerouting of SeaRoute - Backend
This is the backend for our website that automatically reroutes when a relevant news that may impact sea trade is published online.

This backend listens to the published news using NewsAPI(https://newsapi.ai/#). It will feed relevant news to OpenAI to read and determine it's severity level. Such news will be flagged up to admins to view. Upon confirmation of the severity of the news, the user will confirm the news on our website which will then reroute affected ships.

We used firebase for database storage.
