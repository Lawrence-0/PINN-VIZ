import sqlite3

conn = sqlite3.connect('projects.db')
c = conn.cursor()
print ("数据库打开成功")

cursor = c.execute("SELECT MAX(CAST(ID as int)) from PROJECTS")
for row in cursor:
   print("ID = ", row[0])
   
cursor = c.execute("SELECT NAME from PROJECTS WHERE ID = (SELECT MAX(CAST(ID as int)) from PROJECTS)")
for row in cursor:
    print("NAME = ", row[0])

cursor = c.execute("SELECT ID, NAME from PROJECTS")
for row in cursor:
    print("ID = ", row[0])
    print("NAME = ", row[1])

print ("数据操作成功")
conn.close()