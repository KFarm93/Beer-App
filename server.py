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

@app.route('/search/both/<search_term>')
def beerBoth(search_term):
    # data = brewerydb.search({'q':search_term, 'type': 'beer'})
    # data = brewerydb.search({'q':search_term, 'type': 'brewery'})
    data = brewerydb.search({'q':search_term, 'withBreweries': 'Y'})
    return jsonify(data)

@app.route('/search/beers/<search_term>')
def beerBeer(search_term):
    data = brewerydb.search({'q':search_term, 'type': 'beer', 'withBreweries': 'Y'})
    return jsonify(data)

@app.route('/search/breweries/<search_term>')
def beerBrewery(search_term):
    data = brewerydb.search({'q':search_term, 'type': 'brewery'})
    return jsonify(data)


@app.route('/beers/<page_num>')
def beerCall(page_num):
    data = brewerydb.beers({'p':page_num, 'withBreweries':'Y'})
    return jsonify(data)

@app.route('/breweries/<page_num>')
def breweryCall(page_num):
    data = brewerydb.breweries({'p':page_num})
    return jsonify(data)

@app.route('/user/signup', methods=["POST"])
def signup():
   data = request.get_json()
   print data
   password = data['password']
   salt = bcrypt.gensalt()
   encrypted_password = bcrypt.hashpw(password.encode('utf-8'), salt)
   db.insert (
       "users",
       username = data['username'],
       email = data['email'],
       password = encrypted_password,
       first_name = data['first_name'],
       last_name = data['last_name']
   )
   return "poop"

@app.route('/user/cellar', methods=['POST'])
def cellar():
    data = request.get_json()
    name = data['details']['name']

    # Query to find matches in user_owns_beer table, to stop duplicate matches
    query = db.query('select * from user_owns_beer inner join users on $1 = user_owns_beer.users_id inner join beer on name.beer = $1', data['user_id'], data['details']['name']).dictresult()

    if query:
        return "Beer already in cellar"

    db.insert(
        "beer",
        name = data['details']['name'],
        description = data['details']['description'],
        image_path = data['details']['labels']['large'],
        brewery = data['details']['breweries'][0]['name'],
        style = data['details']['style']['shortName'],
        abv = data['details']['abv'],
        ibu = data['details']['style']['ibuMax']
    )
    query = db.query('select * from beer where name = $1', data['details']['name']).dictresult()[0]
    print query['id']
    db.insert(
        "beer_in_cellar",
        user_id = data['user_id'],
        beer_id = query['id']
    )
    return "success"


@app.route('/user/login', methods=["POST"])
def login():
   req = request.get_json()
   # print req
   username = req['username']
   password = req['password']
   query = db.query('select * from users where username = $1', username).dictresult()[0]
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
       db_token = db.query('select token from auth_token where users_id = $1',query['id']).dictresult()
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
               'users_id' : query['id']
           })

       return jsonify({
       "users" : query,
       "auth_token" :
           token
       })
   else:
       return "login failed", 401

if __name__ == '__main__':
    app.run(debug=True)
