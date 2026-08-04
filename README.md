# EPICUI

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 7.1.0.

## Assessing Code Quality

* Lint with `npm run lint`.
* Check for duplicate code with: `npm run cpd-check`.

## Developing Offline Functionality

Angular's service workers only function when the app has been built and staticly hosted. You'll need to build the project using `npm run build:dev-offline`.

```bash
docker cp dist/EPIC/ docker_epic-ws_1:/usr/local/tomcat/webapps
```

Then load `http://localhost:8080/EPIC/`.

You'll need to run the application once in order for it to cache information. Then, you can disable your internet connection (e.g. for Chrome, you can disable this under Dev Tools > Application > Service Workers > Offline) and refresh the page; the application should run off cached code. 

## Containerization

The prefered container engine to use is Podman.
For installing and setting up Podman, please see and follow instruction on the [wiki](https://aplwiki.jhuapl.edu/confluence/spaces/SESSIG/pages/910532943/Podman+Setup).

You can develop within Podman with the following commands:

```bash
podman-compose up # Launches the containers in your composition, replacing any already running instances. It will not rebuild containers if a built version already exists. Append the `--build` argument to force a rebuild. Append the name of a service (e.g. `epic-db` or `epic-ws`) to limit the command to a specific service.

podman-compose stop # Stops the containers in your composition.

podman-compose down #Stops and destroys the containers in your composition. All data contained in the containers will be lost. 
```

Note, for dev environments, the docker-compose.dev.yml file should be used. You can develop with the following command:
```bash
podman compose -f docker-compose.dev.yml build
podman compose -f docker-compose.dev.yml up
podman compose -f docker-compose.dev.yml down
```

To do a build: See `ci.sh` for example.

## Development server

DEPRECATED - use Docker instead.

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## E2E Testing with Playwright

EPIC uses the Playwright testing framework for end-to-end testing. Further documentation on Playwright and configuration can be found at the IST wiki at https://aplwiki.jhuapl.edu/confluence/pages/viewpage.action?spaceKey=SESSIG&title=Setting+up+Automated+End-to-End+UI+Testing+with+Playwright

Eventually the Playwright tests will be containerized, but as of 2023-07-13 they can be run manually. Follow the instructions below for setting up and running the tests. 

### Setting up to run end-to-end tests with Playwright

1. Assuming the Node 18 is installed on the local machine, install the Playwright packages locally by running `npm install`.
2. Playwright will not work with a self-signed certificate in Node. Create an environmental variable that points to the epic-ui/docker/assets/apl-certs/JHUAPL-MS-Root-CA-05-21-2038-B64-text.crt certificate:
    a. `export NODE_EXTRA_CA_CERTS="path/to/the/certificate"`
    b. Don't forget the quotation marks. 
3. Initialize Playwright from the command line: `npm init playwright@latest --yes -- --quiet --browser=chromium --browser=firefox --browser=webkit --gha`
    a. If you get a message that several files already exist and question about overriding them, choose yes.
4. Add an empty file to the top level project directory titled "state.json".
5. Add a file to the top level project directory titled ".env".
6. In the ".env", put the following:
    `````
   USERNAME=your-5-2-1
   PASSWORD=your_apl_password
   DISPLAYNAME=your_first_and_last_name
   ``````

Note that .env and state.json should never be committed to the repository. Ensure that these files are in the `.gitignore` file.

Note that the .env file should never be shown to anyone else, since it contains your login information. Once VisTool figures out how to change this, we will copy it for EPIC.

### Running end-to-end tests with Playwright (via the command line)

Note that the WS container and the UI must be running to allow tests to run.

Run `npx playwright test` to execute the end-to-end tests via [Playwright](https://playwright.dev/).
Run `npx playwright test --ui` to display a browser based UI that can be used to navigate and run tests. Click on the "watch" icon for a given test to have tests re-run as changes are saved.
Run `npx playwright show-report` to display the results of the last run test.

### Running end-to-end tests with Playwright (via VSCode)

Note that the WS container and the UI must be running to allow tests to run.

Assuming the Playwright extension for Playwright is installed:
1. Navigate to the "Test" icon in the VSCode left sidenav (looks like a chemistry flask).
2. Navigate through the Test Explorer to find the desired test(s)
3. Click the play buttons to either run the test or debug it.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
