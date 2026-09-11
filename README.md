# ScanTrack

<p>
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-Prisma-2D3748?logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/JWT-Authentication-000000?logo=jsonwebtokens&logoColor=white" />
</p>

ScanTrack is a full-stack asset tracking and management system built with React, TypeScript, Node.js, Express, PostgreSQL, and Prisma. It helps organizations manage physical assets, locations, assignments, RFID-style scanning, unexpected movement detection, and audit activity in one application.

## Overview

ScanTrack connects asset management, location tracking, asset assignment, RFID-style scanning, movement verification, and audit logging.

Users can register assets with unique asset codes, serial numbers, and RFID-style tags, assign assets to users, track their locations, and monitor their status.

The scanning workflow compares the asset's expected location with the location where it was scanned. When a mismatch is detected, the system reports the issue without automatically changing the asset location. An authorized user can verify the movement and explicitly update the location.

## Key Features

### Asset Management

- Create, update, search, filter, and archive assets
- Asset status management
- Serial number and RFID-style tag tracking
- Asset assignment to users
- Detailed asset information and history
- Pagination and validation

### Location Management

- Create, update, view, and delete locations
- Assign assets to locations
- View asset counts by location
- Prevent deletion of locations containing assets
- Explicit asset location updates

### RFID-Style Scanning

- Simulated RFID tag scanning
- Successful asset identification
- Unknown RFID detection
- Location mismatch detection
- Scan history
- Asset-specific scan history
- Verified location updates

### Authentication & Authorization

- User registration and login
- JWT-based authentication
- bcrypt password hashing
- Protected API routes
- Role-based access control
- Role-aware frontend actions

Supported roles:

```text
ADMIN
ASSET_MANAGER
VIEWER
Dashboard
Total asset statistics
Available, assigned, and in-transit assets
Assets requiring attention
Location overview
Asset status distribution
Recent scan activity
Quick actions
Audit Activity

ScanTrack records important asset changes for accountability.

Tracked activities include:

ASSET_CREATED
ASSET_UPDATED
ASSET_ASSIGNED
LOCATION_CHANGED
STATUS_CHANGED
ASSET_DELETED

Audit records include the user, asset, action, previous value, new value, and timestamp.

Scanning Workflow
RFID Tag
   ↓
Scan Asset
   ↓
Identify Asset
   ↓
Compare Expected Location
   ↓
┌───────────────┬────────────────────┐
│ Location Match│ Location Mismatch  │
└───────┬───────┴──────────┬─────────┘
        ↓                  ↓
     SUCCESS          MISMATCH DETECTED
                           ↓
                    User Verification
                           ↓
                  Explicit Location Update
                           ↓
                       Audit Log

The system deliberately does not automatically change an asset's location when a mismatch occurs. This prevents accidental location changes and allows authorized users to verify asset movement.

Architecture
Browser
   ↓
React + TypeScript + Vite
   ↓
Axios REST Client
   ↓
Node.js + Express + TypeScript
   ↓
Middleware
   ├── Authentication
   ├── Role Authorization
   ├── Validation
   └── Error Handling
   ↓
Service Layer
   ↓
Prisma ORM
   ↓
PostgreSQL

The backend follows a modular structure with separate controllers, routes, services, middleware, types, and utilities.

Backend Modules
Authentication
      ↓
Assets
      ↓
Locations
      ↓
Scanning
      ↓
Audit Activity
API Endpoints
Authentication
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

Assets
POST   /api/assets
GET    /api/assets
GET    /api/assets/:id
PUT    /api/assets/:id
DELETE /api/assets/:id
PATCH  /api/assets/:id/location

Locations
POST   /api/locations
GET    /api/locations
GET    /api/locations/:id
PUT    /api/locations/:id
DELETE /api/locations/:id

Scanning
POST   /api/scans
GET    /api/scans
GET    /api/scans/asset/:assetId

Audit Activity
GET    /api/audits
GET    /api/audits/asset/:assetId

Health
GET    /api/health
Database Design

The system uses PostgreSQL with Prisma ORM.

users
  │
  ├───────────────┐
  │               │
  ↓               ↓
assets        scan_records
  │
  ├───────────────┐
  │               │
  ↓               ↓
locations      audit_logs
Main Entities
User
Asset
Location
ScanRecord
AuditLog
Asset

Assets contain information such as:

assetCode
name
category
serialNumber
rfidTag
status
location
assignedUser
createdAt
updatedAt
ScanRecord

Stores:

asset
RFID tag
scanned location
scanner/user
scan status
scan timestamp
AuditLog

Stores:

asset
user
action
old value
new value
timestamp
Security

The application implements several security and validation mechanisms:

JWT authentication
bcrypt password hashing
Protected API routes
Role-based authorization
Server-side input validation
Foreign key validation
Duplicate asset validation
Generic invalid-login responses
Environment variables excluded from Git
Controlled asset location updates
Audit logging for important asset changes

Sensitive configuration remains in .env files and is excluded from the repository.

Frontend

The frontend is built with React and TypeScript and provides:

Responsive dashboard
Asset management interface
Location management
Asset details
RFID-style scanner
Scan history
Audit activity
Authentication pages
Role-aware UI controls
Loading, error, empty, and confirmation states
Toast notifications
Project Structure
ScanTrack/
│
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   │
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   │
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   │
│   ├── .env.example
│   ├── package.json
│   └── vite.config.ts
│
├── .gitignore
└── README.md
Installation
Requirements
Node.js
npm
PostgreSQL
Git
Backend
cd backend
npm install

Create .env from .env.example and configure the PostgreSQL connection and JWT settings.

Generate Prisma Client:

npx prisma generate

Run migrations:

npx prisma migrate dev

Start the development server:

npm run dev

Backend runs on:

http://localhost:5000
Frontend

Open another terminal:

cd frontend
npm install

Create .env from .env.example:

VITE_API_URL=http://localhost:5000/api

Start the frontend:

npm run dev

Frontend runs on:

http://localhost:5173
Testing

The application was manually verified across the main workflows, including:

✓ User registration
✓ User login
✓ JWT session restoration
✓ Protected routes
✓ Role-based authorization
✓ Asset creation and management
✓ Location management
✓ Successful asset scanning
✓ Location mismatch detection
✓ Unknown RFID handling
✓ Explicit location updates
✓ Scan history
✓ Audit activity
✓ Responsive interface
✓ Backend and frontend builds
Tech Stack
Layer	Technology
Frontend	React, TypeScript, Vite
Routing	React Router
HTTP Client	Axios
UI Icons	Lucide React
Backend	Node.js, Express, TypeScript
Authentication	JWT, bcrypt
Database	PostgreSQL
ORM	Prisma
API	REST
Testing	Manual API & UI verification
Version Control	Git, GitHub
Engineering Highlights
Modular backend architecture
RESTful API design
Relational database modeling
Prisma migrations
JWT authentication
Role-based authorization
Server-side validation
Centralized error handling
Audit logging
Location verification workflow
Responsive React UI
Separation of frontend and backend responsibilities
Future Improvements

Potential future enhancements include:

Physical RFID reader integration
Real-time notifications
Email alerts
Advanced analytics and reporting
Cloud deployment
Mobile application
Asset utilization reports
Author

Rathini Rajendran

Computer Engineering Undergraduate
University of Jaffna

Interested in Software Engineering, Full-Stack Development, and AI/ML
