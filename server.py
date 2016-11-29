from flask import Flask, render_template, redirect, request, session, flash, jsonify
from BreweryDB import *

DEFAULT_BASE_URI = "http://api.brewerydb.com/v2"
BASE_URI = ""
API_KEY = "2197e5ac270cdce51585dbf484297b1f"

brewerydb = BreweryDb()
brewerydb.configure(API_KEY, DEFAULT_BASE_URI)

app = Flask('beer_trader', static_url_path = '')

@app.route('/')
def home():
    return app.send_static_file('index.html')

@app.route('/beer/<search_term>')
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

if __name__ == '__main__':
    app.run(debug=True)
