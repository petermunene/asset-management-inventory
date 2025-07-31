#resources.py
import cloudinary.uploader
from flask import request, jsonify , make_response
from flask_restful import Resource
from server.extensions import db
from server.models import Company, User, Department, Asset, DepartmentalAsset, AsignedAsset , Request
from flask_jwt_extended import create_access_token, create_refresh_token , jwt_required, get_jwt_identity,verify_jwt_in_request
import smtplib
from email.mime.text import MIMEText
import os 
def send_email(to_email, subject, message):
    from_email = os.getenv('EMAIL_ADDRESS')  # Your email address
    password = os.getenv('EMAIL_PASSWORD')  # Your email password

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
        print("Email failed:", e)
        return False

def get_json_data(*fields):
    data = request.get_json() or {}
    missing = [f for f in fields if f not in data]
    if missing:
        raise ValueError(f"Missing fields: {', '.join(missing)}")
    return data




class CompanyResource(Resource):
    def post(self):
        try:
            name = request.form.get('name')
            email = request.form.get('email')
            logo_file = request.files.get('logo_url')  

            if not logo_file:
                return {'error': 'Logo file is required'}, 400

            upload_result = cloudinary.uploader.upload(logo_file)
            logo_url = upload_result.get('secure_url')
            company = Company(name=name, email=email, logo_url=logo_url)
            db.session.add(company)
            db.session.commit()

            return company.to_dict(only=('id', 'name', 'email', 'logo_url', 'is_approved')), 201

        except Exception as e:
            return {'error': str(e)}, 400

    @jwt_required()
    def patch(self,id):
        try:
            company = Company.query.get(id)
            if not company:
                return {'error': 'Company not found'}, 404

            data = request.get_json()
            for field in ['name', 'email', 'logo_url', 'is_approved']:
                if field in data:
                    setattr(company, field, data[field])
            db.session.commit()
            if company.is_approved:
                send_email(
                    to_email=company.email,
                    subject="Company Approved",
                    message=f"Congratulations {company.name}, your company has been approved."
                )
            else:
                send_email(
                    to_email=company.email,
                    subject="Approval Withheld",
                    message=f"Hi {company.name}, your company's approval has been withheld. Please contact support."
                )

            return company.to_dict(only=('id', 'name', 'email', 'logo_url', 'is_approved')), 200
        except Exception as e:
            return {'error': str(e)}, 400    
    @jwt_required()
    def delete(self, id):
        try:
            company = Company.query.get(id)
            if not company:
                return {'error': 'Company not found'}, 404

            db.session.delete(company)
            db.session.commit()
            send_email(
            to_email=company.email,
            subject="Company Account Deleted",
            message=f"Dear {company.name}, your company has been deleted from our system."
            )
            return None, 204 
        except Exception as e:
            return {'error': str(e)}, 400
    @jwt_required()
    def get(self):
        try:
            name = request.args.get('name')
            company = Company.query.filter_by(name=name).first()    
            if not company:
                return {'error': 'Company not found'}, 404
            return company.to_dict(only=('id', 'name', 'email', 'logo_url', 'is_approved')), 200
        except Exception as e:
            return {'error': str(e)}, 400
class GetAllCompanies(Resource):
    @jwt_required()
    def get(self):
        try:
            companies = Company.query.all()
            if not companies:
                return [],200
            return [c.to_dict(only=('id', 'name', 'email', 'logo_url', 'is_approved')) for c in companies], 200
        except Exception as e:  
            return {'error': str(e)}, 400


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
            send_email(
                to_email=user.email,
                subject="Welcome to Our Platform",
                message=f"""Hello {user.username}, your account has been created successfully.

            Kindly contact your company admin to guide you on how to login and use the platform.

            Thank you for joining us — can't wait to help you streamline your assets!"""
            )
            return user.to_dict(only=('id', 'username', 'email', 'role','company_id','department_id')), 201
        except Exception as e:
            return {'error': str(e)}, 400
    @jwt_required()
    def patch(self, id):
        try:
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
            return user.to_dict(only=('id', 'username', 'email', 'role','company_id','department_id')), 200
        except Exception as e:
            return {'error': str(e)}, 400
    @jwt_required()
    def delete(self, id):
        try:
            user = User.query.get(id)
            if not user:
                return {'error': 'User not found'}, 404
            db.session.delete(user)
            db.session.commit()
            return None, 204 
        except Exception as e:      
            return {'error': str(e)}, 400
    @jwt_required()
    def get(self):
        try:
            username = request.args.get('username')
            user = User.query.filter_by(username=username).first()
            if not user:
                return {'error': 'User not found'}, 404
            return user.to_dict(only=('id', 'username', 'email', 'role','company_id','department_id')), 200
        except Exception as e:  
            return {'error': str(e)}, 400
