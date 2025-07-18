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

