# :beer::beer:**Beer App** :beer::beer:

<img src="static/img/logo_with_title.png" alt="Logo" width="150px"/>

##### [Live Project](/ digitalcraftbeer.org /)   |  [Overview](/ https://github.com/KFarm93/Beer-App /)   |   [Team](/ put the team cohort url /)   |   [What We Used](https://github.com/KFarm93/Beer-App#what-we-used)   |   [MVP](https://github.com/DigitalCrafts-September-2016-Cohort/team_freedom_nerdreview#mvp-minimum-viable-product)   |   [Challenges](https://github.com/KFarm93/Beer-App#mvp-minimum-viable-product)   |   [Code](https://github.com/KFarm93/Beer-App#code-snippets)   | [Screenshots](https://github.com/KFarm93/Beer-App#screenshots)   |   [Contributing](https://github.com/KFarm93/Beer-App#contribute-to-nerd-review)

### Overview
digitalcraftbeer.org is a beer search, cellar, and trading engine that allows you to search through over 59,000 beers and breweries around the world. You can view information about the beers and breweries, and once you've made an account and logged in, you can add any beer you want to your personal cellar. Users who have accounts and beers in their cellars can proposition trades with each other.

### Github Link
###### [Beer App](https://github.com/KFarm93/Beer-App)


### Team Members

* #### [Robert Dunn](https://github.com/robdunn220)
  ###### **\(Back-end Leader)**
  **Set up making the server.py to make the correct API calls.**
  **Helped set up the data base, and the queries to the data base in server.py**
  **Set up many of the service calls in the JavaScript, and handled what data was supposed to return, and what format it was in.**

* #### [Kirk Abbott](https://github.com/kirkabbott1)
  ###### **\(Front-end & Back-end organizer)**
  **Contributions**

* #### [Kevin](https://github.com/KFarm93)
  ###### **\(Front-end & UX/UI designer)**
  **Contributions**

* #### [Che](https://github.com/CheBlankenship)
  ###### **\(README.md ninja)**
  **Contributions: **Organize README.md. Leaned how API can connect to server.py.

### What we used
#### **Languages**
* **Python**
  * Flask

* **JavaScript**
  * Angular JS
  * UI Router

* **HTML**

* **CSS**

#### API
  * [BreweryDB.com](http://www.brewerydb.com/)

#### Other
  * AWS
  * Apache

### MVP (Minimum Viable Product)
Our Minimum Viable Product was a site that would allow users to search a multitude of sorted results, and view and add beers to their cellar. They would be able to view other users beer cellars, and initiate a trade with that user.

#### **Stretch Goals**
  * Allow users to trade multiple beers with each other
  * Allow users to message each other, or at least have notifications about trades
  * Allow users to share their location and receive information about stores in the area that sell craft beers


### Code examples
##### Python API file
##### Defined class and class methods for making calls to the API and querying the database
```Python
import requests

DEFAULT_BASE_URI = "http://api.brewerydb.com/v2"
BASE_URI = ""
API_KEY = "2197e5ac270cdce51585dbf484297b1f"

simple_endpoints = ["beers", "breweries", "categories", "events",
                    "featured", "features", "fluidsizes", "glassware",
                    "locations", "guilds", "heartbeat", "ingredients",
                    "search", "search/upc", "socialsites", "styles"]

single_param_endpoints = ["beer", "brewery", "category", "event",
                          "feature", "glass", "guild", "ingredient",
                          "location", "socialsite", "style", "menu"]


class BreweryDb:

    @staticmethod
    def __make_simple_endpoint_fun(name):
        @staticmethod
        def _function(options={}):
            return BreweryDb._get("/" + name, options)
        return _function

    @staticmethod
    def __make_singlearg_endpoint_fun(name):
        @staticmethod
        def _function(id, options={}):
            return BreweryDb._get("/" + name + "/" + id, options)
        return _function

    @staticmethod
    def _get(request, options):
        options.update({"key" : BreweryDb.API_KEY})
        return requests.get(BreweryDb.BASE_URI + request, params=options).json()

    @staticmethod
    def configure(apikey, baseuri=DEFAULT_BASE_URI):
        BreweryDb.API_KEY = apikey
        BreweryDb.BASE_URI = baseuri
        for endpoint in simple_endpoints:
            fun = BreweryDb.__make_simple_endpoint_fun(endpoint)
            setattr(BreweryDb, endpoint.replace('/', '_'), fun)
        for endpoint in single_param_endpoints:
            fun = BreweryDb.__make_singlearg_endpoint_fun(endpoint)
            setattr(BreweryDb, endpoint.replace('/', '_'), fun)
```

##### Python API Calls
##### This is where the created API class is created, and the specific API calls are created with this created object
```Python
DEFAULT_BASE_URI = "http://api.brewerydb.com/v2"
BASE_URI = ""
API_KEY = "2197e5ac270cdce51585dbf484297b1f"

brewerydb = BreweryDb()
brewerydb.configure(API_KEY, DEFAULT_BASE_URI)

@app.route('/search/beers/<search_term>')
def beerBeer(search_term):
    data = brewerydb.search({'q':search_term, 'type': 'beer', 'withBreweries': 'Y'})
    return jsonify(data)
```

##### JavaScript
##### This is where
```Python
DEFAULT_BASE_URI = "http://api.brewerydb.com/v2"
BASE_URI = ""
API_KEY = "2197e5ac270cdce51585dbf484297b1f"

brewerydb = BreweryDb()
brewerydb.configure(API_KEY, DEFAULT_BASE_URI)

@app.route('/search/beers/<search_term>')
def beerBeer(search_term):
    data = brewerydb.search({'q':search_term, 'type': 'beer', 'withBreweries': 'Y'})
    return jsonify(data)
```

### Screenshots
![Add photo](/ Add screenshot /)

![Add photo](/ Add screenshot /)

![Add photo](/ Add screenshot /)

![Add photo](/ Add screenshot /)



### Project History
11/29/2016 - Project Start

12/02/2016 - Project Completion and Deployment
