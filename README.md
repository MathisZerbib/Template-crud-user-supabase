```bash
# 🔐 Next.js Authentication with NextAuth, Prisma, and PostgreSQL

# 1. Create Next.js Project
npx create-next-app@latest my-auth-app
cd my-auth-app

# 2. Install Dependencies
npm install next-auth @prisma/client @next-auth/prisma-adapter
npm install -D prisma

# 🗄️ Database Configuration

# Supabase Setup
# 1. Create a Supabase account
# 2. Launch a new project
# 3. Set your database password
# 4. Copy the database URI from project settings

# 🔗 Prisma Integration

# Initialize Prisma
npx prisma init

# Configure Database Connection
# Update .env file:
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-SUPABASE-ID].supabase.co:5432/postgres"

# Define Schema
# Add the following to prisma/schema.prisma:
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id             String    @id @default(cuid())
  name           String?
  email          String?   @unique
  password       String?
  emailVerified  DateTime?
  image          String?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  accounts       Account[]
  sessions       Session[]
}

# Create Tables
npx prisma db push

# Install Prisma Client
npm install @prisma/client
```# Template-crud-user-supabase
