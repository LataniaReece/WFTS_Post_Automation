# WFTS Motivational Post Generator

## Overview
Generate motivational posts based on themes using AI-powered suggestions. This application retrieves data from a Supabase database, which contains all the quotes that WFTS has previously posted. It uses these existing quotes as the dataset for OpenAI's models to learn from and craft new posts.

## Prerequisites
- Node.js installed
- Access to Supabase and OpenAI services

## Setup

### Environment Variables
Create a `.env` file in the root directory with the following variables:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_API_KEY` - Your Supabase service key
- `OPENAI_API_KEY` - Your OpenAI API key

### Database Setup
Initialize your Supabase database by following the instructions detailed in the Supabase documentation for LangChain. This setup will create a `documents` table where you can push your vectors to. See the guide [here](https://supabase.com/docs/guides/ai/langchain?queryGroups=database-method&database-method=sql) for detailed steps on setting up your database.

### Installation
Run the following command to install dependencies:
`npm install`

### Running the Application
To start the application, run:

`npm start`

After starting, follow the on-screen prompts to input a theme and receive a motivational post suggestion.

## Updating Quotes Database
To add or update the quotes in your Supabase database, prepare a `quotes_samples.js` file containing your new quotes. Ensure each quote is separated by a newline and numbered. Here is an example of how the file should be formatted:

```
export default `
1. Your first quote here

2. Your second quote here

3. Your third quote here
`;

```
Execute the `updateDbWithQuotes` script after setting up your `quotes_samples.js` file by running `npm run updateDbWithQuotes` . This script processes the file, assuming each quote is on a new line and numbered, and ensures your database is updated. Make sure to remove any duplicates from your file before updating to maintain the uniqueness of the quotes in your database.
