from flask import Flask, render_template, redirect, request, session, flash, jsonify
from BreweryDB import BreweryDb
brewerydb = BreweryDb()

app = Flask('beer_trader', static_url_path = '')


@app.route()
def home():
    print "home"
    return


@app.route('/beer/<name>')
def beerCall(name):
    print 'stuff'
    return brewerydb.__make_simple_endpoint_fun(name)

app.run(debug=True)
