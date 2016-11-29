from flask import Flask, render_template, redirect, request, session, flash, jsonify
from BreweryDB import *
import pg, bcrypt, datetime, uuid

DEFAULT_BASE_URI = "http://api.brewerydb.com/v2"
BASE_URI = ""
API_KEY = "2197e5ac270cdce51585dbf484297b1f"

brewerydb = BreweryDb()
brewerydb.configure(API_KEY, DEFAULT_BASE_URI)

db = pg.DB(dbname="Beer-App")

app = Flask('beer_trader', static_url_path = '')

@app.route('/')
def home():
    return app.send_static_file('index.html')

@app.route('/search/<search_term>')
def beer(search_term):
    data = brewerydb.search({'q':search_term})
    return jsonify(data)

@app.route('/beers/<page_num>')
def beerCall(page_num):
    data = brewerydb.beers({'p':page_num})
    return jsonify(data)

@app.route('/breweries/<page_num>')
def breweryCall(page_num):
    data = brewerydb.breweries({'p':page_num})
    return jsonify(data)

@app.route('/user/signup', methods=["POST"])
def signup():
   data = request.get_json()
   password = data['password']
   salt = bcrypt.gensalt()
   encrypted_password = bcrypt.hashpw(password.encode('utf-8'), salt)
   db.insert (
       "customer",
       username = data['username'],
       email = data['email'],
       password = encrypted_password,
       first_name = data['first_name'],
       last_name = data['last_name']
   )
   return "poop"

@app.route('/user/login', methods=["POST"])
def login():
   req = request.get_json()
   # print req
   username = req['username']
   password = req['password']
   query = db.query('select * from customer where username = $1', username).dictresult()[0]
   # print query
   stored_enc_pword = query['password']
   del query['password']
   print stored_enc_pword
   rehash = bcrypt.hashpw(password.encode('utf-8'), stored_enc_pword)
   print rehash

   if (stored_enc_pword == rehash):
       print "Success"
       # do a query to delete expired auth_token??
       current_date = datetime.datetime.now()
       # db.query('delete token from auth_token where $1 <= token_expires ', current_date)
       db_token = db.query('select token from auth_token where customer_id = $1',query['id']).dictresult()
       print db_token

       if(len(db_token) > 0):
           token = db_token[0]
           print "token exist"
       else:
           # exp_date = datetime.datetime.now() + timedelta(days = 30)
           # print exp_date
           token = uuid.uuid4()
           db.insert('auth_token',{
               'token' : token,
               'customer_id' : query['id']
           })

       return jsonify({
       "user" : query,
       "auth_token" :
           token
       })
   else:
       return "login failed", 401

if __name__ == '__main__':
    app.run(debug=True)
