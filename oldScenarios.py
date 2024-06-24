import psycopg2
from dotenv import load_dotenv
load_dotenv()
import os
from datetime import datetime, timedelta

load_dotenv()
db_conn = psycopg2.connect(
    host=os.getenv('DB_HOST'),
    database=os.getenv('DB_DATABASE'),
    user=os.getenv('DB_USER'),
    password=os.getenv('DB_PASSWORD')
)
db_cur = db_conn.cursor()

# Calculate the date 3 months ago
three_months_ago = datetime.now() - timedelta(days=90)
    
# Convert to the appropriate format if needed
three_months_ago_str = three_months_ago.strftime('%Y-%m-%d')

ids = db_cur.execute('SELECT id "public"."Scenarios" WHERE uploaded_date > ', (three_months_ago_str))

print(ids)