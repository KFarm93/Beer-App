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
   return "success"


# list all users
@app.route('/members')
def users():
    listAllUsers = db.query("select * from users").dictresult()
    print listAllUsers
    return jsonify(listAllUsers)


@app.route('/user/cellar', methods=['POST'])
def cellar():
    data = request.get_json()
    name = data['details']['name']

    query = db.query('select * from beer where name = $1', data['details']['name']).dictresult()

    # Filters out adding beer more than once to the beer table
    if len(query) < 1:
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

@app.route('/user/trade', methods=["POST"])
def userTrade():
    # This is the data I need sent to this route from the JS
    req = request.get_json()
    user_id_one = req['user_id_one']
    user_id_two = req['user_id_two']
    beer_user_one = req['beer_user_one']
    beer_user_two = req['beer_user_two']

    # Deletes entries for each user, since they no longer own the beer
    queryOne = db.query('delete * from beer_in_cellar where %s = user_id and %s = beer_id' % (user_id_one, beer_user_one))
    queryTwo = db.query('delete * from beer_in_cellar where %s = user_id and %s = beer_id' % (user_id_two, beer_user_two))

    # Inserts the beer being traded into each others cellars
    db.insert(
        "beer_in_cellar",
        user_id= user_id_one,
        beer_id= beer_user_two
    )

    db.insert(
        "beer_in_cellar",
        user_id= user_id_two,
        beer_id= beer_user_one
    )

    # Inserts the Original values into the users_trade_beer table, showing the trade that occured
    db.insert(
        "users_trade_beer",
        user_one= user_id_one,
        user_two= user_id_two,
        user_one_beer= beer_user_one,
        user_two_beer= beer_user_two
    )



if __name__ == '__main__':
    app.run(debug=True)
