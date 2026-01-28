# resources.py
import cloudinary.uploader
import smtplib
from email.mime.text import MIMEText
import os
from flask import request, jsonify, make_response, current_app
from flask_restful import Resource
from flask_jwt_extended import (
    create_access_token, create_refresh_token, 
    jwt_required, get_jwt_identity, verify_jwt_in_request
)
from extensions import db
from models import Company, User, Department, Asset, DepartmentalAsset, AsignedAsset, Request


# ==================== UTILITY FUNCTIONS ====================

def send_email(to_email, subject, message):
    """send email notification"""
    from_email = os.getenv('EMAIL_ADDRESS')
    password = os.getenv('EMAIL_PASSWORD')

    msg = MIMEText(message)
    msg['Subject'] = subject
    msg['From'] = from_email
    msg['To'] = to_email

    try:
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
            smtp.login(from_email, password)
            smtp.sendmail(from_email, to_email, msg.as_string())
        return True
    except Exception as e:
        current_app.logger.error(f"Email failed: {e}")
        return False


def get_json_data(*required_fields):
    """extract and validate required fields from json request"""
    data = request.get_json() or {}
    missing = [f for f in required_fields if f not in data]
    if missing:
        raise ValueError(f"Missing fields: {', '.join(missing)}")
    return data


def upload_file(file_field, error_msg="File is required"):
    """handle file upload to cloudinary"""
    file = request.files.get(file_field)
    if not file:
        raise ValueError(error_msg)
    
    upload_result = cloudinary.uploader.upload(file)
    return upload_result.get('secure_url')


def get_or_404(model, obj_id, error_msg):
    """get object by id or return 404 error"""
    obj = model.query.get(obj_id)
    if not obj:
        return None, {'error': error_msg}, 404
    return obj, None, None


def update_object(obj, data, allowed_fields):
    """update object attributes from data dict"""
    for field in allowed_fields:
        if field in data:
            setattr(obj, field, data[field])


# ==================== BASE RESOURCE CLASSES ====================

class BaseResource(Resource):
    """base resource class with common CRUD operations"""
    
    model = None
    allowed_fields = []
    serialize_fields = ()
    
    @jwt_required()
    def patch(self, id):
        """update resource by id"""
        try:
            obj, error, status = get_or_404(self.model, id, f'{self.model.__name__} not found')
            if error:
                return error, status
            
            data = request.get_json()
            update_object(obj, data, self.allowed_fields)
            db.session.commit()
            
            return obj.to_dict(only=self.serialize_fields), 200
        except Exception as e:
            return {'error': str(e)}, 400
    
    @jwt_required()
    def delete(self, id):
        """delete resource by id"""
        try:
            obj, error, status = get_or_404(self.model, id, f'{self.model.__name__} not found')
            if error:
                return error, status
            
            db.session.delete(obj)
            db.session.commit()
            return None, 204
        except Exception as e:
            return {'error': str(e)}, 400
    
    def get(self):
        """get resource by name/username parameter"""
        try:
            name_field = getattr(self, 'name_field', 'name')
            param_value = request.args.get(name_field)
            
            if not param_value:
                return {'error': f'{name_field.capitalize()} parameter required'}, 400
            
            filter_kwargs = {name_field: param_value}
            obj = self.model.query.filter_by(**filter_kwargs).first()
            
            if not obj:
                return {'error': f'{self.model.__name__} not found'}, 404
            
            return obj.to_dict(only=self.serialize_fields), 200
        except Exception as e:
            return {'error': str(e)}, 400


class BaseListResource(Resource):
    """base class for listing all resources"""
    
    model = None
    serialize_fields = ()
    
    def get(self):
        """get all resources"""
        try:
            items = self.model.query.all()
            if not items:
                return [], 200
            return [item.to_dict(only=self.serialize_fields) for item in items], 200
        except Exception as e:
            return {'error': str(e)}, 400


# ==================== COMPANY RESOURCES ====================

