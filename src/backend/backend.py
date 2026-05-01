from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error

app = Flask(__name__)
CORS(app)

# --------------------------
# DATABASE CONNECTION
# --------------------------
def get_db_connection():
    return mysql.connector.connect(
        host="127.0.0.1",
        user="root",
        password="Ezaria1022",   
        database="SmartCampus"
    )



def success_response(data, status_code=200):
    return jsonify(data), status_code


def error_response(message, status_code=500):
    return jsonify({"error": message}), status_code


# --------------------------
# HOME
# --------------------------
@app.route("/", methods=["GET"])
def home():
    return success_response({
        "message": "Smart Campus Backend Running",
        "routes": [
            "/health",
            "/tables",
            "/users",
            "/students",
            "/student-info",
            "/student/<id>",
            "/courses",
            "/enrollments",
            "/tickets",
            "/tickets/<id>",
            "/add-student"
        ]
    })


# --------------------------
# HEALTH CHECK
# --------------------------
@app.route("/health", methods=["GET"])
def health():
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT DATABASE();")
        db_name = cursor.fetchone()

        return success_response({
            "status": "connected",
            "database": db_name[0] if db_name else None
        })

    except Error as e:
        return error_response(str(e))

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


# --------------------------
# SHOW TABLES
# --------------------------
@app.route("/tables", methods=["GET"])
def get_tables():
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SHOW TABLES;")
        rows = cursor.fetchall()

        return success_response({
            "database": "SmartCampus",
            "tables": [row[0] for row in rows]
        })

    except Error as e:
        return error_response(str(e))

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


# --------------------------
# USERS
# --------------------------
@app.route("/users", methods=["GET"])
def get_users():
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("SELECT * FROM `User`")
        results = cursor.fetchall()

        return success_response(results)

    except Error as e:
        return error_response(str(e))

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


# --------------------------
# STUDENTS
# --------------------------
@app.route("/students", methods=["GET"])
def get_students():
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("SELECT * FROM Student")
        results = cursor.fetchall()

        return success_response(results)

    except Error as e:
        return error_response(str(e))

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


@app.route("/student-info", methods=["GET"])
def get_student_info():
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
        SELECT 
            s.student_id,
            u.user_id,
            u.first_name,
            u.last_name,
            u.email,
            u.phone,
            u.address,
            s.major,
            s.class_level
        FROM Student s
        JOIN `User` u ON s.user_id = u.user_id
        """
        cursor.execute(query)
        results = cursor.fetchall()

        return success_response(results)

    except Error as e:
        return error_response(str(e))

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


@app.route("/student/<int:student_id>", methods=["GET"])
def get_one_student(student_id):
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
        SELECT 
            s.student_id,
            u.user_id,
            u.first_name,
            u.last_name,
            u.email,
            u.phone,
            u.address,
            s.major,
            s.class_level
        FROM Student s
        JOIN `User` u ON s.user_id = u.user_id
        WHERE s.student_id = %s
        """
        cursor.execute(query, (student_id,))
        result = cursor.fetchone()

        if not result:
            return error_response("Student not found", 404)

        return success_response(result)

    except Error as e:
        return error_response(str(e))

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


@app.route("/add-student", methods=["POST"])
def add_student():
    connection = None
    cursor = None
    try:
        data = request.get_json()

        if not data:
            return error_response("Request body must be JSON", 400)

        required_fields = ["first_name", "last_name", "email", "major", "class_level"]
        for field in required_fields:
            if field not in data or not str(data[field]).strip():
                return error_response(f"Missing field: {field}", 400)

        connection = get_db_connection()
        cursor = connection.cursor()

        user_query = """
        INSERT INTO `User` (first_name, last_name, email, phone, address)
        VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(user_query, (
            data["first_name"],
            data["last_name"],
            data["email"],
            data.get("phone"),
            data.get("address")
        ))

        user_id = cursor.lastrowid

        student_query = """
        INSERT INTO Student (user_id, major, class_level)
        VALUES (%s, %s, %s)
        """
        cursor.execute(student_query, (
            user_id,
            data["major"],
            data["class_level"]
        ))

        connection.commit()

        return success_response({
            "message": "Student added successfully",
            "user_id": user_id
        }, 201)

    except Error as e:
        if connection and connection.is_connected():
            connection.rollback()
        return error_response(str(e))

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


# --------------------------
# COURSES
# --------------------------
@app.route("/courses", methods=["GET"])
def get_courses():
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("SELECT * FROM Course")
        results = cursor.fetchall()

        return success_response(results)

    except Error as e:
        return error_response(str(e))

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


# --------------------------
# ENROLLMENTS
# --------------------------
@app.route("/enrollments", methods=["GET"])
def get_enrollments():
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
        SELECT 
            e.enrollment_id,
            e.enrollment_date,
            e.status,
            e.grade,
            s.student_id,
            c.course_code,
            c.title,
            sec.section_id,
            sec.term
        FROM Enrollment e
        JOIN Student s ON e.student_id = s.student_id
        JOIN Section sec ON e.section_id = sec.section_id
        JOIN Course c ON sec.course_id = c.course_id
        """
        cursor.execute(query)
        results = cursor.fetchall()

        return success_response(results)

    except Error as e:
        return error_response(str(e))

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


