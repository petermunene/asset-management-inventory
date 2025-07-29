from server.app import app , db
from server.models import Company, Department, User, Request

# Optional: For hashing
from flask_bcrypt import Bcrypt
bcrypt = Bcrypt(app)

def seed():
    with app.app_context():
        # Drop and recreate all tables
        db.reflect()
        db.drop_all()
        db.create_all()

        # ----- Create Companies -----
        company1 = Company(
            name="TechCorp",
            email="contact@techcorp.com",
            logo_url="https://example.com/logos/techcorp.png",
            is_approved=True
        )
        company2 = Company(
            name="BizGroup",
            email="info@bizgroup.com",
            logo_url="https://example.com/logos/bizgroup.png",
            is_approved=False
        )

        db.session.add_all([company1, company2])
        db.session.flush()  # Flush to get IDs

        # ----- Create Departments -----
        dept1 = Department(name="Engineering", company_id=company1.id)
        dept2 = Department(name="HR", company_id=company1.id)
        dept3 = Department(name="Marketing", company_id=company2.id)

        db.session.add_all([dept1, dept2, dept3])
        db.session.flush()

        # ----- Create Users -----
        user1 = User(
            username="alice",
            email="alice@techcorp.com",
            role="employee",
            company_id=company1.id,
            department_id=dept1.id
        )
        user1.hash_password = "password123"

        user2 = User(
            username="bob",
            email="bob@techcorp.com",
            role="manager",
            company_id=company1.id,
            department_id=dept2.id
        )
        user2.hash_password = "securepass"

        user3 = User(
            username="carol",
            email="carol@bizgroup.com",
            role="director",
            company_id=company2.id,
            department_id=None  # Directors may not belong to departments
        )
        user3.hash_password = "adminpass"

        user4 = User(
            username="peter",
            email="muriukimunenepierr@gmail.com",
            role="super_admin",
            company_id=None,
            department_id=None  
        )
        user4.hash_password = "superadminpass"

        db.session.add_all([user1, user2, user3,user4])
        db.session.flush()

        # ----- Create Requests -----
        request1 = Request(
            reason="Need laptop",
            quantity=1,
            urgency="High",
            request_type="hardware",
            status="pending",
            user_id=user1.id
        )

        request2 = Request(
            reason="Office supplies",
            quantity=5,
            urgency="Medium",
            request_type="stationery",
            status="approved",
            user_id=user2.id
        )

        db.session.add_all([request1, request2])

        db.session.commit()
        print("🌱 Database seeded successfully!")

if __name__ == "__main__":
    seed()
