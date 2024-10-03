# Behavio
behavio.cc and app.behavio.cc are offline until we have more support for collecting data.

# Purpose
My wife works in a classroom with special needs children. We were trying to assess whether or not the weather had any impact on their behavior. This project was initially created to manually track their behavior as it relates to the day of the week, lunar cycle, and barometric pressure.

If you would like to continue the work, feel free to continue working with our limited code.

## Struggles
- We have limited input to create valuable models.

## Notes for next steps
- Polish the user and team management
- Tie the users to the teams and the logins
- Find an API provider that supports historical data beyond 7 days for free(?)
- This app costs roughly $20 to run on DigitalOcean.

# Development
## Install Dependencies
Local applications
```
NPM
MongoDB
```

Clone the repo

From `app` run `npm install`
From `mongodb` run `mongorestore --uri=mongodb://localhost:27017`

## Get Weather API key
https://www.weatherapi.com/

## Run the Node.js server via Nodemon
From `app` run 'nodemon server.js`

## Inital password
12345

## Contact
You can email me at steven@behavio.cc if you would like to bring this tool back to life.
