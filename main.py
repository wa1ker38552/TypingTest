from flask import render_template
from database import Database
from flask import redirect
from flask import request
from flask import Flask
import random
import json

db = Database()
app = Flask(__name__)
TEST_LENGTH = 20
words = open('words.txt', 'r').read().split('\n')
alpha = '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

@app.route('/')
def app_index():
  global TEST_LENGTH
  if request.args.get('from'):
    sequence = db.load()['tests'][request.args.get('from')]['original']
  else:
    sequence = ' '.join([random.choice(words) for i in range(TEST_LENGTH)])
  return render_template('index.html', words=sequence)

@app.route('/scores')
def app_scores():
  return render_template('scores.html')

@app.route('/share/<id>')
def app_share(id):
  if id in db.load()['tests']:
    return render_template('share.html', test_id=id, wpm=db.load()['tests'][id]['wpm'])
  else:
    return redirect('/', code=302)

@app.route('/scores/get/<id>')
def api_get_scores_id(id):
  return db.load()['tests'][id]

@app.route('/scores/get')
def api_get_scores():
  database = db.load()
  average_wpm = 0
  average_raw = 0
  average_accuracy = 0
  highest_wpm = database['tests'][list(database['tests'].keys())[0]]['wpm']
  highest_raw = database['tests'][list(database['tests'].keys())[0]]['raw']

  for test in database['tests']:
    average_wpm += database['tests'][test]['wpm']
    average_raw += database['tests'][test]['raw']
    average_accuracy += database['tests'][test]['accuracy']
    if database['tests'][test]['wpm'] > highest_wpm:
      highest_wpm = database['tests'][test]['wpm']
    if database['tests'][test]['raw'] > highest_raw:
      highest_raw = database['tests'][test]['raw']
      
  data = {
    'tests_taken': len(database['tests']),
    'average_wpm': round(average_wpm/len(database['tests'])),
    'average_raw': round(average_raw/len(database['tests'])),
    'highest_wpm': highest_wpm,
    'highest_raw': highest_raw,
    'average_accuracy': round(average_accuracy/len(database['tests']))
  }
  return data

@app.route('/scores/save', methods=['POST'])
def api_save_score():
  id = "".join([random.choice(alpha) for i in range(10)])
  data = json.loads(request.data.decode("utf-8"))
  database = db.load()

  while id in database['tests']:
    id = "".join([random.choice(alpha) for i in range(10)])
    
  database['tests'][id] = {
    'id': id,
    'original': data['original_sequence'],
    'wpm': data['wpm'],
    'raw': data['raw'],
    'accuracy': data['accuracy'],
    'sequence': data['sequence']
  }
  db.save(database)
  return {'id': id}

app.run(host='0.0.0.0', port=8080)