class GetAllUsers(Resource):
    def get(self):
        try:
            users = User.query.all()
            if not users:
                return [], 200
            return [user.to_dict(only=('id', 'username', 'email', 'role','company_id','department_id')) for user in users], 200
        except Exception as e:
            return {'error': str(e)}, 400


class DepartmentResource(Resource):
    @jwt_required()
    def post(self):
        try:
            data = get_json_data('name', 'company_id')
            dept = Department(name=data['name'], company_id=data['company_id'])
            db.session.add(dept)
            db.session.commit()
            return dept.to_dict(only=('id','name','company_id')), 201
        except Exception as e:
            return {'error': str(e)}, 400
    @jwt_required()
    def delete(self, id):
        try:
            dept = Department.query.get(id)
            if not dept:
                return {'error': 'Department not found'}, 404
            db.session.delete(dept)
            db.session.commit()
            return None, 204 
        except Exception as e:
            return {'error': str(e)}, 400
    @jwt_required()
    def get(self):
        try:
            name = request.args.get('name')
            dept = Department.query.filter_by(name=name).first()
            if not dept:
                return {'error': 'Department not found'}, 404
            return dept.to_dict(only=('id','name','company_id')), 200
        except Exception as e:  
            return {'error': str(e)}, 400
class GetAllDepartments(Resource):
    @jwt_required()
    def get(self):
        try:
            departments = Department.query.all()
            if not departments:
                return [], 200
            return [dept.to_dict(only=('id','name','company_id')) for dept in departments], 200
        except Exception as e:
            return {'error': str(e)}, 400


class CompanyAssetResource(Resource):
    def post(self):
        try:
            name = request.form.get('name')
            category = request.form.get('category') 
            image_file = request.files.get('image_url')
            company_id = request.form.get('company_id')
            if not image_file:
                return {'error': 'Image file is required'}, 400
            upload_result = cloudinary.uploader.upload(image_file)
            image_url = upload_result.get('secure_url')
            asset = Asset(
                name=name,
                category=category,
                image_url=image_url,
                company_id=company_id
            )
            db.session.add(asset)
            db.session.commit()
            return asset.to_dict(only=('id','name','category','image_url','company_id')), 201
        except Exception as e:
            return {'error': str(e)}, 400
    @jwt_required()
    def patch(self, id):
        try:
            asset = Asset.query.get(id)
            if not asset:
                return {'error': 'Asset not found'}, 404
            data = request.get_json()
            for field in ['name', 'category']:
                if field in data:
                    setattr(asset, field, data[field])
            db.session.commit()
            return asset.to_dict(only=('id','name','category','image_url','company_id')), 200
        except Exception as e:
            return {'error': str(e)}, 400
    @jwt_required()
    def delete(self, id):
        try:
            asset = Asset.query.get(id)
            if not asset:
                return {'error': 'Asset not found'}, 404
            db.session.delete(asset)
            db.session.commit()
            return None, 204 
        except Exception as e:
            return {'error': str(e)}, 400
    def get(self):
        try:
            name = request.args.get('name')
            if name:
                company = Company.query.filter_by(name=name).first()
                if not company:
                    return {'error': 'Company not found'}, 404
                assets = company.assets
            else:
                # Return all company assets if no name specified
                assets = Asset.query.all()

            if not assets:
                return [],200  
            return [asset.to_dict(only=('id','name','category','image_url','company_id')) for asset in assets], 200
        except Exception as e:
            return {'error': str(e)}, 400   
    