# --------------------------
# TICKETS - FULL CRUD
# --------------------------
@app.route("/tickets", methods=["GET"])
def get_tickets():
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
        SELECT 
            ticket_id AS id,
            user_id,
            title,
            priority,
            status,
            created_at AS dateSubmitted
        FROM MaintenanceTicket
        ORDER BY ticket_id DESC
        """
        cursor.execute(query)
        results = cursor.fetchall()

        return success_response(results)

    except Error as e:
        return error_response(str(e))

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


@app.route("/tickets/<int:ticket_id>", methods=["GET"])
def get_ticket(ticket_id):
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
        SELECT 
            ticket_id AS id,
            user_id,
            title,
            priority,
            status,
            created_at AS dateSubmitted
        FROM MaintenanceTicket
        WHERE ticket_id = %s
        """
        cursor.execute(query, (ticket_id,))
        result = cursor.fetchone()

        if not result:
            return error_response("Ticket not found", 404)

        return success_response(result)

    except Error as e:
        return error_response(str(e))

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


@app.route("/tickets", methods=["POST"])
def create_ticket():
    connection = None
    cursor = None
    try:
        data = request.get_json()

        if not data:
            return error_response("Request body must be JSON", 400)

        required_fields = ["title", "priority", "status"]
        for field in required_fields:
            if field not in data or not str(data[field]).strip():
                return error_response(f"Missing field: {field}", 400)

        user_id = data.get("user_id", 1)

        connection = get_db_connection()
        cursor = connection.cursor()

        query = """
        INSERT INTO MaintenanceTicket (user_id, title, priority, status, created_at)
        VALUES (%s, %s, %s, %s, NOW())
        """
        cursor.execute(query, (
            user_id,
            data["title"],
            data["priority"],
            data["status"]
        ))

        connection.commit()

        log_activity(user_id, "Created Maintenance Ticket", "Success")
        return success_response({
            "message": "Ticket created successfully",
            "ticket_id": cursor.lastrowid
        }, 201)

    except Error as e:
        if connection and connection.is_connected():
            connection.rollback()
        return error_response(str(e))

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


@app.route("/tickets/<int:ticket_id>", methods=["PUT"])
def update_ticket(ticket_id):
    connection = None
    cursor = None
    try:
        data = request.get_json()

        if not data:
            return error_response("Request body must be JSON", 400)

        title = data.get("title")
        priority = data.get("priority")
        status = data.get("status")

        if title is None and priority is None and status is None:
            return error_response("Provide at least one field to update", 400)

        connection = get_db_connection()
        cursor = connection.cursor()

        check_query = "SELECT ticket_id FROM MaintenanceTicket WHERE ticket_id = %s"
        cursor.execute(check_query, (ticket_id,))
        existing = cursor.fetchone()

        if not existing:
            return error_response("Ticket not found", 404)

        query = """
        UPDATE MaintenanceTicket
        SET
            title = COALESCE(%s, title),
            priority = COALESCE(%s, priority),
            status = COALESCE(%s, status)
        WHERE ticket_id = %s
        """
        cursor.execute(query, (title, priority, status, ticket_id))
        connection.commit()

        return success_response({"message": "Ticket updated successfully"})

    except Error as e:
        if connection and connection.is_connected():
            connection.rollback()
        return error_response(str(e))

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


@app.route("/tickets/<int:ticket_id>", methods=["DELETE"])
def delete_ticket(ticket_id):
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        check_query = "SELECT ticket_id FROM MaintenanceTicket WHERE ticket_id = %s"
        cursor.execute(check_query, (ticket_id,))
        existing = cursor.fetchone()

        if not existing:
            return error_response("Ticket not found", 404)

        delete_query = "DELETE FROM MaintenanceTicket WHERE ticket_id = %s"
        cursor.execute(delete_query, (ticket_id,))
        connection.commit()

        return success_response({"message": "Ticket deleted successfully"})

    except Error as e:
        if connection and connection.is_connected():
            connection.rollback()
        return error_response(str(e))

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()
@app.route("/tickets/user/<int:user_id>", methods=["GET"])
def get_tickets_by_user(user_id):
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
        SELECT 
            ticket_id AS id,
            user_id,
            title,
            priority,
            status,
            created_at AS dateSubmitted
        FROM MaintenanceTicket
        WHERE user_id = %s
        ORDER BY ticket_id DESC
        """
        cursor.execute(query, (user_id,))
        results = cursor.fetchall()

        return success_response(results)

    except Error as e:
        return error_response(str(e))

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

@app.route("/login", methods=["POST"])
def login():
    connection = None
    cursor = None
    try:
        data = request.get_json()
        if not data:
            return error_response("Request body must be JSON", 400)

        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return error_response("Email and password are required", 400)

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        # 1. Fetch user
        query = "SELECT user_id, first_name, last_name, email FROM `User` WHERE email = %s"
        cursor.execute(query, (email,))
        user = cursor.fetchone()

        # 2. Validate user and "password" (last_name)
        if not user or password != user["last_name"]:
            return error_response("Invalid email or password", 401)

        # 3. Check role (Fixed Indentation)
        cursor.execute("SELECT staff_id FROM Staff WHERE user_id = %s", (user["user_id"],))
        staff_record = cursor.fetchone()
        role = "staff" if staff_record else "student"

        # 4. Log and Respond
        log_activity(user_id=user["user_id"], action_name="Login")
        
        return success_response({
            "message": "Login successful",
            "role": role, # Good to include the role in the response
            "user": {
                "user_id": user["user_id"],
                "first_name": user["first_name"],
                "last_name": user["last_name"],
                "email": user["email"]
            }
        }, 200)

    except Exception as e: # Catching general exceptions unless 'Error' is imported
        return error_response(str(e), 500)

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()
# --------------------------
# RUN APP
# --------------------------
if __name__ == "__main__":
    app.run(debug=True, port=5001)