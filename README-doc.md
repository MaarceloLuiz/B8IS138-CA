## Documentation

#### Install Node.js (if not already installed)
#### Download from https://nodejs.org/ (LTS version recommended)

#### Verify installation
node --version
npm --version

#### Install Ionic CLI globally
npm install -g @ionic/cli

#### Verify Ionic installation
ionic --version

#### Create new Ionic Angular app with tabs template
ionic start B8IS138-CA tabs --type=angular --capacitor

######## Navigate into project
cd B8IS138-CA

######## Install Firebase and AngularFire
npm install firebase @angular/fire

#### Install Capacitor plugins (for future native features)
npm install @capacitor/core @capacitor/cli

#### Start development server
ionic serve

#### Or with specific options
ionic serve --lab  #### Shows iOS and Android side-by-side

## Auth feature
ionic generate page features/auth/login
ionic generate page features/auth/register

## Properties feature
ionic generate page features/properties/property-list
ionic generate page features/properties/property-detail
ionic generate page features/properties/property-create

## Bookings feature
ionic generate page features/bookings/booking-form
ionic generate page features/bookings/booking-list

## Map feature (for CA Two)
ionic generate page features/map/property-map

## Env vars
env vars are being loaded from the config.sh file
to run the server use the following commands:

source config.sh
ionic serve

## CA2

## Profile page
ionic generate page features/profile/profile --standalone
