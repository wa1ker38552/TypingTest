import json

class Database:
  def __init__(self, route="database.json"):
    self.route = route

  def load(self):
    return json.loads(open(self.route, 'r').read())

  def save(self, database):
    with open(self.route, 'w') as file:
      file.write(json.dumps(database, indent=2))
