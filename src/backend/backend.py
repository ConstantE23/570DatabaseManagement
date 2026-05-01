from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
from pymongo import MongoClient
from pymongo.errors import PyMongoError
from datetime import datetime
from werkzeug.security import check_password_hash, generate_password_hash


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

mongo_client = MongoClient("mongodb://localhost:27017/", serverSelectionTimeoutMS=5000)
mongo_db = mongo_client["campusDB"]
access_card_nosql = mongo_db["Access_Card"]
activitylog_nosql = mongo_db["AccessLog"] #Needing to update log activity log to capture user actions for logging in, submitting tickets, and updating tickets. Each user needs to be captured by user_id
maintenance_nosql = mongo_db["maintenance"] #Needing to update to record notes and pictures for maintenance tickets, tickets ID need to match unique identifer within SQL.
lossreport_nosql = mongo_db["LossReport"]


try:
    activitylog_nosql.create_index([("user_id", 1), ("timestamp", -1)])
    activitylog_nosql.create_index([("event_type", 1), ("timestamp", -1)])
    activitylog_nosql.create_index([("category", 1), ("timestamp", -1)])
    activitylog_nosql.create_index("timestamp")
    print("[startup] Mongo indexes ready")
except PyMongoError as e:
    print(f"[startup] Could not create indexes: {e}")


def mysql_table_exists(cursor, table_name):
    cursor.execute(
        """
        SELECT 1
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = %s AND TABLE_NAME = %s
        """,
        ("SmartCampus", table_name),
    )
    return cursor.fetchone() is not None


def mysql_column_exists(cursor, table_name, column_name):
    cursor.execute(
        """
        SELECT 1
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = %s AND TABLE_NAME = %s AND COLUMN_NAME = %s
        """,
        ("SmartCampus", table_name, column_name),
    )
    return cursor.fetchone() is not None


def ensure_mysql_column(cursor, table_name, column_name, column_ddl):
    if not mysql_column_exists(cursor, table_name, column_name):
        cursor.execute(f"ALTER TABLE `{table_name}` ADD COLUMN {column_ddl}")


def bootstrap_mysql_schema():
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        if mysql_table_exists(cursor, "User"):
            ensure_mysql_column(cursor, "User", "password_hash", "password_hash VARCHAR(255) NOT NULL DEFAULT '' AFTER email")
            cursor.execute(
                "SELECT user_id, last_name FROM `User` WHERE password_hash = '' OR password_hash IS NULL"
            )
            for user_id, last_name in cursor.fetchall():
                seed_password = (last_name or "ChangeMe123!").strip() or "ChangeMe123!"
                cursor.execute(
                    "UPDATE `User` SET password_hash = %s WHERE user_id = %s",
                    (generate_password_hash(seed_password), user_id),
                )

        if mysql_table_exists(cursor, "MaintenanceTicket"):
            ensure_mysql_column(cursor, "MaintenanceTicket", "assignee", "assignee VARCHAR(100) DEFAULT NULL AFTER priority")
            ensure_mysql_column(cursor, "MaintenanceTicket", "action_notes", "action_notes TEXT DEFAULT NULL AFTER status")
            ensure_mysql_column(cursor, "MaintenanceTicket", "building", "building VARCHAR(100) DEFAULT NULL AFTER action_notes")
            ensure_mysql_column(cursor, "MaintenanceTicket", "room", "room VARCHAR(20) DEFAULT NULL AFTER building")

        if mysql_table_exists(cursor, "Course"):
            ensure_mysql_column(cursor, "Course", "department", "department VARCHAR(100) DEFAULT NULL AFTER credits")
            ensure_mysql_column(cursor, "Course", "description", "description TEXT DEFAULT NULL AFTER department")

        if mysql_table_exists(cursor, "Section"):
            ensure_mysql_column(cursor, "Section", "section_number", "section_number VARCHAR(20) DEFAULT NULL AFTER course_id")
            ensure_mysql_column(cursor, "Section", "building", "building VARCHAR(100) DEFAULT NULL AFTER term")
            ensure_mysql_column(cursor, "Section", "room", "room VARCHAR(20) DEFAULT NULL AFTER building")
            ensure_mysql_column(cursor, "Section", "days", "days VARCHAR(50) DEFAULT NULL AFTER room")
            ensure_mysql_column(cursor, "Section", "time", "time VARCHAR(50) DEFAULT NULL AFTER days")
            ensure_mysql_column(cursor, "Section", "capacity", "capacity INT DEFAULT NULL AFTER time")
            ensure_mysql_column(cursor, "Section", "enrolled", "enrolled INT DEFAULT 0 AFTER capacity")
            ensure_mysql_column(cursor, "Section", "status", "status VARCHAR(20) DEFAULT 'Open' AFTER enrolled")

        connection.commit()
        print("[startup] MySQL schema ready")
    except Error as e:
        print(f"[startup] Could not bootstrap MySQL schema: {e}")
        if connection and connection.is_connected():
            connection.rollback()
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


