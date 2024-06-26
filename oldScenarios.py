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

# Executing the SQL query
db_cur.execute('SELECT id FROM public."Scenarios" WHERE upload_date < %s', (three_months_ago_str,))

# Fetching the results - result is [(1,), (2,)]
result = db_cur.fetchall()

ids = [item[0] for item in result]

#print('The following ids are older than three months:', ids)
id = min(ids)
print('Deleting the following id:', id)
db_cur.execute('DELETE FROM public."Scenarios" WHERE id = %s', (id,))
db_conn.commit()
# Delete files from excelFiles/solved excelFiles/logs excelFiles/uploaded
os.remove(f"excelFiles/solved/{id}.xlsx")
os.remove(f"excelFiles/uploaded/{id}.xlsx")
os.remove(f"excelFiles/logs/{id}.txt")

# Delete all the scenarios that are older than three months
# for id in ids:
#     print('Deleting the following id:', id)
#     db_cur.execute('DELETE FROM public."Scenarios" WHERE id = %s', (id,))
#     db_conn.commit()
#     # Delete files from excelFiles/solved excelFiles/logs excelFiles/uploaded
#     os.remove(f"excelFiles/solved/{id}.xlsx")
#     os.remove(f"excelFiles/uploaded/{id}.xlsx")
#     os.remove(f"excelFiles/logs/{id}.txt")


# Closing the connection
db_cur.close()
db_conn.close()

print('Successfully deleted all files')