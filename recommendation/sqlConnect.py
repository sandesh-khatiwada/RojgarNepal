import os
from dotenv import load_dotenv
from sqlalchemy import URL

# Load environment variables from .env file
load_dotenv()

# Get the environment variables
username = os.getenv('DB_USERNAME')
password = os.getenv('DB_PASSWORD')
database = os.getenv('DB_NAME')

# Create the connection URL
connection_url = URL.create(
    "mysql+mysqlconnector",
    username=username,
    password=password,
    database=database,
)


