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
        user_id = request.args.get("user_id")

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
        SELECT
            e.enrollment_id,
            c.course_code   AS course_id,
            c.title         AS course_name,
            sec.section_id  AS section,
            c.credits,
            e.status,
            e.grade,
            sec.term,
            sec.instructor
        FROM Enrollment e
        JOIN Student s   ON e.student_id  = s.student_id
        JOIN Section sec ON e.section_id  = sec.section_id
        JOIN Course c    ON sec.course_id = c.course_id
        WHERE s.user_id = %s
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

        # Demo login:
        # email must match, and password must equal the user's last_name
        query = """
        SELECT user_id, first_name, last_name, email
        FROM `User`
        WHERE email = %s
        """
        cursor.execute(query, (email,))
        user = cursor.fetchone()

        if not user:
            return error_response("Invalid email or password", 401)

        if password != user["last_name"]:
            return error_response("Invalid email or password", 401)

        return success_response({
            "message": "Login successful",
            "user": {
                "user_id": user["user_id"],
                "first_name": user["first_name"],
                "last_name": user["last_name"],
                "email": user["email"]
            }
        }, 200)

    except Error as e:
        return error_response(str(e))

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

# --------------------------
# HOUSING
# --------------------------
@app.route("/housing", methods=["GET"])
def get_housing():
    connection = None
    cursor = None
    try:
        user_id = request.args.get("user_id")
        if not user_id:
            return error_response("Missing user_id", 400)

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
        SELECT
            hc.contract_id,
            d.dorm_name AS dorm,
            r.room_number AS room,
            r.room_type,
            hc.start_date,
            hc.end_date,
            'Active' AS status
        FROM HousingContract hc
        JOIN Student s   ON hc.student_id = s.student_id
        JOIN Room r      ON hc.room_id    = r.room_id
        JOIN Dorm d      ON r.dorm_id     = d.dorm_id
        WHERE s.user_id = %s
        LIMIT 1
        """
        cursor.execute(query, (user_id,))
        result = cursor.fetchone()
        return success_response(result if result else {})

    except Error as e:
        return error_response(str(e))

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


@app.route("/housing/assign", methods=["POST"])
def assign_housing():
    connection = None
    cursor = None
    try:
        data = request.get_json()
        if not data:
            return error_response("Request body must be JSON", 400)

        user_id       = data.get("user_id")
        dorm_pref     = data.get("dorm_preference")
        room_type     = data.get("room_type", "Single")

        if not user_id:
            return error_response("Missing user_id", 400)

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        # get student_id from user_id
        cursor.execute(
            "SELECT student_id FROM Student WHERE user_id = %s", (user_id,)
        )
        student = cursor.fetchone()
        if not student:
            return error_response("Student not found", 404)

        student_id = student["student_id"]

        # check if student already has a contract
        cursor.execute(
            "SELECT contract_id FROM HousingContract WHERE student_id = %s", (student_id,)
        )
        if cursor.fetchone():
            return error_response("Student already has a housing contract", 409)

        # find an available room matching their preference
        cursor.execute("""
            SELECT r.room_id
            FROM Room r
            JOIN Dorm d ON r.dorm_id = d.dorm_id
            LEFT JOIN HousingContract hc ON r.room_id = hc.room_id
            WHERE hc.room_id IS NULL
              AND r.room_type = %s
              AND (%s IS NULL OR d.dorm_name = %s)
            LIMIT 1
        """, (room_type, dorm_pref, dorm_pref))
        room = cursor.fetchone()

        if not room:
            return error_response("No available rooms matching your preference", 404)

        # create the contract
        cursor.execute("""
            INSERT INTO HousingContract (student_id, room_id, start_date, end_date)
            VALUES (%s, %s, '2026-08-15', '2027-05-30')
        """, (student_id, room["room_id"]))
        connection.commit()

        return success_response({"message": "Housing contract created successfully"}, 201)

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
# RUN APP
# --------------------------
if __name__ == "__main__":
    app.run(debug=True, port=5001)