import sqlite3

conn = sqlite3.connect('projects.db')
print ("数据库打开成功")
c = conn.cursor()
c.execute('''CREATE TABLE PROJECTS
       (ID INTEGER PRIMARY KEY   AUTOINCREMENT,
       NAME           TEXT    NOT NULL);''')
print ("数据表创建成功")
conn.commit()
conn.close()