bootstrap_mysql_schema()

def log_activity(user_id, event_type, category="system", result="success", details=None, metadata=None):
    """
    Log an activity event to MongoDB.
    
    Args:
        user_id: The user who triggered the event (int, or None for anonymous failures)
        event_type: Specific event identifier (e.g. "login", "ticket_create", "door_swipe")
        category: Broad bucket — "system" or "physical"
        result: Outcome — "success", "failure", "granted", "denied"
        details: Event-specific dict (ticket_id, door_id, etc.)
        metadata: Free-form dict for anything else
    """
    try:
        activitylog_nosql.insert_one({
            "user_id": user_id,
            "event_type": event_type,
            "category": category,
            "result": result,
            "details": details or {},
            "metadata": metadata or {},
            "timestamp": datetime.utcnow()
        })
    except PyMongoError as e:
        print(f"[log_activity] Mongo error: {e}")



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

        password_source = (data.get("password") or data["last_name"]).strip()
        password_hash = generate_password_hash(password_source or "ChangeMe123!")

        user_query = """
        INSERT INTO `User` (first_name, last_name, email, password_hash, phone, address)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.execute(user_query, (
            data["first_name"],
            data["last_name"],
            data["email"],
            password_hash,
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
            assignee,
            action_notes AS actionNotes,
            building,
            room,
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
            assignee,
            action_notes AS actionNotes,
            building,
            room,
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
        INSERT INTO MaintenanceTicket (
            user_id, title, priority, status, assignee, action_notes, building, room, created_at
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW())
        """
        cursor.execute(query, (
            user_id,
            data["title"],
            data["priority"],
            data["status"],
            data.get("assignee"),
            data.get("action_notes"),
            data.get("building"),
            data.get("room")
        ))

        connection.commit()
        ticket_id = cursor.lastrowid
        log_activity(
            user_id=user_id,
            event_type="ticket_create",
            result="success",
            details={
                "ticket_id": ticket_id,
                "title": data["title"],
                "priority": data["priority"]
            }
        )
        return success_response({
            "message": "Ticket created successfully",
            "ticket_id": ticket_id
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
        assignee = data.get("assignee")
        action_notes = data.get("action_notes")
        building = data.get("building")
        room = data.get("room")

        if title is None and priority is None and status is None and assignee is None and action_notes is None and building is None and room is None:
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
            status = COALESCE(%s, status),
            assignee = COALESCE(%s, assignee),
            action_notes = COALESCE(%s, action_notes),
            building = COALESCE(%s, building),
            room = COALESCE(%s, room)
        WHERE ticket_id = %s
        """
        cursor.execute(query, (title, priority, status, assignee, action_notes, building, room, ticket_id))
        connection.commit()
        log_activity(
            user_id=data.get("user_id"),  # frontend should send this; fallback to None
            event_type="ticket_update",
            result="success",
            details={
            "ticket_id": ticket_id,
            "changes": {k: v for k, v in {"title": title, "priority": priority, "status": status}.items() if v is not None}
        }
        )
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
            assignee,
            action_notes AS actionNotes,
            building,
            room,
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
        query = "SELECT user_id, first_name, last_name, email, password_hash FROM `User` WHERE email = %s"
        cursor.execute(query, (email,))
        user = cursor.fetchone()

        # 2. Validate user password hash, with a legacy fallback for rows that have not been migrated yet.
        if not user:
            return error_response("Invalid email or password", 401)

        password_hash = user.get("password_hash") or ""
        legacy_password = (user.get("last_name") or "").strip()
        password_valid = False

        if password_hash:
            password_valid = check_password_hash(password_hash, password)
        elif legacy_password:
            password_valid = password == legacy_password
            if password_valid:
                cursor.execute(
                    "UPDATE `User` SET password_hash = %s WHERE user_id = %s",
                    (generate_password_hash(password), user["user_id"]),
                )
                connection.commit()

        if not password_valid:
            log_activity(
                user_id=user["user_id"],
                event_type="login",
                result="failure",
                details={"email": email},
            )
            return error_response("Invalid email or password", 401)

        # 3. Check role.
        cursor.execute("SELECT staff_id, department FROM Staff WHERE user_id = %s", (user["user_id"],))
        staff_record = cursor.fetchone()
        role = "staff" if staff_record else "student"

        student_record = None
        if not staff_record:
            cursor.execute("SELECT student_id, major, class_level FROM Student WHERE user_id = %s", (user["user_id"],))
            student_record = cursor.fetchone()

        # 4. Log and Respond
        log_activity(
            user_id=user["user_id"],
            event_type="login",
            result="success",
            details={"email": email, "role": role},
        )
        
        return success_response({
            "message": "Login successful",
            "role": role,
            "user": {
                "user_id": user["user_id"],
                "first_name": user["first_name"],
                "last_name": user["last_name"],
                "email": user["email"],
                "department": staff_record["department"] if staff_record else None,
                "major": student_record["major"] if student_record else None,
                "class_level": student_record["class_level"] if student_record else None,
            }
        }, 200)

    except Exception as e:
        return error_response(str(e), 500)

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

@app.route("/mongo-health", methods=["GET"])
def mongo_health():
    try:
        mongo_client.admin.command("ping")
        return success_response({
            "status": "connected",
            "database": mongo_db.name,
            "collections": mongo_db.list_collection_names()
        })
    except PyMongoError as e:
        return error_response(str(e))


#Retrieve Logs and Display in Frontend
@app.route("/activity-logs", methods=["GET"])
def get_activity_logs():
    try:
        user_id = request.args.get("user_id", type=int)
        limit = request.args.get("limit", default=50, type=int)

        query = {"user_id": user_id} if user_id else {}
        cursor = activity_logs.find(query).sort("timestamp", -1).limit(limit)

        # Convert ObjectId and datetime to JSON-serializable forms
        results = []
        for doc in cursor:
            doc["_id"] = str(doc["_id"])
            doc["timestamp"] = doc["timestamp"].isoformat()
            results.append(doc)

        return success_response(results)
    except PyMongoError as e:
        return error_response(str(e))
#Query to retrieve  logs for a specific user or time
@app.route("/activity-logs/search", methods=["GET"])
def search_activity_logs():
    try:
        user_id = request.args.get("user_id", type=int)
        start_time = request.args.get("start_time")
        end_time = request.args.get("end_time")

        query = {}
        if user_id:
            query["user_id"] = user_id
        if start_time and end_time:
            query["timestamp"] = {
                "$gte": datetime.fromisoformat(start_time),
                "$lte": datetime.fromisoformat(end_time)
            }

        cursor = activity_logs.find(query).sort("timestamp", -1)

        results = []
        for doc in cursor:
            doc["_id"] = str(doc["_id"])
            doc["timestamp"] = doc["timestamp"].isoformat()
            results.append(doc)

        return success_response(results)
    except PyMongoError as e:
        return error_response(str(e))

#Save maintence notes and pictures to MongoDB
@app.route("/maintenance-notes", methods=["POST"])
def add_maintenance_note():
    try:
        data = request.get_json()
        if not data:
            return error_response("Request body must be JSON", 400)

        ticket_id = data.get("ticket_id")
        note = data.get("note")
        image_url = data.get("image_url")

        if not ticket_id or not note:
            return error_response("Ticket ID and note are required", 400)

        maintenance_nosql.insert_one({
            "ticket_id": ticket_id,
            "note": note,
            "image_url": image_url,
            "timestamp": datetime.utcnow()
        })

        return success_response({"message": "Maintenance note added successfully"}, 201)
    except PyMongoError as e:
        return error_response(str(e))

#Retrieve maintenance notes and images for a specific ticket
@app.route("/maintenance-notes/<int:ticket_id>", methods=["GET"])
def get_maintenance_notes(ticket_id):
    try:
        cursor = maintenance_nosql.find({"ticket_id": ticket_id}).sort("timestamp", -1)

        results = []
        for doc in cursor:
            doc["_id"] = str(doc["_id"])
            doc["timestamp"] = doc["timestamp"].isoformat()
            results.append(doc)

        return success_response(results)
    except PyMongoError as e:
        return error_response(str(e))

@app.route("/lost-report", methods=["POST"])
def add_lost_report():
    try:
        data = request.get_json()
        if not data:
            return error_response("Request body must be JSON", 400)

        # Process the lost report data
        # ...

        return success_response({"message": "Lost report added successfully"}, 201)
    except PyMongoError as e:
        return error_response(str(e))

@app.route("/get-lost-reports", methods=["GET"])
def get_lost_reports():
    try:
        cursor = lost_reports.find()

        results = []
        for doc in cursor:
            doc["_id"] = str(doc["_id"])
            doc["timestamp"] = doc["timestamp"].isoformat()
            results.append(doc)

        return success_response(results)
    except PyMongoError as e:
        return error_response(str(e))


#Can be used for room or classroom
@app.route("/create-new-room"   , methods=["POST"])
def create_new_room(building_id):
    try:
        data = request.get_json()
        if not data:
            return error_response("Request body must be JSON", 400)

        # Process the new room data
        # ...

        return success_response({"message": "New room created successfully"}, 201)
    except PyMongoError as e:
        return error_response(str(e))

@app.route("/get-rooms", methods=["GET"])
def get_rooms():
    try:
        cursor = rooms.find()

        results = []
        for doc in cursor:
            doc["_id"] = str(doc["_id"])
            doc["timestamp"] = doc["timestamp"].isoformat()
            results.append(doc)

        return success_response(results)
    except PyMongoError as e:
        return error_response(str(e))

@app.route("/create-new-building" , methods=["POST"])
def create_new_building():
    try:
        data = request.get_json()
        if not data:
            return error_response("Request body must be JSON", 400)

        # Process the new building data
        # ...
        query = "INSERT INTO Building (name) VALUES (%s)"
        return success_response({"message": "New building created successfully"}, 201)
    except PyMongoError as e:
        return error_response(str(e))

#Retrieve all classrooms within a building
@app.route("/get-classrooms/<int:building_id>", methods=["GET"])
def get_classrooms(building_id):
    try:
        cursor = classrooms.find({"building_id": building_id})

        results = []
        for doc in cursor:
            doc["_id"] = str(doc["_id"])
            doc["timestamp"] = doc["timestamp"].isoformat()
            results.append(doc)

        return success_response(results)
    except PyMongoError as e:
        return error_response(str(e))


@app.route("/retrieve-tickets-by-assignees", methods=["GET"])
def retrieve_tickets_by_assignees():
    try:
        # Implementation for retrieving tickets by assignees
        pass
    except PyMongoError as e:
        return error_response(str(e))

@app.route("/update-password", methods=["POST"])
def update_password():
    connection = None
    cursor = None
    try:
        data = request.get_json()
        if not data:
            return error_response("Request body must be JSON", 400)

        user_id = data.get("user_id")
        email = data.get("email")
        current_password = data.get("current_password")
        new_password = data.get("new_password")

        if not (user_id or email) or not new_password:
            return error_response("User ID or email and new password are required", 400)

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            "SELECT user_id, email, last_name, password_hash FROM `User` WHERE (%s IS NOT NULL AND user_id = %s) OR (%s IS NOT NULL AND email = %s)",
            (user_id, user_id, email, email),
        )
        user = cursor.fetchone()
        if not user:
            return error_response("User not found", 404)

        password_hash = user.get("password_hash") or ""
        if current_password:
            if password_hash:
                if not check_password_hash(password_hash, current_password):
                    return error_response("Current password is incorrect", 401)
            elif current_password != (user.get("last_name") or "").strip():
                return error_response("Current password is incorrect", 401)

        query = "UPDATE `User` SET password_hash = %s WHERE user_id = %s"
        cursor.execute(query, (generate_password_hash(new_password), user["user_id"]))
        connection.commit()

        return success_response({"message": "Password updated successfully"})

    except Error as e:
        if connection and connection.is_connected():
            connection.rollback()
        return error_response(str(e))

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


@app.route("/change-password", methods=["POST"])
def change_password():
    return update_password()

@app.route("/update-department", methods=["POST"])
def update_department():
    connection = None
    cursor = None
    try:
        data = request.get_json()
        if not data:
            return error_response("Request body must be JSON", 400)

        user_id = data.get("user_id")
        new_department = data.get("new_department")

        if not user_id or not new_department:
            return error_response("User ID and new department are required", 400)

        if not str(new_department).strip():
            return error_response("Department cannot be empty", 400)

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        # 1. Verify the user exists AND is a staff member
        cursor.execute(
            "SELECT staff_id FROM Staff WHERE user_id = %s",
            (user_id,)
        )
        staff = cursor.fetchone()

        if not staff:
            return error_response("User is not a staff member; cannot assign department", 403)

        # 2. Update the Staff row, not the User row
        cursor.execute(
            "UPDATE Staff SET department = %s WHERE user_id = %s",
            (new_department.strip(), user_id)
        )
        connection.commit()

        log_activity(
            user_id=user_id,
            event_type="department_update",
            details={"old_department": None, "new_department": new_department.strip()}
        )
        return success_response({"message": "Department updated successfully"})

    except Error as e:
        if connection and connection.is_connected():
            connection.rollback()
        return error_response(str(e))

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

@app.route("/user-department/<int:user_id>", methods=["GET"])
def get_user_department(user_id):
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        # 1. Verify the user exists at all
        cursor.execute(
            "SELECT user_id, first_name, last_name, email FROM `User` WHERE user_id = %s",
            (user_id,)
        )
        user = cursor.fetchone()

        if not user:
            return error_response("User not found", 404)

        # 2. Check if they're staff
        cursor.execute(
            "SELECT staff_id, department FROM Staff WHERE user_id = %s",
            (user_id,)
        )
        staff = cursor.fetchone()

        if staff:
            return success_response({
                "user": user,
                "role": "staff",
                "staff_id": staff["staff_id"],
                "department": staff["department"],
                "editable": True
            })

        # 3. Not staff — check Student table
        cursor.execute(
            "SELECT student_id, major, class_level FROM Student WHERE user_id = %s",
            (user_id,)
        )
        student = cursor.fetchone()

        if student:
            return success_response({
                "user": user,
                "role": "student",
                "student_id": student["student_id"],
                "major": student["major"],
                "class_level": student["class_level"],
                "editable": False,
                "message": "Student academic information is read-only."
            })

        # 4. User exists but is in neither Staff nor Student — data integrity issue
        return success_response({
            "user": user,
            "role": "unknown",
            "editable": False,
            "message": "User has no Staff or Student record."
        })

    except Error as e:
        return error_response(str(e))

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

@app.route("/retrieve-users", methods=["GET"])
def retrieve_users():
    connection = None
    cursor = None
    try:
        department = request.args.get("department")
        role = request.args.get("role")

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT
                u.user_id,
                u.first_name,
                u.last_name,
                u.email,
                u.phone,
                u.address,
                CASE
                    WHEN s.staff_id IS NOT NULL THEN 'staff'
                    WHEN st.student_id IS NOT NULL THEN 'student'
                    ELSE 'unknown'
                END AS role,
                s.department,
                st.major,
                st.class_level
            FROM `User` u
            LEFT JOIN Staff s ON s.user_id = u.user_id
            LEFT JOIN Student st ON st.user_id = u.user_id
            WHERE 1=1
        """
        params = []

        if department:
            query += " AND s.department = %s"
            params.append(department)

        if role == "staff":
            query += " AND s.staff_id IS NOT NULL"
        elif role == "student":
            query += " AND st.student_id IS NOT NULL"

        query += " ORDER BY u.last_name, u.first_name"

        cursor.execute(query, params)
        return success_response(cursor.fetchall())

    except Error as e:
        return error_response(str(e))

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


def serialize_mongo_doc(doc):
    doc["_id"] = str(doc["_id"])
    if isinstance(doc.get("timestamp"), datetime):
        doc["timestamp"] = doc["timestamp"].isoformat()
    return doc


@app.route("/activity-logs", methods=["GET"])
def get_activity_logs():
    try:
        user_id = request.args.get("user_id", type=int)
        limit = request.args.get("limit", default=50, type=int)
        query = {"user_id": user_id} if user_id else {}
        cursor = activitylog_nosql.find(query).sort("timestamp", -1).limit(limit)
        return success_response([serialize_mongo_doc(doc) for doc in cursor])
    except PyMongoError as e:
        return error_response(str(e))


@app.route("/activity-logs/search", methods=["GET"])
def search_activity_logs():
    try:
        user_id = request.args.get("user_id", type=int)
        start_time = request.args.get("start_time")
        end_time = request.args.get("end_time")

        query = {}
        if user_id:
            query["user_id"] = user_id
        if start_time and end_time:
            query["timestamp"] = {
                "$gte": datetime.fromisoformat(start_time),
                "$lte": datetime.fromisoformat(end_time),
            }

        cursor = activitylog_nosql.find(query).sort("timestamp", -1)
        return success_response([serialize_mongo_doc(doc) for doc in cursor])
    except PyMongoError as e:
        return error_response(str(e))


@app.route("/access_logs", methods=["GET"])
def get_access_logs():
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT
                al.log_id,
                ac.user_id,
                CONCAT(u.first_name, ' ', u.last_name) AS student_name,
                CONCAT(d.location, ' (', d.door_type, ')') AS access_type,
                d.location AS location,
                al.time,
                al.result
            FROM AccessLog al
            LEFT JOIN AccessCard ac ON ac.card_id = al.card_id
            LEFT JOIN `User` u ON u.user_id = ac.user_id
            LEFT JOIN Door d ON d.door_id = al.door_id
            ORDER BY al.time DESC
            """
        )
        rows = cursor.fetchall()
        results = []
        for row in rows:
            row["time"] = row["time"].isoformat(sep=" ") if row.get("time") else None
            results.append(row)
        return success_response(results)
    except Error as e:
        return error_response(str(e))
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


@app.route("/lost_id_cards", methods=["GET"])
def get_lost_id_cards():
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT
                lr.report_id AS card_id,
                ac.user_id,
                ac.card_number,
                lr.report_date,
                lr.notes,
                COALESCE(
                    (
                        SELECT cr.status
                        FROM CardRequest cr
                        WHERE cr.user_id = ac.user_id
                        ORDER BY cr.request_date DESC
                        LIMIT 1
                    ),
                    'Open'
                ) AS request_status
            FROM LossReport lr
            LEFT JOIN AccessCard ac ON ac.card_id = lr.card_id
            ORDER BY lr.report_date DESC
            """
        )
        rows = cursor.fetchall()
        results = []
        for row in rows:
            status = row.get("request_status") or "Open"
            if status == "Pending":
                status = "Under Review"
            elif status == "Approved":
                status = "Resolved"
            elif status == "Rejected":
                status = "Closed"
            results.append({
                "user_id": row.get("user_id"),
                "card_id": row.get("card_id"),
                "card_number": row.get("card_number") or "",
                "reported_date": row["report_date"].isoformat() if row.get("report_date") else "",
                "status": status,
                "replacement_requested": row.get("request_status") in {"Pending", "Approved"},
                "notes": row.get("notes") or "",
            })
        return success_response(results)
    except Error as e:
        return error_response(str(e))
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


@app.route("/lost-report", methods=["POST"])
def add_lost_report():
    connection = None
    cursor = None
    try:
        data = request.get_json()
        if not data:
            return error_response("Request body must be JSON", 400)

        card_id = data.get("card_id")
        notes = data.get("notes") or data.get("note")
        if not card_id or not notes:
            return error_response("card_id and notes are required", 400)

        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute(
            "INSERT INTO LossReport (card_id, report_date, notes) VALUES (%s, CURDATE(), %s)",
            (card_id, notes),
        )
        connection.commit()
        return success_response({"message": "Lost report added successfully", "report_id": cursor.lastrowid}, 201)
    except Error as e:
        if connection and connection.is_connected():
            connection.rollback()
        return error_response(str(e))
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


@app.route("/get-lost-reports", methods=["GET"])
def get_lost_reports():
    return get_lost_id_cards()


@app.route("/get-rooms", methods=["GET"])
def get_rooms():
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT
                d.dorm_id AS building_id,
                d.dorm_name AS building,
                r.room_id,
                r.room_number AS room,
                r.capacity,
                r.room_type,
                d.dorm_address AS address
            FROM Room r
            LEFT JOIN Dorm d ON d.dorm_id = r.dorm_id
            ORDER BY d.dorm_name, r.room_number
            """
        )
        return success_response(cursor.fetchall())
    except Error as e:
        return error_response(str(e))
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


@app.route("/create-new-room", methods=["POST"])
def create_new_room():
    connection = None
    cursor = None
    try:
        data = request.get_json()
        if not data:
            return error_response("Request body must be JSON", 400)

        dorm_id = data.get("dorm_id")
        room_number = data.get("room_number")
        capacity = data.get("capacity", 0)
        room_type = data.get("room_type", "Single")

        if not dorm_id or not room_number:
            return error_response("dorm_id and room_number are required", 400)

        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute(
            "INSERT INTO Room (dorm_id, room_number, capacity, room_type) VALUES (%s, %s, %s, %s)",
            (dorm_id, room_number, capacity, room_type),
        )
        connection.commit()
        return success_response({"message": "New room created successfully", "room_id": cursor.lastrowid}, 201)
    except Error as e:
        if connection and connection.is_connected():
            connection.rollback()
        return error_response(str(e))
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


@app.route("/create-new-building", methods=["POST"])
def create_new_building():
    connection = None
    cursor = None
    try:
        data = request.get_json()
        if not data:
            return error_response("Request body must be JSON", 400)

        name = data.get("name")
        if not name:
            return error_response("name is required", 400)

        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("INSERT INTO Dorm (dorm_name, dorm_address) VALUES (%s, %s)", (name, data.get("address")))
        connection.commit()
        return success_response({"message": "New building created successfully", "building_id": cursor.lastrowid}, 201)
    except Error as e:
        if connection and connection.is_connected():
            connection.rollback()
        return error_response(str(e))
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


@app.route("/get-classrooms/<int:building_id>", methods=["GET"])
def get_classrooms(building_id):
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT
                d.dorm_id AS building_id,
                d.dorm_name AS building,
                r.room_id,
                r.room_number AS room,
                r.capacity,
                r.room_type
            FROM Room r
            JOIN Dorm d ON d.dorm_id = r.dorm_id
            WHERE d.dorm_id = %s
            ORDER BY r.room_number
            """,
            (building_id,),
        )
        return success_response(cursor.fetchall())
    except Error as e:
        return error_response(str(e))
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


