[Google]: https://developers.google.com/maps/documentation/javascript/get-api-key

# Plan for Tonight

##Description
Plan your night with Plan for Tonight! Pick what you'd like to do tonight and we'll take of your game plan. The idea is to calculate the minimum distance from where you'd like to start, round trip, and take into consideration the things you want to do and when you want to do them. This app will leverage Google Map's Autocomplete and Geocode APIs.

##Getting Started
1. Clone repo to your machine
2. Ensure that you have MongoDB installed on your machine
3. In newly created folder, run the following commands:
  - 'npm install'
  - 'npm run start'
4. Change the name of the "api_keys_demo.js" file in the client/config folder to "api_keys.js"
5. Inside of your new api_keys.js file, inside of the placeholder empty string, add your own google api key. You can get one here: [Google][]

##Assumptions
1. UI
  - I decided to do away with a submit button for the address form, assuming that the user can select an address either by clicking on or pressing enter/return
2. Google APIs
  - For v1 I decided to limit Google's Autocomplete results to locations in the US and addresses (opposed to business names)
3. Server/Controller
  - To calculate the distance between two coordinates I used the following formula: http://www.geodatasource.com/developers/javascript
  - In order to find the nearest store to a target address, I decided to compare the target address to every store located in the SAME STATE vs. every store in the database.
  This may lead to incorrect results given that it's possible a store in a different state is actually the nearest store to a given target address. However I thought the efficiency/accuracy trade-off 
  was worth it for v1. 
4. Database
  - For v1 I decided to seed a MongoDB with seed json data located in the "seed.json" file
   in the root directory
  - Given the nature of the data, a SQL database may be a better fit down the line
5. Tests
  - For v1 I added a basic happy and sad path test to ensure the store controller returns the appropriate data based on the client side request

##Testing
1. Run 'npm test' within the repo directory