class CompanyResource(Resource):
    def post(self):
        """create new company with logo upload"""
        try:
            name = request.form.get('name')
            email = request.form.get('email')
            
            logo_url = upload_file('logo_url', 'Logo file is required')
            
            company = Company(name=name, email=email, logo_url=logo_url)
            db.session.add(company)
            db.session.commit()
            
            return company.to_dict(only=('id', 'name', 'email', 'logo_url', 'is_approved')), 201
        except ValueError as e:
            return {'error': str(e)}, 400
        except Exception as e:
            return {'error': str(e)}, 400
    
    @jwt_required()
    def patch(self, id):
        """update company approval status and send notification"""
        try:
            company, error, status = get_or_404(Company, id, 'Company not found')
            if error:
                return error, status
            
            data = request.get_json()
            update_object(company, data, ['name', 'email', 'logo_url', 'is_approved'])
            db.session.commit()
            
            # send approval notification email
            if company.is_approved:
                email_subject = "Company Approved"
                email_message = f"Congratulations {company.name}, your company has been approved."
            else:
                email_subject = "Approval Withheld"
                email_message = f"Hi {company.name}, your company's approval has been withheld. Please contact support."
            
            send_email(company.email, email_subject, email_message)
            
            return company.to_dict(only=('id', 'name', 'email', 'logo_url', 'is_approved')), 200
        except Exception as e:
            return {'error': str(e)}, 400


class GetAllCompanies(BaseListResource):
    model = Company
    serialize_fields = ('id', 'name', 'email', 'logo_url', 'is_approved')


# ==================== USER RESOURCES ====================

class UserSignup(BaseResource):
    model = User
    allowed_fields = ['username', 'email', 'role', 'company_id', 'department_id']
    serialize_fields = ('id', 'username', 'email', 'role', 'company_id', 'department_id')
    name_field = 'username'
    
    def post(self):
        """create new user account"""
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
            
            # send welcome email
            welcome_message = f"""Hello {user.username}, your account has been created successfully.

            Kindly contact your company admin to guide you on how to login and use the platform.

            Thank you for joining us — can't wait to help you streamline your assets!"""
            
            send_email(user.email, "Welcome to Our Platform", welcome_message)
            
            return user.to_dict(only=self.serialize_fields), 201
        except ValueError as e:
            return {'error': str(e)}, 400
        except Exception as e:
            return {'error': str(e)}, 400
    
    @jwt_required()
    def patch(self, id):
        """update user with password handling"""
        try:
            user, error, status = get_or_404(User, id, 'User not found')
            if error:
                return error, status
            
            data = request.get_json()
            update_object(user, data, self.allowed_fields)
            
            if 'password' in data:
                user.hash_password = data['password']
            
            db.session.commit()
            return user.to_dict(only=self.serialize_fields), 200
        except Exception as e:
            return {'error': str(e)}, 400


class GetAllUsers(BaseListResource):
    model = User
    serialize_fields = ('id', 'username', 'email', 'role', 'company_id', 'department_id')


# ==================== DEPARTMENT RESOURCES ====================

class DepartmentResource(BaseResource):
    model = Department
    allowed_fields = ['name', 'company_id']
    serialize_fields = ('id', 'name', 'company_id')
    
    @jwt_required()
    def post(self):
        """create new department"""
        try:
            data = get_json_data('name', 'company_id')
            dept = Department(name=data['name'], company_id=data['company_id'])
            db.session.add(dept)
            db.session.commit()
            return dept.to_dict(only=self.serialize_fields), 201
        except Exception as e:
            return {'error': str(e)}, 400


class GetAllDepartments(BaseListResource):
    model = Department
    serialize_fields = ('id', 'name', 'company_id')


# ==================== ASSET RESOURCES ====================

class CompanyAssetResource(Resource):
    def post(self):
        """create company asset with image upload"""
        try:
            name = request.form.get('name')
            category = request.form.get('category')
            company_id = request.form.get('company_id')
            
            image_url = upload_file('image_url', 'Image file is required')
            
            asset = Asset(
                name=name,
                category=category,
                image_url=image_url,
                company_id=company_id
            )
            db.session.add(asset)
            db.session.commit()
            
            return asset.to_dict(only=('id', 'name', 'category', 'image_url', 'company_id')), 201
        except ValueError as e:
            return {'error': str(e)}, 400
        except Exception as e:
            return {'error': str(e)}, 400
    
    def get(self):
        """get assets by company name or all assets"""
        try:
            company_name = request.args.get('name')
            
            if company_name:
                company = Company.query.filter_by(name=company_name).first()
                if not company:
                    return {'error': 'Company not found'}, 404
                assets = company.assets
            else:
                assets = Asset.query.all()
            
            if not assets:
                return [], 200
            
            return [asset.to_dict(
                only=('id', 'name', 'category', 'image_url', 'company_id')
            ) for asset in assets], 200
        except Exception as e:
            return {'error': str(e)}, 400


