from app import db,bcrypt
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy import Numeric
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.ext.hybrid import hybrid_property
from app import db, bcrypt
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy import ForeignKey



class SuperAdmin(SerializerMixin, db.Model):
    __tablename__ = "superadmins"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String)
    _hash_password = db.Column(db.String, nullable=False)

    @hybrid_property
    def hash_password(self):
        raise AttributeError("Cannot access password directly")

    @hash_password.setter
    def hash_password(self, password):
        self._hash_password = bcrypt.generate_password_hash(password).decode('utf-8')

    def authenticate(self, password):
        return bcrypt.check_password_hash(self._hash_password, password)


class Company(SerializerMixin, db.Model):
    __tablename__ = "companies"
    serializer_rules = ('-users.company', '-departments.company')

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String)
    name = db.Column(db.String, nullable=False, unique=True)
    logo_url = db.Column(db.String, nullable=False)

    users = db.relationship("Users", back_populates='company', cascade='all,delete-orphan')
    departments = db.relationship('Department', back_populates='company', cascade='all,delete-orphan')
    assets = db.relationship('Asset', back_populates='company', cascade='all,delete-orphan')
    asigned_assets = db.relationship('AsignedAsset', back_populates='company', cascade='all,delete-orphan')
    departmental_assets = db.relationship('DepartmentalAssets', back_populates='company', cascade='all,delete-orphan')


class Department(SerializerMixin, db.Model):
    __tablename__ = 'departments'
    serializer_rules = ('-users.department', '-company.departments')

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id', ondelete="CASCADE"))

    company = db.relationship('Company', back_populates='departments')
    users = db.relationship('Users', back_populates='department', cascade='all,delete-orphan')
    departmental_assets = db.relationship('DepartmentalAssets', back_populates='department', cascade='all,delete-orphan')

class Asset(SerializerMixin, db.Model):
    __tablename__ = 'assets'
    serializer_rules = ('-company.assets',)

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    category = db.Column(db.String)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id', ondelete='CASCADE'))

    company = db.relationship('Company', back_populates='assets')


class AsignedAsset(SerializerMixin, db.Model):
    __tablename__ = 'asigned_assets'
    serializer_rules = ('-user.asigned_assets', '-company.asigned_assets')

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    category = db.Column(db.String)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'))
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id', ondelete='CASCADE'))

    user = db.relationship('Users', back_populates='asigned_assets')
    company = db.relationship('Company', back_populates='asigned_assets')


class DepartmentalAssets(SerializerMixin, db.Model):
    __tablename__ = 'departmental_assets'
    serializer_rules = ('-department.departmental_assets', '-company.departmental_assets')

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    category = db.Column(db.String)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id', ondelete='CASCADE'))
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id', ondelete='CASCADE'))

    department = db.relationship('Department', back_populates='departmental_assets')
    company = db.relationship('Company', back_populates='departmental_assets')

class Users(SerializerMixin, db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, unique=True, nullable=False)
    _hash_password = db.Column(db.String, nullable=False)
    email = db.Column(db.String, nullable=False)
    role = db.Column(db.String, nullable=False)
    company_id = db.Column(db.Integer, db.ForeignKey("companies.id", ondelete='CASCADE'), nullable=True)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id', ondelete='CASCADE'), nullable=True)
    asigned_asset_id = db.Column(db.Integer, db.ForeignKey('asigned_assets.id'), nullable=True)

    company = db.relationship('Company', back_populates='users')
    department = db.relationship('Department', back_populates='users')
    asigned_assets = db.relationship('AsignedAsset', back_populates='user', cascade='all,delete-orphan')

    @hybrid_property
    def hash_password(self):
        raise AttributeError('You cannot access the password directly')

    @hash_password.setter
    def hash_password(self, password):
        self._hash_password = bcrypt.generate_password_hash(password).decode('utf-8')

    def authenticate(self, password):
        return bcrypt.check_password_hash(self._hash_password, password)


