# RoktoBondhon (রক্তবন্ধন) - Product Requirements Document (PRD)

## 1. Overview
RoktoBondhon is a digital ecosystem designed to streamline blood donation in Bangladesh. It connects donors with those in need, provides real-time tracking, and offers an admin panel for blood banks to manage inventory and campaigns.

### 1.1 Target Users
- **Donors**: Individuals willing to donate blood.
- **Requesters**: People in urgent need of blood for patients.
- **Blood Bank Admins**: Staff managing hospital or organization blood stocks.
- **App Admins**: System administrators managing the platform.

### 1.2 Core Problems Solved
- Fragmented donor data in Bangladesh.
- Difficulty in finding rare blood groups quickly.
- Lack of real-time inventory visibility in blood banks.
- Manual tracking of donation eligibility.

---

## 2. User Roles & Features

### 2.1 Donor
- **Frictionless Auth**: Google Sign-In or Email/Password.
- **Profile**: Blood group, location (Division/District/Upazila), last donation date.
- **Availability Toggle**: "Available to Donate" switch.
- **Eligibility Tracker**: Auto-calculation of next donation date (90-day rule).
- **Gamification**: Earn points and badges for donations.
- **Health Dashboard**: Log basic health metrics (Hemoglobin, BP).

### 2.2 Requester
- **SOS Request**: Create urgent blood requests with hospital location and bags needed.
- **Donor Search**: Filter donors by blood group, location, and radius.
- **Real-time Updates**: Track how many donors responded "I'm coming".

### 2.3 Blood Bank Admin
- **Inventory Management**: Update stock levels for all blood groups.
- **Appointment Management**: Manage donor slots.
- **Campaigns**: Create and promote blood donation drives.

### 2.4 App Admin
- **Moderation**: Remove fake requests or block abusive users.
- **Analytics**: View donation trends across regions.
- **User Management**: Manage roles and permissions.

---

## 3. System Architecture

### 3.1 Tech Stack
- **Mobile**: Flutter (Riverpod for state management).
- **Admin Panel**: React + Tailwind CSS + Lucide Icons.
- **Backend**: Firebase (Auth, Firestore, Storage, Functions, FCM).
- **AI**: Gemini API for chatbot and eligibility guidance.
- **Maps**: Google Maps SDK for location-based search.

### 3.2 Data Model (Firestore)

#### Collections:
- `users`: `{ uid, name, bloodGroup, location: { lat, lng, area }, lastDonationDate, points, role, isAvailable }`
- `requests`: `{ requestId, requesterUid, patientName, bloodGroup, bagsNeeded, hospital: { name, lat, lng }, urgency, status, createdAt, expiresAt }`
- `donations`: `{ donationId, donorUid, requestId, date, location, verified }`
- `bloodBanks`: `{ bankId, name, location, contact, stock: { 'A+': 10, 'O-': 2, ... } }`
- `appointments`: `{ appointmentId, userId, bankId, dateTime, status }`
- `posts`: `{ postId, authorId, content, likes, comments, createdAt }`
- `notifications`: `{ notificationId, userId, title, body, type, read, createdAt }`

---

## 4. AI Chatbot (Gemini)
The chatbot "Bondhu" assists users in Bangla and English.

### System Prompt:
"You are Bondhu, the AI assistant for RoktoBondhon. Your goal is to help users find donors, check eligibility, and understand blood donation benefits. You support Bangla and English. Use the provided tools to fetch real-time data."

### Tools (Function Calling):
- `searchDonors(bloodGroup, location)`
- `checkEligibility(lastDonationDate, healthConditions)`
- `findNearbyBloodBanks(lat, lng)`
- `createDraftRequest(details)`

---

## 5. Roadmap
- **Phase 1 (MVP)**: Auth, Profile, SOS Request, Donor Search, Basic Admin.
- **Phase 2**: Blood Bank Inventory, Gamification, AI Chatbot.
- **Phase 3**: Community Feed, Health Dashboard, Ambulance Module.
