from flask import request, jsonify
from flask_restful import Resource
from app import db
from models import Company, User, Department, Asset, DepartmentalAsset, AsignedAsset , Request
from flask_jwt_extended import create_access_token, create_refresh_token


def get_json_data(*fields):
    data = request.get_json()
    for field in fields:
        if field not in data:
            raise ValueError(f"Missing field: {field}")
    return data


class CompanySignup(Resource):
    def post(self):
        try:
            data = get_json_data('name', 'email', 'logo_url')
            company = Company(name=data['name'], email=data['email'], logo_url=data['logo_url'])
            db.session.add(company)
            db.session.commit()
            return company.to_dict(), 201
        except Exception as e:
            return {'error': str(e)}, 400

    def patch(self, id):
        company = Company.query.get(id)
        if not company:
            return {'error': 'Company not found'}, 404

        data = request.get_json()
        for field in ['name', 'email', 'logo_url']:
            if field in data:
                setattr(company, field, data[field])
        db.session.commit()
        return company.to_dict(), 200

    def delete(self, id):
        company = Company.query.get(id)
        if not company:
            return {'error': 'Company not found'}, 404

        db.session.delete(company)
        db.session.commit()
        return {}, 204
    
    def get(self, id):
        company = Company.query.get(id)
        if not company:
            return {'error': 'Company not found'}, 404
        return company.to_dict(), 200
    def get_all(self):
        companies = Company.query.all()
        return [company.to_dict() for company in companies], 200


class UserSignup(Resource):
    def post(self):
        try:
            data = get_json_data('username', 'password', 'email', 'role')
            user = User(
                username=data['username'],
                email=data['email'],
                role=data['role'],
                company_id=data.get('company_id'),
                department_id=data.get('department_id'),
            )
            user.hash_password = data['password']
            db.session.add(user)
            db.session.commit()
            return user.to_dict(), 201
        except Exception as e:
            return {'error': str(e)}, 400

    def patch(self, id):
        user = User.query.get(id)
        if not user:
            return {'error': 'User not found'}, 404

        data = request.get_json()
        for field in ['username', 'email', 'role', 'company_id', 'department_id']:
            if field in data:
                setattr(user, field, data[field])
        if 'password' in data:
            user.hash_password = data['password']
        db.session.commit()
        return user.to_dict(), 200

    def delete(self, id):
        user = User.query.get(id)
        if not user:
            return {'error': 'User not found'}, 404
        db.session.delete(user)
        db.session.commit()
        return {}, 204
    
    def get(self):
        data = get_json_data('username')
        username = data['username']
        user = User.query.filter(user.username == username).first()
        if not user:
            return {'error': 'User not found'}, 404
        return user.to_dict(), 200
    
    def get_all(self):
        users = User.query.all()
        return [user.to_dict() for user in users], 200


class DepartmentResource(Resource):
    def post(self):
        try:
            data = get_json_data('name', 'company_id')
            dept = Department(name=data['name'], company_id=data['company_id'])
            db.session.add(dept)
            db.session.commit()
            return dept.to_dict(), 201
        except Exception as e:
            return {'error': str(e)}, 400

    def delete(self, id):
        dept = Department.query.get(id)
        if not dept:
            return {'error': 'Department not found'}, 404
        db.session.delete(dept)
        db.session.commit()
        return {}, 204
    
    def get(self, id):
        dept = Department.query.get(id)
        if not dept:
            return {'error': 'Department not found'}, 404
        return dept.to_dict(), 200
    
    def get_all(self):
        departments = Department.query.all()
        return [dept.to_dict() for dept in departments], 200


class CompanyAssetResource(Resource):
    def post(self):
        try:
            data = get_json_data('name', 'category', 'company_id')
            asset = Asset(name=data['name'], category=data['category'], company_id=data['company_id'])
            db.session.add(asset)
            db.session.commit()
            return asset.to_dict(), 201
        except Exception as e:
            return {'error': str(e)}, 400

    def patch(self, id):
        asset = Asset.query.get(id)
        if not asset:
            return {'error': 'Asset not found'}, 404
        data = request.get_json()
        for field in ['name', 'category']:
            if field in data:
                setattr(asset, field, data[field])
        db.session.commit()
        return asset.to_dict(), 200

    def delete(self, id):
        asset = Asset.query.get(id)
        if not asset:
            return {'error': 'Asset not found'}, 404
        db.session.delete(asset)
        db.session.commit()
        return {}, 204

    def get(self):
        data = get_json_data('name')
        company = Company.query.filter_by(name=data['name']).first()
        if not company:
            return {'error': 'Company not found'}, 404
        assets = company.assets
        return [asset.to_dict() for asset in assets], 200
    

