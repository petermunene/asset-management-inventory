from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_restful import Api
from flask_jwt_extended import JWTManager


import os
app = Flask(__name__)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://peter_munene:muriukimunene@localhost:5432/assets_management_db'
api = Api(app)
app.config['JWT_SECRET_KEY'] = 'stenoh,munene,leon,howard,cynthia'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 900  
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = 2592000 
jwt = JWTManager(app)
db = SQLAlchemy(app)
migrate = Migrate(app,db)
bcrypt = Bcrypt(app)
CORS (app , supports_credentials=True)


from resources import (
    CompanySignup, UserSignup, DepartmentResource, CompanyAssetResource,
    DepartmentAssetResource, UserAssetResource, RequestAssetResource,
    UserLogin, SuperAdminResource, CompaniesGrouped
)

api.add_resource(CompanySignup, '/companies/signup', '/companies/<int:id>', '/companies/get', '/companies/all')
api.add_resource(UserSignup, '/users/signup', '/users/<int:id>', '/users/get', '/users/all')
api.add_resource(UserLogin, '/users/login')
api.add_resource(DepartmentResource, '/departments', '/departments/<int:id>', '/departments/get', '/departments/all')
api.add_resource(CompanyAssetResource, '/company-assets', '/company-assets/<int:id>', '/company-assets/get')
api.add_resource(DepartmentAssetResource, '/department-assets', '/department-assets/<int:id>', '/department-assets/get')
api.add_resource(UserAssetResource, '/user-assets', '/user-assets/<int:id>', '/user-assets/get')
api.add_resource(RequestAssetResource, '/asset-requests', '/asset-requests/get')
api.add_resource(SuperAdminResource, '/superadmin/signup', '/superadmin/approve')
api.add_resource(CompaniesGrouped, '/companies/grouped')
