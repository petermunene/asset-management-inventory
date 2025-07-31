#app.py

import os
from flask import Flask
from extensions import migrate, bcrypt , db
from flask_cors import CORS
from flask_restful import Api
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import cloudinary
import cloudinary.uploader
import cloudinary.api
load_dotenv()
cloudinary.config(
  cloud_name="dqdxhajo1",
  api_key="156916228529995",
  api_secret=os.getenv('CLOUDINARY_SECRET_KEY'),
  secure=True
)
app = Flask(__name__)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URL")
api = Api(app)
app.config['JWT_SECRET_KEY'] = os.getenv('APP_SECRET_KEY')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 900  
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = 2592000 
app.config['JWT_COOKIE_CSRF_PROTECT'] = False
jwt = JWTManager(app)
db.init_app(app)
migrate.init_app(app, db)
bcrypt.init_app(app)
CORS (app , supports_credentials=True)



from resources import (
    CompanyResource, GetAllCompanies,
    UserSignup, GetAllUsers,
    DepartmentResource, GetAllDepartments,
    CompanyAssetResource, DepartmentAssetResource, UserAssetResource,
    RequestAssetResource, UserLogin,
    SuperAdminResource, CompaniesGrouped,AllRequests,AllUserAssets,RefreshTokenResource
)
# JWT token refresh route
api.add_resource(RefreshTokenResource, '/refresh')
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
api.add_resource(AllUserAssets,
    '/user-assets/all'           # GET all user assets
)

# Asset requests
api.add_resource(RequestAssetResource,
    '/asset-requests',           # POST
    '/asset-requests/get' ,       # GET requests by username
    '/asset-requests/<int:id>'  # PATCH to approve/reject request
)

api.add_resource(AllRequests,
    '/asset-requests/all'        # GET all requests
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