class DepartmentAssetResource(Resource):
    def post(self):
        try:
            data = get_json_data('name', 'category', 'company_id', 'department_id')
            d_asset = DepartmentalAsset(
                name=data['name'],
                category=data['category'],
                company_id=data['company_id'],
                department_id=data['department_id']
            )
            db.session.add(d_asset)
            db.session.commit()
            return d_asset.to_dict(), 201
        except Exception as e:
            return {'error': str(e)}, 400

    def patch(self, id):
        d_asset = DepartmentalAsset.query.get(id)
        if not d_asset:
            return {'error': 'Department asset not found'}, 404
        data = request.get_json()
        for field in ['name', 'category']:
            if field in data:
                setattr(d_asset, field, data[field])
        db.session.commit()
        return d_asset.to_dict(), 200

    def delete(self, id):
        d_asset = DepartmentalAsset.query.get(id)
        if not d_asset:
            return {'error': 'Department asset not found'}, 404
        db.session.delete(d_asset)
        db.session.commit()
        return {}, 204

    def get(self):
        data = get_json_data('name')
        department = Department.query.filter_by(name=data['name']).first()
        if not department:
            return {'error': 'Department not found'}, 404
        assets = department.assets
        return [asset.to_dict() for asset in assets], 200
    
    
class UserAssetResource(Resource):
    def post(self):
        try:
            data = get_json_data('name', 'category', 'user_id', 'company_id')
            assigned = AsignedAsset(
                name=data['name'],
                category=data['category'],
                user_id=data['user_id'],
                company_id=data['company_id']
            )
            db.session.add(assigned)
            db.session.commit()
            return assigned.to_dict(), 201
        except Exception as e:
            return {'error': str(e)}, 400

    def patch(self, id):
        asset = AsignedAsset.query.get(id)
        if not asset:
            return {'error': 'User asset not found'}, 404
        data = request.get_json()
        for field in ['name', 'category']:
            if field in data:
                setattr(asset, field, data[field])
        db.session.commit()
        return asset.to_dict(), 200

    def delete(self, id):
        asset = AsignedAsset.query.get(id)
        if not asset:
            return {'error': 'User asset not found'}, 404
        db.session.delete(asset)
        db.session.commit()
        return {}, 204
    
    def get(self):
        data = get_json_data('name')
        user = User.query.filter_by(name=data['name']).first()
        if not user:
            return {'error': 'User not found'}, 404
        assets = user.assets
        return [asset.to_dict() for asset in assets], 200


class RequestAssetResource(Resource):
    def post(self):
        try:
            data = get_json_data('user_id', 'asset_name', 'reason')
            # This would typically go to a Request table (not in current models).
            return {
                'message': 'Asset request recorded (mock)',
                'data': data
            }, 201
        except Exception as e:
            return {'error': str(e)}, 400
    
    def get(self):
      data = get_json_data('username')  
      user = User.query.filter_by(username=data['username']).first()
      if not user:
            return {'error': 'User not found'}, 404
      requests = user.requests
      return [request.to_dict() for request in requests], 200

class UserLogin(Resource):
    def get(self):
        try:
            data = get_json_data('username', 'password')
            user = User.query.filter_by(username=data['username']).first()
            if user and user.authenticate(data['password']):
                access_token = create_access_token(identity=user.id)
                refresh_token = create_refresh_token(identity=user.id)
                return {'access_token': access_token}, 200
            return {'error': 'Invalid credentials'}, 401
        except Exception as e:
            return {'error': str(e)}, 400
        
class SuperAdminResource(Resource):
    def post(self):
        try:
            data = get_json_data('username', 'password')
            if data['role'] != 'superadmin':
                return {'error': 'Only superadmin can create superadmin accounts'}, 403
            user = User(
                username=data['username'],
                password=data['password']
                
            )
            user.hash_password = data['password']
            db.session.add(user)
            db.session.commit()
            return user.to_dict(), 201
        except Exception as e:
            return {'error': str(e)}, 400