class DepartmentAssetResource(Resource):
    @jwt_required()
    def post(self):
        try:
            data = get_json_data('name', 'category','image_url','company_id', 'department_id')
            d_asset = DepartmentalAsset(
                name=data['name'],
                category=data['category'],
                image_url=data.get('image_url'),
                company_id=data['company_id'],
                department_id=data['department_id']
            )
            db.session.add(d_asset)
            db.session.commit()
            return d_asset.to_dict(only=('id','name','category','image_url','company_id','department_id')), 201
        except Exception as e:
            return {'error': str(e)}, 400
    @jwt_required()
    def patch(self, id):
        try:
            d_asset = DepartmentalAsset.query.get(id)
            if not d_asset:
                return {'error': 'Department asset not found'}, 404
            data = request.get_json()
            for field in ['name', 'category', 'image_url']:
                if field in data:
                    setattr(d_asset, field, data[field])
            db.session.commit()
            return d_asset.to_dict(only=('id','name','category','image_url','company_id','department_id')), 200
        except Exception as e:
            return {'error': str(e)}, 400
    @jwt_required()
    def delete(self, id):
        try:
            d_asset = DepartmentalAsset.query.get(id)
            if not d_asset:
                return {'error': 'Department asset not found'}, 404
            db.session.delete(d_asset)
            db.session.commit()
            return None, 204 
        except Exception as e:
            return {'error': str(e)}, 400
    def get(self):
        try:
            name = request.args.get('name')
            if name:
                department = Department.query.filter_by(name=name).first()
                if not department:
                    return {'error': 'Department not found'}, 404
                assets = department.assets
            else:
                # Return all department assets if no name specified
                assets = DepartmentalAsset.query.all()

            if not assets:
                return [], 200
            return [asset.to_dict(only=('id','name','category','image_url','company_id','department_id')) for asset in assets], 200
        except Exception as e:
            return {'error': str(e)}, 400
    
class UserAssetResource(Resource):
    @jwt_required()
    def post(self):
        try:
            data = get_json_data('name', 'category','image_url', 'user_id', 'company_id')
            assigned = AsignedAsset(
                name=data['name'],
                category=data['category'],
                image_url=data.get('image_url'),
                user_id=data['user_id'],
                company_id=data['company_id']
            )
            db.session.add(assigned)
            db.session.commit()
            return assigned.to_dict(only=('id','name','category','image_url','company_id','user_id')), 201
        except Exception as e:
            return {'error': str(e)}, 400
    @jwt_required()
    def patch(self, id):
        try:
            asset = AsignedAsset.query.get(id)
            if not asset:
                return {'error': 'User asset not found'}, 404
            data = request.get_json()
            for field in ['name', 'category','image_url']:
                if field in data:
                    setattr(asset, field, data[field])
            db.session.commit()
            return asset.to_dict(only=('id','name','category','image_url','company_id','user_id')), 200
        except Exception as e:
            return {'error': str(e)}, 400
    @jwt_required()
    def delete(self, id):
        try:
            asset = AsignedAsset.query.get(id)
            if not asset:
                return {'error': 'User asset not found'}, 404
            db.session.delete(asset)
            db.session.commit()
            return None, 204 
        except Exception as e:  
            return {'error': str(e)}, 400
    def get(self):
        try:
            username = request.args.get('username')
            if not username:
                return {'error': 'Username is required'}, 400

            user = User.query.filter_by(username=username).first()
            if not user:
                return {'error': 'User not found'}, 404

            assets = user.asigned_assets
            if not assets:
                return [], 200

            return [asset.to_dict(only=(
                'id', 'name', 'category', 'image_url', 'company_id', 'user_id'
            )) for asset in assets], 200

        except Exception as e:
            import traceback
            print("Unexpected error:", traceback.format_exc())
            return {'error': str(e)}, 400
class AllUserAssets(Resource):
    @jwt_required()
    def get(self):
        try:
            assets = AsignedAsset.query.all()
            if not assets:
                return [], 200
            return [asset.to_dict(only=('id','name','category','image_url','company_id','user_id')) for asset in assets], 200
        except Exception as e:
            return {'error': str(e)}, 400


