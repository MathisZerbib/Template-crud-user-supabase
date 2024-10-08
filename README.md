# 🔐 Next.js Authentication with NextAuth, Prisma, and Supabase

This project demonstrates how to implement authentication in a Next.js application using NextAuth.js.

## Features

- User authentication with NextAuth.js
- Sendgrid for email verification & password reset
- Custom login page
- Protected routes
- User sessions
- Google OAuth

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- A Supabase account
- A Sendgrid account

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/your-username/nextjs-auth-example.git
cd nextjs-auth-example

yarn install
# or
npm install
```

2. Create a `.env.local` file in the root of the project:

```bash
touch .env.local
```

3. Add the following environment variables to the `.env.local` file:

```bash
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-SUPABASE-ID].supabase.co:5432/postgres"
NEXT_PUBLIC_APP_URL='http://localhost:3000'
NEXT_AUTH_SECRET='your secret'

SENDGRID_API_KEY="YOUR_SENDGRID_API_KEY"
SENDGRID_FROM_EMAIL='YOUR_EMAIL'
SENDGRID_FROM_NAME='YOUR NAME'
SENDGRID_SMTP_SERVER='smtp://apikey:[YOUR-PASSWORD]@smtp.sendgrid.net:587'
GOOGLE_CLIENT_ID='YOUR_GOOGLE_CLIENT_ID'
GOOGLE_CLIENT_SECRET='YOUR_GOOGLE_CLIENT_SECRET'
``` 


## Prisma
1. Modify the `DATABASE_URL` environment variable in the `.env.local` file with your Supabase database URL.

2. You can modify the schema in the `prisma/schema.prisma` file to match the following but you can modify it according to your needs:
  

```bash
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
    provider = "prisma-client-js"
}

datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
}

model Account {
    id                String  @id @default(cuid())
    userId            String
    type              String
    provider          String
    providerAccountId String
    refresh_token     String? @db.Text
    access_token      String? @db.Text
    expires_at        Int?
    token_type        String?
    scope             String?
    id_token          String? @db.Text
    session_state     String?

    user User @relation(fields: [userId], references: [id], onDelete: Cascade)

    @@unique([provider, providerAccountId])
}

model Session {
    id           String   @id @default(cuid())
    userId       String
    expires      DateTime
    sessionToken String   @unique
    accessToken  String   @unique
    createdAt    DateTime @default(now())
    updatedAt    DateTime @updatedAt
    user         User     @relation(fields: [userId], references: [id])
}

model User {
    id                String    @id @default(cuid())
    name              String?
    email             String?   @unique
    password          String?
    emailVerified     DateTime?
    image             String?
    createdAt         DateTime  @default(now())
    updatedAt         DateTime  @updatedAt
    accounts          Account[]
    sessions          Session[]
    resetToken        String?
    resetTokenExpiry  DateTime?
    verificationToken String?
    googleId          String?   @unique
}

model VerificationRequest {
    id         String   @id @default(cuid())
    identifier String
    token      String   @unique
    expires    DateTime
    createdAt  DateTime @default(now())
    updatedAt  DateTime @updatedAt

    @@unique([identifier, token])
}
```

4. Run the following command to generate the Prisma client:

```bash
npx prisma generate
```

5. Run the following command to create the database tables:

```bash
npx prisma db push
```

## run the project
```bash
yarn dev
```

