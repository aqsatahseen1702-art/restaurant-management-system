import mysql.connector

def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="Aqsa@1702",
        database="restaurant_management"
    )