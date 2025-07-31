from app import app, db
from models import User
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt(app)

def seed():
    with app.app_context():
        # Drop and recreate all tables
        db.reflect()
        db.drop_all()
        db.create_all()

        # Create super admin user
        super_admin = User(
            username="peter",
            email="muriukimunenepierr@gmail.com",
            role="super_admin",
            company_id=None,
            department_id=None
        )
        super_admin.hash_password = "superadminpass"  # Use property setter

        db.session.add(super_admin)
        db.session.commit()

        print("✅ Super admin user seeded successfully!")

if __name__ == "__main__":
    seed()