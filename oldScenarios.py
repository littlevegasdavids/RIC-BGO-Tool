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

# Calculating the date three months ago from today
three_months_ago = datetime.now() - timedelta(days=90)
three_months_ago_str = three_months_ago.strftime('%Y-%m-%d')

# Correct SQL query
query = 'SELECT id FROM public."Scenarios" WHERE upload_date > %s'

# Executing the SQL query
db_cur.execute(query, (three_months_ago_str,))

# Fetching the results - result is [(1,), (2,)]
result = db_cur.fetchall()

ids = [item[0] for item in result]

deleteQuery = 'DELETE FROM public."Scenarios" WHERE id = %s'
print('Deleting the following ids:', ids)
db_cur.execute(deleteQuery, (ids[0],))

# Closing the connection
db_cur.close()
db_conn.close()

print('Deleted ids:', ids)