@app.route("/retrieve-tickets-by-assignees", methods=["GET"])
def retrieve_tickets_by_assignees():
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT
                COALESCE(NULLIF(assignee, ''), 'Unassigned') AS assignee,
                COUNT(*) AS ticket_count
            FROM MaintenanceTicket
            GROUP BY COALESCE(NULLIF(assignee, ''), 'Unassigned')
            ORDER BY ticket_count DESC, assignee ASC
            """
        )
        return success_response(cursor.fetchall())
    except Error as e:
        return error_response(str(e))
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


@app.route("/courses", methods=["GET"])
def get_courses():
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM Course ORDER BY course_id")
        return success_response(cursor.fetchall())
    except Error as e:
        return error_response(str(e))
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


@app.route("/courses", methods=["POST"])
def create_course():
    connection = None
    cursor = None
    try:
        data = request.get_json() or {}
        if not data.get("course_code") or not data.get("title"):
            return error_response("course_code and title are required", 400)

        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute(
            "INSERT INTO Course (course_code, title, credits, department, description) VALUES (%s, %s, %s, %s, %s)",
            (data.get("course_code"), data.get("title"), data.get("credits", 3), data.get("department"), data.get("description")),
        )
        connection.commit()
        return success_response({"message": "Course created successfully", "course_id": cursor.lastrowid}, 201)
    except Error as e:
        if connection and connection.is_connected():
            connection.rollback()
        return error_response(str(e))
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


@app.route("/courses/<int:course_id>", methods=["PUT"])
def update_course(course_id):
    connection = None
    cursor = None
    try:
        data = request.get_json() or {}
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute(
            """
            UPDATE Course
            SET course_code = COALESCE(%s, course_code),
                title = COALESCE(%s, title),
                credits = COALESCE(%s, credits),
                department = COALESCE(%s, department),
                description = COALESCE(%s, description)
            WHERE course_id = %s
            """,
            (data.get("course_code"), data.get("title"), data.get("credits"), data.get("department"), data.get("description"), course_id),
        )
        connection.commit()
        return success_response({"message": "Course updated successfully"})
    except Error as e:
        if connection and connection.is_connected():
            connection.rollback()
        return error_response(str(e))
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


@app.route("/courses/<int:course_id>", methods=["DELETE"])
def delete_course(course_id):
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("DELETE FROM Course WHERE course_id = %s", (course_id,))
        connection.commit()
        return success_response({"message": "Course deleted successfully"})
    except Error as e:
        if connection and connection.is_connected():
            connection.rollback()
        return error_response(str(e))
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


@app.route("/sections", methods=["GET"])
def get_sections():
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT
                section_id,
                course_id,
                section_number,
                instructor,
                term,
                building,
                room,
                days,
                time,
                capacity,
                enrolled,
                status,
                seat_cap
            FROM Section
            ORDER BY section_id
            """
        )
        return success_response(cursor.fetchall())
    except Error as e:
        return error_response(str(e))
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