class DepartmentAssetResource(BaseResource):
    model = DepartmentalAsset
    allowed_fields = ['name', 'category', 'image_url']
    serialize_fields = ('id', 'name', 'category', 'image_url', 'company_id', 'department_id')
    
    @jwt_required()
    def post(self):
        """create department asset"""
        try:
            data = get_json_data('name', 'category', 'company_id', 'department_id')
            d_asset = DepartmentalAsset(
                name=data['name'],
                category=data['category'],
                image_url=data.get('image_url'),
                company_id=data['company_id'],
                department_id=data['department_id']
            )
            db.session.add(d_asset)
            db.session.commit()
            return d_asset.to_dict(only=self.serialize_fields), 201
        except Exception as e:
            return {'error': str(e)}, 400
    
    def get(self):
        """get assets by department name or all department assets"""
        try:
            dept_name = request.args.get('name')
            
            if dept_name:
                department = Department.query.filter_by(name=dept_name).first()
                if not department:
                    return {'error': 'Department not found'}, 404
                assets = department.assets
            else:
                assets = DepartmentalAsset.query.all()
            
            if not assets:
                return [], 200
            
            return [asset.to_dict(only=self.serialize_fields) for asset in assets], 200
        except Exception as e:
            return {'error': str(e)}, 400


class UserAssetResource(BaseResource):
    model = AsignedAsset
    allowed_fields = ['name', 'category', 'image_url']
    serialize_fields = ('id', 'name', 'category', 'image_url', 'company_id', 'user_id')
    
    @jwt_required()
    def post(self):
        """assign asset to user"""
        try:
            data = get_json_data('name', 'category', 'user_id', 'company_id')
            assigned = AsignedAsset(
                name=data['name'],
                category=data['category'],
                image_url=data.get('image_url'),
                user_id=data['user_id'],
                company_id=data['company_id']
            )
            db.session.add(assigned)
            db.session.commit()
            return assigned.to_dict(only=self.serialize_fields), 201
        except Exception as e:
            return {'error': str(e)}, 400


class AllUserAssets(BaseListResource):
    model = AsignedAsset
    serialize_fields = ('id', 'name', 'category', 'image_url', 'company_id', 'user_id')


# ==================== REQUEST RESOURCES ====================

class RequestAssetResource(Resource):
    @jwt_required()
    def post(self):
        """create new asset request"""
        try:
            data = request.get_json() or {}
            
            if not data.get('reason'):
                return {'error': 'Reason is required'}, 400
            if not data.get('request_type'):
                return {'error': 'Request type is required'}, 400
            
            current_user_id = get_jwt_identity()
            current_user = User.query.get(current_user_id)
            
            if not current_user:
                return {'error': 'User not found'}, 404
            
            new_request = Request(
                reason=data['reason'],
                quantity=data.get('quantity', 1),
                urgency=data.get('urgency', 'medium'),
                request_type=data['request_type'],
                user_id=current_user.id,
                status='pending'
            )
            
            db.session.add(new_request)
            db.session.commit()
            
            return new_request.to_dict(only=(
                'id', 'reason', 'quantity', 'urgency', 
                'request_type', 'status', 'user_id'
            )), 201
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Request creation failed: {e}")
            return {'error': 'Failed to create request'}, 500
    
    def get(self):
        """get requests by username"""
        try:
            username = request.args.get('username')
            if not username:
                return {'error': 'Username parameter is required'}, 400
            
            user = User.query.filter_by(username=username).first()
            if not user:
                return {'error': 'User not found'}, 404
            
            requests = Request.query.filter_by(user_id=user.id).all()
            return [req.to_dict(only=(
                'id', 'reason', 'quantity', 'urgency', 
                'request_type', 'status', 'user_id'
            )) for req in requests], 200
        except Exception as e:
            current_app.logger.error(f"Request retrieval failed: {e}")
            return {'error': 'Failed to retrieve requests'}, 500
    
    def patch(self, id):
        """update request status"""
        try:
            req, error, status = get_or_404(Request, id, 'Request not found')
            if error:
                return error, status
            
            data = request.get_json()
            if 'status' in data:
                req.status = data['status']
            
            db.session.commit()
            return req.to_dict(only=(
                'id', 'reason', 'quantity', 'urgency', 
                'request_type', 'status', 'user_id'
            )), 200
        except Exception as e:
            return {'error': str(e)}, 400
    
    def delete(self, id):
        """delete request"""
        try:
            req, error, status = get_or_404(Request, id, 'Request not found')
            if error:
                return error, status
            
            db.session.delete(req)
            db.session.commit()
            return None, 204
        except Exception as e:
            return {'error': str(e)}, 400


