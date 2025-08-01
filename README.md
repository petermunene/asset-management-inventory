🧾 Asset Inventory Management System
A centralized web application to help organizations manage, track, and maintain their physical assets across departments.

📌 Problem Statement
Many organizations struggle to track assets and handle requests for repairs or replacements. Most still rely on spreadsheets, making it hard to prioritize and allocate funds effectively. This project provides a centralized, user-role-based system for managing assets, requests, and workflows.

🚀 Features (Minimum Viable Product)
User Authentication & Authorization
Secure login system with role-based access control

Three user types:

Admin (full system access)

Director (request approval, asset management)

Employees (request submission, personal asset tracking)

Asset Management
Add, update, and remove assets with images and categories

Asset allocation to specific employees

Centralized database for all organizational assets

Request System
Employees can:

Request new assets (with quantity, reason, urgency)

Report needed repairs

Track request status (pending/approved/rejected)

Procurement Managers can:

View and prioritize pending requests by urgency

Approve or reject requests

Track completed requests

Technical Specifications
Backend
Framework: Flask (Python)

Database: PostgreSQL

API: RESTful architecture

Frontend
Framework: ReactJS

State Management: Redux Toolkit

UI/UX: Mobile-responsive design (Figma wireframes)

Testing
Unit Testing: Jest & Minitest

UI Testing: Comprehensive test suite

Coverage: Maintains >85% test coverage

Installation
Prerequisites
Node.js (v14+)

Python (v3.8+)

PostgreSQL (v12+)

npm/yarn


📂 Project Structure (Suggested)
backend/
  ├── app/
  ├── tests/
  └── requirements.txt

frontend/
  ├── src/
  │   ├── components/
  │   ├── assets/
  │   ├── api.js
  │   └── App.jsx
  └── package.json

🛠️ Setup Instructions
Clone the repository

git clone <repo-url>
Backend
cd backend
pip install -r requirements.txt
flask run

Frontend
cd frontend
npm install
npm start

🔐 User Roles
Role	Permissions
Admin	Full access
Director Admin	Approve/reject requests, manage assets
Finance	View all requests
Employee	Create/view personal asset requests

✨ Contributing
Fork the repo

Create a feature branch

Submit a pull request after review

Include tests with your feature

🧪 Testing
Run backend tests:
python -m unittest

Run frontend tests:
npm test
