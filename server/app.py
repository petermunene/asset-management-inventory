#app.py


from flask import Flask
from flask_cors import CORS
from flask_restful import Api
from flask_jwt_extended import JWTManager
from database import db, migrate, bcrypt
import cloudinary
import cloudinary.uploader
import cloudinary.api

cloudinary.config(
  cloud_name="dqdxhajo1",
  api_key="156916228529995",
  api_secret="Siir6pT6E04Q_T2U_xPxtCuVMfE",
  secure=True
)

import os
app = Flask(__name__)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///assets_management.db'  # Use SQLite for simplicity
app.config['JWT_SECRET_KEY'] = 'stenoh,munene,leon,howard,cynthia'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 900
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = 2592000

# Initialize extensions
db.init_app(app)
migrate.init_app(app, db)
bcrypt.init_app(app)
jwt = JWTManager(app)
api = Api(app)
CORS(app, supports_credentials=True)


from resources import (
    CompanyResource, GetAllCompanies,
    UserSignup, GetAllUsers,
    DepartmentResource, GetAllDepartments,
    CompanyAssetResource, DepartmentAssetResource, UserAssetResource,
    RequestAssetResource, UserLogin,
    SuperAdminResource, CompaniesGrouped
)

# Company routes
api.add_resource(CompanyResource,
    '/companies/signup',         # POST
    '/companies/<int:id>',        # PATCH, DELETE
    '/companies/get'             # GET (query param: name)
)
api.add_resource(GetAllCompanies,
    '/companies/all'             # GET all companies
)

# User routes
api.add_resource(UserSignup,
    '/users/signup',             # POST
    '/users/<int:id>'   ,         # PATCH, DELETE
    '/users/get'              # GET (query param: username)
)
api.add_resource(GetAllUsers,
    '/users/all'                 # GET all users
)
api.add_resource(UserLogin, '/users/login')  # POST login

# Department routes
api.add_resource(DepartmentResource,
    '/departments',              # POST
    '/departments/<int:id>',    # DELETE
    '/departments/get'          # GET (query param: name)
)
api.add_resource(GetAllDepartments,
    '/departments/all'           # GET all
)

# Company-wide assets
api.add_resource(CompanyAssetResource,
    '/company-assets',           # POST
    '/company-assets/<int:id>',  # PATCH, DELETE
    '/company-assets/get'        # GET assets by company name
)

# Department-wide assets
api.add_resource(DepartmentAssetResource,
    '/department-assets',        # POST
    '/department-assets/<int:id>',  # PATCH, DELETE
    '/department-assets/get'     # GET assets by department name
)

# User-assigned assets
api.add_resource(UserAssetResource,
    '/user-assets',              # POST
    '/user-assets/<int:id>',     # PATCH, DELETE
    '/user-assets/get'           # GET assets by username
)

# Asset requests
api.add_resource(RequestAssetResource,
    '/asset-requests',           # POST
    '/asset-requests/get'        # GET requests by username
)

# SuperAdmin
api.add_resource(SuperAdminResource,

    '/superadmin/approve'        # PATCH to toggle approval
)

# Grouping companies
api.add_resource(CompaniesGrouped,
    '/companies/grouped'         # GET grouped by approval
)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Create tables if they don't exist
    app.run(debug=True, host='0.0.0.0', port=5000)
