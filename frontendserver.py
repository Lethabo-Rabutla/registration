from datetime import datetime
from flask import Flask, render_template, render_template_string, request, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
import base64

app = Flask(__name__)

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'User'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50))
    surname = db.Column(db.String(50))
    gender = db.Column(db.String(10))
    age = db.Column(db.Integer)
    id_number = db.Column(db.String(20))
    address = db.Column(db.String(100))
    account_number = db.Column(db.String(20))
    activation_amount = db.Column(db.Float)
    confirm_pin = db.Column(db.String(20))
    picture_data = db.Column(db.Text)
    voice_data = db.Column(db.Text)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:123@192.168.1.69:5432'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Define the User model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    surname = db.Column(db.String(100))
    gender = db.Column(db.String(10))
    age = db.Column(db.Integer)
    id_number = db.Column(db.String(20), unique=True)
    address = db.Column(db.String(200))
    account_number = db.Column(db.String(20), unique=True)
    activation_amount = db.Column(db.Float)
    confirm_pin = db.Column(db.String(20))
    picture_data = db.Column(db.Text)  # Store as base64 encoded string
    voice_data = db.Column(db.Text)    # Store as base64 encoded string

# Define the route to render the form
@app.route('/')
def index():
    return render_template('frontend.html')

# Define the route to handle form submission
@app.route('/submission', methods=['POST'])
def submission():
    # Extract form data
    name = request.form.get('name')
    surname = request.form.get('surname')
    id_number = request.form.get('id')
    address = request.form.get('address')
    account_number = request.form.get('account')
    activation_amount = request.form.get('amount')
    confirm_pin = request.form.get('confirm_pin')
    picture_data = request.form.get('picture_data')
    voice_data = request.form.get('voice_data')

    info = parse_sa_id_number(id_number)

    # Extract gender and age from the info dictionary
    gender = info["Gender"]
    age = info["Age"]
    print(gender)
    print(age)
    # Create a new User instance
    new_user = User(
        name=name, surname=surname, gender=gender, age=age, id_number=id_number,
        address=address, account_number=account_number, activation_amount=activation_amount,
        confirm_pin=confirm_pin, picture_data=picture_data, voice_data=voice_data
    )

    # Add the new user to the database
    db.session.add(new_user)
    db.session.commit()

    return render_template_string("""
    <script>
        alert("Data sent successfully!");
        window.location.href = "/";  // Redirect to the home page
    </script>
    """)
def parse_sa_id_number(id_number):
    dob_str = id_number[:6]
    dob = datetime.strptime(dob_str, '%y%m%d')
    
    # Extract citizenship status
    citizenship = "South African" if int(id_number[6]) == 0 else "Non-South African"
    
    # Extract gender
    gender = "Female" if int(id_number[7]) % 2 == 0 else "Male"
    
    # Calculate age
    current_year = datetime.now().year
    age = current_year - dob.year
    
    return {
        "Date of Birth": dob.strftime("%Y-%m-%d"),
        "Age": age,
        "Gender": gender,
        "Citizenship": citizenship
    }

# Define the route to handle reading data
@app.route('/read', methods=['POST', 'GET'])
def read():
    if request.method == 'POST':
        account_number = request.form.get('accountId')
        user = User.query.filter_by(account_number=account_number).first()

        if user:
            displayed_data = f"""
                ID number: {user.id_number}
                Name: {user.name}
                Surname: {user.surname}
                Gender: {user.gender}
                Account Number: {user.account_number}
                Address: {user.address}
                Pin: {user.confirm_pin}
            """
            return render_template('read.html', data=displayed_data)
        else:
            return "No data found for the given account number."

    return render_template('read.html')

# Define the route to handle updating data
@app.route('/update', methods=['POST', 'GET'])
def update():
    if request.method == 'POST':
        account_number = request.form.get('accountId')
        surname = request.form.get('surname')
        password = request.form.get('password')

        user = User.query.filter_by(account_number=account_number).first()
        if user:
            user.surname = surname
            user.confirm_pin = password
            db.session.commit()
            return "Form data updated successfully!"
        else:
            return "No data found for the given account number."

    return render_template('update.html')

# Define the route to handle deletion
@app.route('/delete', methods=['POST', 'GET'])
def delete():
    if request.method == 'POST':
        account_number = request.form.get('accountId')
        user = User.query.filter_by(account_number=account_number).first()
        if user:
            db.session.delete(user)
            db.session.commit()
            return "Form data deleted successfully!"
        else:
            return "No data found for the given account number."

    return render_template('delete.html')

if __name__ == '__main__':
    app.run(debug=True, port=9000)
