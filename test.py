import sqlite3

conn = sqlite3.connect('./projects/project_7/models.db')
c = conn.cursor()
print ("数据库打开成功")

c.execute("INSERT INTO PROJECTS (STRUCTURE, EPOCHS, STEPS_PER_EPOCH, OPTIMIZER, LEARNING_RATE, FINAL_LOSS) \
      VALUES ('4=>30(relu)=>30(relu)=>30(relu)=>1', 50, 100, 'Adam', 0.001, 0.00123)")

conn.commit()
print ("数据插入成功")
conn.close()