class RequestAssetResource(Resource):
    def post(self):
        try:
            data = request.get_json()
            if not data:
                return {'error': 'No JSON data provided'}, 400

            asset_name = data.get('asset_name', 'Unknown Asset')
            reason = data.get('reason', 'Asset movement request')

            new_request = Request(
                reason=reason,
                quantity=1,
                urgency='medium',
                request_type='movement',
                user_id=1  # Default user for testing
            )
            db.session.add(new_request)
            db.session.commit()

            return new_request.to_dict(only=('id','reason','quantity','urgency','request_type','status','user_id')), 201
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 400
    def get(self):
        try:
            username = request.args.get('username')  
            user = User.query.filter_by(username=username).first()
            if not user:
                    return {'error': 'User not found'}, 404
            requests = user.requests
            if not requests:
                return [], 200
            return [request.to_dict(only=('id','reason','quantity','urgency','request_type','status','user_id')) for request in requests], 200
        except Exception as e:  
            return {'error': str(e)}, 400
    def patch(self, id):
        try:
            req = Request.query.get(id)
            if not req:
                return {'error': 'Request not found'}, 404

            data = request.get_json()
            if 'status' in data:
                req.status = data['status']  

            db.session.commit()
            return req.to_dict(only=('id', 'reason', 'quantity', 'urgency', 'request_type', 'status', 'user_id')), 200  # ✅ Return the correct object
        except Exception as e:
            return {'error': str(e)}, 400
    def delete(self, id):
        try:
            req = Request.query.get(id)
            if not req:
                return {'error': 'Request not found'}, 404
            db.session.delete(req)
            db.session.commit()
            return None, 204 
        except Exception as e:
            return {'error': str(e)}, 400
class AllRequests(Resource):
    def get(self):
        try:
            requests = Request.query.all()
            if not requests:
                return [], 200
            return [request.to_dict(only=('id','reason','quantity','urgency','request_type','status','user_id')) for request in requests], 200
        except Exception as e:
            return {'error': str(e)}, 400

class UserLogin(Resource):
    def post(self):
        try:
            data = get_json_data('username', 'password')
            user = User.query.filter_by(username=data['username']).first()

            if user and user.authenticate(data['password']):
                if user.role != 'super_admin':
                    if not user.company or not user.company.is_approved:
                        return {'error': 'Company not approved'}, 403

                access_token = create_access_token(identity=user.id, additional_claims={'role': user.role})
                refresh_token = create_refresh_token(identity=user.id)

                # ✅ Set refresh_token as HttpOnly cookie
                response = make_response({
                    'refresh_token': refresh_token,
                    'access_token': access_token,
                    'user': user.to_dict(only=('id', 'username', 'email', 'role','company_id','department_id'))
                })
                response.set_cookie(
                    'refresh_token_cookie', refresh_token,
                    httponly=True,
                    secure=False,  # Set to True in production (HTTPS)
                    samesite='Lax'
                )
                return response

            return {'error': 'Invalid username or password'}, 401
        except Exception as e:
            return {'error': str(e)}, 400
class SuperAdminResource(Resource):
    # def post(self):
    #     try:
    #         data = get_json_data('username', 'password')
    #         superAdmin = SuperAdmin(
    #             username=data['username'],   
    #         )
    #         superAdmin.hash_password = data['password']
    #         db.session.add(superAdmin)
    #         db.session.commit()
    #         return superAdmin.to_dict(), 201
    #     except Exception as e:
    #         return {'error': str(e)}, 400
    @jwt_required()
    def patch(self):
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
            return {'error': str(e)}, 500
class RefreshTokenResource(Resource):
    # @jwt_required(refresh=True)
    def post(self):
        try:
            verify_jwt_in_request(refresh=True, locations=["cookies"])
            current_user_id = get_jwt_identity()
            new_access_token = create_access_token(identity=current_user_id)
            return {'access_token': new_access_token}, 200 
        except Exception as e:
            print("Error refreshing token:", e)
            return {'error': str(e)}, 401