class AllRequests(BaseListResource):
    model = Request
    serialize_fields = ('id', 'reason', 'quantity', 'urgency', 'request_type', 'status', 'user_id')


# ==================== AUTHENTICATION RESOURCES ====================

class UserLogin(Resource):
    def post(self):
        """authenticate user and return tokens"""
        try:
            data = get_json_data('username', 'password')
            user = User.query.filter_by(username=data['username']).first()
            
            if user and user.authenticate(data['password']):
                # check company approval for non-super admins
                if user.role != 'super_admin' and (
                    not user.company or not user.company.is_approved
                ):
                    return {'error': 'Company not approved'}, 403
                
                # create tokens
                access_token = create_access_token(
                    identity=user.id, 
                    additional_claims={'role': user.role}
                )
                refresh_token = create_refresh_token(identity=user.id)
                
                # build response with refresh token cookie
                response = make_response({
                    'access_token': access_token,
                    'user': user.to_dict(only=(
                        'id', 'username', 'email', 'role', 
                        'company_id', 'department_id'
                    ))
                })
                
                response.set_cookie(
                    'refresh_token_cookie',
                    refresh_token,
                    httponly=True,
                    secure=False,  # set to True in production
                    samesite='Lax'
                )
                
                return response
            
            return {'error': 'Invalid username or password'}, 401
        except Exception as e:
            return {'error': str(e)}, 400


class SuperAdminResource(Resource):
    @jwt_required()
    def patch(self):
        """toggle company approval status"""
        try:
            data = get_json_data('company_name')
            company = Company.query.filter_by(name=data['company_name']).first()
            
            if not company:
                return {'error': 'Company not found'}, 404
            
            company.is_approved = not company.is_approved
            db.session.commit()
            
            status = "approved" if company.is_approved else "disapproved"
            return {'message': f'Company {status} successfully'}, 200
        except Exception as e:
            return {'error': str(e)}, 400


class CompaniesGrouped(Resource):
    @jwt_required()
    def get(self):
        """get companies grouped by approval status"""
        try:
            approved = Company.query.filter_by(is_approved=True).all()
            pending = Company.query.filter_by(is_approved=False).all()
            
            return {
                'approved_companies': [
                    {
                        'id': c.id,
                        'name': c.name,
                        'email': c.email,
                        'logo_url': c.logo_url
                    } for c in approved
                ] if approved else [],
                'pending_companies': [
                    {
                        'id': c.id,
                        'name': c.name,
                        'email': c.email,
                        'logo_url': c.logo_url
                    } for c in pending
                ] if pending else []
            }, 200
        except Exception as e:
            current_app.logger.error(f"Companies grouping failed: {e}")
            return {'error': str(e)}, 500


class RefreshTokenResource(Resource):
    def post(self):
        """refresh access token using refresh token from cookie"""
        try:
            verify_jwt_in_request(refresh=True, locations=["cookies"])
            current_user_id = get_jwt_identity()
            new_access_token = create_access_token(identity=current_user_id)
            return {'access_token': new_access_token}, 200
        except Exception as e:
            current_app.logger.error(f"Token refresh failed: {e}")
            return {'error': str(e)}, 401
