import sqlite3

conn = sqlite3.connect('projects.db')
c = conn.cursor()
print ("数据库打开成功")

c.execute("INSERT INTO PROJECTS (NAME) \
      VALUES ('3DADE_test1')")

conn.commit()
print ("数据插入成功")
conn.close()