@app.route("/sections", methods=["POST"])
def create_section():
    connection = None
    cursor = None
    try:
        data = request.get_json() or {}
        if not data.get("course_id"):
            return error_response("course_id is required", 400)

        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute(
            """
            INSERT INTO Section (
                course_id, section_number, instructor, term, building, room, days, time, capacity, enrolled, status, seat_cap
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                data.get("course_id"),
                data.get("section_number"),
                data.get("instructor"),
                data.get("term"),
                data.get("building"),
                data.get("room"),
                data.get("days"),
                data.get("time"),
                data.get("capacity"),
                data.get("enrolled", 0),
                data.get("status", "Open"),
                data.get("capacity"),
            ),
        )
        connection.commit()
        return success_response({"message": "Section created successfully", "section_id": cursor.lastrowid}, 201)
    except Error as e:
        if connection and connection.is_connected():
            connection.rollback()
        return error_response(str(e))
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


@app.route("/sections/<int:section_id>", methods=["PUT"])
def update_section(section_id):
    connection = None
    cursor = None
    try:
        data = request.get_json() or {}
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute(
            """
            UPDATE Section
            SET course_id = COALESCE(%s, course_id),
                section_number = COALESCE(%s, section_number),
                instructor = COALESCE(%s, instructor),
                term = COALESCE(%s, term),
                building = COALESCE(%s, building),
                room = COALESCE(%s, room),
                days = COALESCE(%s, days),
                time = COALESCE(%s, time),
                capacity = COALESCE(%s, capacity),
                enrolled = COALESCE(%s, enrolled),
                status = COALESCE(%s, status),
                seat_cap = COALESCE(%s, seat_cap)
            WHERE section_id = %s
            """,
            (
                data.get("course_id"),
                data.get("section_number"),
                data.get("instructor"),
                data.get("term"),
                data.get("building"),
                data.get("room"),
                data.get("days"),
                data.get("time"),
                data.get("capacity"),
                data.get("enrolled"),
                data.get("status"),
                data.get("capacity"),
                section_id,
            ),
        )
        connection.commit()
        return success_response({"message": "Section updated successfully"})
    except Error as e:
        if connection and connection.is_connected():
            connection.rollback()
        return error_response(str(e))
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


@app.route("/sections/<int:section_id>", methods=["DELETE"])
def delete_section(section_id):
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("DELETE FROM Section WHERE section_id = %s", (section_id,))
        connection.commit()
        return success_response({"message": "Section deleted successfully"})
    except Error as e:
        if connection and connection.is_connected():
            connection.rollback()
        return error_response(str(e))
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


@app.route("/housing-contracts", methods=["GET"])
def get_housing_contracts():
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT
                hc.contract_id,
                hc.student_id,
                CONCAT(u.first_name, ' ', u.last_name) AS student_name,
                d.dorm_name AS dorm,
                r.room_number,
                hc.start_date,
                hc.end_date
            FROM HousingContract hc
            LEFT JOIN Student s ON s.student_id = hc.student_id
            LEFT JOIN `User` u ON u.user_id = s.user_id
            LEFT JOIN Room r ON r.room_id = hc.room_id
            LEFT JOIN Dorm d ON d.dorm_id = r.dorm_id
            ORDER BY hc.contract_id DESC
            """
        )
        return success_response(cursor.fetchall())
    except Error as e:
        return error_response(str(e))
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


@app.route("/card-requests", methods=["GET"])
def get_card_requests():
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT
                cr.request_id,
                cr.user_id,
                u.first_name,
                u.last_name,
                u.email,
                cr.request_date,
                cr.reason,
                cr.status
            FROM CardRequest cr
            LEFT JOIN `User` u ON u.user_id = cr.user_id
            ORDER BY cr.request_date DESC
            """
        )
        return success_response(cursor.fetchall())
    except Error as e:
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
    app.run(debug=True, port=5002)