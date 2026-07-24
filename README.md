# SmartPantry
SmartPantry
Food Donation and Pantry Management System
Project Overview

SmartPantry is a web application developed to help users manage food inventory and reduce food waste through food donation. Users can track pantry items, monitor expiry dates, donate surplus food, and browse available donations.

Team Members
Sujina – Project setup, User Authentication, Dashboard, Email Verification, UI Development, GitHub Management
Pasang – Inventory Management, Food Management, Image Upload, Frontend Integration, Inventory CRUD
Manav – Donation Management, Notification System, API Integration, System Testing and Documentation

Technologies Used
-Python
-Django & Django REST Framework
-React.js
-PostgreSQL
-Git & GitHub

Main Features
-User Registration & Login
-Inventory Management
-Food Donation
-Dashboard
-Notifications
-Image Upload
-Expiry Tracking

Installation

Clone the repository:

git clone https://github.com/sujina8/SmartPantry.git

Backend:

cd SmartPantry
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

Frontend:

npm install
npm run dev
Git Workflow
main
│
develop
│
├── feature/sujina-auth
├── feature/pasang-inventory
└── feature/manav-donation

Each team member worked on a separate feature branch before merging into develop, and finally into main.

Testing

The system was tested for:

User Authentication
-Inventory Management
-Food Donation
-Dashboard
-API Endpoints
-Playwright Testing

Future Improvements
-Mobile Application
-AI Meal Recommendation
-Barcode Scanner
-Push Notifications
-Conclusion

SmartPantry provides a simple solution for managing food inventory and encouraging food donation. This project allowed the team to gain practical experience in full-stack web development, API development, database management, Git collaboration, and software testing.